"use client";

import { PIPELINE_ORDER } from "./crew";
import { getLocalProject, patchLocalProject, saveLocalProject } from "./clientStore";
import { mockProvider } from "./providers/mock";
import type { Emit } from "./providers/types";
import type {
  AssetArtifact,
  Project,
  ProjectInput,
  ScriptArtifact,
  Stage,
  StageOutput,
  StoryboardArtifact,
} from "./types";

/** Whether the platform runs the crew in the browser (mock) or via the API (vimax). */
export const CLIENT_PROVIDER = (
  process.env.NEXT_PUBLIC_GENERATION_PROVIDER || "mock"
).toLowerCase();
export const isClientMock = CLIENT_PROVIDER !== "vimax";

function id(): string {
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

export function createLocalProject(input: ProjectInput): Project {
  const now = Date.now();
  const stages: Stage[] = PIPELINE_ORDER.map((crewId) => ({
    crewId,
    status: "pending",
    log: [],
  }));
  const project: Project = {
    ...input,
    id: id(),
    status: "queued",
    createdAt: now,
    updatedAt: now,
    provider: "mock",
    stages,
  };
  saveLocalProject(project);
  return project;
}

function emitter(projectId: string, stageIndex: number): Emit {
  return (text: string) => {
    patchLocalProject(projectId, (p) => {
      p.stages[stageIndex].log.push({ at: Date.now(), text });
    });
  };
}

/**
 * Runs the mock crew through ViMax's pipeline in the browser, persisting live
 * progress to localStorage after every step. Fire-and-forget.
 */
export async function runLocalPipeline(projectId: string): Promise<void> {
  if (!getLocalProject(projectId)) return;
  patchLocalProject(projectId, (p) => {
    p.status = "running";
  });

  let script: ScriptArtifact | undefined;
  let storyboard: StoryboardArtifact | undefined;
  let assets: AssetArtifact | undefined;

  for (let i = 0; i < PIPELINE_ORDER.length; i++) {
    const crewId = PIPELINE_ORDER[i];
    const emit = emitter(projectId, i);

    patchLocalProject(projectId, (p) => {
      p.stages[i].status = "running";
      p.stages[i].startedAt = Date.now();
    });

    try {
      const input = getLocalProject(projectId)!;
      let output: StageOutput;

      switch (crewId) {
        case "screenwriter":
          script = await mockProvider.screenwrite(input, emit);
          output = script;
          break;
        case "director":
          storyboard = await mockProvider.direct(input, script!, emit);
          output = storyboard;
          break;
        case "producer":
          assets = await mockProvider.produce(input, script!, storyboard!, emit);
          output = assets;
          break;
        case "cinematographer":
          output = await mockProvider.render(input, storyboard!, assets!, emit);
          break;
      }

      patchLocalProject(projectId, (p) => {
        p.stages[i].output = output;
        p.stages[i].status = "done";
        p.stages[i].finishedAt = Date.now();
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      patchLocalProject(projectId, (p) => {
        p.stages[i].log.push({ at: Date.now(), text: `❌ ${message}` });
        p.stages[i].status = "failed";
        p.stages[i].finishedAt = Date.now();
        p.status = "failed";
      });
      return;
    }
  }

  patchLocalProject(projectId, (p) => {
    p.status = "completed";
  });
}

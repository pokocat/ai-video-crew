import { PIPELINE_ORDER } from "./crew";
import { getProvider } from "./providers";
import type { Emit } from "./providers/types";
import { getProject, patchProject } from "./store";
import type {
  AssetArtifact,
  ScriptArtifact,
  StageOutput,
  StoryboardArtifact,
} from "./types";

/**
 * Drives a project through the ViMax pipeline (Screenwriter → Director →
 * Producer → Video Generator), advancing stage status and streaming log lines
 * into the store so the UI can poll live progress.
 *
 * Runs fire-and-forget; the API returns immediately after kicking this off.
 */
export function startPipeline(projectId: string): void {
  void run(projectId);
}

function emitter(projectId: string, stageIndex: number): Emit {
  return (text: string) => {
    patchProject(projectId, (p) => {
      p.stages[stageIndex].log.push({ at: Date.now(), text });
    });
  };
}

async function run(projectId: string): Promise<void> {
  const provider = getProvider();
  const start = getProject(projectId);
  if (!start) return;

  patchProject(projectId, (p) => {
    p.status = "running";
  });

  // Carry artifacts forward between stages.
  let script: ScriptArtifact | undefined;
  let storyboard: StoryboardArtifact | undefined;
  let assets: AssetArtifact | undefined;

  for (let i = 0; i < PIPELINE_ORDER.length; i++) {
    const crewId = PIPELINE_ORDER[i];
    const emit = emitter(projectId, i);

    patchProject(projectId, (p) => {
      p.stages[i].status = "running";
      p.stages[i].startedAt = Date.now();
    });

    try {
      const input = getProject(projectId)!;
      let output: StageOutput;

      switch (crewId) {
        case "screenwriter":
          script = await provider.screenwrite(input, emit);
          output = script;
          break;
        case "director":
          storyboard = await provider.direct(input, script!, emit);
          output = storyboard;
          break;
        case "producer":
          assets = await provider.produce(input, script!, storyboard!, emit);
          output = assets;
          break;
        case "cinematographer":
          output = await provider.render(input, storyboard!, assets!, emit);
          break;
      }

      patchProject(projectId, (p) => {
        p.stages[i].output = output;
        p.stages[i].status = "done";
        p.stages[i].finishedAt = Date.now();
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      patchProject(projectId, (p) => {
        p.stages[i].log.push({ at: Date.now(), text: `❌ ${message}` });
        p.stages[i].status = "failed";
        p.stages[i].finishedAt = Date.now();
        p.status = "failed";
      });
      return;
    }
  }

  patchProject(projectId, (p) => {
    p.status = "completed";
  });
}

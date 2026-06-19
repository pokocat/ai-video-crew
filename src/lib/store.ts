import { PIPELINE_ORDER } from "./crew";
import type { Project, ProjectInput, Stage } from "./types";

/**
 * In-memory project store.
 *
 * For the MVP we keep projects in a process-global Map. `next dev` and
 * `next start` run a single Node process, so the store survives across requests
 * within a session. (Swap this module for a real DB — Prisma/Postgres — when
 * moving past the MVP; the rest of the app only depends on these functions.)
 */

interface Store {
  projects: Map<string, Project>;
}

const g = globalThis as unknown as { __aiVideoCrewStore?: Store };
const store: Store = g.__aiVideoCrewStore ?? { projects: new Map() };
if (!g.__aiVideoCrewStore) g.__aiVideoCrewStore = store;

function id(): string {
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

export function createProject(input: ProjectInput, provider: string): Project {
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
    provider,
    stages,
  };
  store.projects.set(project.id, project);
  return project;
}

export function getProject(projectId: string): Project | undefined {
  return store.projects.get(projectId);
}

export function listProjects(): Project[] {
  return [...store.projects.values()].sort((a, b) => b.createdAt - a.createdAt);
}

/** Mutate a project in place and bump updatedAt. */
export function patchProject(projectId: string, fn: (p: Project) => void): void {
  const p = store.projects.get(projectId);
  if (!p) return;
  fn(p);
  p.updatedAt = Date.now();
}

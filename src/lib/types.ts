import type { CrewId } from "./crew";
import type { ModeId } from "./modes";

export type StageStatus = "pending" | "running" | "done" | "failed";
export type ProjectStatus = "queued" | "running" | "completed" | "failed";

/** A single log line emitted by a crew member while working. */
export interface LogLine {
  at: number;
  text: string;
}

/** ── Stage artifacts (mirror ViMax's intermediate outputs) ─────────────── */

export interface Scene {
  id: string;
  heading: string;
  synopsis: string;
  mood: string;
}

export interface ScriptArtifact {
  logline: string;
  scenes: Scene[];
}

export interface Shot {
  id: string;
  sceneId: string;
  description: string;
  camera: string;
  durationSec: number;
}

export interface StoryboardArtifact {
  shots: Shot[];
}

export type AssetKind = "character" | "location" | "prop";

export interface AssetRef {
  id: string;
  label: string;
  kind: AssetKind;
  /** Self-contained SVG data URL in mock mode; real image URL in vimax mode. */
  imageUrl: string;
}

export interface AssetArtifact {
  references: AssetRef[];
  consistencyNote: string;
}

export interface VideoFrame {
  shotId: string;
  url: string;
  caption: string;
  durationSec: number;
}

export interface VideoArtifact {
  /** "reel" = client-side mock slideshow; "mp4" = real rendered file. */
  format: "reel" | "mp4";
  posterUrl: string;
  frames: VideoFrame[];
  totalDurationSec: number;
  /** Present only when format === "mp4". */
  videoUrl?: string;
}

export type StageOutput =
  | ScriptArtifact
  | StoryboardArtifact
  | AssetArtifact
  | VideoArtifact;

export interface Stage {
  crewId: CrewId;
  status: StageStatus;
  startedAt?: number;
  finishedAt?: number;
  log: LogLine[];
  output?: StageOutput;
}

export interface ProjectInput {
  title: string;
  mode: ModeId;
  prompt: string;
  style: string;
  userRequirement: string;
  /** Data URL of a reference photo (AutoCameo). */
  referenceImage?: string;
}

export interface Project extends ProjectInput {
  id: string;
  status: ProjectStatus;
  createdAt: number;
  updatedAt: number;
  provider: string;
  stages: Stage[];
}

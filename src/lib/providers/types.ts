import type {
  AssetArtifact,
  ProjectInput,
  ScriptArtifact,
  StoryboardArtifact,
  VideoArtifact,
} from "../types";

/** Emit a live log line for the currently-running crew member. */
export type Emit = (text: string) => void;

/**
 * A generation backend. Each method corresponds to exactly one ViMax agent /
 * pipeline stage, so the platform code is agnostic to whether the work is done
 * by the built-in mock crew or by a real ViMax worker.
 */
export interface GenerationProvider {
  id: string;
  label: string;

  /** Screenwriter (Aria): input → structured script. */
  screenwrite(input: ProjectInput, emit: Emit): Promise<ScriptArtifact>;

  /** Director (Vincent): script → storyboard of shots. */
  direct(
    input: ProjectInput,
    script: ScriptArtifact,
    emit: Emit,
  ): Promise<StoryboardArtifact>;

  /** Producer (Nina): plan + index reference assets, enforce consistency. */
  produce(
    input: ProjectInput,
    script: ScriptArtifact,
    storyboard: StoryboardArtifact,
    emit: Emit,
  ): Promise<AssetArtifact>;

  /** Video Generator (Max): synthesize + assemble the final video. */
  render(
    input: ProjectInput,
    storyboard: StoryboardArtifact,
    assets: AssetArtifact,
    emit: Emit,
  ): Promise<VideoArtifact>;
}

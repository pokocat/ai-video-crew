import type {
  AssetArtifact,
  ProjectInput,
  ScriptArtifact,
  StoryboardArtifact,
  VideoArtifact,
} from "../types";
import type { Emit, GenerationProvider } from "./types";

/**
 * Adapter for a real ViMax (HKUDS/ViMax) worker.
 *
 * ViMax itself is Python (multi-agent, driven by LLM + Nanobanana/Gemini image
 * gen + Veo video gen). To use it from this Next.js platform, run ViMax behind a
 * thin HTTP service that exposes one endpoint per pipeline stage and streams
 * progress. This adapter simply forwards each stage to that worker.
 *
 * Expected worker contract (suggested):
 *   POST {VIMAX_WORKER_URL}/screenwrite  → ScriptArtifact
 *   POST {VIMAX_WORKER_URL}/direct       → StoryboardArtifact
 *   POST {VIMAX_WORKER_URL}/produce      → AssetArtifact
 *   POST {VIMAX_WORKER_URL}/render       → VideoArtifact (format: "mp4")
 *
 * The worker reads its model config from ViMax's own configs/*.yaml, using the
 * VIMAX_* API keys forwarded via headers below.
 */

const WORKER = process.env.VIMAX_WORKER_URL ?? "http://localhost:8000";

function authHeaders(): Record<string, string> {
  return {
    "content-type": "application/json",
    "x-vimax-llm-key": process.env.VIMAX_LLM_API_KEY ?? "",
    "x-vimax-image-key": process.env.VIMAX_IMAGE_API_KEY ?? "",
    "x-vimax-video-key": process.env.VIMAX_VIDEO_API_KEY ?? "",
  };
}

async function call<T>(path: string, body: unknown, emit: Emit): Promise<T> {
  emit(`→ ViMax worker: ${path}`);
  const res = await fetch(`${WORKER}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`ViMax worker ${path} failed: ${res.status} ${detail}`);
  }
  emit(`← ${path} 完成`);
  return (await res.json()) as T;
}

export const vimaxProvider: GenerationProvider = {
  id: "vimax",
  label: "ViMax worker (HKUDS/ViMax)",

  screenwrite(input: ProjectInput, emit: Emit) {
    return call<ScriptArtifact>("/screenwrite", input, emit);
  },
  direct(input: ProjectInput, script: ScriptArtifact, emit: Emit) {
    return call<StoryboardArtifact>("/direct", { input, script }, emit);
  },
  produce(
    input: ProjectInput,
    script: ScriptArtifact,
    storyboard: StoryboardArtifact,
    emit: Emit,
  ) {
    return call<AssetArtifact>("/produce", { input, script, storyboard }, emit);
  },
  render(
    input: ProjectInput,
    storyboard: StoryboardArtifact,
    assets: AssetArtifact,
    emit: Emit,
  ) {
    return call<VideoArtifact>("/render", { input, storyboard, assets }, emit);
  },
};

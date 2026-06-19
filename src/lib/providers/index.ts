import { mockProvider } from "./mock";
import type { GenerationProvider } from "./types";
import { vimaxProvider } from "./vimax";

/** Select the generation backend from env (defaults to the offline mock crew). */
export function getProvider(): GenerationProvider {
  const choice = (process.env.GENERATION_PROVIDER ?? "mock").toLowerCase();
  return choice === "vimax" ? vimaxProvider : mockProvider;
}

export type { GenerationProvider } from "./types";

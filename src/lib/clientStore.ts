"use client";

import type { Project } from "./types";

/**
 * Browser-side project store backed by localStorage.
 *
 * The default `mock` crew runs entirely in the browser (it's pure, offline
 * code), so projects live in localStorage rather than on the server. This makes
 * the platform work on stateless/serverless hosting (e.g. Vercel) without any
 * database. The server-side store (`store.ts`) is still used by the real ViMax
 * provider path.
 */

const KEY = "aivc:projects";
type Listener = () => void;
const listeners = new Set<Listener>();

function read(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "[]") as Project[];
  } catch {
    return [];
  }
}

function writeAll(projects: Project[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(projects));
  notify();
}

function notify(): void {
  listeners.forEach((fn) => fn());
}

export function listLocalProjects(): Project[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function getLocalProject(id: string): Project | undefined {
  return read().find((p) => p.id === id);
}

export function saveLocalProject(project: Project): void {
  const all = read();
  const i = all.findIndex((p) => p.id === project.id);
  if (i >= 0) all[i] = project;
  else all.push(project);
  writeAll(all);
}

/** Load a project, mutate it in place, persist, and notify subscribers. */
export function patchLocalProject(id: string, fn: (p: Project) => void): void {
  const all = read();
  const p = all.find((x) => x.id === id);
  if (!p) return;
  fn(p);
  p.updatedAt = Date.now();
  writeAll(all);
}

/** Subscribe to any change (same tab + cross-tab via the storage event). */
export function subscribeLocal(fn: Listener): () => void {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) fn();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

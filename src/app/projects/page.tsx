"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isClientMock } from "@/lib/clientEngine";
import { listLocalProjects, subscribeLocal } from "@/lib/clientStore";
import { MODE_BY_ID } from "@/lib/modes";
import type { Project, VideoArtifact } from "@/lib/types";

const STATUS_LABEL: Record<Project["status"], string> = {
  queued: "排队中",
  running: "拍摄中",
  completed: "已完成",
  failed: "失败",
};

const STATUS_COLOR: Record<Project["status"], string> = {
  queued: "#9aa3b8",
  running: "#38bdf8",
  completed: "#10b981",
  failed: "#f87171",
};

function poster(p: Project): string | undefined {
  const last = p.stages.find((s) => s.crewId === "cinematographer");
  const out = last?.output as VideoArtifact | undefined;
  return out?.posterUrl;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isClientMock) {
      const sync = () => {
        setProjects(listLocalProjects());
        setLoaded(true);
      };
      sync();
      return subscribeLocal(sync);
    }

    let active = true;
    const load = async () => {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (!active) return;
      setProjects(data.projects);
      setLoaded(true);
    };
    load();
    const t = setInterval(load, 2500);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">作品</h1>
        <Link
          href="/create"
          className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 text-sm hover:border-[var(--color-brand)]"
        >
          + 新建
        </Link>
      </div>

      {loaded && projects.length === 0 && (
        <div className="card mt-10 p-12 text-center">
          <p className="text-4xl">🎬</p>
          <p className="mt-3 text-[var(--color-muted)]">还没有作品，去创作第一部吧。</p>
          <Link
            href="/create"
            className="mt-5 inline-block rounded-xl bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)] px-6 py-2.5 font-semibold text-black"
          >
            开始创作
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => {
          const src = poster(p);
          return (
            <Link key={p.id} href={`/projects/${p.id}`} className="card overflow-hidden transition hover:-translate-y-1">
              <div className="relative aspect-video bg-[var(--color-panel-2)]">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={p.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-3xl">
                    {MODE_BY_ID[p.mode].icon}
                  </div>
                )}
                <span
                  className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs backdrop-blur"
                  style={{ color: STATUS_COLOR[p.status] }}
                >
                  {p.status === "running" && (
                    <span
                      className="dot-live h-1.5 w-1.5 rounded-full"
                      style={{ background: STATUS_COLOR[p.status] }}
                    />
                  )}
                  {STATUS_LABEL[p.status]}
                </span>
              </div>
              <div className="p-4">
                <h3 className="truncate font-medium">{p.title}</h3>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  {MODE_BY_ID[p.mode].name} · {p.style}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

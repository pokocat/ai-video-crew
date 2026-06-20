"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReelPlayer from "@/components/ReelPlayer";
import { isClientMock } from "@/lib/clientEngine";
import { getLocalProject, subscribeLocal } from "@/lib/clientStore";
import { CREW_BY_ID, type CrewId } from "@/lib/crew";
import { MODE_BY_ID } from "@/lib/modes";
import type {
  AssetArtifact,
  Project,
  ScriptArtifact,
  Stage,
  StageStatus,
  StoryboardArtifact,
  VideoArtifact,
} from "@/lib/types";

const STAGE_DOT: Record<StageStatus, string> = {
  pending: "#3a3f52",
  running: "#38bdf8",
  done: "#10b981",
  failed: "#f87171",
};

function stageOf(p: Project, id: CrewId): Stage | undefined {
  return p.stages.find((s) => s.crewId === id);
}

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (isClientMock) {
      // Read live from the browser store (updated by the client engine).
      const sync = () => {
        const p = getLocalProject(id);
        if (p) setProject(p);
        else setNotFound(true);
      };
      sync();
      return subscribeLocal(sync);
    }

    let active = true;
    let timer: ReturnType<typeof setInterval> | null = null;
    const load = async () => {
      const res = await fetch(`/api/projects/${id}`);
      if (res.status === 404) {
        setNotFound(true);
        if (timer) clearInterval(timer);
        return;
      }
      const data = await res.json();
      if (!active) return;
      setProject(data.project);
      // Stop polling once finished.
      if (
        (data.project?.status === "completed" || data.project?.status === "failed") &&
        timer
      ) {
        clearInterval(timer);
      }
    };
    load();
    timer = setInterval(load, 1200);
    return () => {
      active = false;
      if (timer) clearInterval(timer);
    };
  }, [id]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-4xl">🤷</p>
        <p className="mt-3 text-[var(--color-muted)]">没有找到这个作品。</p>
        <Link href="/projects" className="mt-4 inline-block text-[var(--color-brand)] hover:underline">
          返回作品列表
        </Link>
      </div>
    );
  }

  if (!project) {
    return <div className="px-4 py-24 text-center text-[var(--color-muted)]">加载中…</div>;
  }

  const mode = MODE_BY_ID[project.mode];
  const script = stageOf(project, "screenwriter")?.output as ScriptArtifact | undefined;
  const storyboard = stageOf(project, "director")?.output as StoryboardArtifact | undefined;
  const assets = stageOf(project, "producer")?.output as AssetArtifact | undefined;
  const video = stageOf(project, "cinematographer")?.output as VideoArtifact | undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex-1">
          <Link href="/projects" className="text-sm text-[var(--color-muted)] hover:text-white">
            ← 作品
          </Link>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{project.title}</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {mode.icon} {mode.name} · {project.style}
            {project.userRequirement && ` · ${project.userRequirement}`}
          </p>
        </div>
        <span
          className="rounded-full border border-[var(--color-line)] px-3 py-1 text-sm"
          style={{ color: STAGE_DOT[project.status === "running" ? "running" : project.status === "completed" ? "done" : project.status === "failed" ? "failed" : "pending"] }}
        >
          {project.status === "completed"
            ? "✓ 已完成"
            : project.status === "failed"
              ? "✕ 失败"
              : project.status === "running"
                ? "● 拍摄中"
                : "排队中"}
        </span>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">
        {/* Crew pipeline */}
        <aside className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            剧组进度
          </h2>
          {project.stages.map((stage) => {
            const m = CREW_BY_ID[stage.crewId];
            return (
              <div
                key={stage.crewId}
                className="card p-4"
                style={
                  stage.status === "running"
                    ? { borderColor: m.accent, boxShadow: `0 0 0 1px ${m.accent}55` }
                    : undefined
                }
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-lg"
                    style={{ background: `${m.accent}22` }}
                  >
                    {m.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-[var(--color-muted)]">{m.title}</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: STAGE_DOT[stage.status] }}>
                    {stage.status === "running" && (
                      <span className="dot-live h-1.5 w-1.5 rounded-full" style={{ background: STAGE_DOT[stage.status] }} />
                    )}
                    {stage.status === "running"
                      ? m.workingVerb
                      : stage.status === "done"
                        ? "完成"
                        : stage.status === "failed"
                          ? "失败"
                          : "等待"}
                  </span>
                </div>

                {stage.log.length > 0 && (
                  <div className="scrollbar-thin mt-3 max-h-32 space-y-1 overflow-y-auto rounded-lg bg-[var(--color-panel-2)] p-2.5 font-mono text-[11px] leading-relaxed text-[var(--color-muted)]">
                    {stage.log.map((l, i) => (
                      <div key={i}>{l.text}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </aside>

        {/* Artifacts */}
        <div className="space-y-8">
          {/* Final video */}
          <section>
            <h2 className="mb-3 text-lg font-semibold">🎥 成片</h2>
            {video ? (
              <ReelPlayer video={video} />
            ) : (
              <div className="card flex aspect-video items-center justify-center text-sm text-[var(--color-muted)]">
                {project.status === "failed" ? "渲染失败" : "剧组正在赶制，成片稍后呈现…"}
              </div>
            )}
          </section>

          {/* Script */}
          {script && (
            <section>
              <h2 className="mb-1 text-lg font-semibold">📝 剧本</h2>
              <p className="mb-3 text-sm text-[var(--color-muted)]">{script.logline}</p>
              <div className="space-y-2">
                {script.scenes.map((s) => (
                  <div key={s.id} className="card p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{s.heading}</span>
                      <span className="rounded-full bg-[var(--color-panel-2)] px-2 py-0.5 text-xs text-[var(--color-muted)]">
                        {s.mood}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-[var(--color-muted)]">{s.synopsis}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Storyboard */}
          {storyboard && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">🎬 分镜表（{storyboard.shots.length} 镜）</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {storyboard.shots.map((shot, i) => (
                  <div key={shot.id} className="card p-3 text-sm">
                    <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
                      <span className="font-mono">镜 {i + 1}</span>
                      <span>{shot.durationSec}s</span>
                    </div>
                    <p className="mt-1">{shot.description}</p>
                    <p className="mt-1 text-xs" style={{ color: CREW_BY_ID.director.accent }}>
                      {shot.camera}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Assets */}
          {assets && (
            <section>
              <h2 className="mb-1 text-lg font-semibold">🎯 美术资产</h2>
              <p className="mb-3 text-sm text-[var(--color-muted)]">{assets.consistencyNote}</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {assets.references.map((a) => (
                  <div key={a.id} className="card overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.imageUrl} alt={a.label} className="aspect-square w-full object-cover" />
                    <div className="p-2">
                      <p className="truncate text-xs font-medium">{a.label}</p>
                      <p className="text-[10px] uppercase text-[var(--color-muted)]/70">{a.kind}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

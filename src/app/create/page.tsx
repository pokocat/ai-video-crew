"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { createLocalProject, isClientMock, runLocalPipeline } from "@/lib/clientEngine";
import { MODE_BY_ID, MODES, STYLE_PRESETS, type ModeId } from "@/lib/modes";

function CreateForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialMode = (params.get("mode") as ModeId) || "idea2video";

  const [mode, setMode] = useState<ModeId>(
    MODE_BY_ID[initialMode] ? initialMode : "idea2video",
  );
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<string>(STYLE_PRESETS[0]);
  const [requirement, setRequirement] = useState("");
  const [reference, setReference] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cfg = MODE_BY_ID[mode];

  function onPickReference(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setReference(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function submit() {
    setError(null);
    if (!prompt.trim()) {
      setError("请先填写创意 / 剧本内容");
      return;
    }
    setSubmitting(true);
    const input = {
      title: title.trim() || prompt.trim().slice(0, 24) || "未命名作品",
      mode,
      prompt: prompt.trim(),
      style: style.trim() || STYLE_PRESETS[0],
      userRequirement: requirement.trim(),
      referenceImage: cfg.acceptsReference ? reference : undefined,
    };

    try {
      if (isClientMock) {
        // Mock crew runs entirely in the browser — no server state needed.
        const project = createLocalProject(input);
        void runLocalPipeline(project.id);
        router.push(`/projects/${project.id}`);
        return;
      }
      // Real ViMax provider: orchestrate on the server.
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "提交失败");
      router.push(`/projects/${data.project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败");
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-2)] px-4 py-3 text-sm outline-none focus:border-[var(--color-brand)]";

  const canSubmit = useMemo(() => prompt.trim().length > 0 && !submitting, [
    prompt,
    submitting,
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-12">
      <h1 className="text-3xl font-bold">开始创作</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        选择模式，告诉剧组你想要什么，剩下的交给他们。
      </p>

      {/* Mode selector */}
      <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`card p-4 text-left transition ${
              mode === m.id
                ? "border-[var(--color-brand)] ring-1 ring-[var(--color-brand)]"
                : "hover:border-[var(--color-line)]"
            }`}
          >
            <div className="text-2xl">{m.icon}</div>
            <div className="mt-2 text-sm font-medium">{m.name}</div>
            <div className="text-[10px] uppercase text-[var(--color-muted)]/70">
              {m.vimaxMode}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium">作品标题（可选）</label>
          <input
            className={inputClass}
            placeholder="给你的作品起个名字"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium">{cfg.inputLabel}</label>
            <button
              type="button"
              className="text-xs text-[var(--color-brand)] hover:underline"
              onClick={() => setPrompt(cfg.example)}
            >
              填入示例
            </button>
          </div>
          <textarea
            className={`${inputClass} min-h-36 resize-y leading-relaxed`}
            placeholder={cfg.placeholder}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        {cfg.acceptsReference && (
          <div>
            <label className="mb-1.5 block text-sm font-medium">参考照片（出演者）</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={onPickReference}
                className="text-sm text-[var(--color-muted)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--color-panel-2)] file:px-3 file:py-2 file:text-sm file:text-white"
              />
              {reference && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={reference}
                  alt="reference"
                  className="h-14 w-14 rounded-lg object-cover"
                />
              )}
            </div>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">视觉风格</label>
            <select
              className={inputClass}
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              {STYLE_PRESETS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">附加要求（可选）</label>
            <input
              className={inputClass}
              placeholder="例如：面向儿童，不超过 3 个场景"
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className="w-full rounded-xl bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)] px-6 py-3.5 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "正在召集剧组…" : "🎬 交给剧组"}
        </button>
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="px-4 py-20 text-center text-[var(--color-muted)]">加载中…</div>}>
      <CreateForm />
    </Suspense>
  );
}

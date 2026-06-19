import Link from "next/link";
import { CREW } from "@/lib/crew";
import { MODES } from "@/lib/modes";

export default function HomePage() {
  return (
    <div className="bg-grid">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-20 text-center">
        <p className="mb-4 inline-block rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1 text-xs text-[var(--color-muted)]">
          基于开源 ViMax · 多智能体视频生成框架
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
          一支 <span className="bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)] bg-clip-text text-transparent">AI 剧组</span>
          <br />
          把你的灵感拍成成片
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-[var(--color-muted)] sm:text-lg">
          编剧、导演、制片、摄制四位 AI 成员协同工作，从一句话创意到多场景视频，
          全流程自动完成。
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/create"
            className="rounded-xl bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)] px-6 py-3 font-semibold text-black hover:opacity-90"
          >
            🎬 开始创作
          </Link>
          <Link
            href="/crew"
            className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-6 py-3 font-medium hover:border-[var(--color-brand)]"
          >
            认识剧组
          </Link>
        </div>
      </section>

      {/* Crew */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-2 text-center text-2xl font-bold">认识你的剧组</h2>
        <p className="mb-8 text-center text-sm text-[var(--color-muted)]">
          每位成员对应 ViMax 框架中的一个智能体
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CREW.map((m) => (
            <div
              key={m.id}
              className="card p-5 transition hover:-translate-y-1"
              style={{ boxShadow: `0 0 0 1px ${m.accent}22` }}
            >
              <div
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                style={{ background: `${m.accent}22` }}
              >
                {m.emoji}
              </div>
              <h3 className="font-semibold">{m.name}</h3>
              <p className="text-xs" style={{ color: m.accent }}>
                {m.title}
              </p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{m.tagline}</p>
              <p className="mt-3 text-[10px] uppercase tracking-wide text-[var(--color-muted)]/70">
                ViMax · {m.vimaxAgent}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Modes */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-2 text-center text-2xl font-bold">四种创作模式</h2>
        <p className="mb-8 text-center text-sm text-[var(--color-muted)]">
          完整对齐 ViMax 的 Idea2Video / Novel2Video / Script2Video / AutoCameo
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODES.map((mode) => (
            <Link
              key={mode.id}
              href={`/create?mode=${mode.id}`}
              className="card p-5 transition hover:-translate-y-1 hover:border-[var(--color-brand)]"
            >
              <div className="text-3xl">{mode.icon}</div>
              <h3 className="mt-3 font-semibold">{mode.name}</h3>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{mode.blurb}</p>
              <p className="mt-3 text-[10px] uppercase tracking-wide text-[var(--color-muted)]/70">
                {mode.vimaxMode}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold">从灵感到成片</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CREW.map((m, i) => (
            <div key={m.id} className="card p-5">
              <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                <span className="font-mono">{i + 1}</span>
                <span className="text-lg">{m.emoji}</span>
                <span className="font-medium text-white">{m.name}</span>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-[var(--color-muted)]">
                {m.responsibilities.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span style={{ color: m.accent }}>•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

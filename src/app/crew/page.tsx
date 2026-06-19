import Link from "next/link";
import { CREW } from "@/lib/crew";

export const metadata = { title: "剧组 · AI Video Crew" };

export default function CrewPage() {
  return (
    <div className="bg-grid">
      <section className="mx-auto max-w-4xl px-4 pb-8 pt-16">
        <h1 className="text-3xl font-bold sm:text-4xl">你的 AI 剧组</h1>
        <p className="mt-3 text-[var(--color-muted)]">
          四位成员各司其职，对应开源 ViMax 框架中的四个智能体与处理阶段。
        </p>
      </section>

      <section className="mx-auto max-w-4xl space-y-4 px-4 pb-16">
        {CREW.map((m, i) => (
          <div key={m.id} className="card overflow-hidden">
            <div className="flex flex-col gap-4 p-6 sm:flex-row">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl"
                style={{ background: `${m.accent}22` }}
              >
                {m.emoji}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h2 className="text-xl font-semibold">{m.name}</h2>
                  <span className="text-sm" style={{ color: m.accent }}>
                    {m.title}
                  </span>
                  <span className="ml-auto font-mono text-xs text-[var(--color-muted)]">
                    阶段 {i + 1}/4
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{m.bio}</p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]/80">
                      职责
                    </p>
                    <ul className="space-y-1 text-sm">
                      {m.responsibilities.map((r) => (
                        <li key={r} className="flex gap-2">
                          <span style={{ color: m.accent }}>•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-2)] p-3 text-sm">
                    <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]/80">
                      对应 ViMax
                    </p>
                    <p className="mt-1 font-medium">{m.vimaxAgent}</p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">{m.vimaxStage}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4 text-center">
          <Link
            href="/create"
            className="rounded-xl bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)] px-6 py-3 font-semibold text-black hover:opacity-90"
          >
            🎬 让剧组开工
          </Link>
        </div>
      </section>
    </div>
  );
}

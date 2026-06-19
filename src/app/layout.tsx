import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Video Crew — 你的 AI 视频剧组",
  description:
    "基于开源 ViMax (HKUDS/ViMax) 的视频 AI 平台：一支由编剧、导演、制片、摄制组成的 AI 剧组，把你的灵感变成成片。",
};

function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[var(--color-ink)]/85 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-lg">🎬</span>
          <span>AI Video Crew</span>
        </Link>
        <div className="ml-auto flex items-center gap-5 text-sm text-[var(--color-muted)]">
          <Link href="/crew" className="hover:text-white">
            剧组
          </Link>
          <Link href="/projects" className="hover:text-white">
            作品
          </Link>
          <Link
            href="/create"
            className="rounded-lg bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-2)] px-3.5 py-1.5 font-medium text-black hover:opacity-90"
          >
            开始创作
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        <Nav />
        <main>{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-xs text-[var(--color-muted)]">
          基于开源{" "}
          <a
            href="https://github.com/HKUDS/ViMax"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-white"
          >
            ViMax · HKUDS/ViMax
          </a>{" "}
          (MIT) 构建 · AI Video Crew
        </footer>
      </body>
    </html>
  );
}

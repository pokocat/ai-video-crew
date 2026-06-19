"use client";

import { useEffect, useRef, useState } from "react";
import type { VideoArtifact } from "@/lib/types";

/**
 * Plays a generated video.
 *
 * In mock mode the "video" is a reel: a client-side slideshow that cycles
 * through the rendered shot frames with captions, approximating playback fully
 * offline. In vimax mode (format === "mp4") it renders a real <video> element.
 */
export default function ReelPlayer({ video }: { video: VideoArtifact }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const frames = video.frames;
  const current = frames[index];

  useEffect(() => {
    if (video.format === "mp4" || !playing || frames.length === 0) return;
    timer.current = setTimeout(
      () => setIndex((i) => (i + 1) % frames.length),
      Math.max(1200, current.durationSec * 600),
    );
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [index, playing, frames, current, video.format]);

  if (video.format === "mp4" && video.videoUrl) {
    return (
      <video src={video.videoUrl} controls poster={video.posterUrl} className="w-full rounded-xl" />
    );
  }

  if (frames.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-line)]">
      <div className="relative aspect-video bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current.url} alt={current.caption} className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <p className="text-sm text-white/90">{current.caption}</p>
        </div>
        <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white/80 backdrop-blur">
          {index + 1} / {frames.length}
        </span>
      </div>

      <div className="flex items-center gap-3 bg-[var(--color-panel-2)] px-3 py-2">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="rounded-lg bg-white/10 px-3 py-1 text-sm hover:bg-white/20"
        >
          {playing ? "⏸ 暂停" : "▶ 播放"}
        </button>
        <div className="flex flex-1 gap-1">
          {frames.map((f, i) => (
            <button
              key={f.shotId}
              type="button"
              aria-label={`镜头 ${i + 1}`}
              onClick={() => {
                setIndex(i);
                setPlaying(false);
              }}
              className="h-1.5 flex-1 rounded-full transition"
              style={{ background: i === index ? "var(--color-brand)" : "#3a3f52" }}
            />
          ))}
        </div>
        <span className="text-xs text-[var(--color-muted)]">~{video.totalDurationSec}s</span>
      </div>
    </div>
  );
}

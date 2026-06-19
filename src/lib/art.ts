/**
 * Tiny, dependency-free generative art helpers.
 *
 * The mock crew needs to "produce" images without any network or model access,
 * so we synthesize deterministic SVG data URLs (gradients + simple shapes +
 * a label). This keeps the MVP fully offline and demoable.
 */

const PALETTES: [string, string][] = [
  ["#1e3a8a", "#38bdf8"],
  ["#4c1d95", "#a855f7"],
  ["#831843", "#fb7185"],
  ["#14532d", "#34d399"],
  ["#7c2d12", "#fb923c"],
  ["#0f172a", "#64748b"],
  ["#172554", "#22d3ee"],
];

/** Deterministic hash → number, so the same seed yields the same art. */
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface FrameArtOptions {
  seed: string;
  label?: string;
  emoji?: string;
  width?: number;
  height?: number;
}

/** Build a self-contained SVG data URL for a "frame" or asset reference. */
export function frameArt({
  seed,
  label = "",
  emoji = "",
  width = 640,
  height = 360,
}: FrameArtOptions): string {
  const h = hash(seed);
  const [c1, c2] = PALETTES[h % PALETTES.length];
  const angle = h % 360;
  const cx = 20 + (h % 60);
  const cy = 20 + ((h >> 3) % 60);
  const r1 = 30 + (h % 25);
  const r2 = 18 + ((h >> 5) % 22);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${angle} 0.5 0.5)">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="v" cx="50%" cy="45%" r="75%">
      <stop offset="60%" stop-color="black" stop-opacity="0"/>
      <stop offset="100%" stop-color="black" stop-opacity="0.45"/>
    </radialGradient>
  </defs>
  <rect width="100" height="100" fill="url(#g)"/>
  <circle cx="${cx}" cy="${cy}" r="${r1}" fill="white" opacity="0.10"/>
  <circle cx="${100 - cx}" cy="${100 - cy}" r="${r2}" fill="white" opacity="0.08"/>
  <rect width="100" height="100" fill="url(#v)"/>
  ${emoji ? `<text x="50" y="52" font-size="26" text-anchor="middle" dominant-baseline="middle">${escapeXml(emoji)}</text>` : ""}
  ${label ? `<text x="50" y="93" font-size="5" fill="white" opacity="0.85" text-anchor="middle" font-family="sans-serif">${escapeXml(label.slice(0, 42))}</text>` : ""}
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

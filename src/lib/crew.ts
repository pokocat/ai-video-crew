/**
 * The AI Video Crew.
 *
 * Each crew member is a friendly, personified front-end identity for one of the
 * four agents in the open-source ViMax framework (HKUDS/ViMax). The platform's
 * pipeline is a 1:1 mapping onto ViMax's roles and processing stages — we only
 * give each agent a name and a face so end users understand who is doing what.
 *
 * ViMax pipeline (from the project README):
 *   INPUT → SCRIPT UNDERSTANDING → SCENE & SHOT PLANNING → VISUAL ASSET PLANNING
 *   → ASSET INDEXING → CONSISTENCY & CONTINUITY → VISUAL SYNTHESIS & ASSEMBLY → OUTPUT
 */

export type CrewId = "screenwriter" | "director" | "producer" | "cinematographer";

export interface CrewMember {
  /** Stable id, also used as the pipeline stage id. */
  id: CrewId;
  /** The underlying ViMax agent this persona represents. */
  vimaxAgent: string;
  /** Friendly first name shown to users. */
  name: string;
  /** Localized role title. */
  title: string;
  /** Emoji avatar (keeps the MVP dependency-free). */
  emoji: string;
  /** Accent color (hex) used across the UI. */
  accent: string;
  /** One-line pitch in the user's voice. */
  tagline: string;
  /** Personality blurb. */
  bio: string;
  /** What this member is responsible for, in plain language. */
  responsibilities: string[];
  /** The exact ViMax pipeline stage(s) this maps to. */
  vimaxStage: string;
  /** Short verb shown while this member is working ("Aria is …"). */
  workingVerb: string;
}

export const CREW: CrewMember[] = [
  {
    id: "screenwriter",
    vimaxAgent: "Screenwriter",
    name: "Aria",
    title: "编剧 · Screenwriter",
    emoji: "📝",
    accent: "#f59e0b",
    tagline: "把你的一句灵感，写成有血有肉的故事。",
    bio: "Aria 想象力爆棚，擅长把模糊的点子、长篇小说或专业剧本梳理成结构清晰、情绪饱满的分场剧本。",
    responsibilities: [
      "理解你的灵感 / 小说 / 剧本输入",
      "用 RAG 长文本引擎拆解超长故事",
      "产出分场剧本：梗概、场次、情绪基调",
    ],
    vimaxStage: "Script Understanding & Generation",
    workingVerb: "正在创作剧本",
  },
  {
    id: "director",
    vimaxAgent: "Director",
    name: "Vincent",
    title: "导演 · Director",
    emoji: "🎬",
    accent: "#a855f7",
    tagline: "用镜头语言，把剧本变成可拍摄的分镜。",
    bio: "Vincent 是有想法的视觉派，把每一场戏拆成具体的镜头，标注景别、运镜与节奏。",
    responsibilities: [
      "把剧本拆解为场景与镜头",
      "设计运镜、景别与镜头时长",
      "产出可执行的分镜表 (storyboard)",
    ],
    vimaxStage: "Scene & Shot Planning",
    workingVerb: "正在设计分镜",
  },
  {
    id: "producer",
    vimaxAgent: "Producer",
    name: "Nina",
    title: "制片 · Producer",
    emoji: "🎯",
    accent: "#10b981",
    tagline: "管好每一个角色、场景与道具，保证前后一致。",
    bio: "Nina 极度细致，负责参考图资产、角色与场景的一致性，让整部片子看起来出自同一个世界。",
    responsibilities: [
      "规划角色 / 场景 / 道具参考图资产",
      "建立资产索引，跨镜头复用",
      "并行生成并挑选最一致的首帧",
    ],
    vimaxStage: "Visual Asset Planning · Asset Indexing · Consistency & Continuity",
    workingVerb: "正在准备美术资产",
  },
  {
    id: "cinematographer",
    vimaxAgent: "Video Generator",
    name: "Max",
    title: "摄制 · Video Generator",
    emoji: "🎥",
    accent: "#38bdf8",
    tagline: "把分镜和资产，合成为最终成片。",
    bio: "Max 是技术控，按分镜逐镜生成画面，再把所有镜头拼接、调色，输出最终视频。",
    responsibilities: [
      "逐镜头生成画面 (image → video)",
      "并行渲染多个镜头",
      "拼接、组装并输出最终成片",
    ],
    vimaxStage: "Visual Synthesis & Assembly · Output",
    workingVerb: "正在渲染成片",
  },
];

export const CREW_BY_ID: Record<CrewId, CrewMember> = Object.fromEntries(
  CREW.map((m) => [m.id, m]),
) as Record<CrewId, CrewMember>;

/** Pipeline order — matches ViMax's role hand-off. */
export const PIPELINE_ORDER: CrewId[] = [
  "screenwriter",
  "director",
  "producer",
  "cinematographer",
];

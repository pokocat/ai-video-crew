/**
 * The four production modes, mapped 1:1 onto ViMax's operational modes:
 *   Idea2Video · Novel2Video · Script2Video · AutoCameo
 */

export type ModeId = "idea2video" | "novel2video" | "script2video" | "autocameo";

export interface Mode {
  id: ModeId;
  /** The exact ViMax mode name. */
  vimaxMode: string;
  name: string;
  icon: string;
  blurb: string;
  /** Label for the main text input. */
  inputLabel: string;
  placeholder: string;
  /** Whether this mode accepts a reference photo (AutoCameo). */
  acceptsReference: boolean;
  /** Example input pre-fillable from the UI. */
  example: string;
}

export const MODES: Mode[] = [
  {
    id: "idea2video",
    vimaxMode: "Idea2Video",
    name: "灵感成片",
    icon: "💡",
    blurb: "一句话灵感，自动生成完整的多场景短片。",
    inputLabel: "你的灵感 / 创意",
    placeholder: "例如：如果一只猫和一只狗是好朋友，当它们遇到一只新来的猫会发生什么？",
    acceptsReference: false,
    example:
      "如果一只猫和一只狗是最好的朋友，当它们遇到一只新来的猫，会发生一段温暖又好笑的故事。",
  },
  {
    id: "novel2video",
    vimaxMode: "Novel2Video",
    name: "小说改编",
    icon: "📚",
    blurb: "把长篇小说 / 故事，拆解成分集的视频内容。",
    inputLabel: "小说 / 长故事正文",
    placeholder: "粘贴你的小说章节或完整故事，Aria 会用 RAG 引擎拆解成分场剧本…",
    acceptsReference: false,
    example:
      "夜色笼罩着古老的灯塔。守塔人独自一人，直到那封漂流瓶里的信改变了一切——信中写道：'十年之约，今夜归来。'",
  },
  {
    id: "script2video",
    vimaxMode: "Script2Video",
    name: "剧本拍摄",
    icon: "🎞️",
    blurb: "已有专业剧本？直接交给剧组拍成片。",
    inputLabel: "剧本 (含场景标题与动作描述)",
    placeholder: "EXT. 学校体育馆 - 日\n一群学生正在练习篮球…",
    acceptsReference: false,
    example:
      "EXT. 学校体育馆 - 日\n一群学生正在练习篮球。队长林夏运球突破，全场屏息。她跃起，投出制胜一球。",
  },
  {
    id: "autocameo",
    vimaxMode: "AutoCameo",
    name: "真人出演",
    icon: "🪄",
    blurb: "上传一张照片，让你成为故事的主角。",
    inputLabel: "故事设定",
    placeholder: "描述你想出演的故事，并上传一张参考照片…",
    acceptsReference: true,
    example: "我成为一名星际探险家，第一次踏上一颗发光的水晶星球。",
  },
];

export const MODE_BY_ID: Record<ModeId, Mode> = Object.fromEntries(
  MODES.map((m) => [m.id, m]),
) as Record<ModeId, Mode>;

export const STYLE_PRESETS = [
  "电影感 Cinematic",
  "卡通 Cartoon",
  "动画 Anime",
  "写实 Photorealistic",
  "水彩 Watercolor",
  "赛博朋克 Cyberpunk",
] as const;

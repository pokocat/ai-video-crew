import { frameArt } from "../art";
import { MODE_BY_ID } from "../modes";
import type {
  AssetArtifact,
  AssetRef,
  ProjectInput,
  Scene,
  ScriptArtifact,
  Shot,
  StoryboardArtifact,
  VideoArtifact,
  VideoFrame,
} from "../types";
import type { Emit, GenerationProvider } from "./types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MOODS = ["温暖", "紧张", "欢快", "神秘", "壮阔", "感伤", "诙谐", "宁静"];
const CAMERAS = [
  "全景 · 缓慢推进",
  "中景 · 手持跟拍",
  "特写 · 浅景深",
  "航拍 · 俯视下摇",
  "过肩镜头 · 固定",
  "低角度 · 仰拍",
];

/** Split free text into a handful of sentence-ish beats. */
function beats(text: string): string[] {
  const parts = text
    .split(/[。.!?！？\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : [text.trim() || "一个尚未展开的故事"];
}

function buildScript(input: ProjectInput): ScriptArtifact {
  const mode = MODE_BY_ID[input.mode];
  const b = beats(input.prompt);
  // Idea/AutoCameo → fewer scenes; novel/script → more.
  const target =
    input.mode === "novel2video" ? 5 : input.mode === "script2video" ? 4 : 3;
  const scenes: Scene[] = [];
  for (let i = 0; i < target; i++) {
    const beat = b[i % b.length];
    scenes.push({
      id: `s${i + 1}`,
      heading: `第 ${i + 1} 场`,
      synopsis: beat.slice(0, 80),
      mood: MOODS[(i + beat.length) % MOODS.length],
    });
  }
  return {
    logline: `【${mode.name} · ${input.style}】${b[0].slice(0, 60)}`,
    scenes,
  };
}

function buildStoryboard(script: ScriptArtifact): StoryboardArtifact {
  const shots: Shot[] = [];
  script.scenes.forEach((scene, si) => {
    const shotCount = 2 + (scene.synopsis.length % 2); // 2–3 shots per scene
    for (let k = 0; k < shotCount; k++) {
      shots.push({
        id: `${scene.id}-sh${k + 1}`,
        sceneId: scene.id,
        description: `${scene.synopsis}（镜 ${k + 1}）`,
        camera: CAMERAS[(si + k) % CAMERAS.length],
        durationSec: 3 + ((si + k) % 3),
      });
    }
  });
  return { shots };
}

function buildAssets(input: ProjectInput, script: ScriptArtifact): AssetArtifact {
  const refs: AssetRef[] = [];
  const kinds: AssetRef["kind"][] = ["character", "character", "location", "prop"];
  const emojiByKind = { character: "🧍", location: "🏞️", prop: "🎒" } as const;
  kinds.forEach((kind, i) => {
    const label =
      kind === "character"
        ? `角色 ${i + 1}`
        : kind === "location"
          ? `场景 ${script.scenes[i % script.scenes.length]?.mood ?? ""}`
          : "关键道具";
    refs.push({
      id: `asset-${i + 1}`,
      label,
      kind,
      imageUrl: frameArt({
        seed: `${input.title}-${kind}-${i}`,
        emoji: emojiByKind[kind],
        label,
        width: 320,
        height: 320,
      }),
    });
  });
  return {
    references: refs,
    consistencyNote:
      "已为每个角色/场景并行生成候选参考图，并选取最一致的首帧以保证跨镜头连贯。",
  };
}

function buildVideo(
  input: ProjectInput,
  script: ScriptArtifact,
  storyboard: StoryboardArtifact,
): VideoArtifact {
  const frames: VideoFrame[] = storyboard.shots.map((shot, i) => {
    const scene = script.scenes.find((s) => s.id === shot.sceneId);
    return {
      shotId: shot.id,
      url: frameArt({
        seed: `${input.title}-${shot.id}`,
        emoji: MODE_BY_ID[input.mode].icon,
        label: scene?.synopsis ?? shot.description,
        width: 1280,
        height: 720,
      }),
      caption: shot.description,
      durationSec: shot.durationSec,
    };
  });
  return {
    format: "reel",
    posterUrl: frames[0]?.url ?? frameArt({ seed: input.title, label: input.title }),
    frames,
    totalDurationSec: frames.reduce((a, f) => a + f.durationSec, 0),
  };
}

/**
 * The built-in mock crew. Faithfully walks ViMax's pipeline, emitting live logs
 * and synthesizing offline artifacts so the whole platform runs without keys.
 */
export const mockProvider: GenerationProvider = {
  id: "mock",
  label: "内置模拟剧组 (offline)",

  async screenwrite(input, emit) {
    emit("读取输入，理解题材与目标受众…");
    await sleep(700);
    emit(`识别模式：${MODE_BY_ID[input.mode].vimaxMode}`);
    await sleep(600);
    if (input.mode === "novel2video") {
      emit("启动 RAG 长文本引擎，拆解超长故事…");
      await sleep(800);
    }
    const script = buildScript(input);
    emit(`生成分场剧本：共 ${script.scenes.length} 场`);
    await sleep(500);
    emit("剧本定稿 ✓");
    return script;
  },

  async direct(_input, script, emit) {
    emit("通读剧本，规划镜头语言…");
    await sleep(700);
    const storyboard = buildStoryboard(script);
    for (const scene of script.scenes) {
      const n = storyboard.shots.filter((s) => s.sceneId === scene.id).length;
      emit(`${scene.heading}：拆解为 ${n} 个镜头`);
      await sleep(350);
    }
    emit(`分镜表完成：共 ${storyboard.shots.length} 个镜头 ✓`);
    return storyboard;
  },

  async produce(input, script, _storyboard, emit) {
    emit("规划角色 / 场景 / 道具参考图资产…");
    await sleep(700);
    const assets = buildAssets(input, script);
    for (const ref of assets.references) {
      emit(`并行生成候选图并挑选最一致首帧：${ref.label}`);
      await sleep(400);
    }
    emit("建立资产索引，标记可复用资源 ✓");
    await sleep(300);
    return assets;
  },

  async render(input, storyboard, _assets, emit) {
    emit("加载分镜与资产，准备逐镜渲染…");
    await sleep(600);
    const script = buildScript(input); // deterministic, re-derive captions
    const video = buildVideo(input, script, storyboard);
    for (let i = 0; i < storyboard.shots.length; i++) {
      emit(`渲染镜头 ${i + 1}/${storyboard.shots.length} (image → video)…`);
      await sleep(300);
    }
    emit("拼接、调色、组装最终成片…");
    await sleep(700);
    emit(`成片输出 ✓ 时长约 ${video.totalDurationSec}s`);
    return video;
  },
};

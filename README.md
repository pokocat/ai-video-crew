# 🎬 AI Video Crew

一个基于开源 **[ViMax](https://github.com/HKUDS/ViMax)** (HKUDS/ViMax, MIT) 多智能体视频生成框架构建的视频 AI 平台。

ViMax 用四个智能体（Screenwriter / Director / Producer / Video Generator）把一句话灵感、一部小说或一个剧本自动拍成多场景视频。AI Video Crew 把这四个智能体包装成一支**拟人化的 AI 剧组**，让普通用户也能直观理解"谁在做什么"，并提供 Web 端的创建、进度追踪与作品画廊体验。

> 平台的流程与角色 **完全对齐 ViMax** —— 相同的四个智能体、相同的四种模式、相同的处理管线，只是给每个智能体取了名字和头像。

## 你的剧组（= ViMax 的四个智能体）

| 成员 | 角色 | 对应 ViMax 智能体 | 负责的管线阶段 |
| --- | --- | --- | --- |
| 📝 **Aria** | 编剧 | Screenwriter | Script Understanding & Generation |
| 🎬 **Vincent** | 导演 | Director | Scene & Shot Planning |
| 🎯 **Nina** | 制片 | Producer | Visual Asset Planning · Asset Indexing · Consistency |
| 🎥 **Max** | 摄制 | Video Generator | Visual Synthesis & Assembly · Output |

## 四种模式（= ViMax 的四种模式）

| 平台模式 | ViMax 模式 | 说明 |
| --- | --- | --- |
| 💡 灵感成片 | Idea2Video | 一句话创意 → 多场景短片 |
| 📚 小说改编 | Novel2Video | 长篇小说 → 分集视频 |
| 🎞️ 剧本拍摄 | Script2Video | 专业剧本 → 成片 |
| 🪄 真人出演 | AutoCameo | 上传照片 → 成为主角 |

## 技术栈

- **Next.js (App Router) + TypeScript + Tailwind CSS v4**
- 进程内任务编排引擎，逐阶段驱动剧组并流式输出日志
- **可插拔生成后端**：统一的 `GenerationProvider` 接口
  - `mock`（默认）：内置模拟剧组，完全离线、无需 API key，立即可演示
  - `vimax`：转发到真实的 ViMax Python worker（需 Gemini / Veo 等 API key）

## 快速开始

```bash
npm install
npm run dev      # http://localhost:3000
```

默认使用内置模拟剧组（`GENERATION_PROVIDER=mock`），开箱即用、全程离线。
打开首页 → 「开始创作」→ 选择模式并输入创意 → 实时观看剧组逐阶段产出剧本、分镜、美术资产与成片。

## 接入真实的 ViMax

模拟后端产出的是占位画面（离线 SVG）。要生成真实视频，把 [ViMax](https://github.com/HKUDS/ViMax) 部署成一个 HTTP worker，按阶段暴露接口：

```
POST /screenwrite  → ScriptArtifact
POST /direct       → StoryboardArtifact
POST /produce      → AssetArtifact
POST /render       → VideoArtifact (format: "mp4")
```

然后配置环境变量（见 `.env.example`）：

```bash
GENERATION_PROVIDER=vimax
VIMAX_WORKER_URL=http://localhost:8000
VIMAX_LLM_API_KEY=...      # 对应 ViMax configs/*.yaml 中的模型配置
VIMAX_IMAGE_API_KEY=...
VIMAX_VIDEO_API_KEY=...
```

适配器代码见 `src/lib/providers/vimax.ts`，无需改动平台其余部分即可切换后端。

## 项目结构

```
src/
├── app/
│   ├── page.tsx                 # 落地页（剧组 + 模式介绍）
│   ├── crew/page.tsx            # 剧组详情
│   ├── create/page.tsx          # 创建作品（模式/创意/风格表单）
│   ├── projects/page.tsx        # 作品画廊（拍摄中实时刷新）
│   ├── projects/[id]/page.tsx   # 制作详情（实时进度 + 成片/剧本/分镜/资产）
│   └── api/projects/            # 创建/列表/详情 API
├── components/ReelPlayer.tsx    # 成片播放器（mock 为分镜轮播，真实为 mp4）
└── lib/
    ├── crew.ts                  # 四位成员 ↔ ViMax 智能体映射
    ├── modes.ts                 # 四种模式 ↔ ViMax 模式映射
    ├── engine.ts                # 管线编排引擎
    ├── store.ts                 # 进程内作品存储（MVP；可替换为数据库）
    ├── art.ts                   # 离线 SVG 占位图生成
    └── providers/               # 可插拔生成后端（mock / vimax）
```

## 后续路线（MVP 之外）

- 用户认证、积分 / 计费
- 数据库持久化（替换 `store.ts`，例如 Prisma + Postgres）
- 独立队列 + worker（替换进程内引擎）
- 真实 ViMax worker 部署与 mp4 产出

## 致谢

视频生成框架与流程设计基于香港大学数据科学实验室开源项目
**[HKUDS/ViMax](https://github.com/HKUDS/ViMax)**（MIT License）。本仓库是其之上的 Web 平台层。

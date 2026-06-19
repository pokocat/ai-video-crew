import { NextResponse } from "next/server";
import { startPipeline } from "@/lib/engine";
import { MODE_BY_ID } from "@/lib/modes";
import { getProvider } from "@/lib/providers";
import { createProject, listProjects } from "@/lib/store";
import type { ProjectInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ projects: listProjects() });
}

export async function POST(req: Request) {
  let body: Partial<ProjectInput>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "无效的请求体" }, { status: 400 });
  }

  const mode = body.mode;
  if (!mode || !MODE_BY_ID[mode]) {
    return NextResponse.json({ error: "未知的生成模式" }, { status: 400 });
  }
  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: "请填写创意 / 剧本内容" }, { status: 400 });
  }

  const input: ProjectInput = {
    title: body.title?.trim() || body.prompt.trim().slice(0, 24) || "未命名作品",
    mode,
    prompt: body.prompt.trim(),
    style: body.style?.trim() || "电影感 Cinematic",
    userRequirement: body.userRequirement?.trim() || "",
    referenceImage: MODE_BY_ID[mode].acceptsReference ? body.referenceImage : undefined,
  };

  const project = createProject(input, getProvider().id);
  startPipeline(project.id);

  return NextResponse.json({ project }, { status: 201 });
}

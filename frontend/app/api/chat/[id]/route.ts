import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../db/client";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
  }

  const { prompt } = await req.json();
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const name = prompt.split(" ")[0];

  let chat = await db.chat.findUnique({
    where: { id },
    include: { interaction: true },
  });
  if (!chat) {
    chat = await db.chat.create({
      data: {
        id,
        name: name,
        interaction: {
          create: {
            prompt: prompt,
          },
        },
      },
      include: { interaction: true },
    })
  }

  return NextResponse.json(chat);
} 
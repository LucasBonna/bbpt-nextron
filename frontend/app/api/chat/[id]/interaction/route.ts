import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../../db/client";

export async function POST(req: NextRequest, { params }: { params: { id: string, prompt: string } }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
  }

  const { prompt } = await req.json();

  const interaction = await db.interaction.create({
    data: {
      chatId: id,
      prompt,
    }
  });

  return NextResponse.json(interaction);
} 
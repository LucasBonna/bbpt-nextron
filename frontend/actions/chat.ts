"use server"

import { revalidatePath } from "next/cache"
import prisma from "../../prisma/database"

export async function getChatWithInteractions(chatId: string) {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { interactions: { orderBy: { createdAt: "asc" } } },
    })

    return chat
  } catch (error) {
    console.error("Error fetching chat:", error)
    return null
  }
}

export async function createChat() {
  try {
    const chat = await prisma.chat.create({
      data: {},
    })

    return chat
  } catch (error) {
    console.error("Error creating chat:", error)
    return null
  }
}

export async function sendMessage(chatId: string, prompt: string) {
  try {
    let chat = await prisma.chat.findUnique({
      where: { id: chatId },
    })

    if (!chat) {
      chat = await prisma.chat.create({
        data: { id: chatId },
      })
    }

    const mockedResponse = "Mocked response from the server";

    const interaction = await prisma.interaction.create({
      data: {
        chatId,
        prompt,
        response: mockedResponse,
      },
    })

    revalidatePath(`/chat/${chatId}`)

    return {
      success: true,
      interactionId: interaction.id,
    }
  } catch (error) {
    console.error("Error sending message:", error)
    return {
      success: false,
      error: "Failed to send message",
    }
  }
}

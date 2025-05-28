'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../../prisma/database';
import { getMCPClient } from '@/lib/mcpClient';
import { MessageParam } from '@anthropic-ai/sdk/resources';
import { Client } from '@/components/client-selector';

export async function getBasicChatInfo() {
	try {
		const chats = await prisma.chat.findMany({
			include: {
				interactions: false,
			},
			orderBy: { id: 'asc' },
		});
		if (!chats) {
			return [];
		}

		return chats;
	} catch (error) {
		console.error('Error fetching chat:', error);
		return [];
	}
}

export async function getChatWithInteractions(chatId: string) {
	try {
		const chat = await prisma.chat.findUnique({
			where: { id: chatId },
			include: { interactions: { orderBy: { createdAt: 'asc' } } },
		});

		return chat;
	} catch (error) {
		console.error('Error fetching chat:', error);
		return null;
	}
}

export async function deleteteChat(id: string) {
	try {
		return await prisma.chat.delete({
			where: {
				id
			},
		});
	} catch (error) {
		console.error('Error deleting chat:', error);
		throw error;
	}
}

export async function renameChat(id: string, name: string) {
	try {
		return await prisma.chat.update({
			where: {
				id
			},
			data: {
				name
			},
		});
	} catch (error) {
		console.error('Error renaming chat:', error);
		throw error;
	}
}

export async function createChat(id: string, name: string) {
	try {
		const chat = await prisma.chat.create({
			data: {
				id,
				name
			},
		});

		return chat;
	} catch (error) {
		console.error('Error creating chat:', error);
		throw error;
	}
}

export async function sendMessage(chatId: string, prompt: string, client: Client | null) {
	try {
		const mcpClient = getMCPClient();

		let chat = await prisma.chat.findUnique({
			where: { id: chatId },
			include: {
				interactions: {
					orderBy: { createdAt: 'asc' },
					take: 10,
				},
			},
		});

		const chatName = `${client.name} - ${prompt.substring(0, 15)}...`

		if (!chat) {
			chat = { ...(await createChat(chatId, chatName)), interactions: [] };
		}

		const chatHistory: MessageParam[] = [];
		for (const interaction of chat.interactions) {
			chatHistory.push({
				role: 'user',
				content: interaction.prompt,
			});

			if (interaction.response) {
				chatHistory.push({
					role: 'assistant',
					content: interaction.response,
				});
			}
		}

		const startTime = performance.now();

		const result = await mcpClient.processMessage(prompt, client, chatHistory);

		const responseTime = (performance.now() - startTime) / 1000;

		const interaction = await prisma.interaction.create({
			data: {
				prompt: prompt,
				response: result.text,
				responseTime,
				model: 'claude-3-5-sonnet-latest',
				chatId: chatId,
			},
		});

		revalidatePath(`/chat/${chatId}`);

		return interaction;
	} catch (error) {
		console.error('Error sending message:', error);
		const mockedErrorResponse = `Ocorreu um erro ao enviar sua mensagem,
		 por favor tente novamente`;
		await prisma.interaction.create({
			data: {
				prompt: prompt,
				response: mockedErrorResponse,
				responseTime: null,
				model: 'claude-3-5-sonnet-latest',
				chatId: chatId,
			},
		});
		throw error;
	}
}

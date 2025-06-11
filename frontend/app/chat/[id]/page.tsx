'use client';

import type React from 'react';
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { getChatWithInteractions, sendMessage } from '@/actions/chat';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Send } from 'lucide-react';
import { MessageContent } from '@/components/(chat)/message-content';
import { type Client, ClienteSelector } from '@/components/client-selector';
import { authClient } from '@/lib/auth-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Interaction {
	id: number;
	prompt: string;
	response: string | null;
	createdAt: Date;
}

interface Chat {
	id: string;
	name: string | null;
	interactions: Interaction[];
}

export default function ChatPage() {
	const params = useParams<{ id: string }>();
	const [chat, setChat] = useState<Chat | null>(null);
	const [loading, setLoading] = useState(true);
	const [sending, setSending] = useState(false);
	const [input, setInput] = useState('');
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [showMessages, setShowMessages] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const [selectedClient, setSelectedClient] = useState<Client | null>(null);
	const { data: userSession } = authClient.useSession();

	useEffect(() => {
		const fetchChat = async () => {
			setLoading(true);
			const chatData = await getChatWithInteractions(params.id);
			setChat(chatData);
			setLoading(false);
		};

		fetchChat();
	}, [params.id]);

	// Delay para scroll após animação
	useEffect(() => {
		if (chat?.interactions) {
			const timeout = setTimeout(() => {
				messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
			}, 700);
			return () => clearTimeout(timeout);
		}
	}, [chat?.interactions]);

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!input.trim() || sending) return;

		const isFirstMessage =
			!chat?.interactions || chat.interactions.length === 0;

		if (isFirstMessage) {
			setIsTransitioning(true);
			setTimeout(() => {
				setShowMessages(true);
			}, 800);
		}

		setSending(true);

		try {
			const optimisticChat = {
				...chat,
				interactions: [
					...(chat?.interactions || []),
					{
						id: Date.now(),
						prompt: input,
						response: null,
						createdAt: new Date(),
					},
				],
			};
			setChat(optimisticChat as Chat);

			const currentInput = input;
			setInput('');

			await sendMessage(params.id, currentInput, selectedClient);

			const updatedChat = await getChatWithInteractions(params.id);
			setChat(updatedChat);
			inputRef.current?.focus();
		} catch (error) {
			console.error('Error sending message:', error);
		} finally {
			setSending(false);
			const updatedChat = await getChatWithInteractions(params.id);
			setChat(updatedChat);
			inputRef.current?.focus();
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin text-gray-500" />
			</div>
		);
	}

	const hasMessages = chat?.interactions && chat.interactions.length > 0;

	return (
		<div className="flex flex-col h-screen max-h-screen p-2 box-border">
			<div className="flex justify-end p-2 w-full max-w-6xl mx-auto">
				<ClienteSelector onSelectClient={setSelectedClient} />
			</div>

			<Card className="flex flex-col h-full bg-[#282828] border border-[#282828] shadow-none max-w-6xl mx-auto w-full">
				<CardContent
					className={`flex-1 overflow-y-auto p-6 space-y-4 ${
						!hasMessages ? 'flex flex-col justify-center items-center' : ''
					}`}
				>
					{hasMessages ? (
						<div className="space-y-4" aria-live="polite">
							{chat.interactions.map((interaction, index) => {
								const isLast = index === chat.interactions.length - 1;
								return (
									<div
										key={interaction.id}
										className={`space-y-4 ${isLast ? 'animate-slide-in-message' : ''}`}
									>
										<div className="flex items-start justify-end gap-2">
											<div className="bg-[#3B3B3B] rounded-lg border border-[#8E8E8E] p-3 max-w-[80%] text-sm">
												<div className="flex items-start gap-2">
													<p className="text-secondary-foreground flex-1">
														{interaction.prompt}
													</p>
													<Avatar className="h-9 w-9 rounded-xl flex-shrink-0 left-2">
														<AvatarImage
															src={userSession?.user?.image}
															alt={userSession?.user?.name}
														/>
														<AvatarFallback className="rounded-full">
															{userSession?.user?.name?.charAt(0).toUpperCase()}
														</AvatarFallback>
													</Avatar>
												</div>
											</div>
										</div>

										{interaction.response ? (
											<div className="flex items-start justify-start gap-2">
												<div className="bg-transparent rounded-lg p-3 max-w-[80%] whitespace-pre-wrap">
													<div className="flex items-start gap-2 text-sm">
														<Avatar className="h-9 w-9 rounded-xl bg-[#00BC5F]/10 flex-shrink-0 right-2">
															<AvatarFallback className="rounded-xl text-[#00BC5F]">
																BBP
															</AvatarFallback>
														</Avatar>
														<MessageContent content={interaction.response} />
													</div>
												</div>
											</div>
										) : (
											<div className="flex items-start justify-start gap-2">
												<div className="bg-card rounded-lg p-3">
													<div className="flex items-center gap-2">
														<Avatar className="h-9 w-9 rounded-xl bg-[#00BC5F]/10 flex-shrink-0">
															<AvatarFallback className="rounded-xl text-[#00BC5F]">
																BBP
															</AvatarFallback>
														</Avatar>
														<Loader2 className="h-4 w-4 animate-spin text-card-foreground" />
													</div>
												</div>
											</div>
										)}
									</div>
								);
							})}
							<div ref={messagesEndRef} />
						</div>
					) : (
						<div className="flex flex-col items-center justify-center space-y-8 -mt-20">
							<div
								className={`text-center ${isTransitioning ? 'animate-greeting-exit' : 'animate-greeting-enter'}`}
								style={{
									animation: isTransitioning
										? 'greetingExit 1s cubic-bezier(0.6, 0, 0.4, 1) forwards'
										: 'greetingEnter 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both',
								}}
							>
								<span className="bg-gradient-to-r from-[#00BC5F] to-[#03944C] bg-clip-text text-transparent font-medium text-[33px] select-none">
									Olá, {userSession?.user?.name}
								</span>
							</div>

							<div
								className={`w-full max-w-[500px] mx-auto ${isTransitioning ? 'animate-input-exit' : 'animate-input-enter'}`}
								style={{
									animation: isTransitioning
										? 'inputExit 1s cubic-bezier(0.6, 0, 0.4, 1) 0.2s forwards'
										: 'inputEnter 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both',
									width: '500px',
								}}
							>
								<form onSubmit={handleSendMessage} className="w-full">
									<div className="relative w-full">
										<Input
											ref={inputRef}
											value={input}
											onChange={e => setInput(e.target.value)}
											placeholder="Escreva a sua mensagem..."
											className="pr-20 h-14 border-[#8E8E8E] w-full transition-all duration-300 ease-out focus:scale-[1.02] focus:shadow-lg"
											disabled={sending}
										/>
										<button
											type="submit"
											disabled={sending || !selectedClient}
											className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-all duration-200 hover:scale-110"
										>
											{sending ? (
												<Loader2 className="h-5 w-5 animate-spin" />
											) : (
												<Send className="h-5 w-5" />
											)}
										</button>
									</div>
								</form>
							</div>
						</div>
					)}
				</CardContent>

				{hasMessages && (
					<CardFooter
						className="flex items-center justify-center p-4"
						style={{
							animation: showMessages
								? 'slideInBottom 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s both'
								: 'none',
						}}
					>
						<form
							onSubmit={handleSendMessage}
							className="w-full max-w-[700px] mx-auto"
						>
							<div className="relative w-full">
								<Input
									ref={inputRef}
									value={input}
									onChange={e => setInput(e.target.value)}
									placeholder="Escreva a sua mensagem..."
									className="pr-20 h-14 border-[#8E8E8E] w-full transition-all duration-300 ease-out focus:scale-[1.01] focus:shadow-lg"
									disabled={sending}
								/>
								<button
									type="submit"
									disabled={sending || !selectedClient}
									className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-all duration-200 hover:scale-110"
								>
									{sending ? (
										<Loader2 className="h-5 w-5 animate-spin" />
									) : (
										<Send className="h-5 w-5" />
									)}
								</button>
							</div>
						</form>
					</CardFooter>
				)}
			</Card>

			<style jsx>{`
				@keyframes greetingEnter {
					0% {
						opacity: 0;
						transform: translateY(20px) scale(0.95);
					}
					100% {
						opacity: 1;
						transform: translateY(0) scale(1);
					}
				}
				@keyframes greetingExit {
					0% {
						opacity: 1;
						transform: translateY(0) scale(1);
					}
					50% {
						opacity: 0.7;
						transform: translateY(-10px) scale(1.02);
					}
					100% {
						opacity: 0;
						transform: translateY(-30px) scale(0.95);
					}
				}
				@keyframes inputEnter {
					0% {
						opacity: 0;
						transform: translateY(30px) scale(0.95);
					}
					100% {
						opacity: 1;
						transform: translateY(0) scale(1);
					}
				}
				@keyframes inputExit {
					0% {
						opacity: 1;
						transform: translateY(0) scale(1);
					}
					30% {
						opacity: 0.8;
						transform: translateY(10px) scale(0.98);
					}
					100% {
						opacity: 0;
						transform: translateY(200px) scale(0.9);
					}
				}
				@keyframes slideInMessage {
					0% {
						opacity: 0;
						transform: translateX(-20px) translateY(10px);
					}
					100% {
						opacity: 1;
						transform: translateX(0) translateY(0);
					}
				}
				@keyframes slideInBottom {
					0% {
						opacity: 0;
						transform: translateY(50px);
					}
					100% {
						opacity: 1;
						transform: translateY(0);
					}
				}

				.animate-slide-in-message {
					animation: slideInMessage 0.6s cubic-bezier(0.4, 0, 0.2, 1);
				}
			`}</style>
		</div>
	);
}

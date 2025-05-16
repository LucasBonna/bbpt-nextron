import { Button } from "../../../components/ui/button";
import React, { useState } from "react";
import { useChat, useSendMessage } from "../../../lib/hooks/chatHooks";

interface ChatPageProps {
	params: {
		id: string
	}
}

export default function ChatPage({ params }: ChatPageProps) {
	const { id } = params;
	const { data: chat, isPending, error } = useChat(id);
	const [message, setMessage] = useState("");
	const sendMessage = useSendMessage(id);

	if (isPending) return <div>Carregando... / Loading...</div>;
	if (error) return <div>Erro: {(error as Error).message}</div>;

	return (
		<div>
			<Button>Button ShadcnUI</Button>
			<h1 className="text-3xl font-bold underline">Teste</h1>
			<a>Id da pagina: {id}</a>
			<div>
				<ul>
					{chat?.messages.map((msg: any) => (
						<li key={msg.id}>
							<b>{msg.createdAt}:</b> {msg.content}
						</li>
					))}
				</ul>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						sendMessage.mutate(message);
						setMessage("");
					}}
				>
					<input
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder="Digite sua mensagem..."
					/>
					<Button type="submit" disabled={sendMessage.isPending}>
						Enviar
					</Button>
				</form>
			</div>
		</div>
	)
}

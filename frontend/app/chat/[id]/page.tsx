interface ChatPageProps {
	params: {
		id: string
	}
}

export default function ChatPage({ params }: ChatPageProps) {
	const { id } = params;

	return (
		<div>
			<h1 className="text-3xl font-bold underline">Teste</h1>
			<a>Id da pagina: {id}</a>
		</div>
	)
}

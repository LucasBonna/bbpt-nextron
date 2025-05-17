"use client"

import { useParams } from "next/navigation"

export default function ChatPage() {
	const params = useParams<{ id: string }>()


	return (
		<div>
			<h1>Teste</h1>
			<a>ChatId = {params.id}</a>
		</div>
	)
}

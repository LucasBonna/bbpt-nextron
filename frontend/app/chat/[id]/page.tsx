"use client"

import type React from "react"

import { useParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { getChatWithInteractions, sendMessage } from "@/actions/chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Send } from 'lucide-react'
import { MessageContent } from "@/components/(chat)/message-content" 

interface Interaction {
  id: number
  prompt: string
  response: string | null
  createdAt: Date
}

interface Chat {
  id: string
  name: string | null
  interactions: Interaction[]
}

export default function ChatPage() {
  const params = useParams<{ id: string }>()
  const [chat, setChat] = useState<Chat | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchChat = async () => {
      setLoading(true)
      const chatData = await getChatWithInteractions(params.id)
      setChat(chatData)
      setLoading(false)
    }

    fetchChat()
  }, [params.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chat?.interactions])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || sending) return

    setSending(true)

    try {
      const optimisticChat = {
        ...chat,
        interactions: [
          ...(chat?.interactions || []),
          { id: Date.now(), prompt: input, response: null, createdAt: new Date() },
        ],
      }
      setChat(optimisticChat as Chat)
      
      const currentInput = input
      setInput("")
      
      await sendMessage(params.id, currentInput)
      
      const updatedChat = await getChatWithInteractions(params.id)
      setChat(updatedChat)
      
      inputRef.current?.focus()
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen max-h-screen p-4">
      <Card className="flex flex-col h-full">
        <CardHeader className="px-6 py-4 border-b">
          <CardTitle>Chat {chat?.name || `#${params.id.substring(0, 8)}`}</CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {chat?.interactions && chat.interactions.length > 0 ? (
            chat.interactions.map((interaction) => (
              <div key={interaction.id} className="space-y-4">
                <div className="flex items-end justify-end">
                  <div className="bg-secondary rounded-lg p-3 max-w-[80%]">
                    <p className="text-secondary-foreground">{interaction.prompt}</p>
                  </div>
                </div>

                {interaction.response ? (
                  <div className="flex items-start justify-start">
                    <div className="bg-accent rounded-lg p-3 max-w-[80%]">
                      <MessageContent content={interaction.response} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-start">
                    <div className="bg-card rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin text-card-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 my-8">
              <p>No messages yet. Start a conversation!</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        <CardFooter className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow"
              disabled={sending}
            />
            <Button type="submit" disabled={sending || !input.trim()}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin flex items-start justify-end" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

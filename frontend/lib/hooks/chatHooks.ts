import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useChat(id: string, prompt: string) {
  return useQuery({
    queryKey: ["chat", id],
    queryFn: async () => {
      const res = await fetch(`/api/chat/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error("Erro ao buscar/criar chat");
      return res.json();
    },
  });
}

export function useSendInteraction(chatId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (prompt: string) => {
      const res = await fetch(`/api/chat/${chatId}/interaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error("Erro ao enviar mensagem");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
    },
  });
} 
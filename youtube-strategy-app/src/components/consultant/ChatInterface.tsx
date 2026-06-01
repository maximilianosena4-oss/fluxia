"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useConsultantStore } from "@/store/useConsultantStore";
import { useUserStore } from "@/store/useUserStore";
import type { ChatMessage } from "@/types/ai";
import { MessageBubble } from "./MessageBubble";

const SUGGESTED_PROMPTS = [
  "¿Por dónde empiezo hoy?",
  "Analiza mi nicho",
  "¿Cuál es mi primer video?",
  "¿Cómo optimizo thumbnails?",
  "¿Cuánto gano en 90 días?",
];

const CHANNEL_ID = "default"; // Hasta que el usuario tenga canal en DB

interface ChatInterfaceProps {
  initialContext?: {
    nicheScore: number | null;
    roadmapProgress: number;
    currentNiche: string | null;
    lastCompletedActions: string[];
  };
}

export function ChatInterface({ initialContext }: ChatInterfaceProps) {
  const { sessions, createSession, addMessage, updateStreamingMessage, finalizeStreamingMessage, activeSessionId, setActiveSession, isStreaming, setStreaming } = useConsultantStore();
  const { metrics } = useUserStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Obtener o crear sesión activa
  const sessionId = activeSessionId ?? (() => {
    const id = createSession(CHANNEL_ID);
    return id;
  })();

  const session = sessions.find((s) => s.id === sessionId);
  const messages = session?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    setInput("");

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      createdAt: new Date(),
    };

    const assistantMsgId = `assistant-${Date.now()}`;
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      createdAt: new Date(),
      isStreaming: true,
    };

    addMessage(sessionId, userMsg);
    addMessage(sessionId, assistantMsg);
    setStreaming(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          context: {
            nicheScore: initialContext?.nicheScore ?? metrics.nicheScore,
            roadmapProgress: initialContext?.roadmapProgress ?? metrics.roadmapProgress,
            currentNiche: initialContext?.currentNiche ?? null,
            lastCompletedActions: initialContext?.lastCompletedActions ?? [],
          },
        }),
      });

      if (!res.ok || !res.body) {
        updateStreamingMessage(sessionId, assistantMsgId, "Error al conectar con NEXUS. Intentá de nuevo.");
        finalizeStreamingMessage(sessionId, assistantMsgId);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data) as { text?: string; error?: string };
            if (parsed.text) {
              accumulated += parsed.text;
              updateStreamingMessage(sessionId, assistantMsgId, accumulated);
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch {
      updateStreamingMessage(sessionId, assistantMsgId, "❌ Error de conexión. Verificá tu internet e intentá de nuevo.");
    } finally {
      finalizeStreamingMessage(sessionId, assistantMsgId);
    }
  }, [sessionId, isStreaming, metrics, addMessage, updateStreamingMessage, finalizeStreamingMessage, setStreaming]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="grid lg:grid-cols-4 gap-4 flex-1 min-h-0">
        {/* Panel izquierdo — historial de sesiones (futuro) */}
        <div
          className="hidden lg:flex flex-col rounded-xl border p-3 gap-2"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-default)",
          }}
        >
          <p className="text-xs font-medium uppercase tracking-wide px-2" style={{ color: "var(--text-muted)" }}>
            Sesión actual
          </p>
          <div
            className="px-3 py-2 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: "var(--accent-primary)",
              color: "white",
            }}
          >
            Consulta general
          </div>
          <div className="mt-auto text-xs px-2 space-y-1" style={{ color: "var(--text-muted)" }}>
            <p>Progreso: {metrics.roadmapProgress}%</p>
            {metrics.nicheScore && <p>Nicho: {metrics.nicheScore}/96</p>}
          </div>
        </div>

        {/* Panel derecho — chat */}
        <div className="lg:col-span-3 flex flex-col rounded-xl border overflow-hidden" style={{ borderColor: "var(--border-default)" }}>
          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ backgroundColor: "var(--bg-primary)" }}
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full space-y-6 text-center px-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                  }}
                >
                  N
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                    Soy NEXUS
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                    Tu consultor IA de YouTube. Preguntame lo que quieras sobre<br />
                    nichos, monetización, contenido y estrategia.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => void sendMessage(prompt)}
                      className="px-3 py-1.5 rounded-full text-xs border transition-all hover:scale-105"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        borderColor: "var(--border-default)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div
            className="border-t p-4"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-default)",
            }}
          >
            {/* Suggested prompts chips (cuando hay mensajes) */}
            {messages.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {SUGGESTED_PROMPTS.slice(0, 3).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => void sendMessage(prompt)}
                    disabled={isStreaming}
                    className="px-2.5 py-1 rounded-full text-xs border transition-all hover:scale-105 disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      borderColor: "var(--border-default)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
                rows={2}
                placeholder="Escribí tu consulta... (Enter para enviar)"
                className="flex-1 resize-none rounded-xl px-4 py-3 text-sm outline-none border transition-colors"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
              />
              <Button
                onClick={() => void sendMessage(input)}
                disabled={!input.trim() || isStreaming}
                loading={isStreaming}
                size="lg"
                className="flex-shrink-0"
              >
                {isStreaming ? "..." : "→"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

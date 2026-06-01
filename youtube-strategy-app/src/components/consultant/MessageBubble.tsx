"use client";

import type { ChatMessage } from "@/types/ai";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
        style={
          isUser
            ? { backgroundColor: "var(--bg-card)", color: "var(--text-secondary)" }
            : {
                background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                color: "white",
              }
        }
      >
        {isUser ? "Vos" : "N"}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser ? "rounded-tr-sm" : "rounded-tl-sm"
        }`}
        style={
          isUser
            ? {
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-default)",
              }
            : {
                backgroundColor: "var(--bg-card)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-accent)",
              }
        }
      >
        {message.isStreaming && message.content === "" ? (
          <div className="flex gap-1 items-center py-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full animate-bounce"
                style={{
                  backgroundColor: "var(--accent-primary)",
                  animationDelay: `${i * 150}ms`,
                }}
              />
            ))}
          </div>
        ) : (
          <FormattedMessage content={message.content} />
        )}

        {/* Streaming cursor */}
        {message.isStreaming && message.content.length > 0 && (
          <span
            className="inline-block w-0.5 h-4 ml-0.5 animate-pulse"
            style={{ backgroundColor: "var(--accent-primary)", verticalAlign: "middle" }}
          />
        )}
      </div>
    </div>
  );
}

function FormattedMessage({ content }: { content: string }) {
  // Renderizado básico de markdown (bold, italic, listas)
  const lines = content.split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith("**") && line.includes(":**")) {
          // Sección del consultor: **ANÁLISIS:** text
          const colonIdx = line.indexOf(":**");
          const label = line.slice(2, colonIdx);
          const text = line.slice(colonIdx + 3).trim();
          return (
            <div key={i}>
              <span className="font-bold text-xs uppercase tracking-wide" style={{ color: "var(--accent-primary)" }}>
                {label}
              </span>
              {text && (
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                  {" "}{text}
                </span>
              )}
            </div>
          );
        }

        if (line.startsWith("- ") || line.startsWith("• ")) {
          return (
            <div key={i} className="flex gap-2 text-sm">
              <span style={{ color: "var(--accent-primary)" }}>•</span>
              <span>{formatInline(line.slice(2))}</span>
            </div>
          );
        }

        if (line.startsWith("> ")) {
          return (
            <blockquote
              key={i}
              className="border-l-2 pl-3 text-xs italic"
              style={{
                borderColor: "var(--accent-primary)",
                color: "var(--text-muted)",
              }}
            >
              {line.slice(2)}
            </blockquote>
          );
        }

        if (!line.trim()) return <div key={i} className="h-1" />;

        return (
          <p key={i} className="text-sm leading-relaxed">
            {formatInline(line)}
          </p>
        );
      })}
    </div>
  );
}

function formatInline(text: string): React.ReactNode {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

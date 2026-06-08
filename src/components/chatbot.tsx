"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ChatMessage {
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

const suggestions = [
  "Show my courses",
  "My progress",
  "My grades",
  "My achievements",
  "My notes",
  "What am I enrolled in?",
];

function formatTimestamp(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function TypewriterText({ html, speed = 12 }: { html: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const raw = html.replace(/<br\/>/g, "\n");
    const total = raw.length;
    indexRef.current = 0;
    setTimeout(() => setDisplayed(""), 0);

    timerRef.current = setInterval(() => {
      indexRef.current += 3;
      if (indexRef.current >= total) {
        setDisplayed(raw);
        clearInterval(timerRef.current!);
      } else {
        setDisplayed(raw.slice(0, indexRef.current));
      }
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [html, speed]);

  const formatted = displayed.replace(/\n/g, "<br/>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
}

function BotMessage({ text, timestamp }: { text: string; timestamp: Date }) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-8 shrink-0 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 mt-0.5">
        <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-zinc-800/80 rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed text-zinc-200 border border-zinc-700/50">
          <TypewriterText html={text} speed={10} />
        </div>
        <p className="text-[10px] text-zinc-600 mt-1 px-1">{formatTimestamp(timestamp)}</p>
      </div>
    </div>
  );
}

function UserMessage({ text, timestamp }: { text: string; timestamp: Date }) {
  return (
    <div className="flex items-start gap-3 flex-row-reverse">
      <div className="size-8 shrink-0 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 mt-0.5">
        <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed text-white shadow-lg shadow-violet-500/20">
          {text}
        </div>
        <p className="text-[10px] text-zinc-600 mt-1 px-1 text-right">{formatTimestamp(timestamp)}</p>
      </div>
    </div>
  );
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      text: "Hello! I'm your **STEAM ELMS Learning Assistant**. 🎓\n\nI can help you track your courses, check your progress and grades, review achievements, and find your notes.\n\nTry asking me something like:\n• *\"What courses are available?\"*\n• *\"How am I doing?\"*\n• *\"Show my achievements\"*",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        const u = JSON.parse(raw);
        setTimeout(() => { setUserId(u.id); setUserName(u.name || ""); }, 0);
      } catch {}
    }
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = useCallback(async () => {
    const msg = input.trim();
    if (!msg || loading || !userId) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: msg, timestamp: new Date() }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, userId }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.response, timestamp: new Date() }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.", timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, userId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "bot",
        text: "Chat cleared. How can I help you with your learning today? 🎓",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 size-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/40 hover:shadow-violet-500/60 hover:scale-110 active:scale-95 transition-all duration-300 ${
          open ? "rotate-90 scale-0 opacity-0" : ""
        }`}
        aria-label="Open chatbot"
      >
        <svg className="size-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
        </svg>
      </button>

      {/* Close button (shown when open) */}
      <button
        onClick={() => setOpen(false)}
        className={`fixed bottom-6 right-6 z-50 size-14 rounded-2xl bg-zinc-800 flex items-center justify-center shadow-2xl shadow-black/30 hover:bg-zinc-700 hover:scale-110 active:scale-95 transition-all duration-300 ${
          open ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
        aria-label="Close chatbot"
      >
        <svg className="size-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[420px] max-w-[calc(100vw-48px)] rounded-2xl border border-zinc-700/50 bg-zinc-950 shadow-2xl shadow-black/50 overflow-hidden transition-all duration-500 ${
          open ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-8 pointer-events-none"
        }`}
        style={{ maxHeight: "min(680px, calc(100vh - 160px))", height: "min(680px, calc(100vh - 160px))" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800 bg-gradient-to-r from-violet-600/10 to-indigo-600/10">
          <div className="size-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0">
            <svg className="size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-white text-sm">Learning Assistant</p>
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </div>
            <p className="text-[10px] text-zinc-500">{userName ? `Helping ${userName.split(" ")[0]}` : "Ask me anything"}</p>
          </div>
          <button
            onClick={clearChat}
            className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800"
            title="Clear chat"
          >
            Clear
          </button>
        </div>

        {/* Messages */}
        <div
          className="overflow-y-auto p-4 space-y-4 scrollbar-thin"
          style={{ height: "calc(min(680px, calc(100vh - 160px)) - 140px)" }}
          ref={messagesEndRef}
        >
          {messages.map((m, i) =>
            m.role === "user" ? (
              <UserMessage key={i} text={m.text} timestamp={m.timestamp} />
            ) : (
              <BotMessage key={i} text={m.text} timestamp={m.timestamp} />
            )
          )}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="size-8 shrink-0 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
              </div>
              <div className="bg-zinc-800/80 rounded-2xl rounded-tl-sm px-4 py-3 border border-zinc-700/50">
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="size-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="size-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {/* Suggestion chips */}
          {messages.length <= 2 && userId && (
            <div className="pt-2">
              <p className="text-[10px] text-zinc-600 mb-2 px-1">QUICK ACTIONS</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setInput(s);
                      setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                    className="text-[11px] px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-400 hover:border-violet-500/50 hover:text-violet-300 hover:bg-violet-500/10 transition-all duration-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="border-t border-zinc-800 p-3 bg-zinc-950">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={userId ? "Ask about your courses, grades..." : "Sign in to use the chatbot"}
              disabled={loading || !userId}
              className="flex-1 bg-zinc-800/80 text-white text-sm rounded-xl px-4 py-3 border border-zinc-700 focus:border-violet-500/50 focus:outline-none placeholder-zinc-500 transition-colors disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading || !userId}
              className="size-11 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center disabled:opacity-40 hover:from-violet-500 hover:to-indigo-500 hover:scale-105 active:scale-95 transition-all duration-300 shrink-0 shadow-lg shadow-violet-500/20"
            >
              <svg className="size-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          {!userId && (
            <p className="text-[10px] text-zinc-600 mt-2 text-center">
              <a href="/login" className="text-violet-400 hover:text-violet-300 underline">Sign in</a> to use the learning assistant
            </p>
          )}
          {input.length > 0 && (
            <p className="text-[10px] text-zinc-700 mt-1.5 text-right">Press Enter to send</p>
          )}
        </div>
      </div>
    </>
  );
}

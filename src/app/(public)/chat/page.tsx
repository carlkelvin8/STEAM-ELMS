"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

interface UserInfo {
  id: string;
  name: string;
  role: string;
  avatarUrl: string | null;
}

interface Conversation {
  user: UserInfo;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastMessageFromMe: boolean;
  unreadCount: number;
}

interface MessageData {
  id: string;
  senderId: string;
  receiverId: string;
  courseId: string | null;
  message: string;
  read: boolean;
  createdAt: string;
  sender: UserInfo;
}

interface EnrolledCourse {
  id: string;
  title: string;
  instructor: UserInfo;
}

export default function ChatPage() {
  const router = useRouter();
  const [user] = useState<UserInfo | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  });
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const initRef = useRef(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (initRef.current) return;
    initRef.current = true;

    const loadData = async () => {
      try {
        const [chatRes, enrollRes] = await Promise.all([
          fetch(`/api/chat?userId=${user.id}`),
          user.role === "STUDENT" ? fetch(`/api/enrollments?userId=${user.id}`) : null,
        ]);

        if (chatRes.ok) {
          setConversations(await chatRes.json());
        }

        if (enrollRes && enrollRes.ok) {
          const data = await enrollRes.json();
          if (Array.isArray(data)) {
            setEnrolledCourses(data.map((e: { course: EnrolledCourse }) => e.course));
          }
        }
      } catch {}
      setLoading(false);
    };

    loadData();
  }, [user, router]);

  const fetchMessages = useCallback(async (otherUserId: string, courseId?: string) => {
    if (!user) return;
    let url = `/api/chat?userId=${user.id}&otherUserId=${otherUserId}`;
    if (courseId) url += `&courseId=${courseId}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
    }
    // Mark as read
    fetch(`/api/chat`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, otherUserId }),
    });
    // Update conversation unread count
    setConversations(prev => prev.map(c =>
      c.user.id === otherUserId ? { ...c, unreadCount: 0 } : c
    ));
  }, [user]);

  const selectConversation = (conv: Conversation) => {
    setSelectedConv(conv);
    fetchMessages(conv.user.id);
    setShowNewChat(false);
  };

  const sendMessage = async () => {
    if (!user || !selectedConv || !input.trim() || sending) return;
    setSending(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: user.id,
        receiverId: selectedConv.user.id,
        message: input.trim(),
      }),
    });
    if (res.ok) {
      const msg = await res.json();
      setMessages(prev => [...prev, msg]);
      setInput("");
      setConversations(prev => prev.map(c =>
        c.user.id === selectedConv.user.id
          ? { ...c, lastMessage: msg.message, lastMessageAt: msg.createdAt, lastMessageFromMe: true }
          : c
      ));
    }
    setSending(false);
  };

  const startNewChat = (targetUser: UserInfo) => {
    setShowNewChat(false);
    const existing = conversations.find(c => c.user.id === targetUser.id);
    if (existing) {
      selectConversation(existing);
      return;
    }
    const newConv: Conversation = {
      user: targetUser,
      lastMessage: null,
      lastMessageAt: null,
      lastMessageFromMe: false,
      unreadCount: 0,
    };
    setConversations(prev => [newConv, ...prev]);
    selectConversation(newConv);
  };

  // Poll for new messages
  useEffect(() => {
    if (!user || !selectedConv) return;
    pollRef.current = setInterval(() => {
      fetchMessages(selectedConv.user.id);
    }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [user, selectedConv, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="size-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          Loading messages...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-5rem)]">
      {/* Conversation List */}
      <div className={`w-full lg:w-80 border-r border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 flex flex-col ${selectedConv ? "hidden lg:flex" : "flex"}`}>
        <div className="p-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold">Messages</h1>
            {(user?.role === "STUDENT" || user?.role === "INSTRUCTOR") && (
              <button
                onClick={() => setShowNewChat(!showNewChat)}
                className="size-9 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-center hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/20 transition-all"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            )}
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              placeholder="Search conversations..."
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {showNewChat && user?.role === "STUDENT" && (
          <div className="p-3 border-b border-zinc-200/60 dark:border-zinc-800/60 space-y-1">
            <p className="text-xs font-semibold text-zinc-500 px-2 mb-2">Contact your instructors</p>
            {enrolledCourses.length === 0 ? (
              <p className="text-xs text-zinc-400 px-2">No enrolled courses</p>
            ) : (
              Array.from(new Map(enrolledCourses.map(c => [c.instructor.id, c.instructor])).values()).map((instructor) => (
                <button
                  key={instructor.id}
                  onClick={() => startNewChat(instructor)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
                >
                  <div className="size-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {instructor.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{instructor.name}</p>
                    <p className="text-xs text-zinc-400">Instructor</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {showNewChat && user?.role === "INSTRUCTOR" && (
          <div className="p-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
            <p className="text-xs font-semibold text-zinc-500 px-2 mb-2">Students will appear here when they message you</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500 px-6 text-center">
              <svg className="size-12 mb-4 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
              </svg>
              <p className="text-sm font-medium">No conversations yet</p>
              <p className="text-xs mt-1">Messages will appear here when you chat with instructors or students</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.user.id}
                onClick={() => selectConversation(conv)}
                className={`w-full flex items-start gap-3 px-4 py-3 border-b border-zinc-100/60 dark:border-zinc-800/30 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition-colors text-left ${
                  selectedConv?.user.id === conv.user.id ? "bg-violet-50/50 dark:bg-violet-900/10" : ""
                }`}
              >
                <div className="size-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 ring-2 ring-white/50 dark:ring-zinc-800/50">
                  {conv.user.avatarUrl ? <Image src={conv.user.avatarUrl} alt="" width={40} height={40} className="size-full object-cover rounded-full" unoptimized /> : conv.user.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold truncate">{conv.user.name}</p>
                    {conv.lastMessageAt && (
                      <p className="text-[10px] text-zinc-400 shrink-0">
                        {new Date(conv.lastMessageAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-zinc-500 truncate flex-1">
                      {conv.lastMessageFromMe && <span className="text-violet-500 mr-1">You:</span>}
                      {conv.lastMessage ?? "No messages yet"}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="size-5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-[10px] font-bold text-white flex items-center justify-center shrink-0">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {conv.user.role === "INSTRUCTOR" ? "Instructor" : "Student"}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message Thread */}
      <div className={`flex-1 flex flex-col ${selectedConv ? "flex" : "hidden lg:flex"}`}>
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 flex items-center gap-3">
              <button
                onClick={() => setSelectedConv(null)}
                className="lg:hidden size-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
              <div className="size-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {selectedConv.user.avatarUrl ? <Image src={selectedConv.user.avatarUrl} alt="" width={36} height={36} className="size-full object-cover rounded-full" unoptimized /> : selectedConv.user.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold">{selectedConv.user.name}</p>
                <p className="text-xs text-zinc-500">{selectedConv.user.role === "INSTRUCTOR" ? "Instructor" : "Student"}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
                  <p>Send a message to start the conversation</p>
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] ${isMe ? "order-1" : "order-1"}`}>
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          isMe
                            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-md shadow-md shadow-violet-500/20"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-md"
                        }`}
                      >
                        {msg.message}
                      </div>
                      <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                        <p className="text-[10px] text-zinc-400">
                          {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {isMe && (
                          <svg className={`size-3 ${msg.read ? "text-blue-500" : "text-zinc-300 dark:text-zinc-600"}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022Z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    maxLength={5000}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none placeholder:text-zinc-400 max-h-32"
                    style={{ minHeight: "42px" }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="size-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-center hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 shadow-lg shadow-violet-500/20 transition-all shrink-0"
                >
                  {sending ? (
                    <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-zinc-400 mt-2">Press Enter to send, Shift+Enter for new line</p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-400">
            <div className="text-center">
              <svg className="size-16 mx-auto mb-4 text-zinc-200 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
              </svg>
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-1">Choose a chat from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

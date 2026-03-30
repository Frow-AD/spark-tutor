"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import ChatBubble from "@/components/ChatBubble"
import ChatInput from "@/components/ChatInput"
import { getStudentMemory, setStudentMemory } from "@/lib/storage"
import { migrateLegacyIfNeeded } from "@/lib/storage"
import { useTTS } from "@/hooks/useTTS"
import type { StudentMemory } from "@/lib/spark-memory/types"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function ChatPage() {
  const router = useRouter()
  const [memory, setMemory] = useState<StudentMemory | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [ending, setEnding] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const hasInit = useRef(false)
  const { speak, stop, toggle, speaking, supported, enabled } = useTTS()

  useEffect(() => {
    if (hasInit.current) return
    hasInit.current = true
    migrateLegacyIfNeeded()
    const m = getStudentMemory()
    if (!m?.curated?.setupComplete) {
      router.replace("/")
      return
    }
    setMemory(m)
    const welcome = `Hi ${m.curated.name}! I'm Spark, your learning buddy! What would you like to explore today?`
    setMessages([{ role: "assistant", content: welcome }])
    // Don't auto-speak welcome — iOS blocks audio without user gesture first
  }, [router]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!memory || loading) return

    const newMessages: Message[] = [...messages, { role: "user", content: text }]
    setMessages(newMessages)
    setLoading(true)
    stop() // stop any current speech when user sends

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, memory }),
      })

      if (!response.ok) throw new Error("Chat request failed")
      if (!response.body) throw new Error("No response body")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ""

      setMessages(prev => [...prev, { role: "assistant", content: "" }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        assistantMessage += chunk
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: "assistant", content: assistantMessage }
          return updated
        })
      }

      // Speak the completed message (strip VISUAL tags — handled in useTTS too, belt+suspenders)
      speak(assistantMessage)

    } catch (err) {
      console.error(err)
      const errMsg = "Oops! Something went wrong. Can you try again? 😅"
      setMessages(prev => [...prev, { role: "assistant", content: errMsg }])
      speak(errMsg)
    } finally {
      setLoading(false)
    }
  }

  const endSession = async () => {
    if (!memory || ending) return
    setEnding(true)
    stop()

    try {
      const transcript = messages
        .map(m => `${m.role === "user" ? "Student" : "Spark"}: ${m.content}`)
        .join("\n\n")

      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, memory }),
      })

      if (response.ok) {
        const updatedMemory: StudentMemory = await response.json()
        setStudentMemory(updatedMemory)
        setMemory(updatedMemory)
      }

      const farewell = "Great session today! 🎉 I've saved what we learned. See you next time! Come back anytime you want to learn something new! ⭐"
      setMessages(prev => [...prev, { role: "assistant", content: farewell }])
      speak(farewell)
    } catch (err) {
      console.error(err)
    } finally {
      setEnding(false)
    }
  }

  if (!memory) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-2xl text-gray-500">Loading... ✨</div>
    </div>
  )

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { stop(); router.push("/") }}
            className="text-gray-400 hover:text-gray-600 text-sm font-medium px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ← Home
          </button>
          <span className="text-3xl">✨</span>
          <div>
            <h1 className="text-xl font-bold text-blue-600">Spark</h1>
            <p className="text-sm text-gray-500">Learning with {memory.curated.name} · Grade {memory.curated.grade}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {supported && (
            <button
              onClick={toggle}
              title={enabled ? "Mute Spark's voice" : "Unmute Spark's voice"}
              className={`text-xl px-2 py-1 rounded-xl transition-all ${
                enabled
                  ? speaking
                    ? "bg-yellow-100 text-yellow-600 animate-pulse"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  : "text-gray-300 hover:text-gray-400 hover:bg-gray-100"
              }`}
            >
              {enabled ? (speaking ? "🔊" : "🔈") : "🔇"}
            </button>
          )}
          <button
            onClick={() => { stop(); router.push("/profile") }}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Profile 📋
          </button>
          <button
            onClick={endSession}
            disabled={ending || messages.length < 2}
            className="bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            {ending ? "Saving... 💾" : "End Session ✅"}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2">
        {messages.map((msg, i) => (
          <ChatBubble
            key={i}
            role={msg.role}
            content={msg.content}
            onSpeak={msg.role === "assistant" ? () => speak(msg.content) : undefined}
          />
        ))}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-xl mr-3">✨</div>
            <div className="bg-white rounded-2xl rounded-bl-sm px-5 py-3 shadow-md">
              <span className="text-2xl animate-pulse">💭</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={loading || ending} />
    </div>
  )
}

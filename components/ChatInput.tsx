// components/ChatInput.tsx

import { useState, KeyboardEvent } from "react"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("")

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue("")
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex gap-3 items-end p-4 bg-white border-t border-gray-200">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your answer here..."
        disabled={disabled}
        rows={2}
        className="flex-1 resize-none rounded-2xl border-2 border-gray-300 focus:border-blue-400 outline-none px-4 py-3 text-lg text-gray-800 placeholder-gray-400 disabled:opacity-50"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white rounded-2xl px-6 py-3 text-lg font-semibold transition-colors flex-shrink-0"
      >
        Send 🚀
      </button>
    </div>
  )
}

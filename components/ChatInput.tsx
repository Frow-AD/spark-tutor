// components/ChatInput.tsx

import { useState, useEffect, useRef, KeyboardEvent } from "react"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  showIDontKnow?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecognition = any

export default function ChatInput({ onSend, disabled, showIDontKnow }: ChatInputProps) {
  const [value, setValue] = useState("")
  const isSending = useRef(false)
  const [listening, setListening] = useState(false)
  const [sttSupported, setSttSupported] = useState(false)
  const recognitionRef = useRef<AnyRecognition>(null)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    setSttSupported(
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in w)
    )
  }, [])

  // Reset send guard when parent signals ready for next message
  useEffect(() => {
    if (!disabled) isSending.current = false
  }, [disabled])

  // Stop mic when input is disabled (e.g. waiting for response)
  useEffect(() => {
    if (disabled && listening) {
      recognitionRef.current?.stop()
      setListening(false)
    }
  }, [disabled, listening])

  const toggleMic = () => {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (!SR) return
    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onresult = (e: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => {
      const transcript = Array.from(Object.values(e.results) as { [key: number]: { transcript: string } }[])
        .map((r) => r[0].transcript)
        .join("")
      setValue(transcript)
    }

    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled || isSending.current) return
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
    }
    isSending.current = true
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
    <div className="bg-white border-t border-gray-200 pb-[max(0px,env(safe-area-inset-bottom))]">
      {showIDontKnow && (
        <div className="px-4 pt-3">
          <button
            onClick={() => onSend("I don't know")}
            disabled={disabled}
            className="bg-yellow-100 hover:bg-yellow-200 disabled:opacity-40 text-yellow-800 font-semibold rounded-2xl px-4 py-2 text-base transition-all active:scale-95"
          >
            🤷 I don&apos;t know
          </button>
        </div>
      )}
    <div className="flex gap-3 items-end p-4">
      {sttSupported && (
        <button
          onClick={toggleMic}
          disabled={disabled}
          title={listening ? "Stop listening" : "Speak your answer"}
          className={`rounded-2xl px-3 py-3 text-xl flex-shrink-0 transition-all disabled:opacity-40 ${
            listening
              ? "bg-red-100 text-red-500 animate-pulse"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          🎤
        </button>
      )}
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={listening ? "Listening... 🎤" : "Type your answer here..."}
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
    </div>
  )
}

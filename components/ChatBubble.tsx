// components/ChatBubble.tsx

interface ChatBubbleProps {
  role: "user" | "assistant"
  content: string
  onSpeak?: () => void
}

export default function ChatBubble({ role, content, onSpeak }: ChatBubbleProps) {
  const isUser = role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 group`}>
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-xl mr-3 flex-shrink-0">
          ✨
        </div>
      )}
      <div className="flex flex-col gap-1 max-w-[75%]">
        <div
          className={`rounded-2xl px-5 py-3 text-lg leading-relaxed ${
            isUser
              ? "bg-blue-500 text-white rounded-br-sm"
              : "bg-white text-gray-800 shadow-md rounded-bl-sm"
          }`}
        >
          {content}
        </div>
        {/* Replay button for Spark messages */}
        {!isUser && onSpeak && (
          <button
            onClick={onSpeak}
            className="self-start ml-1 text-xs text-gray-300 hover:text-yellow-500 transition-colors opacity-0 group-hover:opacity-100"
            title="Read aloud again"
          >
            🔈 replay
          </button>
        )}
      </div>
      {isUser && (
        <div className="w-10 h-10 rounded-full bg-blue-300 flex items-center justify-center text-xl ml-3 flex-shrink-0">
          🧒
        </div>
      )}
    </div>
  )
}

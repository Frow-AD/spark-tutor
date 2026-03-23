// components/ChatBubble.tsx

interface ChatBubbleProps {
  role: "user" | "assistant"
  content: string
  onSpeak?: () => void
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")   // bold
    .replace(/\*(.+?)\*/g, "$1")         // italic
    .replace(/^#{1,6}\s+/gm, "")         // headers
    .replace(/`([^`]+)`/g, "$1")          // inline code
    .replace(/^\s*[-*+]\s+/gm, "")        // bullet points
    .replace(/^\s*\d+\.\s+/gm, "")        // numbered lists
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
    .trim()
}

export default function ChatBubble({ role, content, onSpeak }: ChatBubbleProps) {
  const isUser = role === "user"
  const displayText = isUser ? content : stripMarkdown(content)

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
          {displayText}
        </div>
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

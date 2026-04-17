// components/ChatBubble.tsx
import VisualBlock, { type VisualData } from "./visuals/VisualBlock"

interface ChatBubbleProps {
  role: "user" | "assistant"
  content: string
  onSpeak?: () => void
  onRate?: (rating: "up" | "down") => void
  rating?: "up" | "down"
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim()
}

function parseVisual(content: string): { text: string; visual: VisualData | null } {
  const match = content.match(/\[VISUAL:\s*(\{[\s\S]*?\})\s*\]/)
  if (!match) return { text: content, visual: null }
  try {
    const visual = JSON.parse(match[1]) as VisualData
    const text = content.replace(match[0], "").trim()
    return { text, visual }
  } catch {
    return { text: content.replace(match[0], "").trim(), visual: null }
  }
}

export default function ChatBubble({ role, content, onSpeak, onRate, rating }: ChatBubbleProps) {
  const isUser = role === "user"
  let displayText = content
  let visual: VisualData | null = null
  if (!isUser) {
    const parsed = parseVisual(content)
    displayText = stripMarkdown(parsed.text)
    visual = parsed.visual
  }
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-xl mr-3 flex-shrink-0 mt-1">
          ✨
        </div>
      )}
      <div className="flex flex-col gap-2 max-w-[75%]">
        <div
          className={`rounded-2xl px-5 py-3 text-lg leading-relaxed ${
            isUser ? "bg-blue-500 text-white rounded-br-sm" : "bg-white text-gray-800 shadow-md rounded-bl-sm"
          }`}
        >
          {displayText}
        </div>
        {visual && <VisualBlock visual={visual} />}
        {!isUser && (onSpeak || onRate) && (
          <div className="flex items-center gap-1 ml-1">
            {onSpeak && (
              <button
                onClick={onSpeak}
                className="px-3 py-1.5 text-sm rounded-xl bg-gray-100 text-gray-500 hover:bg-yellow-100 hover:text-yellow-600 active:scale-95 transition-all"
                title="Read aloud again"
              >
                🔈 replay
              </button>
            )}
            {onRate && (
              <>
                <button
                  onClick={() => onRate("up")}
                  title="I liked this!"
                  className={`px-2 py-1.5 text-base rounded-xl transition-all active:scale-95 ${
                    rating === "up"
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-500"
                  }`}
                >
                  👍
                </button>
                <button
                  onClick={() => onRate("down")}
                  title="This didn't help"
                  className={`px-2 py-1.5 text-base rounded-xl transition-all active:scale-95 ${
                    rating === "down"
                      ? "bg-red-100 text-red-500"
                      : "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-400"
                  }`}
                >
                  👎
                </button>
              </>
            )}
          </div>
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

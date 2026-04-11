// components/ChatBubble.tsx
import VisualBlock, { type VisualData } from "./visuals/VisualBlock"

interface ChatBubbleProps {
    role: "user" | "assistant"
    content: string
    onSpeak?: () => void
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

export default function ChatBubble({ role, content, onSpeak }: ChatBubbleProps) {
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
                  </div>div>
              )}
              <div className="flex flex-col gap-2 max-w-[75%]">
                      <div
                                  className={`rounded-2xl px-5 py-3 text-lg leading-relaxed ${
                                                isUser
                                                  ? "bg-blue-500 text-white rounded-br-sm"
                                                  : "bg-white text-gray-800 shadow-md rounded-bl-sm"
                                  }`}
                                >
                        {displayText}
                      </div>div>
                {visual && <VisualBlock visual={visual} />}
                {!isUser && onSpeak && (
                    <button
                                  onClick={onSpeak}
                                  className="self-start ml-1 px-3 py-1.5 text-sm rounded-xl bg-gray-100 text-gray-500 hover:bg-yellow-100 hover:text-yellow-600 active:scale-95 transition-all"
                                  title="Read aloud again"
                                >
                                🔈 replay
                    </button>button>
                      )}
              </div>div>
          {isUser && (
                  <div className="w-10 h-10 rounded-full bg-blue-300 flex items-center justify-center text-xl ml-3 flex-shrink-0">
                            🧒
                  </div>div>
              )}
        </div>div>
      )
}</div>

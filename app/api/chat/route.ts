import Anthropic from "@anthropic-ai/sdk"
import { buildTutorSystemPrompt } from "@/lib/spark-memory/memory"
import type { StudentMemory } from "@/lib/spark-memory/types"

const STREAM_TIMEOUT_MS = 30_000

export async function POST(request: Request) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  let body: { messages: { role: "user" | "assistant"; content: string }[]; memory: StudentMemory }

  try {
    body = await request.json()
  } catch {
    return new Response("Invalid request body", { status: 400 })
  }

  const { messages, memory } = body
  const systemPrompt = buildTutorSystemPrompt(memory)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS)

  try {
    const stream = anthropic.messages.stream({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    })

    const readableStream = new ReadableStream({
      async start(streamController) {
        try {
          for await (const chunk of stream) {
            if (controller.signal.aborted) break
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              streamController.enqueue(new TextEncoder().encode(chunk.delta.text))
            }
          }
          streamController.close()
        } catch (err) {
          const isTimeout = controller.signal.aborted
          console.error("[chat] Stream error:", err)
          const message = isTimeout
            ? "Spark is taking too long to think. Please try again!"
            : "Something went wrong. Please try again!"
          streamController.enqueue(new TextEncoder().encode(message))
          streamController.close()
        } finally {
          clearTimeout(timeout)
        }
      },
      cancel() {
        clearTimeout(timeout)
        controller.abort()
      },
    })

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    })
  } catch (err) {
    clearTimeout(timeout)
    console.error("[chat] Stream setup failed:", err)
    return new Response("Spark couldn't connect right now. Please try again!", { status: 503 })
  }
}

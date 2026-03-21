import Anthropic from "@anthropic-ai/sdk"
import { buildTutorSystemPrompt } from "@/lib/spark-memory/memory"
import type { StudentMemory } from "@/lib/spark-memory/types"

const anthropic = new Anthropic()

export async function POST(request: Request) {
  const { messages, memory }: { messages: { role: "user" | "assistant"; content: string }[]; memory: StudentMemory } =
    await request.json()

  const systemPrompt = buildTutorSystemPrompt(memory)

  const stream = await anthropic.messages.stream({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  })

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  })
}

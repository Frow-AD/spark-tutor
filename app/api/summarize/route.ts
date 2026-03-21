import { processEndOfSession } from "@/lib/spark-memory/memory"
import type { StudentMemory } from "@/lib/spark-memory/types"

export async function POST(request: Request) {
  const { transcript, memory }: { transcript: string; memory: StudentMemory } =
    await request.json()

  const updatedMemory = await processEndOfSession(transcript, memory)

  return Response.json(updatedMemory)
}

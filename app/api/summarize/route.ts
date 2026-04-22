import { processEndOfSession } from "@/lib/spark-memory/memory"
import type { StudentMemory, SessionRecap } from "@/lib/spark-memory/types"

export async function POST(request: Request) {
  const { transcript, memory }: { transcript: string; memory: StudentMemory } =
    await request.json()

  const { memory: updatedMemory, recap } = await processEndOfSession(transcript, memory)

  return Response.json({ memory: updatedMemory, recap })
}

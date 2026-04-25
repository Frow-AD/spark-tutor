import { processEndOfSession } from "@/lib/spark-memory/memory"
import { supabase } from "@/lib/supabase"
import type { StudentMemory, SessionRecap } from "@/lib/spark-memory/types"

export async function POST(request: Request) {
  const { transcript, memory, messageCount, iDontKnowCount }: {
    transcript: string
    memory: StudentMemory
    messageCount: number
    iDontKnowCount: number
  } = await request.json()

  const { memory: updatedMemory, recap } = await processEndOfSession(transcript, memory)

  let sessionId: string | null = null
  if (supabase) {
    const { data, error } = await supabase.from("sessions").insert({
      student_name: memory.curated.name,
      grade: memory.curated.grade,
      summary: recap.summary,
      parent_note: recap.parentNote,
      topics_covered: recap.topicsCovered,
      message_count: messageCount,
      i_dont_know_count: iDontKnowCount,
    }).select("id").single()
    if (error) console.error("[spark] Supabase insert failed:", error)
    sessionId = data?.id ?? null
  }

  return Response.json({ memory: updatedMemory, recap, sessionId })
}

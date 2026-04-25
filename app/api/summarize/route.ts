import { processEndOfSession } from "@/lib/spark-memory/memory"
import type { StudentMemory } from "@/lib/spark-memory/types"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  const { transcript, memory }: { transcript: string; memory: StudentMemory } =
    await request.json()

  const { memory: updatedMemory, recap } = await processEndOfSession(transcript, memory)

  // Log session to Supabase (non-blocking — don't fail the response if this errors)
  if (supabase) {
    supabase.from("sessions").insert({
      student_name: memory.curated.name,
      grade: memory.curated.grade,
      session_number: updatedMemory.curated.sessionCount,
      summary: recap.summary,
      topics_covered: recap.topicsCovered,
      parent_note: recap.parentNote,
      transcript,
    }).then(({ error }) => {
      if (error) console.error("[supabase] Failed to log session:", error.message)
    })
  }

  return Response.json({ memory: updatedMemory, recap })
}

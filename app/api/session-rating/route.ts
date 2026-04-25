import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  const { sessionId, rating }: { sessionId: string; rating: "up" | "down" } = await request.json()
  if (!sessionId || !supabase) return Response.json({ ok: false }, { status: 400 })

  const { error } = await supabase.from("sessions").update({ parent_rating: rating }).eq("id", sessionId)
  if (error) console.error("[spark] Rating update failed:", error)

  return Response.json({ ok: !error })
}

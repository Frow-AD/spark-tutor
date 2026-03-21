// app/api/tts/route.ts
// On local/home network: proxies to Kokoro on port 5050
// On Vercel: returns 503 so client falls back to Web Speech API

export async function POST(req: Request) {
  const { text } = await req.json()
  if (!text?.trim()) return new Response("No text", { status: 400 })

  const kokoroUrl = process.env.KOKORO_URL ?? "http://127.0.0.1:5050"

  try {
    const response = await fetch(`${kokoroUrl}/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.slice(0, 500) }),
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) throw new Error(`Kokoro ${response.status}`)

    return new Response(response.body, {
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-store",
      },
    })
  } catch {
    // Kokoro unavailable — client will fall back to Web Speech
    return new Response("TTS unavailable", { status: 503 })
  }
}

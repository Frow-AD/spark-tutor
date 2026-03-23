// spark-memory/memory.ts
// Core memory logic: merge, recurate, build system prompt.
// Import this in your API routes.

import Anthropic from "@anthropic-ai/sdk"
import type { StudentMemory, CuratedProfile, SessionUpdatePayload, RawSessionLog } from "./types"

const anthropic = new Anthropic() // uses ANTHROPIC_API_KEY from env
const MODEL = "claude-haiku-4-5"
const RECURATE_EVERY = 5  // sessions

// ─────────────────────────────────────────────
// SYSTEM PROMPT BUILDER (for /api/chat)
// ─────────────────────────────────────────────

export function buildTutorSystemPrompt(memory: StudentMemory): string {
  const p = memory.curated
  const recentSessions = memory.sessionLog
    .slice(0, 5)
    .map(s => `- ${s.date.split("T")[0]}: ${s.summary}`)
    .join("\n")

  const topicLines = Object.entries(p.topics)
    .map(([t, v]) => `- ${t}: ${v.proficiency}${v.notes ? ` (${v.notes})` : ""}`)
    .join("\n")

  const frustration = p.flags.frustrationTriggers.length
    ? `Frustration triggers: ${p.flags.frustrationTriggers.join(", ")}`
    : ""
  const wins = p.flags.celebrationMoments.length
    ? `Recent wins to reference: ${p.flags.celebrationMoments.slice(-3).join(", ")}`
    : ""

  return `
You are Spark, a warm and patient Socratic tutor for ${p.name} (Grade ${p.grade}).
Never give answers directly — guide with questions, encouragement, and examples.
Keep language simple and age-appropriate for a ${p.grade}th grader.

IMPORTANT FORMATTING RULES:
- Your responses are displayed as plain text AND read aloud via text-to-speech
- Never use markdown: no asterisks, no bold, no bullet points with *, no headers with #
- Use plain sentences only. For lists, use words like "First... Second... Third..."
- Keep responses concise — 2-4 sentences max per turn
- Do not describe your own capabilities or mention TTS, voice, or technical features

STUDENT PROFILE
Learning style: ${p.learningStyle || "not yet observed"}
Encouragement needs: ${p.encouragementNeeds}
Interests: ${p.interests.join(", ") || "not yet observed — try to learn some this session"}

TOPIC PROFICIENCIES
${topicLines || "No topics assessed yet"}

RECENT SESSIONS
${recentSessions || "This is the first session"}

BEHAVIORAL NOTES
${frustration}
${wins}
`.trim()
}

// ─────────────────────────────────────────────
// END-OF-SESSION: EXTRACT UPDATE (for /api/summarize)
// ─────────────────────────────────────────────

export async function extractSessionUpdate(transcript: string): Promise<SessionUpdatePayload> {
  const system = `
You extract memory updates from tutoring session transcripts.
Return ONLY a valid JSON object — no markdown, no explanation — with this exact shape:
{
  "summary": "one sentence describing what happened this session",
  "topicsDiscussed": ["topic1", "topic2"],
  "rawNotes": "free-form observations: learning style signals, emotional tone, breakthroughs, struggles, anything worth remembering",
  "changed": {
    "topics": { "topic_name": { "proficiency": "emerging|developing|strong", "notes": "brief evidence" } },
    "interests": ["any new interests mentioned"],
    "learningStyle": "updated observation or empty string if unchanged",
    "encouragementNeeds": "low|moderate|high or empty string if unchanged",
    "flags": {
      "frustrationTriggers": ["any new triggers observed"],
      "celebrationMoments": ["any wins or breakthroughs"]
    }
  }
}
Only include fields inside "changed" that actually changed or were newly observed.
`.trim()

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system,
    messages: [{ role: "user", content: `Session transcript:\n\n${transcript}` }],
  })

  const raw = response.content[0].type === "text" ? response.content[0].text : ""
  const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim()
  return JSON.parse(text) as SessionUpdatePayload
}

// ─────────────────────────────────────────────
// MERGE UPDATE INTO MEMORY
// ─────────────────────────────────────────────

export function mergeUpdate(memory: StudentMemory, update: SessionUpdatePayload): StudentMemory {
  const c = { ...memory.curated }
  const ch = update.changed

  // Merge topics
  if (ch.topics) {
    c.topics = { ...c.topics }
    for (const [k, v] of Object.entries(ch.topics)) {
      c.topics[k] = { ...c.topics[k], ...v } as any
    }
  }

  // Merge arrays (deduplicate)
  if (ch.interests?.length)
    c.interests = [...new Set([...c.interests, ...ch.interests])]
  if (ch.flags?.frustrationTriggers?.length)
    c.flags = { ...c.flags, frustrationTriggers: [...new Set([...c.flags.frustrationTriggers, ...ch.flags.frustrationTriggers])] }
  if (ch.flags?.celebrationMoments?.length)
    c.flags = { ...c.flags, celebrationMoments: [...c.flags.celebrationMoments, ...ch.flags.celebrationMoments] }

  // Merge scalar fields
  if (ch.learningStyle) c.learningStyle = ch.learningStyle
  if (ch.encouragementNeeds) c.encouragementNeeds = ch.encouragementNeeds

  c.sessionCount += 1

  // Append to raw log
  const newRawEntry: RawSessionLog = {
    date: new Date().toISOString(),
    summary: update.summary,
    topicsDiscussed: update.topicsDiscussed ?? [],
    rawNotes: update.rawNotes ?? "",
  }

  // Prepend to capped session log (most recent first)
  const newSessionLog = [
    { date: newRawEntry.date, summary: update.summary },
    ...(memory.sessionLog ?? []),
  ].slice(0, 20)

  return {
    curated: c,
    rawLog: [...(memory.rawLog ?? []), newRawEntry],
    sessionLog: newSessionLog,
  }
}

// ─────────────────────────────────────────────
// RECURATION (every N sessions)
// ─────────────────────────────────────────────

export function shouldRecurate(memory: StudentMemory): boolean {
  const { sessionCount, lastCuratedAt } = memory.curated
  return (
    sessionCount > 0 &&
    sessionCount % RECURATE_EVERY === 0 &&
    sessionCount !== lastCuratedAt
  )
}

export async function recurateProfile(memory: StudentMemory): Promise<CuratedProfile> {
  const recentLogs = memory.rawLog.slice(-15)
  const logText = recentLogs
    .map(l => `[${l.date.split("T")[0]}] ${l.summary}\nTopics: ${l.topicsDiscussed.join(", ") || "none"}\nNotes: ${l.rawNotes || "none"}`)
    .join("\n\n")

  const system = `
You maintain a persistent student profile for an AI tutor.
Rewrite the profile to reflect the student's CURRENT state based on the session history below.
Rules:
- Reconcile contradictions (trust more recent sessions more)
- Only mark "strong" if you see consistent evidence across 3+ sessions
- Update proficiencies based on trajectory, not just the last session
- Synthesize learningStyle and encouragementNeeds into concise, actionable descriptions
- Preserve all topics ever observed, even if not recently active
- Return ONLY valid JSON matching the CuratedProfile shape — no markdown, no explanation
`.trim()

  const profileShape = `
{
  "name": string,
  "grade": number,
  "setupComplete": boolean,
  "topics": { "topic_name": { "proficiency": "emerging|developing|strong", "notes": string } },
  "interests": string[],
  "learningStyle": string,
  "encouragementNeeds": "low|moderate|high",
  "flags": { "frustrationTriggers": string[], "celebrationMoments": string[] },
  "sessionCount": number,
  "lastCuratedAt": number
}
`

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system,
    messages: [{
      role: "user",
      content: `Current profile:\n${JSON.stringify(memory.curated, null, 2)}\n\nRecent session notes (last ${recentLogs.length}):\n${logText}\n\nReturn the rewritten profile as JSON matching:\n${profileShape}`
    }],
  })

  const raw = response.content[0].type === "text" ? response.content[0].text : ""
  const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim()
  const newProfile = JSON.parse(text) as CuratedProfile
  newProfile.lastCuratedAt = memory.curated.sessionCount
  newProfile.sessionCount  = memory.curated.sessionCount  // preserve count
  return newProfile
}

// ─────────────────────────────────────────────
// COMBINED END-OF-SESSION HANDLER
// Call this from /api/summarize
// ─────────────────────────────────────────────

export async function processEndOfSession(
  transcript: string,
  memory: StudentMemory
): Promise<StudentMemory> {
  // 1. Extract update from transcript
  const update = await extractSessionUpdate(transcript)

  // 2. Merge into memory
  let updated = mergeUpdate(memory, update)

  // 3. Recurate if due
  if (shouldRecurate(updated)) {
    console.info(`[spark] Recurating profile at session ${updated.curated.sessionCount}`)
    updated.curated = await recurateProfile(updated)
  }

  return updated
}

// spark-memory/types.ts
// Drop-in types for the Spark two-layer memory system

export type Proficiency = "emerging" | "developing" | "strong"

export type TopicEntry = {
  proficiency: Proficiency
  notes: string
}

export type Flags = {
  frustrationTriggers: string[]
  celebrationMoments: string[]
}

export type SessionSummary = {
  date: string    // ISO string
  summary: string
}

export type RawSessionLog = {
  date: string
  summary: string
  topicsDiscussed: string[]
  rawNotes: string
}

export type CuratedProfile = {
  name: string
  grade: number
  setupComplete: boolean
  topics: Record<string, TopicEntry>
  interests: string[]
  learningStyle: string
  encouragementNeeds: "low" | "moderate" | "high"
  flags: Flags
  sessionCount: number
  lastCuratedAt: number  // sessionCount value at last recuration
  parentInstructions?: string
}

export type SessionRecap = {
  summary: string
  topicsCovered: string[]
  parentNote: string  // friendly 1-2 sentence note written for parents
}

export type StudentMemory = {
  curated: CuratedProfile
  rawLog: RawSessionLog[]       // full history, never truncated
  sessionLog: SessionSummary[]  // capped at 20, used for prompt injection
}

// ---- Legacy shape (your current localStorage format) ----
export type LegacyProfile = {
  name: string
  grade: number
  setupComplete: boolean
  topics: Record<string, { proficiency: Proficiency, notes: string }>
  interests: string[]
  learningStyle: string
  encouragementNeeds: "low" | "moderate" | "high"
  flags: Flags
  sessionCount: number
  sessionLog: SessionSummary[]
}

// ---- Extraction payload returned by /api/summarize ----
export type SessionUpdatePayload = {
  summary: string
  topicsDiscussed: string[]
  rawNotes: string
  parentNote: string  // friendly note for the parent card
  changed: {
    topics?: Record<string, Partial<TopicEntry>>
    interests?: string[]
    learningStyle?: string
    encouragementNeeds?: "low" | "moderate" | "high"
    flags?: Partial<Flags>
  }
}

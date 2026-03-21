// spark-memory/migrate.ts
// One-time migration from legacy flat profile to two-layer StudentMemory.
// Safe to call repeatedly — returns existing StudentMemory unchanged if already migrated.

import type { LegacyProfile, StudentMemory, CuratedProfile } from "./types"

const STORAGE_KEY = "spark_student_memory"
const LEGACY_KEY  = "spark_student_profile"  // your current key — update if different

export function migrateOrLoad(): StudentMemory | null {
  if (typeof window === "undefined") return null

  // Already migrated
  const existing = localStorage.getItem(STORAGE_KEY)
  if (existing) {
    try {
      return JSON.parse(existing) as StudentMemory
    } catch {
      console.error("[spark] Failed to parse StudentMemory — resetting")
    }
  }

  // Migrate from legacy shape
  const legacy = localStorage.getItem(LEGACY_KEY)
  if (legacy) {
    try {
      const old = JSON.parse(legacy) as LegacyProfile
      const migrated = migrateFromLegacy(old)
      saveMemory(migrated)
      localStorage.removeItem(LEGACY_KEY)  // clean up old key
      console.info("[spark] Migrated legacy profile to StudentMemory")
      return migrated
    } catch {
      console.error("[spark] Failed to migrate legacy profile")
    }
  }

  return null
}

export function migrateFromLegacy(old: LegacyProfile): StudentMemory {
  const curated: CuratedProfile = {
    name:               old.name,
    grade:              old.grade,
    setupComplete:      old.setupComplete,
    topics:             old.topics ?? {},
    interests:          old.interests ?? [],
    learningStyle:      old.learningStyle ?? "",
    encouragementNeeds: old.encouragementNeeds ?? "low",
    flags: {
      frustrationTriggers: old.flags?.frustrationTriggers ?? [],
      celebrationMoments:  old.flags?.celebrationMoments  ?? [],
    },
    sessionCount:    old.sessionCount ?? 0,
    lastCuratedAt:   0,
  }

  // Backfill rawLog from existing sessionLog entries
  // (no rawNotes available for old sessions — that's fine)
  const rawLog = (old.sessionLog ?? []).map(s => ({
    date:             s.date,
    summary:          s.summary,
    topicsDiscussed:  [],
    rawNotes:         "",
  }))

  return {
    curated,
    rawLog,
    sessionLog: (old.sessionLog ?? []).slice(0, 20),
  }
}

export function saveMemory(memory: StudentMemory): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memory))
}

export function loadMemory(): StudentMemory | null {
  return migrateOrLoad()
}

export function createFreshMemory(name: string, grade: number): StudentMemory {
  return {
    curated: {
      name,
      grade,
      setupComplete:      false,
      topics:             {},
      interests:          [],
      learningStyle:      "",
      encouragementNeeds: "low",
      flags:              { frustrationTriggers: [], celebrationMoments: [] },
      sessionCount:       0,
      lastCuratedAt:      0,
    },
    rawLog:     [],
    sessionLog: [],
  }
}

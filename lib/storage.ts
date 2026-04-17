// lib/storage.ts
// Multi-student localStorage helpers

import type { StudentMemory } from "./spark-memory/types"
import { createFreshMemory } from "./spark-memory/migrate"

export { createFreshMemory }

const ALL_KEY      = "spark_students"       // Record<id, StudentMemory>
const ACTIVE_KEY   = "spark_active_student" // string id

// ── helpers ──────────────────────────────────────────────────────────────────

function loadAll(): Record<string, StudentMemory> {
  if (typeof window === "undefined") return {}
  try { return JSON.parse(localStorage.getItem(ALL_KEY) ?? "{}") } catch { return {} }
}

function saveAll(all: Record<string, StudentMemory>) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(ALL_KEY, JSON.stringify(all))
  } catch (err) {
    if (err instanceof DOMException && err.name === "QuotaExceededError") {
      console.error("[spark] localStorage full — student progress could not be saved.")
      // Surface a visible warning so parents/teachers notice
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("spark:storage-full"))
      }
    } else {
      throw err
    }
  }
}

// ── student list ──────────────────────────────────────────────────────────────

export function getAllStudents(): { id: string; memory: StudentMemory }[] {
  const all = loadAll()
  return Object.entries(all).map(([id, memory]) => ({ id, memory }))
}

export function getStudent(id: string): StudentMemory | null {
  return loadAll()[id] ?? null
}

export function saveStudent(id: string, memory: StudentMemory) {
  const all = loadAll()
  all[id] = memory
  saveAll(all)
}

export function deleteStudent(id: string) {
  const all = loadAll()
  delete all[id]
  saveAll(all)
  if (getActiveStudentId() === id) clearActiveStudent()
}

export function createStudent(name: string, grade: number): string {
  const id = `student_${Date.now()}`
  const memory = createFreshMemory(name, grade)
  memory.curated.setupComplete = true
  saveStudent(id, memory)
  return id
}

// ── active student ────────────────────────────────────────────────────────────

export function getActiveStudentId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACTIVE_KEY)
}

export function setActiveStudent(id: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(ACTIVE_KEY, id)
}

export function clearActiveStudent() {
  if (typeof window === "undefined") return
  localStorage.removeItem(ACTIVE_KEY)
}

export function getActiveMemory(): StudentMemory | null {
  const id = getActiveStudentId()
  if (!id) return null
  return getStudent(id)
}

export function saveActiveMemory(memory: StudentMemory) {
  const id = getActiveStudentId()
  if (!id) return
  saveStudent(id, memory)
}

// ── legacy migration ──────────────────────────────────────────────────────────
// If user had a single-student setup, pull it into the multi-student store

export function migrateLegacyIfNeeded() {
  if (typeof window === "undefined") return
  const legacy = localStorage.getItem("spark_student_memory")
  if (!legacy) return
  try {
    const memory = JSON.parse(legacy) as StudentMemory
    if (memory?.curated?.name) {
      const id = createStudent(memory.curated.name, memory.curated.grade)
      saveStudent(id, memory)
    }
    localStorage.removeItem("spark_student_memory")
  } catch { /* ignore */ }
}

// ── seed demo students ────────────────────────────────────────────────────────

export function seedDemoStudentsIfEmpty() {
  if (typeof window === "undefined") return
  const all = loadAll()
  if (Object.keys(all).length > 0) return // already have students

  const demos = [
    { name: "Mia",   grade: 2 },
    { name: "Oscar", grade: 3 },
    { name: "Zara",  grade: 5 },
  ]
  for (const { name, grade } of demos) {
    createStudent(name, grade)
  }
}

// ── legacy compat (used by chat/profile pages) ────────────────────────────────

export function getStudentMemory(): StudentMemory | null {
  return getActiveMemory()
}

export function setStudentMemory(memory: StudentMemory) {
  saveActiveMemory(memory)
}

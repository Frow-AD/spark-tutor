"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  getAllStudents,
  setActiveStudent,
  seedDemoStudentsIfEmpty,
  migrateLegacyIfNeeded,
  createStudent,
  deleteStudent,
} from "@/lib/storage"
import type { StudentMemory } from "@/lib/spark-memory/types"

type StudentEntry = { id: string; memory: StudentMemory }

const GRADE_COLORS = [
  "", // 0 unused
  "from-pink-400 to-rose-400",
  "from-orange-400 to-amber-400",
  "from-green-400 to-emerald-400",
  "from-blue-400 to-cyan-400",
  "from-purple-400 to-violet-400",
]

const AVATARS = ["🧒", "👦", "👧", "🧑", "👩", "🧑‍🎓"]

export default function HomePage() {
  const router = useRouter()
  const [students, setStudents] = useState<StudentEntry[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState("")
  const [newGrade, setNewGrade] = useState("")

  useEffect(() => {
    migrateLegacyIfNeeded()
    seedDemoStudentsIfEmpty()
    setStudents(getAllStudents())
  }, [])

  const openStudent = (id: string) => {
    setActiveStudent(id)
    router.push("/chat")
  }

  const handleAdd = () => {
    if (!newName.trim() || !newGrade) return
    const id = createStudent(newName.trim(), parseInt(newGrade))
    setActiveStudent(id)
    router.push("/chat")
  }

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation()
    if (!confirm(`Remove ${name}?`)) return
    deleteStudent(id)
    setStudents(getAllStudents())
  }

  return (
    <div className="min-h-screen p-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10 pt-6">
        <div className="text-6xl mb-3">✨</div>
        <h1 className="text-4xl font-bold text-blue-600">Spark</h1>
        <p className="text-gray-500 mt-1 text-lg">Who's learning today?</p>
      </div>

      {/* Student cards */}
      <div className="space-y-4 mb-8">
        {students.map(({ id, memory }) => {
          const p = memory.curated
          const avatar = AVATARS[p.grade % AVATARS.length]
          const gradient = GRADE_COLORS[p.grade] ?? GRADE_COLORS[1]
          const topicCount = Object.keys(p.topics).length
          return (
            <button
              key={id}
              onClick={() => openStudent(id)}
              className="w-full text-left bg-white rounded-3xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 overflow-hidden"
            >
              <div className="flex items-center gap-4 p-5">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-3xl flex-shrink-0`}>
                  {avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">{p.name}</h2>
                    <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                      Grade {p.grade}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-1 text-sm text-gray-500">
                    <span>{p.sessionCount} session{p.sessionCount !== 1 ? "s" : ""}</span>
                    {topicCount > 0 && <span>· {topicCount} topic{topicCount !== 1 ? "s" : ""}</span>}
                    {p.interests.length > 0 && (
                      <span className="truncate">· loves {p.interests.slice(0, 2).join(", ")}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-2xl text-gray-300 group-hover:text-blue-400">›</span>
                  <button
                    onClick={(e) => handleDelete(e, id, p.name)}
                    className="text-gray-300 hover:text-red-400 transition-colors text-lg px-1"
                    title="Remove student"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Add student */}
      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-400 hover:text-blue-500 rounded-3xl py-5 text-lg font-semibold transition-colors"
        >
          + Add a student
        </button>
      ) : (
        <div className="bg-white rounded-3xl shadow-md p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-700">New student</h3>
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name..."
            className="w-full rounded-2xl border-2 border-gray-200 focus:border-blue-400 outline-none px-4 py-3 text-lg text-gray-800"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((g) => (
              <button
                key={g}
                onClick={() => setNewGrade(String(g))}
                className={`rounded-2xl py-3 text-xl font-bold transition-all ${
                  newGrade === String(g)
                    ? "bg-blue-500 text-white scale-110 shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowAdd(false); setNewName(""); setNewGrade("") }}
              className="flex-1 rounded-2xl py-3 border-2 border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!newName.trim() || !newGrade}
              className="flex-1 rounded-2xl py-3 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40 text-gray-900 font-bold transition-colors"
            >
              Start! 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

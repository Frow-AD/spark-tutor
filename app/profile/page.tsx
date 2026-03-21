"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getStudentMemory } from "@/lib/storage"
import type { StudentMemory } from "@/lib/spark-memory/types"

export default function ProfilePage() {
  const router = useRouter()
  const [memory, setMemory] = useState<StudentMemory | null>(null)

  useEffect(() => {
    const m = getStudentMemory()
    if (!m?.curated?.setupComplete) {
      router.replace("/")
      return
    }
    setMemory(m)
  }, [router])

  if (!memory) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-2xl text-gray-500">Loading...</div>
    </div>
  )

  const { curated, sessionLog } = memory
  const proficiencyColor = {
    emerging: "bg-orange-100 text-orange-700",
    developing: "bg-yellow-100 text-yellow-700",
    strong: "bg-green-100 text-green-700",
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.push("/chat")} className="text-blue-500 hover:text-blue-700 text-lg">← Chat</button>
        <button onClick={() => router.push("/")} className="text-gray-400 hover:text-gray-600 text-sm">🏠 Home</button>
        <h1 className="text-3xl font-bold text-gray-800">Student Profile 📋</h1>
      </div>

      {/* Basic info */}
      <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center text-3xl">🧒</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{curated.name}</h2>
            <p className="text-gray-500">Grade {curated.grade} · {curated.sessionCount} session{curated.sessionCount !== 1 ? "s" : ""}</p>
          </div>
        </div>
        {curated.learningStyle && (
          <div className="mt-4 p-3 bg-blue-50 rounded-xl text-gray-700">
            <span className="font-semibold">Learning style:</span> {curated.learningStyle}
          </div>
        )}
        <div className="mt-3 p-3 bg-purple-50 rounded-xl text-gray-700">
          <span className="font-semibold">Encouragement needs:</span> {curated.encouragementNeeds}
        </div>
      </div>

      {/* Interests */}
      {curated.interests.length > 0 && (
        <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-700 mb-3">Interests 🌟</h3>
          <div className="flex flex-wrap gap-2">
            {curated.interests.map((interest, i) => (
              <span key={i} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Topics */}
      {Object.keys(curated.topics).length > 0 && (
        <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-700 mb-3">Topics Explored 📚</h3>
          <div className="space-y-2">
            {Object.entries(curated.topics).map(([topic, data]) => (
              <div key={topic} className="flex items-start gap-3">
                <span className={`px-2 py-1 rounded-lg text-xs font-semibold capitalize ${proficiencyColor[data.proficiency]}`}>
                  {data.proficiency}
                </span>
                <div>
                  <span className="font-medium text-gray-800 capitalize">{topic}</span>
                  {data.notes && <p className="text-sm text-gray-500">{data.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flags */}
      {(curated.flags.celebrationMoments.length > 0 || curated.flags.frustrationTriggers.length > 0) && (
        <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-700 mb-3">Notes for Parents 💬</h3>
          {curated.flags.celebrationMoments.length > 0 && (
            <div className="mb-3">
              <p className="font-semibold text-green-700 mb-1">🎉 Recent wins:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {curated.flags.celebrationMoments.slice(-5).map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          )}
          {curated.flags.frustrationTriggers.length > 0 && (
            <div>
              <p className="font-semibold text-orange-700 mb-1">⚠️ Things that can be tricky:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {curated.flags.frustrationTriggers.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Session Log */}
      {sessionLog.length > 0 && (
        <div className="bg-white rounded-3xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-700 mb-3">Recent Sessions 📅</h3>
          <div className="space-y-3">
            {sessionLog.slice(0, 5).map((session, i) => (
              <div key={i} className="border-l-4 border-blue-200 pl-4">
                <p className="text-sm text-gray-400">{new Date(session.date).toLocaleDateString()}</p>
                <p className="text-gray-700">{session.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

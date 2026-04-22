"use client"

import { useState } from "react"
import type { SessionRecap } from "@/lib/spark-memory/types"

interface SessionEndCardProps {
  childName: string
  recap: SessionRecap
  existingInstructions?: string
  onSaveInstructions: (instructions: string) => void
}

export default function SessionEndCard({ childName, recap, existingInstructions, onSaveInstructions }: SessionEndCardProps) {
  const [rating, setRating] = useState<"up" | "down" | null>(null)
  const [instructions, setInstructions] = useState(existingInstructions ?? "")
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    onSaveInstructions(instructions)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-4 mb-6 mt-2 rounded-3xl border-2 border-purple-100 bg-purple-50 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">📋</span>
        <div>
          <p className="font-bold text-purple-800 text-base">Session Report</p>
          <p className="text-xs text-purple-500">For parents</p>
        </div>
      </div>

      <p className="text-gray-700 text-sm leading-relaxed">{recap.parentNote}</p>

      {recap.topicsCovered.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">Topics covered</p>
          <div className="flex flex-wrap gap-2">
            {recap.topicsCovered.map(topic => (
              <span key={topic} className="bg-white border border-purple-200 text-purple-700 text-sm font-medium px-3 py-1 rounded-full">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-purple-100 pt-4">
        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">How did Spark do?</p>
        <div className="flex gap-2">
          <button
            onClick={() => setRating("up")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-semibold transition-all active:scale-95 ${
              rating === "up"
                ? "bg-green-100 text-green-700 border-2 border-green-300"
                : "bg-white border-2 border-gray-200 text-gray-500 hover:border-green-200 hover:text-green-600"
            }`}
          >
            👍 Great session
          </button>
          <button
            onClick={() => setRating("down")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-semibold transition-all active:scale-95 ${
              rating === "down"
                ? "bg-red-100 text-red-600 border-2 border-red-300"
                : "bg-white border-2 border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500"
            }`}
          >
            👎 Needs work
          </button>
        </div>
      </div>

      <div className="border-t border-purple-100 pt-4">
        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Notes for Spark</p>
        <p className="text-xs text-gray-500 mb-2">Instructions Spark will follow in future sessions with {childName}</p>
        <textarea
          value={instructions}
          onChange={e => setInstructions(e.target.value)}
          placeholder="e.g. Focus on multiplication tables. She gets frustrated easily with word problems — go slow."
          rows={3}
          className="w-full rounded-2xl border-2 border-purple-200 focus:border-purple-400 outline-none px-4 py-3 text-sm text-gray-800 placeholder-gray-400 resize-none bg-white"
        />
        <button
          onClick={handleSave}
          className="mt-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors active:scale-95"
        >
          {saved ? "Saved ✓" : "Save"}
        </button>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useRef, useState, useCallback } from "react"

export function useTTS() {
  const [speaking, setSpeaking] = useState(false)
  const [enabled, setEnabled] = useState(true)
  const [usingElevenLabs, setUsingElevenLabs] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const wsVoiceRef = useRef<SpeechSynthesisVoice | null>(null)

  // Init Web Speech fallback voice
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    const pick = () => {
      const voices = window.speechSynthesis.getVoices()
      const preferred = ["Samantha", "Karen", "Tessa", "Google US English"]
      for (const name of preferred) {
        const v = voices.find(v => v.name === name)
        if (v) { wsVoiceRef.current = v; return }
      }
      wsVoiceRef.current = voices.find(v => v.lang.startsWith("en")) ?? null
    }
    pick()
    window.speechSynthesis.onvoiceschanged = pick
  }, [])

  const stopAll = useCallback(() => {
    // Stop ElevenLabs audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
      audioRef.current = null
    }
    // Stop Web Speech
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setSpeaking(false)
  }, [])

  const speakWithElevenLabs = useCallback(async (text: string) => {
    stopAll()
    setSpeaking(true)
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error(`TTS API ${res.status}`)

      const blob = await res.blob()
      const url = URL.createObjectURL(new Blob([blob], { type: "audio/wav" }))
      const audio = new Audio(url)
      audioRef.current = audio

      audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(url) }
      audio.onerror = () => { setSpeaking(false); URL.revokeObjectURL(url) }
      await audio.play()
    } catch (e) {
      console.warn("[tts] ElevenLabs failed, falling back to Web Speech:", e)
      setUsingElevenLabs(false)
      speakWithWebSpeech(text)
    }
  }, [stopAll]) // eslint-disable-line react-hooks/exhaustive-deps

  const speakWithWebSpeech = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    stopAll()
    const clean = text
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/[#_~]/g, "")
      .trim()
    if (!clean) return
    const utter = new SpeechSynthesisUtterance(clean)
    utter.voice = wsVoiceRef.current
    utter.rate = 0.95
    utter.pitch = 1.1
    utter.onstart = () => setSpeaking(true)
    utter.onend = () => setSpeaking(false)
    utter.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utter)
  }, [stopAll])

  const speak = useCallback((text: string) => {
    if (!enabled || !text?.trim()) return
    if (usingElevenLabs) {
      speakWithElevenLabs(text)
    } else {
      speakWithWebSpeech(text)
    }
  }, [enabled, usingElevenLabs, speakWithElevenLabs, speakWithWebSpeech])

  const toggle = useCallback(() => {
    if (speaking) stopAll()
    setEnabled(e => !e)
  }, [speaking, stopAll])

  return { speak, stop: stopAll, toggle, speaking, supported: true, enabled, usingElevenLabs }
}

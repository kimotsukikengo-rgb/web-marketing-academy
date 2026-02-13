"use client"

import { useState } from "react"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface LessonCompletionButtonProps {
  lessonId: string
  isCompleted: boolean
}

export function LessonCompletionButton({
  lessonId,
  isCompleted: initialCompleted,
}: LessonCompletionButtonProps) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleComplete() {
    if (isCompleted || loading) return
    setLoading(true)

    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId }),
    })

    setLoading(false)

    if (res.ok) {
      setIsCompleted(true)
      router.refresh()
    }
  }

  if (isCompleted) {
    return (
      <div className="flex items-center gap-2 text-green-600 font-medium">
        <CheckCircle2 className="w-5 h-5" />
        完了済み
      </div>
    )
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-5 rounded-lg transition"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Circle className="w-5 h-5" />
      )}
      レッスンを完了にする
    </button>
  )
}

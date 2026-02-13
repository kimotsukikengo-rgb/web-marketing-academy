"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Play,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Loader2,
  Trophy,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { TagAccuracy, ReviewQuestion } from "@/types"

interface ReviewSessionManagerProps {
  availableTags: { id: string; name: string; category: string }[]
  suggestedTagIds: string[]
  weaknessScores: TagAccuracy[]
}

type ReviewMode = "weakest" | "recent_mistakes" | "spaced_repetition"

const modeConfig: Record<ReviewMode, { label: string; description: string }> = {
  weakest: {
    label: "苦手な問題",
    description: "正答率が低い問題を優先的に出題",
  },
  recent_mistakes: {
    label: "最近の間違い",
    description: "直近で間違えた問題を復習",
  },
  spaced_repetition: {
    label: "間隔反復",
    description: "効率的な間隔で復習問題を出題",
  },
}

export function ReviewSessionManager({
  availableTags,
  suggestedTagIds,
  weaknessScores,
}: ReviewSessionManagerProps) {
  const router = useRouter()
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(
    new Set(suggestedTagIds)
  )
  const [mode, setMode] = useState<ReviewMode>("weakest")
  const [questions, setQuestions] = useState<ReviewQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [results, setResults] = useState<
    { questionId: string; isCorrect: boolean }[]
  >([])
  const [loading, setLoading] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) => {
      const next = new Set(prev)
      if (next.has(tagId)) next.delete(tagId)
      else next.add(tagId)
      return next
    })
  }

  async function startSession() {
    setLoading(true)
    const tagIds = Array.from(selectedTagIds).join(",")
    const res = await fetch(
      `/api/quiz/review?mode=${mode}&tagIds=${tagIds}&maxQuestions=10`
    )
    const data = await res.json()
    setLoading(false)

    if (data.questions && data.questions.length > 0) {
      setQuestions(data.questions)
      setSessionStarted(true)
      setCurrentIndex(0)
      setResults([])
      setSessionComplete(false)
    }
  }

  function handleSelectOption(optionId: string) {
    if (showAnswer) return
    setSelectedOption(optionId)
  }

  function handleConfirmAnswer() {
    if (!selectedOption) return
    setShowAnswer(true)

    // Check if correct (we don't have the correct option from the API, but we'll submit to backend)
    // For now, we'll just track the selection
  }

  function handleNext() {
    // Record result
    setResults((prev) => [
      ...prev,
      { questionId: questions[currentIndex].id, isCorrect: false }, // Placeholder
    ])

    setSelectedOption(null)
    setShowAnswer(false)

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setSessionComplete(true)
    }
  }

  function handleRestart() {
    setSessionStarted(false)
    setSessionComplete(false)
    setQuestions([])
    setResults([])
    setCurrentIndex(0)
  }

  // Session complete view
  if (sessionComplete) {
    const correctCount = results.filter((r) => r.isCorrect).length
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          復習セッション完了！
        </h2>
        <p className="text-slate-500 mb-6">
          {questions.length}問中の復習が完了しました
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition"
          >
            <RotateCcw className="w-4 h-4" />
            もう一度復習する
          </button>
          <button
            onClick={() => router.push("/dashboard/analytics")}
            className="flex items-center gap-2 border border-slate-300 hover:border-slate-400 text-slate-700 font-medium py-2.5 px-5 rounded-lg transition"
          >
            分析に戻る
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  // Active review question
  if (sessionStarted && questions.length > 0) {
    const question = questions[currentIndex]
    return (
      <div className="space-y-6">
        {/* Progress */}
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            問題 {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          {question.tags.length > 0 && (
            <div className="flex gap-1.5 mb-3">
              {question.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <h3 className="text-lg font-semibold text-slate-900 mb-5">
            {question.text}
          </h3>

          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = selectedOption === option.id
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  disabled={showAnswer}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border-2 transition",
                    showAnswer
                      ? "cursor-default"
                      : "cursor-pointer",
                    isSelected && !showAnswer
                      ? "border-blue-500 bg-blue-50"
                      : !showAnswer
                        ? "border-slate-200 hover:border-slate-300"
                        : "border-slate-200",
                    isSelected && showAnswer && "border-blue-500 bg-blue-50"
                  )}
                >
                  <span className="text-sm font-medium text-slate-700">
                    {option.text}
                  </span>
                </button>
              )
            })}
          </div>

          {showAnswer && question.explanation && (
            <div className="mt-4 bg-slate-50 rounded-lg p-4">
              <p className="text-sm font-medium text-slate-900 mb-1">解説</p>
              <p className="text-sm text-slate-600">{question.explanation}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          {!showAnswer ? (
            <button
              onClick={handleConfirmAnswer}
              disabled={!selectedOption}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-5 rounded-lg transition"
            >
              回答を確認
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition"
            >
              {currentIndex < questions.length - 1 ? "次の問題" : "結果を見る"}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  // Setup view
  return (
    <div className="space-y-6">
      {/* Mode selection */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">復習モード</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {(Object.entries(modeConfig) as [ReviewMode, { label: string; description: string }][]).map(
            ([key, config]) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition",
                  mode === key
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <p className="font-medium text-sm text-slate-900">
                  {config.label}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {config.description}
                </p>
              </button>
            )
          )}
        </div>
      </div>

      {/* Tag selection */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-2">
          復習する分野を選択
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          苦手な分野が自動で選択されています
        </p>

        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => {
            const isSelected = selectedTagIds.has(tag.id)
            const weakness = weaknessScores.find((w) => w.tagId === tag.id)

            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition",
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                )}
              >
                {tag.name}
                {weakness && (
                  <span className="ml-1 opacity-70">
                    ({weakness.accuracy}%)
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={startSession}
        disabled={loading || selectedTagIds.size === 0}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 px-6 rounded-xl transition text-lg"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Play className="w-5 h-5" />
        )}
        復習を開始する
      </button>
    </div>
  )
}

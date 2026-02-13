"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  Trophy,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface QuizOption {
  id: string
  text: string
  order: number
}

interface QuizQuestion {
  id: string
  text: string
  explanation: string | null
  order: number
  options: QuizOption[]
  tags: { tag: { id: string; name: string } }[]
}

interface QuizData {
  id: string
  title: string
  description: string | null
  passingScore: number
  questions: QuizQuestion[]
}

interface QuizResult {
  attemptId: string
  score: number
  totalQuestions: number
  correctCount: number
  passed: boolean
  answers: {
    questionId: string
    questionText: string
    selectedOptionId: string | null
    correctOptionId: string
    isCorrect: boolean
    explanation: string | null
    tags: { id: string; name: string }[]
  }[]
}

interface QuizComponentProps {
  quiz: QuizData
  isReview?: boolean
}

export function QuizComponent({ quiz, isReview = false }: QuizComponentProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({})
  const [result, setResult] = useState<QuizResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const currentQuestion = quiz.questions[currentIndex]
  const totalQuestions = quiz.questions.length
  const answeredCount = Object.keys(selectedAnswers).length

  function selectOption(questionId: string, optionId: string) {
    if (result) return
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  async function handleSubmit() {
    setLoading(true)
    const answers = quiz.questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: selectedAnswers[q.id] ?? null,
    }))

    const res = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quizId: quiz.id,
        answers,
        isReviewAttempt: isReview,
      }),
    })

    setLoading(false)

    if (res.ok) {
      const data: QuizResult = await res.json()
      setResult(data)
      setShowResults(true)
      router.refresh()
    }
  }

  function handleRetry() {
    setSelectedAnswers({})
    setResult(null)
    setShowResults(false)
    setCurrentIndex(0)
  }

  // Results view
  if (showResults && result) {
    return (
      <div className="space-y-6">
        <div
          className={cn(
            "rounded-2xl p-6 text-center",
            result.passed
              ? "bg-green-50 border border-green-200"
              : "bg-amber-50 border border-amber-200"
          )}
        >
          <Trophy
            className={cn(
              "w-12 h-12 mx-auto mb-3",
              result.passed ? "text-green-500" : "text-amber-500"
            )}
          />
          <h3 className="text-xl font-bold text-slate-900 mb-1">
            {result.passed ? "合格！" : "もう少し！"}
          </h3>
          <p className="text-3xl font-bold text-slate-900 mb-1">
            {result.score}点
          </p>
          <p className="text-sm text-slate-500">
            {result.correctCount} / {result.totalQuestions} 問正解
            {!result.passed && `（合格ライン: ${quiz.passingScore}点）`}
          </p>
        </div>

        <div className="space-y-4">
          {result.answers.map((answer, idx) => (
            <div
              key={answer.questionId}
              className={cn(
                "rounded-xl border p-5",
                answer.isCorrect
                  ? "border-green-200 bg-green-50/50"
                  : "border-red-200 bg-red-50/50"
              )}
            >
              <div className="flex items-start gap-3 mb-3">
                {answer.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="font-medium text-slate-900">
                    Q{idx + 1}. {answer.questionText}
                  </p>
                  {answer.explanation && (
                    <p className="text-sm text-slate-600 mt-2 bg-white/60 rounded-lg p-3">
                      {answer.explanation}
                    </p>
                  )}
                  {answer.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-2">
                      {answer.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleRetry}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition mx-auto"
        >
          <RotateCcw className="w-5 h-5" />
          もう一度挑戦する
        </button>
      </div>
    )
  }

  // Quiz-taking view
  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
        <span>
          問題 {currentIndex + 1} / {totalQuestions}
        </span>
        <span>{answeredCount} 問回答済み</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{
            width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
          }}
        />
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-5">
          Q{currentIndex + 1}. {currentQuestion.text}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected =
              selectedAnswers[currentQuestion.id] === option.id
            return (
              <button
                key={option.id}
                onClick={() => selectOption(currentQuestion.id, option.id)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition",
                  isSelected
                    ? "border-blue-500 bg-blue-50 text-blue-900"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                )}
              >
                <span className="text-sm font-medium">{option.text}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-40 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          前の問題
        </button>

        {currentIndex < totalQuestions - 1 ? (
          <button
            onClick={() =>
              setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))
            }
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
          >
            次の問題
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading || answeredCount < totalQuestions}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition text-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            回答を送信
          </button>
        )}
      </div>

      {/* Question nav dots */}
      <div className="flex items-center justify-center gap-2 pt-4">
        {quiz.questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(idx)}
            className={cn(
              "w-8 h-8 rounded-full text-xs font-medium transition",
              idx === currentIndex
                ? "bg-blue-600 text-white"
                : selectedAnswers[q.id]
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-400"
            )}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

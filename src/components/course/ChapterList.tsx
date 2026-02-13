"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronDown,
  ChevronRight,
  Play,
  FileText,
  Brain,
  CheckCircle2,
  Circle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Lesson {
  id: string
  title: string
  type: string
  order: number
  videoDurationSeconds: number | null
}

interface Chapter {
  id: string
  title: string
  description: string | null
  order: number
  lessons: Lesson[]
}

interface ChapterListProps {
  chapters: Chapter[]
  courseId: string
  completedLessonIds: Set<string>
}

const typeIcon: Record<string, React.ReactNode> = {
  video: <Play className="w-4 h-4" />,
  text: <FileText className="w-4 h-4" />,
  quiz: <Brain className="w-4 h-4" />,
}

const typeLabel: Record<string, string> = {
  video: "動画",
  text: "テキスト",
  quiz: "クイズ",
}

export function ChapterList({
  chapters,
  courseId,
  completedLessonIds,
}: ChapterListProps) {
  const [openChapters, setOpenChapters] = useState<Set<string>>(
    new Set(chapters.map((c) => c.id))
  )

  function toggleChapter(id: string) {
    setOpenChapters((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="space-y-3">
      {chapters.map((chapter) => {
        const isOpen = openChapters.has(chapter.id)
        const completedInChapter = chapter.lessons.filter((l) =>
          completedLessonIds.has(l.id)
        ).length

        return (
          <div
            key={chapter.id}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden"
          >
            <button
              onClick={() => toggleChapter(chapter.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                {isOpen ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
                <div>
                  <h3 className="font-medium text-slate-900">
                    Chapter {chapter.order}: {chapter.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {completedInChapter} / {chapter.lessons.length} 完了
                  </p>
                </div>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-slate-100">
                {chapter.lessons.map((lesson) => {
                  const isCompleted = completedLessonIds.has(lesson.id)
                  return (
                    <Link
                      key={lesson.id}
                      href={`/courses/${courseId}/chapters/${chapter.id}/lessons/${lesson.id}`}
                      className={cn(
                        "flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition border-b border-slate-50 last:border-b-0",
                        isCompleted && "bg-green-50/50"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm font-medium truncate",
                            isCompleted ? "text-slate-500" : "text-slate-900"
                          )}
                        >
                          {lesson.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
                        {typeIcon[lesson.type]}
                        <span>{typeLabel[lesson.type]}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

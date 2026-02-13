import Link from "next/link"
import { BookOpen, Play, FileText, Brain, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string
    category: string
    difficulty: string
    totalLessons: number
    completedLessons: number
    completionPercentage: number
  }
}

const difficultyConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: "初級", color: "bg-green-100 text-green-700" },
  intermediate: { label: "中級", color: "bg-amber-100 text-amber-700" },
  advanced: { label: "上級", color: "bg-red-100 text-red-700" },
}

export function CourseCard({ course }: CourseCardProps) {
  const diff = difficultyConfig[course.difficulty] ?? difficultyConfig.beginner

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group block bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all"
    >
      <div className="h-36 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
        <BookOpen className="w-12 h-12 text-white/80" />
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", diff.color)}>
            {diff.label}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {course.category}
          </span>
        </div>

        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition mb-2">
          {course.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4">
          {course.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
          <span className="flex items-center gap-1">
            <Play className="w-3.5 h-3.5" />
            {course.totalLessons}レッスン
          </span>
        </div>

        {course.completedLessons > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-500">進捗</span>
              <span className="font-medium text-blue-600">
                {course.completionPercentage}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${course.completionPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}

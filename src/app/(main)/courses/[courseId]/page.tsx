import { auth } from "@/lib/auth"
import { getCourseWithDetails } from "@/services/course.service"
import { prisma } from "@/lib/prisma"
import { ChapterList } from "@/components/course/ChapterList"
import { ArrowLeft, BookOpen } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const session = await auth()

  // コース構造（キャッシュ済み）と進捗を並列取得
  const [course, completedLessons] = await Promise.all([
    getCourseWithDetails(courseId),
    prisma.lessonProgress.findMany({
      where: {
        userId: session!.user.id,
        isCompleted: true,
        lesson: { chapter: { courseId } },
      },
      select: { lessonId: true },
    }),
  ])

  if (!course) notFound()

  const completedSet = new Set(completedLessons.map((l) => l.lessonId))
  const totalLessons = course.chapters.reduce(
    (sum, ch) => sum + ch.lessons.length,
    0
  )
  const completedCount = completedSet.size
  const percentage =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const difficultyLabel: Record<string, string> = {
    beginner: "初級",
    intermediate: "中級",
    advanced: "上級",
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/courses"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        コース一覧に戻る
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-8">
        <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <BookOpen className="w-16 h-16 text-white/80" />
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
              {course.category}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              {difficultyLabel[course.difficulty] ?? course.difficulty}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            {course.title}
          </h1>
          <p className="text-slate-600 mb-6">{course.description}</p>

          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-600">
                {completedCount} / {totalLessons} レッスン完了
              </span>
              <span className="font-semibold text-blue-600">
                {percentage}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        カリキュラム
      </h2>

      <ChapterList
        chapters={course.chapters}
        courseId={courseId}
        completedLessonIds={completedSet}
      />
    </div>
  )
}

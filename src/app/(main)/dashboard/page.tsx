import { auth } from "@/lib/auth"
import { getCoursesWithProgress } from "@/services/course.service"
import { getOverallStats, getRecentActivity } from "@/services/progress.service"
import Link from "next/link"
import {
  BookOpen,
  CheckCircle2,
  Brain,
  Trophy,
  ArrowRight,
  Play,
  FileText,
  Clock,
} from "lucide-react"
import { formatDate } from "@/lib/utils"

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user.id

  const [courses, stats, recentActivity] = await Promise.all([
    getCoursesWithProgress(userId),
    getOverallStats(userId),
    getRecentActivity(userId, 5),
  ])

  const startedCourses = courses.filter((c) => c.completedLessons > 0)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          おかえりなさい、{session!.user.name}さん
        </h1>
        <p className="text-slate-500 mt-1">学習の進捗を確認しましょう</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<BookOpen className="w-5 h-5 text-blue-600" />}
          label="受講中コース"
          value={startedCourses.length.toString()}
          bg="bg-blue-50"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
          label="完了レッスン"
          value={stats.completedLessons.toString()}
          bg="bg-green-50"
        />
        <StatCard
          icon={<Brain className="w-5 h-5 text-violet-600" />}
          label="クイズ受験回数"
          value={stats.quizzesTaken.toString()}
          bg="bg-violet-50"
        />
        <StatCard
          icon={<Trophy className="w-5 h-5 text-amber-600" />}
          label="平均スコア"
          value={`${stats.averageScore}点`}
          bg="bg-amber-50"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Course progress */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              コース進捗
            </h2>
            <Link
              href="/courses"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              全てのコース
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-4">まだコースを受講していません</p>
              <Link
                href="/courses"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                コース一覧を見る
              </Link>
            </div>
          ) : (
            courses.map((course) => (
              <CourseProgressRow key={course.id} course={course} />
            ))
          )}
        </div>

        {/* Recent activity */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            最近のアクティビティ
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {recentActivity.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">
                アクティビティはまだありません
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    {activity.lesson.type === "video" && (
                      <Play className="w-3.5 h-3.5 text-blue-500" />
                    )}
                    {activity.lesson.type === "text" && (
                      <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                    {activity.lesson.type === "quiz" && (
                      <Brain className="w-3.5 h-3.5 text-violet-500" />
                    )}
                    <span className="text-sm font-medium text-slate-900 truncate">
                      {activity.lesson.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 ml-5.5">
                    <Clock className="w-3 h-3" />
                    {activity.completedAt
                      ? formatDate(activity.completedAt)
                      : ""}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 space-y-3">
            <Link
              href="/dashboard/analytics"
              className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 transition"
            >
              <h3 className="font-medium text-slate-900 text-sm mb-1">
                苦手分野の分析
              </h3>
              <p className="text-xs text-slate-400">
                クイズ結果を分析してあなたの弱点を可視化
              </p>
            </Link>
            <Link
              href="/dashboard/review"
              className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 transition"
            >
              <h3 className="font-medium text-slate-900 text-sm mb-1">
                苦手分野の復習
              </h3>
              <p className="text-xs text-slate-400">
                苦手な問題を重点的に復習しましょう
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode
  label: string
  value: string
  bg: string
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${bg} mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}

function CourseProgressRow({
  course,
}: {
  course: {
    id: string
    title: string
    category: string
    totalLessons: number
    completedLessons: number
    completionPercentage: number
    nextLesson: {
      courseId: string
      chapterId: string
      lessonId: string
    } | null
  }
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-900">{course.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {course.completedLessons} / {course.totalLessons} レッスン完了
          </p>
        </div>
        <span className="text-sm font-bold text-blue-600">
          {course.completionPercentage}%
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${course.completionPercentage}%` }}
        />
      </div>
      {course.nextLesson && (
        <Link
          href={`/courses/${course.nextLesson.courseId}/chapters/${course.nextLesson.chapterId}/lessons/${course.nextLesson.lessonId}`}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          続きから学習
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}

import { auth } from "@/lib/auth"
import { getOverallStats } from "@/services/progress.service"
import { User, Mail, Calendar, BookOpen, Brain, Trophy } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"

export default async function ProfilePage() {
  const session = await auth()
  const userId = session!.user.id

  const [stats, user] = await Promise.all([
    getOverallStats(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, createdAt: true },
    }),
  ])

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">プロフィール</h1>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600" />
        <div className="px-6 pb-6">
          <div className="w-20 h-20 bg-white rounded-full border-4 border-white -mt-10 flex items-center justify-center shadow-sm">
            <User className="w-10 h-10 text-slate-400" />
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {user?.name ?? "ユーザー"}
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">
                  {user?.createdAt ? formatDate(user.createdAt) : ""} に登録
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-4">
        学習統計
      </h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">
            {stats.completedLessons}
          </p>
          <p className="text-xs text-slate-500">完了レッスン</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <Brain className="w-6 h-6 text-violet-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">
            {stats.quizzesTaken}
          </p>
          <p className="text-xs text-slate-500">クイズ受験</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <Trophy className="w-6 h-6 text-amber-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">
            {stats.averageScore}点
          </p>
          <p className="text-xs text-slate-500">平均スコア</p>
        </div>
      </div>
    </div>
  )
}

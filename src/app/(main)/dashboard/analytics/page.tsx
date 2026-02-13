import { auth } from "@/lib/auth"
import { getWeaknessAnalysis } from "@/services/analytics.service"
import { WeaknessChart } from "@/components/analytics/WeaknessChart"
import { TopicAccuracyBar } from "@/components/analytics/TopicAccuracyBar"
import { BarChart3, ArrowRight, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default async function AnalyticsPage() {
  const session = await auth()
  const analysis = await getWeaknessAnalysis(session!.user.id)

  const hasData = analysis.tagAccuracies.length > 0

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-blue-600" />
          苦手分野の分析
        </h1>
        <p className="text-slate-500 mt-1">
          クイズの結果からあなたの得意・苦手分野を分析します
        </p>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            まだデータがありません
          </h2>
          <p className="text-slate-500 mb-6">
            クイズを受験すると、あなたの得意・苦手分野の分析結果がここに表示されます
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition"
          >
            コースで学習する
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid md:grid-cols-3 gap-4">
            {analysis.topWeaknesses[0] && (
              <div className="bg-red-50 rounded-xl border border-red-200 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-red-900 text-sm">最も苦手な分野</h3>
                </div>
                <p className="text-lg font-bold text-red-800">
                  {analysis.topWeaknesses[0].tagName}
                </p>
                <p className="text-sm text-red-600">
                  正答率: {analysis.topWeaknesses[0].accuracy}%
                </p>
              </div>
            )}
            {analysis.topStrengths[0] && (
              <div className="bg-green-50 rounded-xl border border-green-200 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold text-green-900 text-sm">最も得意な分野</h3>
                </div>
                <p className="text-lg font-bold text-green-800">
                  {analysis.topStrengths[0].tagName}
                </p>
                <p className="text-sm text-green-600">
                  正答率: {analysis.topStrengths[0].accuracy}%
                </p>
              </div>
            )}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-blue-900 text-sm">分析対象</h3>
              </div>
              <p className="text-lg font-bold text-blue-800">
                {analysis.tagAccuracies.length}分野
              </p>
              <p className="text-sm text-blue-600">
                {analysis.tagAccuracies.reduce(
                  (sum, t) => sum + t.totalQuestions,
                  0
                )}
                問の回答データ
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Radar chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                カテゴリ別の正答率
              </h2>
              <WeaknessChart data={analysis.categoryBreakdown} />
            </div>

            {/* Topic bars */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                トピック別の正答率
              </h2>
              <TopicAccuracyBar data={analysis.tagAccuracies} />
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-2">
              苦手分野を復習しましょう
            </h2>
            <p className="text-blue-100 mb-4">
              苦手な問題を重点的に復習して、スキルアップしましょう
            </p>
            <Link
              href="/dashboard/review"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-50 transition"
            >
              復習モードを開始
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

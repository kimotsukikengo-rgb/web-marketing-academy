import Link from "next/link"
import {
  GraduationCap,
  Play,
  FileText,
  Brain,
  BarChart3,
  RefreshCw,
  ArrowRight,
} from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">
              クラプロMarketing Academy
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition px-4 py-2"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-lg"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Brain className="w-4 h-4" />
              WebマーケティングとAIを実践的に学ぶ
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
              あなたのスキルを
              <br />
              <span className="text-blue-600">次のレベル</span>へ
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              動画・テキスト・クイズを組み合わせた実践的なカリキュラムで、
              WebマーケティングとAI活用のスキルを効率的に習得。
              苦手分野を自動分析し、あなた専用の復習プランを提案します。
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl transition shadow-lg shadow-blue-600/25"
              >
                無料で学習を始める
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-slate-300 hover:border-slate-400 text-slate-700 font-medium px-8 py-3.5 rounded-xl transition"
              >
                ログインはこちら
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">
              効率的な学習を支える機能
            </h2>
            <p className="mt-4 text-slate-600">
              学習の質を最大化するための仕組みを用意しています
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Play className="w-6 h-6" />}
              title="動画レッスン"
              description="プロ講師によるわかりやすい動画で、マーケティングの基礎から応用まで学べます"
              color="blue"
            />
            <FeatureCard
              icon={<FileText className="w-6 h-6" />}
              title="テキスト教材"
              description="要点をまとめたテキスト教材で、動画の内容を復習しながら理解を深められます"
              color="emerald"
            />
            <FeatureCard
              icon={<Brain className="w-6 h-6" />}
              title="理解度クイズ"
              description="各チャプターの理解度をクイズで確認。即座にフィードバックを受けられます"
              color="violet"
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="苦手分野の分析"
              description="クイズ結果からAIがあなたの弱点を分析。レーダーチャートで一目でわかります"
              color="amber"
            />
            <FeatureCard
              icon={<RefreshCw className="w-6 h-6" />}
              title="スマート復習"
              description="苦手な問題を優先的に出題する復習モードで、効率的にスキルアップできます"
              color="rose"
            />
            <FeatureCard
              icon={<GraduationCap className="w-6 h-6" />}
              title="進捗管理"
              description="学習の進捗をダッシュボードで可視化。モチベーションを維持しながら学べます"
              color="cyan"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            今すぐ学習を始めましょう
          </h2>
          <p className="mt-4 text-blue-100 text-lg">
            WebマーケティングとAIのスキルを身につけて、キャリアを加速させましょう
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition"
          >
            無料で始める
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} クラプロMarketing Academy. All rights
          reserved.
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    violet: "bg-violet-100 text-violet-600",
    amber: "bg-amber-100 text-amber-600",
    rose: "bg-rose-100 text-rose-600",
    cyan: "bg-cyan-100 text-cyan-600",
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all">
      <div
        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${colorMap[color]} mb-4`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

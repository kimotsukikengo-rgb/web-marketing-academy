import { FileQuestion } from "lucide-react"
import Link from "next/link"

export default function MainNotFound() {
  return (
    <div className="max-w-md mx-auto py-16 text-center">
      <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <FileQuestion className="w-8 h-8 text-slate-400" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">
        ページが見つかりません
      </h2>
      <p className="text-slate-500 mb-6">
        お探しのページは存在しないか、移動された可能性があります。
      </p>
      <Link
        href="/dashboard"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition"
      >
        ダッシュボードに戻る
      </Link>
    </div>
  )
}

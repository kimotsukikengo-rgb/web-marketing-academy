"use client"

import { AlertTriangle } from "lucide-react"

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-md mx-auto py-16 text-center">
      <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">
        エラーが発生しました
      </h2>
      <p className="text-slate-500 mb-6">
        ページの読み込み中にエラーが発生しました。もう一度お試しください。
      </p>
      <button
        onClick={reset}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition"
      >
        もう一度試す
      </button>
    </div>
  )
}

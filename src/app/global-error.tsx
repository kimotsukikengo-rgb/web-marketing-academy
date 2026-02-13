"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ja">
      <body className="bg-slate-50">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              予期しないエラーが発生しました
            </h2>
            <p className="text-slate-500 mb-6">
              申し訳ありません。システムでエラーが発生しました。
            </p>
            <button
              onClick={reset}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition"
            >
              もう一度試す
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

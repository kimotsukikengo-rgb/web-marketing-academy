import { auth } from "@/lib/auth"
import { getReviewableTagsForUser } from "@/services/review.service"
import { calculateWeaknessScores } from "@/services/analytics.service"
import { ReviewSessionManager } from "@/components/review/ReviewSessionManager"
import { RefreshCw } from "lucide-react"

export default async function ReviewPage() {
  const session = await auth()
  const userId = session!.user.id

  const [reviewableTags, weaknessScores] = await Promise.all([
    getReviewableTagsForUser(userId),
    calculateWeaknessScores(userId),
  ])

  // Pre-select the top 3 weakest tags
  const suggestedTagIds = weaknessScores.slice(0, 3).map((t) => t.tagId)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <RefreshCw className="w-7 h-7 text-blue-600" />
          苦手分野の復習
        </h1>
        <p className="text-slate-500 mt-1">
          苦手な問題を重点的に復習してスキルアップしましょう
        </p>
      </div>

      {reviewableTags.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <RefreshCw className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            復習する問題がありません
          </h2>
          <p className="text-slate-500">
            クイズで間違えた問題がここに表示されます。まずはコースでクイズに挑戦しましょう！
          </p>
        </div>
      ) : (
        <ReviewSessionManager
          availableTags={reviewableTags}
          suggestedTagIds={suggestedTagIds}
          weaknessScores={weaknessScores}
        />
      )}
    </div>
  )
}

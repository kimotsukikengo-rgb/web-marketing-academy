import { prisma } from "@/lib/prisma"
import type { TagAccuracy } from "@/types"

export async function calculateWeaknessScores(
  userId: string
): Promise<TagAccuracy[]> {
  // Fetch all quiz answers with their question tags
  const answers = await prisma.quizAnswer.findMany({
    where: {
      attempt: { userId, isReviewAttempt: false },
    },
    include: {
      question: {
        include: {
          tags: {
            include: { tag: true },
          },
        },
      },
    },
    orderBy: { answeredAt: "asc" },
  })

  // Group answers by tag
  const tagMap = new Map<
    string,
    {
      tagId: string
      tagName: string
      category: string
      answers: { isCorrect: boolean; answeredAt: Date }[]
    }
  >()

  for (const answer of answers) {
    for (const tagRel of answer.question.tags) {
      const tag = tagRel.tag
      if (!tagMap.has(tag.id)) {
        tagMap.set(tag.id, {
          tagId: tag.id,
          tagName: tag.name,
          category: tag.category,
          answers: [],
        })
      }
      tagMap.get(tag.id)!.answers.push({
        isCorrect: answer.isCorrect,
        answeredAt: answer.answeredAt,
      })
    }
  }

  // Calculate accuracy for each tag
  const tagAccuracies: TagAccuracy[] = []

  for (const [, data] of tagMap) {
    // Need at least 2 answers for meaningful analysis
    if (data.answers.length < 2) continue

    const totalQuestions = data.answers.length
    const correctCount = data.answers.filter((a) => a.isCorrect).length
    const overallAccuracy = correctCount / totalQuestions

    // Split into older and recent halves
    const midpoint = Math.floor(data.answers.length / 2)
    const olderAnswers = data.answers.slice(0, midpoint)
    const recentAnswers = data.answers.slice(midpoint)

    const olderCorrect = olderAnswers.filter((a) => a.isCorrect).length
    const olderAccuracy =
      olderAnswers.length > 0 ? olderCorrect / olderAnswers.length : 0

    const recentCorrect = recentAnswers.filter((a) => a.isCorrect).length
    const recentAccuracy =
      recentAnswers.length > 0 ? recentCorrect / recentAnswers.length : 0

    // Weighted accuracy (recent matters more)
    const weightedAccuracy = recentAccuracy * 0.7 + olderAccuracy * 0.3
    const weaknessScore = Math.round((1 - weightedAccuracy) * 100)

    // Determine trend
    const diff = recentAccuracy - olderAccuracy
    let trend: "improving" | "declining" | "stable" = "stable"
    if (diff > 0.05) trend = "improving"
    else if (diff < -0.05) trend = "declining"

    tagAccuracies.push({
      tagId: data.tagId,
      tagName: data.tagName,
      category: data.category,
      totalQuestions,
      correctCount,
      accuracy: Math.round(overallAccuracy * 100),
      weaknessScore,
      trend,
      recentAccuracy: Math.round(recentAccuracy * 100),
    })
  }

  // Sort by weakness score (weakest first)
  tagAccuracies.sort((a, b) => b.weaknessScore - a.weaknessScore)

  return tagAccuracies
}

export async function getCategoryBreakdown(userId: string) {
  const tagAccuracies = await calculateWeaknessScores(userId)

  const categoryMap = new Map<string, { total: number; sum: number }>()
  for (const tag of tagAccuracies) {
    if (!categoryMap.has(tag.category)) {
      categoryMap.set(tag.category, { total: 0, sum: 0 })
    }
    const entry = categoryMap.get(tag.category)!
    entry.total++
    entry.sum += tag.accuracy
  }

  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    avgAccuracy: Math.round(data.sum / data.total),
  }))
}

export async function getWeaknessAnalysis(userId: string) {
  const tagAccuracies = await calculateWeaknessScores(userId)
  const categoryBreakdown = await getCategoryBreakdown(userId)

  return {
    tagAccuracies,
    topWeaknesses: tagAccuracies.slice(0, 5),
    topStrengths: [...tagAccuracies].sort(
      (a, b) => a.weaknessScore - b.weaknessScore
    ).slice(0, 5),
    categoryBreakdown,
  }
}

import { prisma } from "@/lib/prisma"
import type { ReviewQuestion, ReviewSetOptions } from "@/types"

export async function generateReviewSet(
  userId: string,
  options: ReviewSetOptions
): Promise<ReviewQuestion[]> {
  const { focusTagIds, maxQuestions = 10, mode } = options

  // Get all incorrectly answered questions with their tags
  const incorrectAnswers = await prisma.quizAnswer.findMany({
    where: {
      attempt: { userId },
      isCorrect: false,
    },
    include: {
      question: {
        include: {
          options: {
            orderBy: { order: "asc" },
            select: { id: true, text: true, order: true },
          },
          tags: { include: { tag: true } },
        },
      },
    },
    orderBy: { answeredAt: "desc" },
  })

  // Group by question and filter by focus tags
  const questionMap = new Map<
    string,
    {
      question: (typeof incorrectAnswers)[0]["question"]
      timesIncorrect: number
      timesAttempted: number
      lastAttemptedAt: Date
    }
  >()

  for (const answer of incorrectAnswers) {
    const q = answer.question

    // Filter by focus tags if specified
    if (focusTagIds && focusTagIds.length > 0) {
      const hasMatchingTag = q.tags.some((t) =>
        focusTagIds.includes(t.tag.id)
      )
      if (!hasMatchingTag) continue
    }

    if (!questionMap.has(q.id)) {
      // Count total attempts for this question
      const totalAttempts = await prisma.quizAnswer.count({
        where: { questionId: q.id, attempt: { userId } },
      })

      questionMap.set(q.id, {
        question: q,
        timesIncorrect: 1,
        timesAttempted: totalAttempts,
        lastAttemptedAt: answer.answeredAt,
      })
    } else {
      const entry = questionMap.get(q.id)!
      entry.timesIncorrect++
    }
  }

  // Calculate priority based on mode
  let prioritized: ReviewQuestion[] = []

  for (const [, data] of questionMap) {
    let priority = 0
    const daysSinceLastAttempt =
      (Date.now() - data.lastAttemptedAt.getTime()) / (1000 * 60 * 60 * 24)

    switch (mode) {
      case "weakest":
        // Higher incorrect rate + time decay = higher priority
        const incorrectRate =
          data.timesAttempted > 0
            ? data.timesIncorrect / data.timesAttempted
            : 1
        priority = incorrectRate * (1 + daysSinceLastAttempt / 7)
        break

      case "recent_mistakes":
        // More recent = higher priority
        priority = 1 / (daysSinceLastAttempt + 1)
        break

      case "spaced_repetition":
        // SM-2 inspired interval calculation
        priority = calculateSpacedRepetitionPriority(data, daysSinceLastAttempt)
        break
    }

    prioritized.push({
      id: data.question.id,
      text: data.question.text,
      explanation: data.question.explanation,
      options: data.question.options,
      tags: data.question.tags.map((t) => ({
        id: t.tag.id,
        name: t.tag.name,
        category: t.tag.category,
      })),
      timesIncorrect: data.timesIncorrect,
      lastAttemptedAt: data.lastAttemptedAt,
      priority,
    })
  }

  // Sort by priority (highest first) and take top N
  prioritized.sort((a, b) => b.priority - a.priority)
  return prioritized.slice(0, maxQuestions)
}

function calculateSpacedRepetitionPriority(
  data: { timesIncorrect: number; timesAttempted: number },
  daysSinceLastAttempt: number
): number {
  const incorrectRate =
    data.timesAttempted > 0 ? data.timesIncorrect / data.timesAttempted : 1

  // Base interval: 1 day for mostly wrong, longer for mostly right
  const baseInterval = Math.max(1, Math.pow(2.5, (1 - incorrectRate) * 3))

  // How overdue is this question?
  const overdueRatio = daysSinceLastAttempt / baseInterval

  return Math.max(0, overdueRatio)
}

export async function getReviewableTagsForUser(userId: string) {
  const tags = await prisma.questionTag.findMany({
    where: {
      questions: {
        some: {
          question: {
            answers: {
              some: {
                isCorrect: false,
                attempt: { userId },
              },
            },
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      category: true,
    },
  })

  return tags
}

import { prisma } from "@/lib/prisma"

export async function getQuizForLesson(quizId: string) {
  return prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: {
            orderBy: { order: "asc" },
            select: { id: true, text: true, order: true },
          },
          tags: { include: { tag: true } },
        },
      },
    },
  })
}

export async function submitQuiz(
  userId: string,
  quizId: string,
  answers: { questionId: string; selectedOptionId: string | null }[],
  isReviewAttempt = false
) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  })

  if (!quiz) throw new Error("Quiz not found")

  let correctCount = 0
  const answerRecords = answers.map((answer) => {
    const question = quiz.questions.find((q) => q.id === answer.questionId)
    if (!question) throw new Error(`Question ${answer.questionId} not found`)

    const correctOption = question.options.find((o) => o.isCorrect)
    const isCorrect = answer.selectedOptionId === correctOption?.id

    if (isCorrect) correctCount++

    return {
      questionId: answer.questionId,
      selectedOptionId: answer.selectedOptionId,
      isCorrect,
    }
  })

  const totalQuestions = quiz.questions.length
  const score =
    totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      quizId,
      score,
      totalQuestions,
      correctCount,
      completedAt: new Date(),
      isReviewAttempt,
      answers: {
        create: answerRecords,
      },
    },
    include: {
      answers: {
        include: {
          question: {
            include: {
              options: true,
              tags: { include: { tag: true } },
            },
          },
        },
      },
    },
  })

  // Auto-mark lesson complete if passed and not a review
  if (!isReviewAttempt && score >= quiz.passingScore) {
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId: quiz.lessonId } },
      update: { isCompleted: true, completedAt: new Date() },
      create: {
        userId,
        lessonId: quiz.lessonId,
        isCompleted: true,
        completedAt: new Date(),
      },
    })
  }

  return {
    attemptId: attempt.id,
    score,
    totalQuestions,
    correctCount,
    passed: score >= quiz.passingScore,
    answers: attempt.answers.map((a) => {
      const correctOption = a.question.options.find((o) => o.isCorrect)
      return {
        questionId: a.questionId,
        questionText: a.question.text,
        selectedOptionId: a.selectedOptionId,
        correctOptionId: correctOption?.id ?? "",
        isCorrect: a.isCorrect,
        explanation: a.question.explanation,
        tags: a.question.tags.map((t) => ({
          id: t.tag.id,
          name: t.tag.name,
        })),
      }
    }),
  }
}

export async function getQuizAttempts(userId: string, quizId: string) {
  return prisma.quizAttempt.findMany({
    where: { userId, quizId },
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      score: true,
      totalQuestions: true,
      correctCount: true,
      startedAt: true,
      isReviewAttempt: true,
    },
  })
}

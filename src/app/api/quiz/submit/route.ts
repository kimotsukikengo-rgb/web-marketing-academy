import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { submitQuiz } from "@/services/quiz.service"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { quizId, answers, isReviewAttempt } = body

  if (!quizId || !Array.isArray(answers)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  try {
    const result = await submitQuiz(
      session.user.id,
      quizId,
      answers,
      isReviewAttempt ?? false
    )
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit quiz" },
      { status: 500 }
    )
  }
}

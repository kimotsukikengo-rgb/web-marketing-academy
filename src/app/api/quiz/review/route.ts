import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { generateReviewSet } from "@/services/review.service"
import type { ReviewSetOptions } from "@/types"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const mode =
    (searchParams.get("mode") as ReviewSetOptions["mode"]) ?? "weakest"
  const tagIds = searchParams.get("tagIds")?.split(",").filter(Boolean)
  const maxQuestions = parseInt(searchParams.get("maxQuestions") ?? "10", 10)

  const questions = await generateReviewSet(session.user.id, {
    mode,
    focusTagIds: tagIds,
    maxQuestions,
  })

  return NextResponse.json({ questions })
}

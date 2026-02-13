import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { markLessonComplete } from "@/services/progress.service"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { lessonId } = body

  if (!lessonId) {
    return NextResponse.json({ error: "lessonId is required" }, { status: 400 })
  }

  try {
    const progress = await markLessonComplete(session.user.id, lessonId)
    return NextResponse.json(progress)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    )
  }
}

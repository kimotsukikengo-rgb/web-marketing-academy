import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getWeaknessAnalysis } from "@/services/analytics.service"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const analysis = await getWeaknessAnalysis(session.user.id)
  return NextResponse.json(analysis)
}

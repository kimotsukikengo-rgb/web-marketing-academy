import { prisma } from "@/lib/prisma"

export async function markLessonComplete(userId: string, lessonId: string) {
  return prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { isCompleted: true, completedAt: new Date() },
    create: {
      userId,
      lessonId,
      isCompleted: true,
      completedAt: new Date(),
    },
  })
}

export async function getLessonProgress(userId: string, lessonId: string) {
  return prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  })
}

export async function getCourseProgress(userId: string, courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        include: {
          lessons: {
            select: {
              id: true,
              progress: {
                where: { userId },
                select: { isCompleted: true },
              },
            },
          },
        },
      },
    },
  })

  if (!course) return null

  const allLessons = course.chapters.flatMap((ch) => ch.lessons)
  const completedLessons = allLessons.filter(
    (l) => l.progress[0]?.isCompleted
  )

  return {
    totalLessons: allLessons.length,
    completedLessons: completedLessons.length,
    percentage:
      allLessons.length > 0
        ? Math.round((completedLessons.length / allLessons.length) * 100)
        : 0,
  }
}

export async function getOverallStats(userId: string) {
  const [totalProgress, quizAttempts] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId, isCompleted: true },
    }),
    prisma.quizAttempt.findMany({
      where: { userId, isReviewAttempt: false },
      select: { score: true },
    }),
  ])

  const avgScore =
    quizAttempts.length > 0
      ? Math.round(
          quizAttempts.reduce((sum, a) => sum + a.score, 0) /
            quizAttempts.length
        )
      : 0

  return {
    completedLessons: totalProgress.length,
    quizzesTaken: quizAttempts.length,
    averageScore: avgScore,
  }
}

export async function getRecentActivity(userId: string, limit = 10) {
  return prisma.lessonProgress.findMany({
    where: { userId, isCompleted: true },
    orderBy: { completedAt: "desc" },
    take: limit,
    include: {
      lesson: {
        select: {
          title: true,
          type: true,
          chapter: {
            select: {
              title: true,
              course: { select: { title: true } },
            },
          },
        },
      },
    },
  })
}

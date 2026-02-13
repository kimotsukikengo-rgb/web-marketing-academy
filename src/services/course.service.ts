import { prisma } from "@/lib/prisma"

export async function getAllCourses() {
  return prisma.course.findMany({
    where: { isPublished: true },
    include: {
      chapters: {
        include: {
          lessons: { select: { id: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })
}

export async function getCourseWithDetails(courseId: string) {
  return prisma.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              type: true,
              order: true,
              youtubeUrl: true,
              videoDurationSeconds: true,
            },
          },
        },
      },
    },
  })
}

export async function getLessonWithContent(lessonId: string) {
  return prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      chapter: {
        include: {
          course: { select: { id: true, title: true } },
          lessons: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, type: true, order: true },
          },
        },
      },
      quiz: {
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: {
              options: { orderBy: { order: "asc" } },
              tags: {
                include: { tag: true },
              },
            },
          },
        },
      },
    },
  })
}

export async function getCoursesWithProgress(userId: string) {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
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
    orderBy: { createdAt: "asc" },
  })

  return courses.map((course) => {
    const allLessons = course.chapters.flatMap((ch) => ch.lessons)
    const completedLessons = allLessons.filter(
      (l) => l.progress[0]?.isCompleted
    )
    return {
      ...course,
      totalLessons: allLessons.length,
      completedLessons: completedLessons.length,
      completionPercentage:
        allLessons.length > 0
          ? Math.round((completedLessons.length / allLessons.length) * 100)
          : 0,
    }
  })
}

export async function getNextIncompleteLesson(
  userId: string,
  courseId: string
) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
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

  for (const chapter of course.chapters) {
    for (const lesson of chapter.lessons) {
      if (!lesson.progress[0]?.isCompleted) {
        return { courseId, chapterId: chapter.id, lessonId: lesson.id }
      }
    }
  }

  return null
}

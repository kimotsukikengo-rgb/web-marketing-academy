import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"

// コース構造はシードデータで変更されないため、1時間キャッシュ
export const getAllCourses = unstable_cache(
  async () => {
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
  },
  ["all-courses"],
  { revalidate: 3600 }
)

// コース詳細もキャッシュ
export const getCourseWithDetails = unstable_cache(
  async (courseId: string) => {
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
  },
  ["course-details"],
  { revalidate: 3600 }
)

// レッスン内容もキャッシュ（クイズ含む）
export const getLessonWithContent = unstable_cache(
  async (lessonId: string) => {
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
  },
  ["lesson-content"],
  { revalidate: 3600 }
)

// ユーザーの進捗付きコース一覧 + 次の未完了レッスンも一緒に計算
export async function getCoursesWithProgress(userId: string) {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
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

    // 次の未完了レッスンを既存データから計算（追加クエリ不要）
    let nextLesson: {
      courseId: string
      chapterId: string
      lessonId: string
    } | null = null
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        if (!lesson.progress[0]?.isCompleted) {
          nextLesson = {
            courseId: course.id,
            chapterId: chapter.id,
            lessonId: lesson.id,
          }
          break
        }
      }
      if (nextLesson) break
    }

    return {
      ...course,
      totalLessons: allLessons.length,
      completedLessons: completedLessons.length,
      completionPercentage:
        allLessons.length > 0
          ? Math.round((completedLessons.length / allLessons.length) * 100)
          : 0,
      nextLesson,
    }
  })
}

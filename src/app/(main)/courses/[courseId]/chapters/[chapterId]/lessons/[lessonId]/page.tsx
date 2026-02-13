import { auth } from "@/lib/auth"
import { getLessonWithContent } from "@/services/course.service"
import { getLessonProgress } from "@/services/progress.service"
import { VideoPlayer } from "@/components/lesson/VideoPlayer"
import { TextContent } from "@/components/lesson/TextContent"
import { QuizComponent } from "@/components/lesson/QuizComponent"
import { LessonCompletionButton } from "@/components/lesson/LessonCompletionButton"
import {
  ArrowLeft,
  Play,
  FileText,
  Brain,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; chapterId: string; lessonId: string }>
}) {
  const { courseId, chapterId, lessonId } = await params
  const session = await auth()
  const lesson = await getLessonWithContent(lessonId)

  if (!lesson) notFound()

  const progress = await getLessonProgress(session!.user.id, lessonId)
  const isCompleted = progress?.isCompleted ?? false

  // Find prev/next lesson
  const allLessons = lesson.chapter.lessons
  const currentIdx = allLessons.findIndex((l) => l.id === lessonId)
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null
  const nextLesson =
    currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null

  const typeIcon: Record<string, React.ReactNode> = {
    video: <Play className="w-5 h-5 text-blue-600" />,
    text: <FileText className="w-5 h-5 text-emerald-600" />,
    quiz: <Brain className="w-5 h-5 text-violet-600" />,
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href={`/courses/${courseId}`}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {lesson.chapter.course.title}に戻る
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Lesson header */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <span>Chapter {lesson.chapter.lessons[0]?.order !== undefined ? Math.ceil((currentIdx + 1) / 1) : 1}</span>
            <span>/</span>
            <span>
              Lesson {currentIdx + 1} / {allLessons.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {typeIcon[lesson.type]}
            <h1 className="text-xl font-bold text-slate-900">{lesson.title}</h1>
          </div>
        </div>

        {/* Lesson content */}
        <div className="p-6">
          {lesson.type === "video" && lesson.youtubeUrl && (
            <div className="space-y-6">
              <VideoPlayer youtubeUrl={lesson.youtubeUrl} title={lesson.title} />
              <LessonCompletionButton
                lessonId={lessonId}
                isCompleted={isCompleted}
              />
            </div>
          )}

          {lesson.type === "text" && lesson.textContent && (
            <div className="space-y-6">
              <TextContent content={lesson.textContent} />
              <div className="border-t border-slate-100 pt-6">
                <LessonCompletionButton
                  lessonId={lessonId}
                  isCompleted={isCompleted}
                />
              </div>
            </div>
          )}

          {lesson.type === "quiz" && lesson.quiz && (
            <QuizComponent quiz={lesson.quiz} />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        {prevLesson ? (
          <Link
            href={`/courses/${courseId}/chapters/${chapterId}/lessons/${prevLesson.id}`}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{prevLesson.title}</span>
            <span className="sm:hidden">前のレッスン</span>
          </Link>
        ) : (
          <div />
        )}
        {nextLesson ? (
          <Link
            href={`/courses/${courseId}/chapters/${chapterId}/lessons/${nextLesson.id}`}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
          >
            <span className="hidden sm:inline">{nextLesson.title}</span>
            <span className="sm:hidden">次のレッスン</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            href={`/courses/${courseId}`}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
          >
            コース概要に戻る
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  )
}

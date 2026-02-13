import { auth } from "@/lib/auth"
import { getCoursesWithProgress } from "@/services/course.service"
import { CourseCard } from "@/components/course/CourseCard"
import { BookOpen } from "lucide-react"

export default async function CoursesPage() {
  const session = await auth()
  const courses = await getCoursesWithProgress(session!.user.id)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-blue-600" />
          コース一覧
        </h1>
        <p className="text-slate-500 mt-1">
          あなたに合ったコースを選んで学習を始めましょう
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          コースがまだ登録されていません
        </div>
      )}
    </div>
  )
}

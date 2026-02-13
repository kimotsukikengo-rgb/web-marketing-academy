export interface CourseWithProgress {
  id: string
  title: string
  description: string
  thumbnail: string | null
  category: string
  difficulty: string
  totalLessons: number
  completedLessons: number
  completionPercentage: number
}

export interface LessonWithProgress {
  id: string
  title: string
  type: "video" | "text" | "quiz"
  order: number
  isCompleted: boolean
}

export interface QuizResult {
  attemptId: string
  score: number
  totalQuestions: number
  correctCount: number
  passed: boolean
  answers: {
    questionId: string
    questionText: string
    selectedOptionId: string | null
    correctOptionId: string
    isCorrect: boolean
    explanation: string | null
    tags: { id: string; name: string }[]
  }[]
}

export interface TagAccuracy {
  tagId: string
  tagName: string
  category: string
  totalQuestions: number
  correctCount: number
  accuracy: number
  weaknessScore: number
  trend: "improving" | "declining" | "stable"
  recentAccuracy: number
}

export interface ReviewSetOptions {
  focusTagIds?: string[]
  maxQuestions?: number
  mode: "weakest" | "recent_mistakes" | "spaced_repetition"
}

export interface ReviewQuestion {
  id: string
  text: string
  explanation: string | null
  options: { id: string; text: string; order: number }[]
  tags: { id: string; name: string; category: string }[]
  timesIncorrect: number
  lastAttemptedAt: Date
  priority: number
}

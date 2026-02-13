export default function LessonLoading() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="h-5 w-40 bg-slate-100 rounded mb-6" />

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-4 w-20 bg-slate-100 rounded" />
          <div className="h-4 w-4 bg-slate-100 rounded" />
          <div className="h-4 w-24 bg-slate-100 rounded" />
        </div>
        <div className="h-7 w-72 bg-slate-200 rounded mb-6" />

        <div className="aspect-video bg-slate-100 rounded-xl mb-4" />

        <div className="h-10 w-48 bg-slate-200 rounded-lg" />
      </div>
    </div>
  )
}

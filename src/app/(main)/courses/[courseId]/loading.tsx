export default function CourseDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="h-5 w-32 bg-slate-100 rounded mb-6" />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-8">
        <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200" />
        <div className="p-6">
          <div className="flex gap-2 mb-3">
            <div className="h-5 w-20 bg-slate-100 rounded-full" />
            <div className="h-5 w-12 bg-slate-100 rounded-full" />
          </div>
          <div className="h-8 w-64 bg-slate-200 rounded mb-3" />
          <div className="h-4 w-full bg-slate-100 rounded mb-1" />
          <div className="h-4 w-3/4 bg-slate-100 rounded mb-4" />
          <div className="h-3 w-40 bg-slate-100 rounded mb-2" />
          <div className="h-2 w-full bg-slate-100 rounded" />
        </div>
      </div>

      <div className="h-7 w-28 bg-slate-200 rounded mb-4" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border border-slate-200 rounded-xl p-4 mb-3">
          <div className="h-6 w-64 bg-slate-200 rounded mb-2" />
          <div className="h-4 w-24 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  )
}

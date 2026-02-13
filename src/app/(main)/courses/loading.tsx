export default function CoursesLoading() {
  return (
    <div className="max-w-6xl mx-auto animate-pulse">
      <div className="mb-8">
        <div className="h-8 w-40 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-64 bg-slate-100 rounded" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200" />
            <div className="p-5">
              <div className="flex gap-2 mb-3">
                <div className="h-5 w-12 bg-slate-100 rounded-full" />
                <div className="h-5 w-24 bg-slate-100 rounded-full" />
              </div>
              <div className="h-6 w-48 bg-slate-200 rounded mb-2" />
              <div className="h-4 w-full bg-slate-100 rounded mb-1" />
              <div className="h-4 w-3/4 bg-slate-100 rounded mb-4" />
              <div className="h-4 w-24 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsLoading() {
  return (
    <div className="max-w-6xl mx-auto animate-pulse">
      <div className="mb-8">
        <div className="h-8 w-48 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-72 bg-slate-100 rounded" />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="h-4 w-32 bg-slate-100 rounded mb-2" />
            <div className="h-6 w-24 bg-slate-200 rounded mb-1" />
            <div className="h-4 w-20 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="h-6 w-40 bg-slate-200 rounded mb-4" />
          <div className="h-64 bg-slate-50 rounded-xl" />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="h-6 w-40 bg-slate-200 rounded mb-4" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="mb-3">
              <div className="h-4 w-24 bg-slate-100 rounded mb-1" />
              <div className="h-6 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

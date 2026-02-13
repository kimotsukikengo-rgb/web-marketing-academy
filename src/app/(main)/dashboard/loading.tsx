export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto animate-pulse">
      <div className="mb-8">
        <div className="h-8 w-64 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-48 bg-slate-100 rounded" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="w-10 h-10 bg-slate-100 rounded-lg mb-3" />
            <div className="h-8 w-16 bg-slate-200 rounded mb-1" />
            <div className="h-4 w-24 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="h-6 w-32 bg-slate-200 rounded mb-4" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-slate-100 rounded-xl p-4 mb-3">
              <div className="h-5 w-48 bg-slate-200 rounded mb-2" />
              <div className="h-3 w-32 bg-slate-100 rounded mb-2" />
              <div className="h-2 w-full bg-slate-100 rounded" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="h-6 w-40 bg-slate-200 rounded mb-4" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <div className="w-8 h-8 bg-slate-100 rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-full bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

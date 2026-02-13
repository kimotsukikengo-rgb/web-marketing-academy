export default function ReviewLoading() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="mb-8">
        <div className="h-8 w-48 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-72 bg-slate-100 rounded" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <div className="h-6 w-40 bg-slate-200 rounded mb-4" />
        <div className="h-4 w-64 bg-slate-100 rounded mb-6" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-slate-200 rounded-xl p-4 mb-3">
            <div className="h-5 w-48 bg-slate-200 rounded mb-2" />
            <div className="h-4 w-full bg-slate-100 rounded" />
          </div>
        ))}
        <div className="h-12 w-40 bg-slate-200 rounded-lg mt-6" />
      </div>
    </div>
  )
}

export default function ProfileLoading() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-slate-200 rounded-full" />
          <div>
            <div className="h-6 w-40 bg-slate-200 rounded mb-2" />
            <div className="h-4 w-48 bg-slate-100 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-4">
              <div className="h-4 w-20 bg-slate-100 rounded mb-2" />
              <div className="h-6 w-12 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

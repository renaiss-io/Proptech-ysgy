export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-20" />
            <div className="h-6 bg-gray-200 rounded w-72" />
            <div className="h-3 bg-gray-100 rounded w-48" />
          </div>
          <div className="text-right space-y-2">
            <div className="h-5 bg-gray-200 rounded w-32" />
            <div className="h-3 bg-gray-100 rounded w-20" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-48" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-6 bg-gray-100 rounded-full w-24" />)}
        </div>
      </div>

      {/* AI summary skeleton */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-5 space-y-2">
        <div className="h-4 bg-blue-200 rounded w-40" />
        <div className="h-3 bg-blue-100 rounded w-full" />
        <div className="h-3 bg-blue-100 rounded w-5/6" />
        <div className="h-3 bg-blue-100 rounded w-4/6" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 flex gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-48" />
              <div className="h-3 bg-gray-100 rounded w-72" />
              <div className="h-3 bg-gray-100 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

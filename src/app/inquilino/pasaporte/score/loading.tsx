export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse max-w-xl">
      <div className="h-7 bg-gray-200 rounded-lg w-56" />
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-gray-200 rounded w-32" />
            <div className="h-3 bg-gray-100 rounded w-48" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3 bg-gray-100 rounded w-32" />
              <div className="h-3 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-5/6" />
        <div className="h-4 bg-gray-100 rounded w-4/6" />
      </div>
    </div>
  );
}

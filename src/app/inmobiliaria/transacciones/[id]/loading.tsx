export default function Loading() {
  return (
    <div className="max-w-2xl space-y-5">
      <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="h-1.5 bg-gray-100" />
        <div className="p-5 space-y-4">
          <div className="h-5 w-56 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
          <div className="flex justify-between mt-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1.5" style={{ width: "25%" }}>
                <div className="w-7 h-7 rounded-full bg-gray-100 animate-pulse" />
                <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
          <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
          <div className="h-3 w-3/4 bg-gray-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

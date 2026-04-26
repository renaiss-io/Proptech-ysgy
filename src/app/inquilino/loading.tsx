export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-7 bg-gray-200 rounded-lg w-48" />
      <div className="h-4 bg-gray-100 rounded w-72" />
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  );
}

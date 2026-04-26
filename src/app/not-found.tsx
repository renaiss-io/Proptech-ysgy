import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl font-bold text-gray-200 mb-4">404</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Página no encontrada</h1>
        <p className="text-gray-500 text-sm mb-6">El recurso que buscás no existe o fue eliminado.</p>
        <Link href="/" className="text-blue-600 text-sm hover:underline">← Volver al inicio</Link>
      </div>
    </div>
  );
}

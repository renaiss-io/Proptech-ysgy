import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { computeScore } from "./actions";
import { verazRange } from "@/lib/veraz/mock";

const VERAZ_COLORS: Record<string, string> = {
  Excelente: "bg-green-100 text-green-800",
  Bueno: "bg-blue-100 text-blue-800",
  Regular: "bg-yellow-100 text-yellow-800",
  Riesgoso: "bg-red-100 text-red-800",
};

export default async function ScorePage() {
  const user = await verifySession();

  const profile = await prisma.inquilinoProfile.findUnique({
    where: { userId: user.id },
    include: { verazScore: true, confianzaScore: true },
  });

  if (!profile) redirect("/inquilino/pasaporte/perfil");

  const veraz = profile.verazScore;
  const confianza = profile.confianzaScore;
  const dimensions = confianza?.dimensions as Record<string, string> | null;

  return (
    <div className="max-w-xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Mi Pasaporte</h1>
        <p className="text-gray-500 text-sm mt-1">Paso 3 de 3 — Tus scores</p>
      </div>

      {/* Veraz */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-medium text-gray-900 mb-3">Score Veraz</h2>
        {veraz ? (
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-gray-900">{veraz.score}</div>
            <div>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${VERAZ_COLORS[veraz.range] ?? "bg-gray-100 text-gray-600"}`}>
                {veraz.range}
              </span>
              <p className="text-xs text-gray-400 mt-1">Rango: 500–999</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Subí tus documentos para obtener tu score Veraz.</p>
        )}
      </div>

      {/* Confianza */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-medium text-gray-900 mb-3">Score Confianza</h2>
        {confianza ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-gray-900">{confianza.score}</div>
              <div>
                <div className="w-32 bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${confianza.score}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">Rango: 0–100</p>
              </div>
            </div>
            {dimensions && (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(dimensions).map(([key, val]) => (
                  <div key={key} className="bg-gray-50 rounded-lg px-3 py-2">
                    <div className="text-xs text-gray-400 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</div>
                    <div className="text-sm font-medium text-gray-700">{val}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-800">{confianza.improvementText}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Tu score Confianza analiza tus documentos con IA.</p>
            <form action={computeScore}>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Calcular Score Confianza
              </button>
            </form>
          </div>
        )}
      </div>

      {(veraz || confianza) && (
        <a href="/inquilino/propiedades" className="block w-full text-center bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors">
          Ver propiedades compatibles →
        </a>
      )}
    </div>
  );
}

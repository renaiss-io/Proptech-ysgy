import { verifyRole } from "@/lib/dal";
import Link from "next/link";
import { signOut } from "@/auth";

export default async function InquilinoLayout({ children }: { children: React.ReactNode }) {
  const user = await verifyRole("INQUILINO");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-gray-900">PropTech</span>
            <Link href="/inquilino" className="text-sm text-gray-600 hover:text-gray-900">Inicio</Link>
            <Link href="/inquilino/pasaporte" className="text-sm text-gray-600 hover:text-gray-900">Mi Pasaporte</Link>
            <Link href="/inquilino/propiedades" className="text-sm text-gray-600 hover:text-gray-900">Propiedades</Link>
            <Link href="/inquilino/postulaciones" className="text-sm text-gray-600 hover:text-gray-900">Mis Postulaciones</Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{user.email}</span>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
              <button className="text-sm text-gray-500 hover:text-gray-900">Salir</button>
            </form>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

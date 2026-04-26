import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export default async function PasaportePage() {
  const user = await verifySession();
  const profile = await prisma.inquilinoProfile.findUnique({
    where: { userId: user.id },
    include: { verazScore: true },
  });

  if (!profile?.dni) redirect("/inquilino/pasaporte/perfil");
  if (!profile.dniImagePath || !profile.incomeDocPath) redirect("/inquilino/pasaporte/documentos");
  redirect("/inquilino/pasaporte/score");
}

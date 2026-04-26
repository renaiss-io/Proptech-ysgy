"use server";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { computeCompatibility } from "@/lib/ai/compatibility";
import { redirect } from "next/navigation";

export async function postulate(propertyId: string) {
  const user = await verifySession();

  const profile = await prisma.inquilinoProfile.findUnique({
    where: { userId: user.id },
    include: { verazScore: true, confianzaScore: true },
  });

  if (!profile) redirect("/inquilino/pasaporte/perfil");

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) return;

  let compatibilityPct: number | null = null;
  let compatibilityExplanation: string | null = null;

  try {
    const result = await computeCompatibility(
      {
        monthlyIncome: Number(profile.monthlyIncome),
        guaranteeType: profile.guaranteeType,
        profileType: profile.profileType,
        hasPets: profile.hasPets,
        isSmoker: profile.isSmoker,
        familySize: profile.familySize,
        verazScore: profile.verazScore?.score ?? null,
        confianzaScore: profile.confianzaScore?.score ?? null,
      },
      {
        title: property.title,
        price: Number(property.price),
        neighborhood: property.neighborhood,
        propertyType: property.propertyType,
        bedrooms: property.bedrooms,
        area: Number(property.area),
      }
    );
    compatibilityPct = result.compatibility_pct;
    compatibilityExplanation = result.explanation;
  } catch {}

  await prisma.postulacion.upsert({
    where: { inquilinoId_propertyId: { inquilinoId: profile.id, propertyId } },
    create: {
      inquilinoId: profile.id,
      propertyId,
      status: "PENDIENTE",
      compatibilityPct,
      compatibilityExplanation,
    },
    update: {},
  });

  redirect("/inquilino/postulaciones");
}

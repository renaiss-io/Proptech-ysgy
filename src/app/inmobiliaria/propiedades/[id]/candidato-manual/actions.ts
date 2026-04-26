"use server";

import { verifyRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { GuaranteeType, ProfileType } from "@/generated/prisma";
import { computeCompatibility } from "@/lib/ai/compatibility";

export async function addManualCandidate(propertyId: string, formData: FormData) {
  const user = await verifyRole("INMOBILIARIA");

  const profile = await prisma.inmobiliariaProfile.findUnique({ where: { userId: user.id } });
  if (!profile) redirect("/inmobiliaria/onboarding");

  const property = await prisma.property.findUnique({ where: { id: propertyId, inmobiliariaId: profile.id } });
  if (!property) redirect("/inmobiliaria/propiedades");

  const monthlyIncome = parseFloat(formData.get("monthlyIncome") as string);
  const guaranteeType = formData.get("guaranteeType") as GuaranteeType;
  const profileType = (formData.get("profileType") as ProfileType) || null;

  let compatibilityPct: number | null = null;
  let compatibilityExplanation: string | null = null;

  try {
    const result = await computeCompatibility(
      {
        monthlyIncome,
        guaranteeType,
        profileType,
        hasPets: formData.get("hasPets") === "on",
        isSmoker: formData.get("isSmoker") === "on",
        familySize: formData.get("familySize") ? parseInt(formData.get("familySize") as string) : null,
        verazScore: null,
        confianzaScore: null,
      },
      {
        title: property.title,
        price: Number(property.price),
        neighborhood: property.neighborhood,
        propertyType: property.propertyType,
        bedrooms: property.bedrooms,
        area: Number(property.area),
        petsAllowed: property.petsAllowed,
        smokersAllowed: property.smokersAllowed,
        childrenAllowed: property.childrenAllowed,
        minVerazScore: property.minVerazScore,
        acceptedGuarantees: property.acceptedGuarantees,
        minIncomeMultiplier: property.minIncomeMultiplier ? Number(property.minIncomeMultiplier) : null,
      }
    );
    compatibilityPct = result.compatibility_pct;
    compatibilityExplanation = result.explanation;
  } catch {}

  await prisma.manualCandidate.create({
    data: {
      propertyId,
      inmobiliariaId: profile.id,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phone: (formData.get("phone") as string) || null,
      email: (formData.get("email") as string) || null,
      monthlyIncome,
      guaranteeType,
      profileType,
      hasPets: formData.get("hasPets") === "on",
      isSmoker: formData.get("isSmoker") === "on",
      familySize: formData.get("familySize") ? parseInt(formData.get("familySize") as string) : null,
      notes: (formData.get("notes") as string) || null,
      compatibilityPct,
      compatibilityExplanation,
    },
  });

  redirect(`/inmobiliaria/propiedades/${propertyId}`);
}

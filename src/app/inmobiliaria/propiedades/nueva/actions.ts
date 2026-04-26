"use server";

import { verifyRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { GuaranteeType, PropertyType } from "@/generated/prisma";

export async function createProperty(formData: FormData) {
  const user = await verifyRole("INMOBILIARIA");

  const profile = await prisma.inmobiliariaProfile.findUnique({ where: { userId: user.id } });
  if (!profile) redirect("/inmobiliaria/onboarding");

  const guarantees = formData.getAll("acceptedGuarantees") as GuaranteeType[];

  const imageInputs = [
    formData.get("image1") as string,
    formData.get("image2") as string,
    formData.get("image3") as string,
  ].filter(Boolean);

  const minIncome = formData.get("minIncomeMultiplier") as string;
  const minVeraz = formData.get("minVerazScore") as string;

  const property = await prisma.property.create({
    data: {
      inmobiliariaId: profile.id,
      title: formData.get("title") as string,
      address: formData.get("address") as string,
      neighborhood: (formData.get("neighborhood") as string) || null,
      city: (formData.get("city") as string) || "Buenos Aires",
      price: parseFloat(formData.get("price") as string),
      currency: (formData.get("currency") as string) || "ARS",
      bedrooms: parseInt(formData.get("bedrooms") as string),
      bathrooms: parseInt((formData.get("bathrooms") as string) || "1"),
      area: parseFloat(formData.get("area") as string),
      propertyType: formData.get("propertyType") as PropertyType,
      description: (formData.get("description") as string) || null,
      externalLink: (formData.get("externalLink") as string) || null,
      images: imageInputs,
      acceptedGuarantees: guarantees,
      petsAllowed: formData.get("petsAllowed") === "on",
      smokersAllowed: formData.get("smokersAllowed") === "on",
      childrenAllowed: formData.get("childrenAllowed") !== "off",
      minVerazScore: minVeraz ? parseInt(minVeraz) : null,
      minIncomeMultiplier: minIncome ? parseFloat(minIncome) : null,
    },
  });

  redirect(`/inmobiliaria/propiedades/${property.id}`);
}

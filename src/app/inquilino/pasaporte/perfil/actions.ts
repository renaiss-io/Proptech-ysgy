"use server";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function saveProfile(formData: FormData) {
  const user = await verifySession();

  const data = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    dni: formData.get("dni") as string,
    phone: (formData.get("phone") as string) || null,
    monthlyIncome: parseFloat(formData.get("monthlyIncome") as string),
    profileType: (formData.get("profileType") as string) || null,
    guaranteeType: formData.get("guaranteeType") as string,
    hasPets: formData.get("hasPets") === "on",
    isSmoker: formData.get("isSmoker") === "on",
    familySize: formData.get("familySize") ? parseInt(formData.get("familySize") as string) : null,
  };

  await prisma.inquilinoProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...data } as never,
    update: data as never,
  });

  redirect("/inquilino/pasaporte/documentos");
}

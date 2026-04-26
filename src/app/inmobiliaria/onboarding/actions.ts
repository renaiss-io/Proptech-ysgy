"use server";

import { verifyRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function saveOnboarding(formData: FormData) {
  const user = await verifyRole("INMOBILIARIA");

  const companyName = formData.get("companyName") as string;
  const cuit = formData.get("cuit") as string;
  const phone = formData.get("phone") as string;

  await prisma.inmobiliariaProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, companyName, cuit, phone },
    update: { companyName, cuit, phone },
  });

  redirect("/inmobiliaria/propiedades");
}

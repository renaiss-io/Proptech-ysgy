"use server";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { uploadDocument } from "@/lib/storage/supabase";
import { checkVeraz } from "@/lib/veraz/mock";
import { redirect } from "next/navigation";

export async function uploadDocuments(formData: FormData) {
  const user = await verifySession();

  const profile = await prisma.inquilinoProfile.findUnique({ where: { userId: user.id } });
  if (!profile) redirect("/inquilino/pasaporte/perfil");

  const dniFile = formData.get("dni") as File | null;
  const incomeFile = formData.get("income") as File | null;

  const updates: Record<string, string> = {};

  if (dniFile && dniFile.size > 0) {
    const path = await uploadDocument(dniFile, "dni", user.id);
    updates.dniImagePath = path;
  }

  if (incomeFile && incomeFile.size > 0) {
    const path = await uploadDocument(incomeFile, "income", user.id);
    updates.incomeDocPath = path;
  }

  if (Object.keys(updates).length > 0) {
    await prisma.inquilinoProfile.update({ where: { userId: user.id }, data: updates });
  }

  await checkVeraz(profile.id, profile.dni);

  redirect("/inquilino/pasaporte/score");
}

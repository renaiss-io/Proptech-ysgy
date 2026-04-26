"use server";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { computeConfidenceScore } from "@/lib/ai/confidenceScore";
import { redirect } from "next/navigation";

export async function computeScore() {
  const user = await verifySession();

  const profile = await prisma.inquilinoProfile.findUnique({
    where: { userId: user.id },
    include: { confianzaScore: true },
  });

  if (!profile) redirect("/inquilino/pasaporte/perfil");
  if (profile.confianzaScore) return;

  const result = await computeConfidenceScore({
    monthlyIncome: Number(profile.monthlyIncome),
    guaranteeType: profile.guaranteeType,
    profileType: profile.profileType,
    dniImagePath: profile.dniImagePath,
    incomeDocPath: profile.incomeDocPath,
  });

  await prisma.confianzaScore.create({
    data: {
      inquilinoId: profile.id,
      score: result.score,
      dimensions: result.dimensions,
      improvementText: result.improvement_text,
    },
  });

  redirect("/inquilino/pasaporte/score");
}

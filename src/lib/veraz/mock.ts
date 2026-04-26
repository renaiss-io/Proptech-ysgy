import { prisma } from "@/lib/prisma";

export function verazRange(score: number) {
  if (score >= 850) return "Excelente";
  if (score >= 700) return "Bueno";
  if (score >= 500) return "Regular";
  return "Riesgoso";
}

export async function checkVeraz(
  inquilinoId: string,
  dni: string
): Promise<{ score: number; range: string }> {
  const existing = await prisma.verazScore.findUnique({ where: { inquilinoId } });
  if (existing) return { score: existing.score, range: existing.range };

  // Match against seeded data by DNI
  const profile = await prisma.inquilinoProfile.findUnique({
    where: { id: inquilinoId },
    include: { verazScore: true },
  });

  // Fall back: users not in seed get a score derived from their DNI digits
  const score = profile?.verazScore?.score ?? Math.min(999, 400 + (parseInt(dni.slice(-3)) % 600));
  const range = verazRange(score);

  await prisma.verazScore.upsert({
    where: { inquilinoId },
    create: { inquilinoId, score, range },
    update: { score, range },
  });

  return { score, range };
}

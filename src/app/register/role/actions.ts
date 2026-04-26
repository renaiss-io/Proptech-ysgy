"use server";

import { auth, unstable_update } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function setRole(role: "INQUILINO" | "INMOBILIARIA") {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role },
  });

  await unstable_update({ user: { role } });

  redirect(role === "INQUILINO" ? "/inquilino" : "/inmobiliaria/onboarding");
}

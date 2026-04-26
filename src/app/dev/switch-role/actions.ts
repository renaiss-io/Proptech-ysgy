"use server";

import { prisma } from "@/lib/prisma";
import { signOut } from "@/auth";
import { Role } from "@/generated/prisma";

export async function switchRole(userId: string, role: Role) {
  if (process.env.NODE_ENV === "production") return;
  await prisma.user.update({ where: { id: userId }, data: { role } });
  await signOut({ redirectTo: "/login" });
}

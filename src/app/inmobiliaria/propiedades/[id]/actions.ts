"use server";

import { verifyRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { PostulacionStatus, PropertyStatus } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

export async function updatePostulacionStatus(postulacionId: string, status: PostulacionStatus) {
  await verifyRole("INMOBILIARIA");
  await prisma.postulacion.update({ where: { id: postulacionId }, data: { status } });
  revalidatePath(`/inmobiliaria/propiedades`);
}

export async function updatePropertyStatus(propertyId: string, status: PropertyStatus) {
  await verifyRole("INMOBILIARIA");
  await prisma.property.update({ where: { id: propertyId }, data: { status } });
  revalidatePath(`/inmobiliaria/propiedades/${propertyId}`);
}

-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('RELACION_DEPENDENCIA', 'MONOTRIBUTISTA', 'AUTONOMO', 'JUBILADO');

-- AlterTable InquilinoProfile: add lifestyle fields
ALTER TABLE "InquilinoProfile" ADD COLUMN "profileType" "ProfileType";
ALTER TABLE "InquilinoProfile" ADD COLUMN "hasPets" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "InquilinoProfile" ADD COLUMN "isSmoker" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "InquilinoProfile" ADD COLUMN "familySize" INTEGER;

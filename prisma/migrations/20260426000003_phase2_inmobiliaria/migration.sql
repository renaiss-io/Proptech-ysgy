-- AlterEnum: remove POSTULACION/EVALUACION from TransactionStage
BEGIN;
CREATE TYPE "TransactionStage_new" AS ENUM ('DOCUMENTACION', 'CONTRATO', 'ACTIVO', 'FINALIZADO');
ALTER TABLE "Transaction" ALTER COLUMN "stage" TYPE "TransactionStage_new" USING ("stage"::text::"TransactionStage_new");
ALTER TABLE "TransactionDocument" ALTER COLUMN "stage" TYPE "TransactionStage_new" USING ("stage"::text::"TransactionStage_new");
ALTER TABLE "TransactionNote" ALTER COLUMN "stage" TYPE "TransactionStage_new" USING ("fromStage"::text::"TransactionStage_new");
ALTER TABLE "TransactionHistory" ALTER COLUMN "fromStage" TYPE "TransactionStage_new" USING ("fromStage"::text::"TransactionStage_new");
ALTER TABLE "TransactionHistory" ALTER COLUMN "toStage" TYPE "TransactionStage_new" USING ("toStage"::text::"TransactionStage_new");
ALTER TYPE "TransactionStage" RENAME TO "TransactionStage_old";
ALTER TYPE "TransactionStage_new" RENAME TO "TransactionStage";
DROP TYPE "TransactionStage_old";
COMMIT;

-- AlterTable Postulacion: drop deprecated transactionStage column
ALTER TABLE "Postulacion" DROP COLUMN IF EXISTS "transactionStage";

-- AlterTable Property: add compatibility spec columns
ALTER TABLE "Property"
  ADD COLUMN "acceptedGuarantees" "GuaranteeType"[] NOT NULL DEFAULT '{}',
  ADD COLUMN "childrenAllowed" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "externalLink" TEXT,
  ADD COLUMN "minIncomeMultiplier" DECIMAL(4,1),
  ADD COLUMN "minVerazScore" INTEGER,
  ADD COLUMN "petsAllowed" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "smokersAllowed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable Transaction
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "postulacionId" TEXT NOT NULL,
    "stage" "TransactionStage" NOT NULL DEFAULT 'DOCUMENTACION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable TransactionDocument
CREATE TABLE "TransactionDocument" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "stage" "TransactionStage" NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransactionDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable TransactionNote
CREATE TABLE "TransactionNote" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "stage" "TransactionStage",
    "body" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransactionNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable TransactionHistory
CREATE TABLE "TransactionHistory" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "fromStage" "TransactionStage",
    "toStage" "TransactionStage" NOT NULL,
    "changedById" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransactionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable ManualCandidate
CREATE TABLE "ManualCandidate" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "inmobiliariaId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "monthlyIncome" DECIMAL(12,2) NOT NULL,
    "guaranteeType" "GuaranteeType" NOT NULL,
    "profileType" "ProfileType",
    "hasPets" BOOLEAN NOT NULL DEFAULT false,
    "isSmoker" BOOLEAN NOT NULL DEFAULT false,
    "familySize" INTEGER,
    "notes" TEXT,
    "compatibilityPct" INTEGER,
    "compatibilityExplanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ManualCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_postulacionId_key" ON "Transaction"("postulacionId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_postulacionId_fkey"
  FOREIGN KEY ("postulacionId") REFERENCES "Postulacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TransactionDocument" ADD CONSTRAINT "TransactionDocument_transactionId_fkey"
  FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TransactionDocument" ADD CONSTRAINT "TransactionDocument_uploadedById_fkey"
  FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TransactionNote" ADD CONSTRAINT "TransactionNote_transactionId_fkey"
  FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TransactionNote" ADD CONSTRAINT "TransactionNote_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TransactionHistory" ADD CONSTRAINT "TransactionHistory_transactionId_fkey"
  FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TransactionHistory" ADD CONSTRAINT "TransactionHistory_changedById_fkey"
  FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ManualCandidate" ADD CONSTRAINT "ManualCandidate_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ManualCandidate" ADD CONSTRAINT "ManualCandidate_inmobiliariaId_fkey"
  FOREIGN KEY ("inmobiliariaId") REFERENCES "InmobiliariaProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

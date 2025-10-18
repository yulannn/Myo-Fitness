-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProgramTemplate" ADD VALUE 'UPPER_LOWER_PUSH_PULL';
ALTER TYPE "ProgramTemplate" ADD VALUE 'PUSH_PULL_LEGS_CARDIO';

-- AlterTable
ALTER TABLE "Exercice" ADD COLUMN     "Materials" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bodyWeight" BOOLEAN NOT NULL DEFAULT false;

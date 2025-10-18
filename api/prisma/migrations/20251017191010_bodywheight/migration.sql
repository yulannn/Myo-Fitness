/*
  Warnings:

  - You are about to drop the column `gym` on the `FitnessProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Exercice" ALTER COLUMN "isDefault" SET DEFAULT false;

-- AlterTable
ALTER TABLE "FitnessProfile" DROP COLUMN "gym",
ADD COLUMN     "bodyWeight" BOOLEAN NOT NULL DEFAULT true;

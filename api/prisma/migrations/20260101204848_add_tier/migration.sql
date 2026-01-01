-- CreateEnum
CREATE TYPE "ExerciseTier" AS ENUM ('STAPLE', 'STANDARD', 'NICHE');

-- AlterTable
ALTER TABLE "Exercice" ADD COLUMN     "tier" "ExerciseTier" NOT NULL DEFAULT 'STANDARD';

/*
  Warnings:

  - The `musclePriorities` column on the `FitnessProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "FitnessProfile" DROP COLUMN "musclePriorities",
ADD COLUMN     "musclePriorities" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

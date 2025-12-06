/*
  Warnings:

  - You are about to drop the column `gymId` on the `FitnessProfile` table. All the data in the column will be lost.
  - You are about to drop the column `gymAddress` on the `SharedSession` table. All the data in the column will be lost.
  - You are about to drop the column `gymId` on the `SharedSession` table. All the data in the column will be lost.
  - You are about to drop the column `gymLat` on the `SharedSession` table. All the data in the column will be lost.
  - You are about to drop the column `gymLng` on the `SharedSession` table. All the data in the column will be lost.
  - You are about to drop the column `gymName` on the `SharedSession` table. All the data in the column will be lost.
  - You are about to drop the column `gymId` on the `TrainingSession` table. All the data in the column will be lost.
  - You are about to drop the `Gym` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."FitnessProfile" DROP CONSTRAINT "FitnessProfile_gymId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SharedSession" DROP CONSTRAINT "SharedSession_gymId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TrainingSession" DROP CONSTRAINT "TrainingSession_gymId_fkey";

-- AlterTable
ALTER TABLE "FitnessProfile" DROP COLUMN "gymId";

-- AlterTable
ALTER TABLE "SharedSession" DROP COLUMN "gymAddress",
DROP COLUMN "gymId",
DROP COLUMN "gymLat",
DROP COLUMN "gymLng",
DROP COLUMN "gymName";

-- AlterTable
ALTER TABLE "TrainingSession" DROP COLUMN "gymId";

-- DropTable
DROP TABLE "public"."Gym";

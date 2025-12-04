/*
  Warnings:

  - You are about to drop the column `levelingId` on the `TrainingSession` table. All the data in the column will be lost.
  - You are about to drop the `Leveling` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Leveling" DROP CONSTRAINT "Leveling_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TrainingSession" DROP CONSTRAINT "TrainingSession_levelingId_fkey";

-- AlterTable
ALTER TABLE "TrainingSession" DROP COLUMN "levelingId";

-- DropTable
DROP TABLE "public"."Leveling";

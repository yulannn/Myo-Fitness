/*
  Warnings:

  - You are about to drop the column `heat` on the `UserMuscleStats` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."UserMuscleStats_heat_idx";

-- AlterTable
ALTER TABLE "UserMuscleStats" DROP COLUMN "heat";

-- CreateIndex
CREATE INDEX "UserMuscleStats_lastTrainedAt_idx" ON "UserMuscleStats"("lastTrainedAt");

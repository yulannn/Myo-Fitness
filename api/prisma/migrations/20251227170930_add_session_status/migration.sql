-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "TrainingSession" ADD COLUMN     "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED';

-- CreateIndex
CREATE INDEX "TrainingSession_programId_status_idx" ON "TrainingSession"("programId", "status");

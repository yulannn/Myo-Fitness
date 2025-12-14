/*
  Warnings:

  - You are about to drop the column `notes` on the `TrainingSession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TrainingSession" DROP COLUMN "notes",
ADD COLUMN     "sessionName" TEXT;

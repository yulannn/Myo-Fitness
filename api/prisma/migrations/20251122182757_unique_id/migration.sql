/*
  Warnings:

  - The primary key for the `_GroupMembers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId]` on the table `FitnessProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_GroupMembers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "_GroupMembers" DROP CONSTRAINT "_GroupMembers_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "FitnessProfile_userId_key" ON "FitnessProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_GroupMembers_AB_unique" ON "_GroupMembers"("A", "B");

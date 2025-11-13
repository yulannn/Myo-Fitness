/*
  Warnings:

  - The values [UPPER_LOWER_UPPER_LOWER] on the enum `ProgramTemplate` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProgramTemplate_new" AS ENUM ('FULL_BODY', 'PUSH_PULL_LEGS', 'UPPER_LOWER', 'UPPER_LOWER_PUSH_PULL', 'PUSH_PULL_LEGS_UPPER_LOWER', 'PUSH_PULL_LEGS_PUSH_PULL_LEGS', 'PUSH_PULL_LEGS_CARDIO', 'CUSTOM');
ALTER TABLE "TrainingProgram" ALTER COLUMN "template" TYPE "ProgramTemplate_new" USING ("template"::text::"ProgramTemplate_new");
ALTER TYPE "ProgramTemplate" RENAME TO "ProgramTemplate_old";
ALTER TYPE "ProgramTemplate_new" RENAME TO "ProgramTemplate";
DROP TYPE "public"."ProgramTemplate_old";
COMMIT;

-- CreateTable
CREATE TABLE "FriendGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FriendGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GroupMembers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_GroupMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GroupMembers_B_index" ON "_GroupMembers"("B");

-- AddForeignKey
ALTER TABLE "_GroupMembers" ADD CONSTRAINT "_GroupMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "FriendGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupMembers" ADD CONSTRAINT "_GroupMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

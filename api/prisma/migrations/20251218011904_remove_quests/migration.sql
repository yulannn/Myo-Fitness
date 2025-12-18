/*
  Warnings:

  - You are about to drop the `Quest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserQuest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Quest" DROP CONSTRAINT "Quest_targetMuscleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserQuest" DROP CONSTRAINT "UserQuest_questId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserQuest" DROP CONSTRAINT "UserQuest_userId_fkey";

-- DropTable
DROP TABLE "public"."Quest";

-- DropTable
DROP TABLE "public"."UserQuest";

-- DropEnum
DROP TYPE "public"."QuestDifficulty";

-- DropEnum
DROP TYPE "public"."QuestStatus";

-- DropEnum
DROP TYPE "public"."QuestType";

-- CreateEnum
CREATE TYPE "MuscleCategory" AS ENUM ('CHEST', 'BACK', 'SHOULDERS', 'ARMS', 'LEGS', 'CORE', 'OTHER');

-- CreateEnum
CREATE TYPE "MuscleHeat" AS ENUM ('HOT', 'WARM', 'COLD', 'FROZEN');

-- CreateEnum
CREATE TYPE "QuestType" AS ENUM ('DAILY', 'WEEKLY', 'LEGENDARY', 'SPECIAL');

-- CreateEnum
CREATE TYPE "QuestDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'EXTREME');

-- CreateEnum
CREATE TYPE "QuestStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "MuscleGroup" ADD COLUMN     "category" "MuscleCategory" NOT NULL DEFAULT 'OTHER';

-- CreateTable
CREATE TABLE "UserMuscleStats" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "muscleGroupId" INTEGER NOT NULL,
    "totalVolume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 0,
    "lastTrainedAt" TIMESTAMP(3),
    "heat" "MuscleHeat" NOT NULL DEFAULT 'COLD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMuscleStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quest" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "QuestType" NOT NULL,
    "difficulty" "QuestDifficulty" NOT NULL,
    "targetMuscleId" INTEGER,
    "requirement" JSONB NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 50,
    "badgeReward" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuest" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "questId" INTEGER NOT NULL,
    "status" "QuestStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "target" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "UserQuest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MirrorMatch" (
    "id" TEXT NOT NULL,
    "user1Id" INTEGER NOT NULL,
    "user2Id" INTEGER NOT NULL,
    "muscleGroupId" INTEGER NOT NULL,
    "user1Volume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "user2Volume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "MatchStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "winnerId" INTEGER,

    CONSTRAINT "MirrorMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserMuscleStats_userId_idx" ON "UserMuscleStats"("userId");

-- CreateIndex
CREATE INDEX "UserMuscleStats_heat_idx" ON "UserMuscleStats"("heat");

-- CreateIndex
CREATE UNIQUE INDEX "UserMuscleStats_userId_muscleGroupId_key" ON "UserMuscleStats"("userId", "muscleGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "Quest_code_key" ON "Quest"("code");

-- CreateIndex
CREATE INDEX "Quest_type_idx" ON "Quest"("type");

-- CreateIndex
CREATE INDEX "Quest_isActive_idx" ON "Quest"("isActive");

-- CreateIndex
CREATE INDEX "UserQuest_userId_status_idx" ON "UserQuest"("userId", "status");

-- CreateIndex
CREATE INDEX "UserQuest_expiresAt_idx" ON "UserQuest"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserQuest_userId_questId_key" ON "UserQuest"("userId", "questId");

-- CreateIndex
CREATE INDEX "MirrorMatch_user1Id_idx" ON "MirrorMatch"("user1Id");

-- CreateIndex
CREATE INDEX "MirrorMatch_user2Id_idx" ON "MirrorMatch"("user2Id");

-- CreateIndex
CREATE INDEX "MirrorMatch_status_idx" ON "MirrorMatch"("status");

-- AddForeignKey
ALTER TABLE "UserMuscleStats" ADD CONSTRAINT "UserMuscleStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMuscleStats" ADD CONSTRAINT "UserMuscleStats_muscleGroupId_fkey" FOREIGN KEY ("muscleGroupId") REFERENCES "MuscleGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quest" ADD CONSTRAINT "Quest_targetMuscleId_fkey" FOREIGN KEY ("targetMuscleId") REFERENCES "MuscleGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuest" ADD CONSTRAINT "UserQuest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuest" ADD CONSTRAINT "UserQuest_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MirrorMatch" ADD CONSTRAINT "MirrorMatch_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MirrorMatch" ADD CONSTRAINT "MirrorMatch_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

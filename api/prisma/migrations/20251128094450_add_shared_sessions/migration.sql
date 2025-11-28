-- AlterTable
ALTER TABLE "_GroupMembers" ADD CONSTRAINT "_GroupMembers_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_GroupMembers_AB_unique";

-- CreateTable
CREATE TABLE "SharedSession" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT DEFAULT 'Gym',
    "maxParticipants" INTEGER,
    "organizerId" INTEGER NOT NULL,
    "groupId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,
    "trainingSessionId" INTEGER,

    CONSTRAINT "SharedSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedSessionParticipant" (
    "id" TEXT NOT NULL,
    "sharedSessionId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trainingSessionId" INTEGER,

    CONSTRAINT "SharedSessionParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SharedSession_organizerId_idx" ON "SharedSession"("organizerId");

-- CreateIndex
CREATE INDEX "SharedSession_groupId_idx" ON "SharedSession"("groupId");

-- CreateIndex
CREATE INDEX "SharedSession_startTime_idx" ON "SharedSession"("startTime");

-- CreateIndex
CREATE INDEX "SharedSessionParticipant_userId_idx" ON "SharedSessionParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SharedSessionParticipant_sharedSessionId_userId_key" ON "SharedSessionParticipant"("sharedSessionId", "userId");

-- AddForeignKey
ALTER TABLE "SharedSession" ADD CONSTRAINT "SharedSession_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedSession" ADD CONSTRAINT "SharedSession_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "FriendGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedSession" ADD CONSTRAINT "SharedSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedSession" ADD CONSTRAINT "SharedSession_trainingSessionId_fkey" FOREIGN KEY ("trainingSessionId") REFERENCES "TrainingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedSessionParticipant" ADD CONSTRAINT "SharedSessionParticipant_sharedSessionId_fkey" FOREIGN KEY ("sharedSessionId") REFERENCES "SharedSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedSessionParticipant" ADD CONSTRAINT "SharedSessionParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedSessionParticipant" ADD CONSTRAINT "SharedSessionParticipant_trainingSessionId_fkey" FOREIGN KEY ("trainingSessionId") REFERENCES "TrainingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

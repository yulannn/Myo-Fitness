-- CreateEnum
CREATE TYPE "CoachingStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "CoachingRelationship" (
    "id" SERIAL NOT NULL,
    "coachId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "status" "CoachingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachingRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoachingRelationship_coachId_idx" ON "CoachingRelationship"("coachId");

-- CreateIndex
CREATE INDEX "CoachingRelationship_clientId_idx" ON "CoachingRelationship"("clientId");

-- CreateIndex
CREATE INDEX "CoachingRelationship_status_idx" ON "CoachingRelationship"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CoachingRelationship_coachId_clientId_key" ON "CoachingRelationship"("coachId", "clientId");

-- AddForeignKey
ALTER TABLE "CoachingRelationship" ADD CONSTRAINT "CoachingRelationship_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingRelationship" ADD CONSTRAINT "CoachingRelationship_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "SessionSummary" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "totalSets" INTEGER NOT NULL,
    "totalReps" INTEGER NOT NULL,
    "totalVolume" DOUBLE PRECISION NOT NULL,
    "avgRPE" DOUBLE PRECISION,
    "duration" INTEGER,
    "muscleGroups" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SessionSummary_sessionId_key" ON "SessionSummary"("sessionId");

-- CreateIndex
CREATE INDEX "SessionSummary_sessionId_idx" ON "SessionSummary"("sessionId");

-- AddForeignKey
ALTER TABLE "SessionSummary" ADD CONSTRAINT "SessionSummary_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "LeaderboardStats" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "totalSessionsCompleted" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "totalVolume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalWorkouts" INTEGER NOT NULL DEFAULT 0,
    "averageSessionDuration" DOUBLE PRECISION,
    "personalRecordsCount" INTEGER NOT NULL DEFAULT 0,
    "lastWorkoutDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardStats_userId_key" ON "LeaderboardStats"("userId");

-- CreateIndex
CREATE INDEX "LeaderboardStats_userId_idx" ON "LeaderboardStats"("userId");

-- CreateIndex
CREATE INDEX "LeaderboardStats_totalSessionsCompleted_idx" ON "LeaderboardStats"("totalSessionsCompleted");

-- CreateIndex
CREATE INDEX "LeaderboardStats_currentStreak_idx" ON "LeaderboardStats"("currentStreak");

-- CreateIndex
CREATE INDEX "LeaderboardStats_totalVolume_idx" ON "LeaderboardStats"("totalVolume");

-- AddForeignKey
ALTER TABLE "LeaderboardStats" ADD CONSTRAINT "LeaderboardStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

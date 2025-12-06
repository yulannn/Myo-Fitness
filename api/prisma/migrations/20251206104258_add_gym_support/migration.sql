-- AlterTable
ALTER TABLE "FitnessProfile" ADD COLUMN     "gymId" INTEGER;

-- AlterTable
ALTER TABLE "TrainingSession" ADD COLUMN     "gymId" INTEGER;

-- CreateTable
CREATE TABLE "Gym" (
    "id" SERIAL NOT NULL,
    "osmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gym_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Gym_osmId_key" ON "Gym"("osmId");

-- CreateIndex
CREATE INDEX "Gym_osmId_idx" ON "Gym"("osmId");

-- CreateIndex
CREATE INDEX "Gym_lat_lng_idx" ON "Gym"("lat", "lng");

-- AddForeignKey
ALTER TABLE "FitnessProfile" ADD CONSTRAINT "FitnessProfile_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE SET NULL ON UPDATE CASCADE;

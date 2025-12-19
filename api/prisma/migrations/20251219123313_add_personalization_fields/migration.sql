-- CreateEnum
CREATE TYPE "TrainingEnvironment" AS ENUM ('HOME', 'GYM', 'HYBRID');

-- AlterTable
ALTER TABLE "FitnessProfile" ADD COLUMN     "injuries" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "musclePriorities" "MuscleCategory"[] DEFAULT ARRAY[]::"MuscleCategory"[],
ADD COLUMN     "targetWeight" DOUBLE PRECISION,
ADD COLUMN     "trainingEnvironment" "TrainingEnvironment" NOT NULL DEFAULT 'GYM';

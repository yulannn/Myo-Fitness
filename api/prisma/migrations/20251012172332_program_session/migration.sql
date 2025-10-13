-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED', 'DRAFT');

-- CreateTable
CREATE TABLE "TrainingProgram" (
    "id" SERIAL NOT NULL,
    "fitnessProfileId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ProgramStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" SERIAL NOT NULL,
    "programId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "notes" TEXT,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercice" (
    "id_exercice" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exercice_pkey" PRIMARY KEY ("id_exercice")
);

-- CreateTable
CREATE TABLE "ExerciceSession" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "exerciceId" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,

    CONSTRAINT "ExerciceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetPerformance" (
    "id_set" SERIAL NOT NULL,
    "id_exercice_session" INTEGER NOT NULL,
    "set_index" INTEGER NOT NULL,
    "reps_effectuees" INTEGER,
    "reps_prevues" INTEGER,
    "weight" DOUBLE PRECISION,
    "rpe" INTEGER,
    "success" BOOLEAN DEFAULT true,

    CONSTRAINT "SetPerformance_pkey" PRIMARY KEY ("id_set")
);

-- CreateTable
CREATE TABLE "ExerciceMuscleGroup" (
    "exerciceId" INTEGER NOT NULL,
    "groupeId" INTEGER NOT NULL,

    CONSTRAINT "ExerciceMuscleGroup_pkey" PRIMARY KEY ("exerciceId","groupeId")
);

-- CreateTable
CREATE TABLE "MuscleGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MuscleGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExerciceSession_sessionId_exerciceId_key" ON "ExerciceSession"("sessionId", "exerciceId");

-- CreateIndex
CREATE UNIQUE INDEX "MuscleGroup_name_key" ON "MuscleGroup"("name");

-- AddForeignKey
ALTER TABLE "TrainingProgram" ADD CONSTRAINT "TrainingProgram_fitnessProfileId_fkey" FOREIGN KEY ("fitnessProfileId") REFERENCES "FitnessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_programId_fkey" FOREIGN KEY ("programId") REFERENCES "TrainingProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciceSession" ADD CONSTRAINT "ExerciceSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciceSession" ADD CONSTRAINT "ExerciceSession_exerciceId_fkey" FOREIGN KEY ("exerciceId") REFERENCES "Exercice"("id_exercice") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetPerformance" ADD CONSTRAINT "SetPerformance_id_exercice_session_fkey" FOREIGN KEY ("id_exercice_session") REFERENCES "ExerciceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciceMuscleGroup" ADD CONSTRAINT "ExerciceMuscleGroup_exerciceId_fkey" FOREIGN KEY ("exerciceId") REFERENCES "Exercice"("id_exercice") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciceMuscleGroup" ADD CONSTRAINT "ExerciceMuscleGroup_groupeId_fkey" FOREIGN KEY ("groupeId") REFERENCES "MuscleGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

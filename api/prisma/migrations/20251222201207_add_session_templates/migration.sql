-- AlterTable
ALTER TABLE "TrainingSession" ADD COLUMN     "sessionTemplateId" INTEGER;

-- CreateTable
CREATE TABLE "SessionTemplate" (
    "id" SERIAL NOT NULL,
    "programId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "orderInProgram" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseTemplate" (
    "id" SERIAL NOT NULL,
    "sessionTemplateId" INTEGER NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "orderInSession" INTEGER NOT NULL DEFAULT 0,
    "sets" INTEGER NOT NULL DEFAULT 3,
    "reps" INTEGER NOT NULL DEFAULT 8,
    "weight" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SessionTemplate_programId_idx" ON "SessionTemplate"("programId");

-- CreateIndex
CREATE INDEX "SessionTemplate_programId_orderInProgram_idx" ON "SessionTemplate"("programId", "orderInProgram");

-- CreateIndex
CREATE INDEX "ExerciseTemplate_sessionTemplateId_idx" ON "ExerciseTemplate"("sessionTemplateId");

-- CreateIndex
CREATE INDEX "ExerciseTemplate_sessionTemplateId_orderInSession_idx" ON "ExerciseTemplate"("sessionTemplateId", "orderInSession");

-- CreateIndex
CREATE INDEX "TrainingSession_sessionTemplateId_idx" ON "TrainingSession"("sessionTemplateId");

-- AddForeignKey
ALTER TABLE "SessionTemplate" ADD CONSTRAINT "SessionTemplate_programId_fkey" FOREIGN KEY ("programId") REFERENCES "TrainingProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseTemplate" ADD CONSTRAINT "ExerciseTemplate_sessionTemplateId_fkey" FOREIGN KEY ("sessionTemplateId") REFERENCES "SessionTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseTemplate" ADD CONSTRAINT "ExerciseTemplate_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_sessionTemplateId_fkey" FOREIGN KEY ("sessionTemplateId") REFERENCES "SessionTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

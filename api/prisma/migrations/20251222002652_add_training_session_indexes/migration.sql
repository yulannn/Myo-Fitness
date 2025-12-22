-- CreateIndex
CREATE INDEX "TrainingSession_programId_completed_idx" ON "TrainingSession"("programId", "completed");

-- CreateIndex
CREATE INDEX "TrainingSession_performedAt_idx" ON "TrainingSession"("performedAt");

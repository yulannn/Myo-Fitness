-- CreateEnum
CREATE TYPE "AIRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateTable
CREATE TABLE "AIChatMessage" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "AIRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIChatMessage_userId_createdAt_idx" ON "AIChatMessage"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AIChatMessage_createdAt_idx" ON "AIChatMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "AIChatMessage" ADD CONSTRAINT "AIChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

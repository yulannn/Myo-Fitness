/*
  Warnings:

  - Added the required column `receiverId` to the `FriendGroupRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "ProgramTemplate" ADD VALUE 'UPPER_LOWER_UPPER_LOWER';

-- AlterTable
ALTER TABLE "FriendGroupRequest" ADD COLUMN     "receiverId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "SessionPhoto" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionPhoto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SessionPhoto" ADD CONSTRAINT "SessionPhoto_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionPhoto" ADD CONSTRAINT "SessionPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendGroupRequest" ADD CONSTRAINT "FriendGroupRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

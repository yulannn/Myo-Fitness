-- AlterTable
ALTER TABLE "SharedSession" ADD COLUMN     "gymId" INTEGER;

-- AddForeignKey
ALTER TABLE "SharedSession" ADD CONSTRAINT "SharedSession_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE SET NULL ON UPDATE CASCADE;

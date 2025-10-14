-- AlterTable
ALTER TABLE "Exercice" ADD COLUMN     "createdByUserId" INTEGER,
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "Exercice" ADD CONSTRAINT "Exercice_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

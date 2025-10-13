/*
  Warnings:

  - The primary key for the `Exercice` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `Exercice` table. All the data in the column will be lost.
  - You are about to drop the column `id_exercice` on the `Exercice` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Exercice` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ExerciceMuscleGroup" DROP CONSTRAINT "ExerciceMuscleGroup_exerciceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ExerciceSession" DROP CONSTRAINT "ExerciceSession_exerciceId_fkey";

-- AlterTable
ALTER TABLE "Exercice" DROP CONSTRAINT "Exercice_pkey",
DROP COLUMN "created_at",
DROP COLUMN "id_exercice",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "Exercice_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "ExerciceSession" ADD CONSTRAINT "ExerciceSession_exerciceId_fkey" FOREIGN KEY ("exerciceId") REFERENCES "Exercice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciceMuscleGroup" ADD CONSTRAINT "ExerciceMuscleGroup_exerciceId_fkey" FOREIGN KEY ("exerciceId") REFERENCES "Exercice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Exercice" ADD COLUMN     "effectiveness" INTEGER,
ADD COLUMN     "fatigueLevel" INTEGER,
ADD COLUMN     "popularity" INTEGER NOT NULL DEFAULT 0;

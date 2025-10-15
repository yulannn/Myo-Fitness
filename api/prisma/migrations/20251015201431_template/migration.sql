-- CreateEnum
CREATE TYPE "ExerciceType" AS ENUM ('COMPOUND', 'ISOLATION', 'CARDIO', 'MOBILITY', 'STRETCH');

-- CreateEnum
CREATE TYPE "ProgramTemplate" AS ENUM ('FULL_BODY', 'PUSH_PULL_LEGS', 'UPPER_LOWER', 'CUSTOM');

-- AlterTable
ALTER TABLE "Exercice" ADD COLUMN     "type" "ExerciceType";

-- AlterTable
ALTER TABLE "TrainingProgram" ADD COLUMN     "template" "ProgramTemplate";

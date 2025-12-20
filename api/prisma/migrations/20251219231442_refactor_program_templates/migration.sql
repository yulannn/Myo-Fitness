/*
  Warnings:

  - The values [UPPER_LOWER_PUSH_PULL,PUSH_PULL_LEGS_UPPER_LOWER,PUSH_PULL_LEGS_PUSH_PULL_LEGS,PUSH_PULL_LEGS_CARDIO,UPPER_LOWER_UPPER_LOWER] on the enum `ProgramTemplate` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProgramTemplate_new" AS ENUM ('FULL_BODY', 'UPPER_LOWER', 'PUSH_PULL_LEGS', 'PHAT', 'BRO_SPLIT', 'ARNOLD_SPLIT', 'CUSTOM');
ALTER TABLE "TrainingProgram" ALTER COLUMN "template" TYPE "ProgramTemplate_new" USING ("template"::text::"ProgramTemplate_new");
ALTER TYPE "ProgramTemplate" RENAME TO "ProgramTemplate_old";
ALTER TYPE "ProgramTemplate_new" RENAME TO "ProgramTemplate";
DROP TYPE "public"."ProgramTemplate_old";
COMMIT;

/*
  Warnings:

  - The values [HYBRID] on the enum `TrainingEnvironment` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TrainingEnvironment_new" AS ENUM ('HOME', 'GYM');
ALTER TABLE "public"."FitnessProfile" ALTER COLUMN "trainingEnvironment" DROP DEFAULT;
ALTER TABLE "FitnessProfile" ALTER COLUMN "trainingEnvironment" TYPE "TrainingEnvironment_new" USING ("trainingEnvironment"::text::"TrainingEnvironment_new");
ALTER TYPE "TrainingEnvironment" RENAME TO "TrainingEnvironment_old";
ALTER TYPE "TrainingEnvironment_new" RENAME TO "TrainingEnvironment";
DROP TYPE "public"."TrainingEnvironment_old";
ALTER TABLE "FitnessProfile" ALTER COLUMN "trainingEnvironment" SET DEFAULT 'GYM';
COMMIT;

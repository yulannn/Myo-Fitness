-- DropForeignKey
ALTER TABLE "public"."WeightHistory" DROP CONSTRAINT "WeightHistory_fitnessProfileId_fkey";

-- AddForeignKey
ALTER TABLE "WeightHistory" ADD CONSTRAINT "WeightHistory_fitnessProfileId_fkey" FOREIGN KEY ("fitnessProfileId") REFERENCES "FitnessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

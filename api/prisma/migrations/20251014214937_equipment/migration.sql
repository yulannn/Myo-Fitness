/*
  Warnings:

  - You are about to drop the `ExerciseEquipment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ExerciseEquipment" DROP CONSTRAINT "ExerciseEquipment_equipmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ExerciseEquipment" DROP CONSTRAINT "ExerciseEquipment_exerciceId_fkey";

-- DropTable
DROP TABLE "public"."ExerciseEquipment";

-- CreateTable
CREATE TABLE "ExerciceEquipment" (
    "exerciceId" INTEGER NOT NULL,
    "equipmentId" INTEGER NOT NULL,

    CONSTRAINT "ExerciceEquipment_pkey" PRIMARY KEY ("exerciceId","equipmentId")
);

-- AddForeignKey
ALTER TABLE "ExerciceEquipment" ADD CONSTRAINT "ExerciceEquipment_exerciceId_fkey" FOREIGN KEY ("exerciceId") REFERENCES "Exercice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciceEquipment" ADD CONSTRAINT "ExerciceEquipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

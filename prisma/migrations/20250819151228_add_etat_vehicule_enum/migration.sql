/*
  Warnings:

  - The `etatActuel` column on the `Vehicule` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."EtatVehicule" AS ENUM ('Bon_etat', 'A_prevoir', 'En_panne');

-- AlterTable
ALTER TABLE "public"."Vehicule" DROP COLUMN "etatActuel",
ADD COLUMN     "etatActuel" "public"."EtatVehicule";

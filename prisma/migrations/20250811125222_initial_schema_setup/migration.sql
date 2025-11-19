-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('SousAdmin', 'Chauffeur');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('Actif', 'Inactif');

-- CreateEnum
CREATE TYPE "public"."MedicalExamResult" AS ENUM ('Apte', 'Inapte');

-- CreateEnum
CREATE TYPE "public"."CardType" AS ENUM ('gazole', 'peage');

-- CreateEnum
CREATE TYPE "public"."CardStatus" AS ENUM ('Active', 'Inactive');

-- CreateEnum
CREATE TYPE "public"."MissionType" AS ENUM ('Chargement', 'Dechargement', 'Sous_traitance', 'Decrochage', 'Accrochage');

-- CreateEnum
CREATE TYPE "public"."ChargementType" AS ENUM ('Chargement_classique', 'Chargement_frigorifique', 'Chargement_plombe');

-- CreateEnum
CREATE TYPE "public"."MissionStatus" AS ENUM ('Programme', 'En_cours', 'Termine', 'Annule');

-- CreateTable
CREATE TABLE "public"."Utilisateur" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userType" "public"."UserType" NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'Actif',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Role" (
    "id" SERIAL NOT NULL,
    "roleName" TEXT NOT NULL,
    "roleDisplayName" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UtilisateurRole" (
    "utilisateurId" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "UtilisateurRole_pkey" PRIMARY KEY ("utilisateurId","roleId")
);

-- CreateTable
CREATE TABLE "public"."Client" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "address" TEXT,
    "profilePictureUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Chauffeur" (
    "id" SERIAL NOT NULL,
    "chauffeurCode" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "address" TEXT,
    "profilePictureUrl" TEXT,
    "licenseNumber" TEXT,
    "licenseCategory" TEXT,
    "licenseIssueDate" TIMESTAMP(3),
    "driverCardValidity" TIMESTAMP(3),
    "medicalExamDate" TIMESTAMP(3),
    "medicalExamResult" "public"."MedicalExamResult",
    "tachographNumber" TEXT,
    "contractType" TEXT,
    "contractStartDate" TIMESTAMP(3),
    "salaryDetails" TEXT,
    "workHours" TEXT,
    "currentStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "utilisateurId" TEXT NOT NULL,

    CONSTRAINT "Chauffeur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Vehicule" (
    "id" SERIAL NOT NULL,
    "immatriculation" TEXT NOT NULL,
    "marque" TEXT,
    "typeVehicule" TEXT,
    "anneeFabrication" INTEGER,
    "dateMiseCirculation" TIMESTAMP(3),
    "kilometrageActuel" INTEGER,
    "nombrePlaces" INTEGER,
    "etatActuel" TEXT,
    "utilisationPrevue" TEXT,
    "remarques" TEXT,
    "photoUrl" TEXT,
    "dateAffectationActuelle" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chauffeurActuelId" INTEGER,

    CONSTRAINT "Vehicule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Carte" (
    "id" SERIAL NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "cardType" "public"."CardType" NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "status" "public"."CardStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chauffeurId" INTEGER,

    CONSTRAINT "Carte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Mission" (
    "id" SERIAL NOT NULL,
    "missionCode" TEXT NOT NULL,
    "missionType" "public"."MissionType" NOT NULL,
    "chargementType" "public"."ChargementType",
    "status" "public"."MissionStatus" NOT NULL,
    "dateDepart" TIMESTAMP(3),
    "heurePresenceObligatoire" TEXT,
    "heureDepartEstimee" TEXT,
    "dateArriveeEstimee" TIMESTAMP(3),
    "heureArriveeEstimee" TEXT,
    "lieuDepart" TEXT,
    "lieuArrivee" TEXT,
    "distanceEstimeeKm" DECIMAL(65,30),
    "distanceReelleKm" DECIMAL(65,30),
    "carburantConsommeL" DECIMAL(65,30),
    "performanceNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientId" INTEGER,
    "chauffeurDepartId" INTEGER,
    "chauffeurArriveeId" INTEGER,
    "vehiculeDepartId" INTEGER,
    "vehiculeArriveeId" INTEGER,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DocumentChauffeur" (
    "id" SERIAL NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chauffeurId" INTEGER NOT NULL,

    CONSTRAINT "DocumentChauffeur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Formation" (
    "id" SERIAL NOT NULL,
    "formationName" TEXT NOT NULL,
    "description" TEXT,
    "dateCompleted" TIMESTAMP(3),
    "chauffeurId" INTEGER NOT NULL,

    CONSTRAINT "Formation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HistoriqueAffectation" (
    "id" SERIAL NOT NULL,
    "dateDebutAffectation" TIMESTAMP(3) NOT NULL,
    "dateFinAffectation" TIMESTAMP(3),
    "vehiculeId" INTEGER NOT NULL,
    "chauffeurId" INTEGER NOT NULL,

    CONSTRAINT "HistoriqueAffectation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Entretien" (
    "id" SERIAL NOT NULL,
    "typeEntretien" TEXT NOT NULL,
    "dateEntretien" TIMESTAMP(3) NOT NULL,
    "dateProchainEntretien" TIMESTAMP(3),
    "notes" TEXT,
    "vehiculeId" INTEGER NOT NULL,

    CONSTRAINT "Entretien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DocumentVehicule" (
    "id" SERIAL NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "dateExpiration" TIMESTAMP(3),
    "vehiculeId" INTEGER NOT NULL,

    CONSTRAINT "DocumentVehicule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EtapeMission" (
    "id" SERIAL NOT NULL,
    "ordre" INTEGER NOT NULL,
    "lieu" TEXT NOT NULL,
    "heureArrivee" TIMESTAMP(3),
    "heureDepart" TIMESTAMP(3),
    "observation" TEXT,
    "missionId" INTEGER NOT NULL,

    CONSTRAINT "EtapeMission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DocumentMission" (
    "id" SERIAL NOT NULL,
    "typeDocument" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "missionId" INTEGER NOT NULL,

    CONSTRAINT "DocumentMission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Incident" (
    "id" SERIAL NOT NULL,
    "incidentType" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "fileUrl" TEXT,
    "missionId" INTEGER,
    "chauffeurId" INTEGER NOT NULL,
    "vehiculeId" INTEGER,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_id_key" ON "public"."Utilisateur"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "public"."Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_roleName_key" ON "public"."Role"("roleName");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "public"."Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Chauffeur_chauffeurCode_key" ON "public"."Chauffeur"("chauffeurCode");

-- CreateIndex
CREATE UNIQUE INDEX "Chauffeur_utilisateurId_key" ON "public"."Chauffeur"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicule_immatriculation_key" ON "public"."Vehicule"("immatriculation");

-- CreateIndex
CREATE UNIQUE INDEX "Carte_cardNumber_key" ON "public"."Carte"("cardNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Mission_missionCode_key" ON "public"."Mission"("missionCode");

-- AddForeignKey
ALTER TABLE "public"."UtilisateurRole" ADD CONSTRAINT "UtilisateurRole_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "public"."Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UtilisateurRole" ADD CONSTRAINT "UtilisateurRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chauffeur" ADD CONSTRAINT "Chauffeur_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "public"."Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vehicule" ADD CONSTRAINT "Vehicule_chauffeurActuelId_fkey" FOREIGN KEY ("chauffeurActuelId") REFERENCES "public"."Chauffeur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Carte" ADD CONSTRAINT "Carte_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "public"."Chauffeur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mission" ADD CONSTRAINT "Mission_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mission" ADD CONSTRAINT "Mission_chauffeurDepartId_fkey" FOREIGN KEY ("chauffeurDepartId") REFERENCES "public"."Chauffeur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mission" ADD CONSTRAINT "Mission_chauffeurArriveeId_fkey" FOREIGN KEY ("chauffeurArriveeId") REFERENCES "public"."Chauffeur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mission" ADD CONSTRAINT "Mission_vehiculeDepartId_fkey" FOREIGN KEY ("vehiculeDepartId") REFERENCES "public"."Vehicule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mission" ADD CONSTRAINT "Mission_vehiculeArriveeId_fkey" FOREIGN KEY ("vehiculeArriveeId") REFERENCES "public"."Vehicule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DocumentChauffeur" ADD CONSTRAINT "DocumentChauffeur_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "public"."Chauffeur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Formation" ADD CONSTRAINT "Formation_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "public"."Chauffeur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HistoriqueAffectation" ADD CONSTRAINT "HistoriqueAffectation_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "public"."Vehicule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HistoriqueAffectation" ADD CONSTRAINT "HistoriqueAffectation_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "public"."Chauffeur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Entretien" ADD CONSTRAINT "Entretien_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "public"."Vehicule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DocumentVehicule" ADD CONSTRAINT "DocumentVehicule_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "public"."Vehicule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EtapeMission" ADD CONSTRAINT "EtapeMission_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "public"."Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DocumentMission" ADD CONSTRAINT "DocumentMission_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "public"."Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Incident" ADD CONSTRAINT "Incident_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "public"."Mission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Incident" ADD CONSTRAINT "Incident_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "public"."Chauffeur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Incident" ADD CONSTRAINT "Incident_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "public"."Vehicule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

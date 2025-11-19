import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database reset...');

  // --- DELETION ORDER IS CRITICAL ---
  // We must delete from tables that have foreign keys pointing to others FIRST,
  // and work our way up to the "parent" tables.

  console.log('Deleting related data (Missions, Incidents, etc.)...');
  // These tables have the most dependencies
  await prisma.documentMission.deleteMany({});
  await prisma.etapeMission.deleteMany({});
  await prisma.incident.deleteMany({});
  await prisma.historiqueAffectation.deleteMany({});
  await prisma.entretien.deleteMany({});
  await prisma.documentVehicule.deleteMany({});
  await prisma.documentChauffeur.deleteMany({});
  await prisma.formation.deleteMany({});
  await prisma.utilisateurRole.deleteMany({});
  await prisma.carte.deleteMany({});

  console.log('Deleting core data (Missions, Chauffeurs, etc.)...');
  // These tables are referenced by the ones above
  await prisma.mission.deleteMany({});
  await prisma.vehicule.deleteMany({});
  await prisma.chauffeur.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.contactMessage.deleteMany({});
  await prisma.expense.deleteMany({});

  console.log('Deleting base user and role data...');
  // These are at the top of the dependency chain
  await prisma.role.deleteMany({});
  await prisma.utilisateur.deleteMany({});
  
  console.log('✅ All tables have been cleared.');
  
  // IMPORTANT: This script does NOT delete users from Supabase Auth.
  // The seed script is designed to handle existing auth users, so this is okay.
  console.log('Note: Users in Supabase Authentication are not affected.');
}

// --- EXECUTE THE SCRIPT ---
main()
  .catch((e) => {
    console.error('An error occurred during the reset:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Reset script finished.');
  });
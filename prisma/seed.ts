import {
  PrismaClient,
  UserType,
  Status,
  Client,
  Chauffeur,
  Vehicule,
  EtatVehicule,
  MissionType,
  MissionStatus,
} from '@prisma/client';
import { createClient, User } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { faker } from '@faker-js/faker';

// --- INITIALIZATION ---
console.log('--- SCRIPT EXECUTION STARTED ---');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('CRITICAL ERROR: Environment variables did not load. Check the path in dotenv.config().');
  console.error('__dirname is:', __dirname); // Helps debug the path
  process.exit(1); // Exit with an error code
}

console.log('Environment variables loaded successfully.');

const prisma = new PrismaClient();
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- NEW, CORRECTED HELPER FUNCTION ---
async function ensureAuthUser(email: string, fullName: string, password = 'Password123'): Promise<User> {
  const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError && createError.message.includes('User already registered')) {
    console.log(`Auth user ${email} already exists. Fetching them...`);
    
    // Fetch ALL users. This is inefficient but the only admin method available.
    // Use pagination for very large user bases if needed in the future.
    const { data: { users: allUsers }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to list users to find existing one: ${listError.message}`);
    }

    // --- THIS IS THE FIX ---
    // We cast the result to User[] to tell TypeScript the correct shape.
    const users = allUsers as User[];
    // ----------------------
    
    const existingUser = users.find(u => u.email === email);
    if (!existingUser) {
      throw new Error(`User ${email} was reported to exist but could not be found via listUsers.`);
    }
    return existingUser;
  }
  
  if (createError) {
    throw new Error(`Supabase createUser Error: ${createError.message}`);
  }
  if (!authData.user) {
    throw new Error('Supabase did not return a user object on creation.');
  }

  console.log(`Created new auth user for ${email}.`);
  return authData.user;
}

async function main() {
  console.log('Starting the seed script...');

  // --- 1. Create the First Sous-Admin ---
  const adminAuthUser = await ensureAuthUser('admin@cargopilot.com', 'Main Administrator', 'SecurePassword123!');
  await prisma.utilisateur.upsert({
    where: { email: 'admin@cargopilot.com' },
    update: {},
    create: {
      id: adminAuthUser.id,
      email: adminAuthUser.email!,
      fullName: 'Main Administrator',
      userType: UserType.SousAdmin,
      status: Status.Actif,
    },
  });
  console.log('✅ Admin ensured.');

  // --- 2. Create Clients ---
  console.log('Creating clients...');
  const clients: Client[] = [];
  for (let i = 0; i < 5; i++) {
    const clientEmail = faker.internet.email();
    clients.push(await prisma.client.upsert({
      where: { email: clientEmail },
      update: {},
      create: {
        companyName: faker.company.name(),
        contactName: faker.person.fullName(),
        email: clientEmail,
        phoneNumber: faker.phone.number(),
        address: faker.location.streetAddress(true),
        status: faker.helpers.arrayElement(['Success', 'Processing', 'Failed']),
      },
    }));
  }
  console.log(`✅ ${clients.length} clients ensured.`);

  // --- 3. Create Chauffeurs ---
  console.log('Creating chauffeurs...');
  const chauffeurs: Chauffeur[] = [];
  for (let i = 0; i < 10; i++) {
    const fullName = faker.person.fullName();
    const email = faker.internet.email({ firstName: fullName.split(' ')[0], lastName: fullName.split(' ')[1] });
    
    const authUser = await ensureAuthUser(email, fullName);
    
    const dbUser = await prisma.utilisateur.upsert({
        where: { email },
        update: {},
        create: { id: authUser.id, email: authUser.email!, fullName, userType: UserType.Chauffeur, status: Status.Actif },
    });

    chauffeurs.push(await prisma.chauffeur.upsert({
      where: { utilisateurId: dbUser.id },
      update: {},
      create: {
        utilisateurId: dbUser.id,
        chauffeurCode: `CH${String(i + 1).padStart(3, '0')}`,
        birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        licenseNumber: faker.string.alphanumeric(10).toUpperCase(),
      },
    }));
  }
  console.log(`✅ ${chauffeurs.length} chauffeurs ensured.`);

  // --- 4. Create Vehicules ---
  console.log('Creating vehicules...');
  const vehicules: Vehicule[] = [];
  for (let i = 0; i < 8; i++) {
    const immatriculation = `${faker.number.int({ min: 100, max: 999 })} TU ${faker.number.int({ min: 1000, max: 9999 })}`;
    vehicules.push(await prisma.vehicule.upsert({
        where: { immatriculation },
        update: {},
        create: {
            immatriculation,
            marque: faker.vehicle.manufacturer(),
            typeVehicule: faker.vehicle.model(),
            anneeFabrication: faker.number.int({ min: 2010, max: 2024 }),
            etatActuel: faker.helpers.arrayElement([EtatVehicule.Bon_etat, EtatVehicule.A_prevoir, EtatVehicule.En_panne]),
        },
    }));
  }
  console.log(`✅ ${vehicules.length} vehicules ensured.`);

  // --- 5. Create Missions ---
  await prisma.mission.deleteMany({});
  console.log('Creating missions...');
  for (let i = 0; i < 20; i++) {
    if (clients.length === 0 || chauffeurs.length === 0 || vehicules.length === 0) continue;
    const randomClient = faker.helpers.arrayElement(clients);
    const randomChauffeur = faker.helpers.arrayElement(chauffeurs);
    const randomVehicule = faker.helpers.arrayElement(vehicules);
    await prisma.mission.create({
      data: {
        missionCode: `INV${String(i + 1).padStart(4, '0')}`,
        missionType: faker.helpers.arrayElement([MissionType.Chargement, MissionType.Dechargement]),
        status: faker.helpers.arrayElement([MissionStatus.Programme, MissionStatus.En_cours, MissionStatus.Termine, MissionStatus.Annule]),
        clientId: randomClient.id,
        chauffeurDepartId: randomChauffeur.id,
        vehiculeDepartId: randomVehicule.id,
        lieuDepart: faker.location.city(),
        lieuArrivee: faker.location.city(),
        dateDepart: faker.date.soon({ days: 30 }),
      },
    });
  }
  console.log('✅ 20 missions created.');
  
  console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
}


// --- EXECUTE THE SCRIPT ---
main()
  .catch((e) => {
    console.error('An error occurred during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
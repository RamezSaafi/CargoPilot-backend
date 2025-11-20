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
console.log('--- DASHBOARD SEEDING STARTED ---');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to ensure Supabase Auth User exists
async function ensureAuthUser(email: string, fullName: string, password = 'Password123'): Promise<User> {
  const { data } = await supabaseAdmin.auth.admin.listUsers();
  
  // We explicitly tell TypeScript that this is an array of Users
  const users = (data.users || []) as User[];

  const existingUser = users.find(u => u.email === email);

  if (existingUser) return existingUser;

  const { data: authData, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error) throw error;
  if (!authData.user) throw new Error('No user returned');
  
  return authData.user;
}

async function main() {
  // 1. Create Admin
  const adminAuth = await ensureAuthUser('admin@cargopilot.com', 'Main Admin');
  await prisma.utilisateur.upsert({
    where: { email: 'admin@cargopilot.com' },
    update: {},
    create: { id: adminAuth.id, email: adminAuth.email!, fullName: 'Main Admin', userType: UserType.SousAdmin, status: Status.Actif },
  });

  // 2. Create Resources (Clients, Chauffeurs, Vehicles)
  console.log('⚡ Generating Resources...');
  const clients: Client[] = [];
  for (let i = 0; i < 5; i++) {
    clients.push(await prisma.client.create({
      data: {
        companyName: faker.company.name(),
        email: faker.internet.email(),
        contactName: faker.person.fullName(),
        status: 'Active'
      }
    }));
  }

  const chauffeurs: Chauffeur[] = [];
  for (let i = 0; i < 5; i++) {
    const email = faker.internet.email();
    const auth = await ensureAuthUser(email, faker.person.fullName());
    const user = await prisma.utilisateur.create({
       data: { id: auth.id, email, fullName: auth.user_metadata.full_name, userType: UserType.Chauffeur }
    });
    chauffeurs.push(await prisma.chauffeur.create({
      data: { utilisateurId: user.id, chauffeurCode: `CH-${i}` }
    }));
  }

  const vehicules: Vehicule[] = [];
  for (let i = 0; i < 5; i++) {
    vehicules.push(await prisma.vehicule.create({
      data: { 
        immatriculation: faker.vehicle.vin().substring(0, 8).toUpperCase(), 
        marque: faker.vehicle.manufacturer(),
        etatActuel: EtatVehicule.Bon_etat
      }
    }));
  }

  // 3. GENERATE DATA FOR CHARTS
  console.log('📊 Generating Chart Data...');

  // A. EXPENSES (Pie Chart)
  const categories = ['Carburant', 'Péage', 'Entretien', 'Amendes', 'Administratif'];
  for (let i = 0; i < 30; i++) {
    await prisma.expense.create({
      data: {
        amount: faker.number.float({ min: 50, max: 500, fractionDigits: 2 }),
        category: faker.helpers.arrayElement(categories),
        date: faker.date.recent({ days: 60 }),
        description: faker.commerce.productName(),
      }
    });
  }
  console.log('✅ Expenses created (Pie Chart populated)');

  // B. RECENT MISSIONS (Bar Chart - Last 7 days)
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(today);
    dayDate.setDate(today.getDate() - i); // Go back i days

    // Create 3-5 missions per day
    const missionsCount = faker.number.int({ min: 3, max: 5 });
    
    for (let j = 0; j < missionsCount; j++) {
        const isDelayed = Math.random() > 0.7; // 30% chance of delay
        const estArrival = new Date(dayDate);
        estArrival.setHours(14, 0, 0);
        
        const realArrival = new Date(estArrival);
        // If delayed, add 3 hours. If not, subtract 1 hour.
        realArrival.setHours(isDelayed ? 17 : 13, 0, 0);

        await prisma.mission.create({
            data: {
                missionCode: `M-D${i}-${j}`,
                missionType: MissionType.Chargement,
                status: MissionStatus.Termine,
                clientId: clients[0].id,
                chauffeurDepartId: chauffeurs[0].id,
                vehiculeDepartId: vehicules[0].id,
                createdAt: dayDate, // IMPORTANT for the chart grouping
                dateDepart: dayDate,
                dateArriveeEstimee: estArrival,
                dateArriveeReelle: realArrival,
                distanceReelleKm: 500,
                carburantConsommeL: 100,
            }
        });
    }
  }
  console.log('✅ Recent missions created (Bar Chart populated)');

  // C. HISTORICAL MISSIONS (Line Chart - Last 6 months)
  // We need to spread missions over months to show the "Average Duration" line
  for (let i = 0; i < 6; i++) {
    const monthDate = new Date(today);
    monthDate.setMonth(today.getMonth() - i);
    
    // Missions took longer 6 months ago (to show a trend)
    const durationBase = 300 + (i * 20); 

    for (let k = 0; k < 5; k++) {
        const dep = new Date(monthDate);
        const arr = new Date(dep.getTime() + (durationBase * 60000)); // Add minutes

        await prisma.mission.create({
            data: {
                missionCode: `M-H${i}-${k}`,
                missionType: MissionType.Dechargement,
                status: MissionStatus.Termine,
                clientId: clients[0].id,
                chauffeurDepartId: chauffeurs[0].id,
                vehiculeDepartId: vehicules[0].id,
                createdAt: monthDate,
                dateDepart: dep,
                dateArriveeReelle: arr,
            }
        });
    }
  }
  console.log('✅ Historical missions created (Line Chart populated)');
  
  // D. INCIDENTS
  for(let i=0; i<5; i++) {
      await prisma.incident.create({
          data: {
              incidentType: 'Panne',
              date: new Date(),
              description: 'Engine overheating',
              chauffeurId: chauffeurs[0].id
          }
      })
  }

  console.log('--- SEEDING FINISHED ---');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
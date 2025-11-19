// =================================================================
// This file is the "contract" defining the shape of data from your backend API.
// It is generated based on the Prisma queries in your NestJS services.
// =================================================================

// --- 1. GENERIC & COMMON TYPES ---

/** The standard shape for all paginated list responses. */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/** The base user profile, returned as a nested object in many responses. */
export interface Utilisateur {
  id: string; // UUID from Supabase
  fullName: string;
  email: string;
  userType: 'SousAdmin' | 'Chauffeur';
  status: 'Actif' | 'Inactif';
  createdAt: string; // All dates from JSON are strings
  updatedAt: string;
}

// --- 2. MODULE-SPECIFIC "LIST ITEM" TYPES (for table views) ---

/** Data for a single row in the Chauffeurs list. From ChauffeursService.findAll() */
export interface ChauffeurListItem {
  id: number;
  chauffeurCode: string;
  createdAt: string;
  utilisateur: {
    fullName: string;
    email: string;
    status: 'Actif' | 'Inactif';
  };
}

/** Data for a single row in the Clients list. From ClientsService.findAll() */
export interface ClientListItem {
  id: number;
  companyName: string;
  contactName: string | null;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  profilePictureUrl: string | null;
  status: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Data for a single row in the Vehicules list. From VehiculesService.findAll() */
export interface VehiculeListItem {
  id: number;
  immatriculation: string;
  marque: string | null;
  typeVehicule: string | null;
  chauffeurActuel: {
    utilisateur: {
      fullName: string;
    };
  } | null;
}

/** Data for a single row in the Cartes list. From CartesService.findAll() */
export interface CarteListItem {
  id: number;
  cardNumber: string;
  cardType: 'gazole' | 'peage';
  status: 'Active' | 'Inactive';
  expirationDate: string | null;
  createdAt: string;
  chauffeur: {
    utilisateur: {
      fullName: string;
    };
  } | null;
}

/** Data for a single row in the Missions list. From MissionsService.findAll() */
export interface MissionListItem {
    id: number;
    missionCode: string;
    status: 'Programme' | 'En_cours' | 'Termine' | 'Annule';
    client: { companyName: string } | null;
    chauffeurDepart: { utilisateur: { fullName: string } } | null;
    vehiculeDepart: { immatriculation: string; marque: string | null } | null;
}

/** Data for a single row in the Contact Messages list. From ContactService.findAllMessages() */
export interface ContactMessage {
    id: number;
    name: string;
    email: string;
    message: string;
    status: 'Nouveau' | 'Lu';
    createdAt: string;
}

/** Data for a single row in the Users list. From UsersService.findAll() */
export interface UserListItem extends Utilisateur {}

/** Data for a single row in the Expenses list. From ExpensesService.findAll() */
export interface ExpenseListItem {
  id: number;
  amount: number; // Prisma Decimal is serialized to number in JSON
  category: string;
  description: string | null;
  date: string;
  mission: { missionCode: string } | null;
  vehicule: { immatriculation: string } | null;
  chauffeur: { utilisateur: { fullName: string } } | null;
}

// --- 3. MODULE-SPECIFIC "DETAIL" TYPES (for detail/edit pages) ---

/** Data for the detailed view of a single Chauffeur. From ChauffeursService.findOne() */
export interface ChauffeurDetail {
  id: number;
  chauffeurCode: string;
  birthDate: string | null;
  address: string | null;
  profilePictureUrl: string | null;
  licenseNumber: string | null;
  licenseCategory: string | null;
  licenseIssueDate: string | null;
  driverCardValidity: string | null;
  medicalExamDate: string | null;
  medicalExamResult: 'Apte' | 'Inapte' | null;
  tachographNumber: string | null;
  contractType: string | null;
  contractStartDate: string | null;
  salaryDetails: string | null;
  workHours: string | null;
  currentStatus: string | null;
  performance: string | null;
  createdAt: string;
  updatedAt: string;
  utilisateurId: string;
  
  // Relations from `include`
  utilisateur: Utilisateur;
  documents: {
    id: number;
    documentType: string;
    fileUrl: string; // This is the PATH
    expirationDate: string | null;
    createdAt: string;
  }[];
  formations: {
    id: number;
    formationName: string;
    description: string | null;
    dateCompleted: string | null;
  }[];
  incidents: {
    id: number;
    incidentType: string;
    date: string;
    description: string;
  }[];
  missionsAsChauffeurDepart: {
    id: number;
    missionCode: string;
    status: string;
  }[];
  currentVehicle: {
    id: number;
    immatriculation: string;
  } | null;
}

/** Data for the detailed view of a single Client. From ClientsService.findOne() */
export interface ClientDetail extends ClientListItem {
  missions: MissionListItem[];
}

/** Data for the detailed view of a single Vehicule. From VehiculesService.findOne() */
export interface VehiculeDetail extends VehiculeListItem {
    anneeFabrication: number | null;
    dateMiseCirculation: string | null;
    kilometrageActuel: number | null;
    nombrePlaces: number | null;
    utilisationPrevue: string | null;
    remarques: string | null;
    photoUrl: string | null;
    dateAffectationActuelle: string | null;
    chauffeurActuelId: number | null;
    
    affectations: {
        id: number;
        dateDebutAffectation: string;
        dateFinAffectation: string | null;
        chauffeur: { utilisateur: { fullName: string } };
    }[];
    entretiens: {
        id: number;
        typeEntretien: string;
        dateEntretien: string;
        dateProchainEntretien: string | null;
    }[];
    documents: {
        id: number;
        documentType: string;
        fileUrl: string; // This is the PATH
        dateExpiration: string | null;
    }[];
}

/** Data for the detailed view of a single Mission. From MissionsService.findOne() */
export interface MissionDetail extends MissionListItem {
    chargementType: 'Chargement_classique' | 'Chargement_frigorifique' | 'Chargement_plombe' | null;
    heurePresenceObligatoire: string | null;
    heureDepartEstimee: string | null;
    dateArriveeEstimee: string | null;
    heureArriveeEstimee: string | null;
    lieuDepart: string | null;
    lieuArrivee: string | null;
    distanceEstimeeKm: number | null;
    distanceReelleKm: number | null;
    carburantConsommeL: number | null;
    dateArriveeReelle: string | null;
    performanceNotes: string | null;
    
    chauffeurArrivee: { utilisateur: { fullName: string } } | null;
    vehiculeArrivee: { immatriculation: string } | null;
    etapes: {
        id: number;
        ordre: number;
        lieu: string;
    }[];
    documents: {
        id: number;
        typeDocument: string;
        fileUrl: string; // PATH
    }[];
}

/** Data for the detailed view of a single Carte. From CartesService.findOne() */
export interface CarteDetail extends CarteListItem {
  chauffeur: {
    id: number;
    chauffeurCode: string;
    utilisateur: Utilisateur;
  } | null;
}

/** Data for the detailed view of an Expense. From ExpensesService.findOne() */
export interface ExpenseDetail extends ExpenseListItem {
    // includes the same relations, so no extra fields needed unless you change the query
}


// --- 4. DASHBOARD & OTHER SPECIAL TYPES ---

/** Data for the main dashboard. From DashboardService.getDashboardAnalytics() */
export interface DashboardAnalytics {
  kpis: {
    missionsEnCours: number;
    missionsTerminees: number;
    incidentsSignales: number;
    moyenneConsommation: number;
  };
  missionsGlobales: {
    date: string;
    missionsRealisees: number;
    missionsEnRetard: number;
  }[];
  expenseStatistics: {
    category: string;
    percentage: number;
  }[];
  tempsMoyenMission: {
    month: string;
    averageDurationMinutes: number;
  }[];
}
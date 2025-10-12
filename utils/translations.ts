export const translations = {
  // Onboarding
  welcomeTitle: 'Benvenuto su Tenant',
  welcomeSubtitle: 'Trova la tua corrispondenza perfetta - che tu stia cercando una casa, un inquilino o un coinquilino',
  imTenant: 'Sono un Inquilino',
  imHomeowner: 'Sono un Proprietario',
  lookingForRoommate: 'Cerco Coinquilino',
  tenantDescription: 'Cerco un posto da affittare',
  homeownerDescription: 'Ho una proprietà da affittare',
  roommateDescription: 'Trova qualcuno con cui condividere',
  continue: 'Continua',
  idVerification: 'Verifica ID',
  backgroundChecks: 'Controlli Background',
  scamFree: 'Senza Truffe',
  
  // Profile Setup
  completeProfile: 'Completa il Profilo',
  profileSetupSubtitle: 'Raccontaci di più su di te per trovare le migliori corrispondenze',
  fullName: 'Nome Completo',
  age: 'Età',
  location: 'Posizione',
  bio: 'Biografia',
  bioPlaceholder: 'Raccontaci qualcosa su di te...',
  
  // Preferences
  setPreferences: 'Imposta Preferenze',
  preferencesSubtitle: 'Aiutaci a trovare la tua corrispondenza perfetta',
  budget: 'Budget Mensile',
  rent: 'Affitto Mensile',
  moveInDate: 'Data di Trasloco',
  leaseDuration: 'Durata Contratto',
  bedrooms: 'Camere da Letto',
  bathrooms: 'Bagni',
  petFriendly: 'Animali Ammessi',
  smoking: 'Fumatori',
  nearAirport: 'Vicino Aeroporto',
  amenities: 'Servizi',
  preferredTenantTypes: 'Tipi di Inquilini Preferiti',
  
  // Home Screen
  tenant: 'Tenant',
  like: 'MI PIACE',
  nope: 'NO',
  allCaughtUp: 'Sei aggiornato!',
  checkBackLater: 'Torna più tardi per altre potenziali corrispondenze',
  startOver: 'Ricomincia',
  
  // Matches
  matches: 'Corrispondenze',
  noMatches: 'Nessuna corrispondenza ancora',
  keepSwiping: 'Continua a scorrere per trovare la tua corrispondenza perfetta!',
  startConversation: 'Inizia una conversazione',
  
  // Chat
  chat: 'Chat',
  typeMessage: 'Scrivi un messaggio...',
  send: 'Invia',
  
  // Profile
  profile: 'Profilo',
  about: 'Informazioni',
  userType: 'Tipo Utente',
  propertyDetails: 'Dettagli Proprietà',
  verified: 'Verificato',
  completeVerification: 'Completa Verifica',
  signOut: 'Esci',
  
  // Verification
  verification: 'Verifica',
  staySafeVerified: 'Rimani al Sicuro e Verificato',
  verificationIntro: 'Completa questi passaggi di verifica per costruire fiducia e garantire un\'esperienza senza truffe per tutti.',
  idVerificationTitle: 'Verifica Identità',
  idVerificationDesc: 'Verifica la tua identità con un documento d\'identità rilasciato dal governo',
  backgroundCheckTitle: 'Controllo Background',
  backgroundCheckDesc: 'Completa un controllo del background per maggiore sicurezza',
  verifyId: 'Verifica ID',
  startCheck: 'Inizia Controllo',
  completed: 'Completato',
  benefitsOfVerification: 'Vantaggi della Verifica',
  increasedTrust: 'Maggiore fiducia da altri utenti',
  higherMatchRate: 'Tasso di corrispondenza più alto',
  scamFreeEnvironment: 'Ambiente senza truffe',
  
  // Contracts
  contracts: 'Contratti',
  rentalContracts: 'Contratti di Affitto',
  createContract: 'Crea Contratto',
  noContracts: 'Nessun contratto ancora',
  createFirstContract: 'Crea il tuo primo contratto di affitto',
  contractDetails: 'Dettagli Contratto',
  propertyAddress: 'Indirizzo Proprietà',
  monthlyRent: 'Affitto Mensile',
  securityDeposit: 'Deposito Cauzionale',
  startDate: 'Data Inizio',
  endDate: 'Data Fine',
  tenantName: 'Nome Inquilino',
  landlordName: 'Nome Proprietario',
  terms: 'Termini e Condizioni',
  termsPlaceholder: 'Inserisci i termini del contratto...',
  saveContract: 'Salva Contratto',
  shareContract: 'Condividi Contratto',
  viewContract: 'Visualizza Contratto',
  
  // Match Animation
  itsAMatch: 'È una Corrispondenza! 🎉',
  canStartChatting: 'Ora puoi iniziare a chattare tra di voi.',
  keepSwipingButton: 'Continua a Scorrere',
  viewMatches: 'Vedi Corrispondenze',
  
  // Common
  yes: 'Sì',
  no: 'No',
  cancel: 'Annulla',
  save: 'Salva',
  edit: 'Modifica',
  delete: 'Elimina',
  back: 'Indietro',
  next: 'Avanti',
  done: 'Fatto',
  month: 'mese',
  perMonth: '/mese',
  
  // User Types
  tenantType: 'Inquilino',
  homeownerType: 'Proprietario',
  roommateType: 'Coinquilino',
  
  // Tenant Types
  professionals: 'Professionisti',
  students: 'Studenti',
  cabinCrew: 'Equipaggio di Cabina',
  pilots: 'Piloti',
  families: 'Famiglie',
};

export type TranslationKey = keyof typeof translations;

export const t = (key: TranslationKey): string => {
  return translations[key] || key;
};
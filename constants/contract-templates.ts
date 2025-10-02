export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: 'residential' | 'commercial' | 'student' | 'short_term';
  clauses: string;
  basicClauses: ContractClause[];
}

export interface ContractClause {
  id: string;
  title: string;
  content: string;
  required: boolean;
  category: 'basic' | 'financial' | 'maintenance' | 'termination' | 'special';
  editable: boolean;
}

export const basicClauses: ContractClause[] = [
  {
    id: 'property_description',
    title: 'Descrizione Immobile',
    content: 'L\'immobile sito in [INDIRIZZO] composto da [STANZE] stanze, [BAGNI] bagni, con una superficie totale di [SUPERFICIE] metri quadrati.',
    required: true,
    category: 'basic',
    editable: true,
  },
  {
    id: 'rental_period',
    title: 'Durata del Contratto',
    content: 'Il presente contratto di locazione ha validità dal [DATA_INIZIO] al [DATA_FINE]. Il contratto può essere rinnovato previo accordo tra le parti.',
    required: true,
    category: 'basic',
    editable: true,
  },
  {
    id: 'monthly_rent',
    title: 'Canone Mensile',
    content: 'Il canone mensile è di €[CANONE_MENSILE] da versare entro il giorno 5 di ogni mese. I ritardi nel pagamento comportano una penale di €50 per settimana.',
    required: true,
    category: 'financial',
    editable: true,
  },
  {
    id: 'security_deposit',
    title: 'Deposito Cauzionale',
    content: 'È richiesto un deposito cauzionale di €[DEPOSITO] prima dell\'ingresso nell\'immobile. Il deposito sarà restituito entro 30 giorni dalla fine del contratto, dedotte eventuali spese per danni.',
    required: true,
    category: 'financial',
    editable: true,
  },
  {
    id: 'utilities',
    title: 'Utenze',
    content: 'Le utenze comprendenti elettricità, gas, acqua e internet sono [UTENZE_INCLUSE]. L\'inquilino è responsabile dell\'attivazione e del pagamento di questi servizi.',
    required: false,
    category: 'financial',
    editable: true,
  },
  {
    id: 'maintenance',
    title: 'Responsabilità di Manutenzione',
    content: 'L\'inquilino deve mantenere l\'immobile in buone condizioni. Le riparazioni importanti sono a carico del proprietario, mentre la manutenzione ordinaria e la pulizia sono a carico dell\'inquilino.',
    required: true,
    category: 'maintenance',
    editable: true,
  },
  {
    id: 'subletting',
    title: 'Sublocazione',
    content: 'La sublocazione o cessione del contratto è vietata senza il consenso scritto del proprietario.',
    required: false,
    category: 'special',
    editable: true,
  },
  {
    id: 'pets',
    title: 'Animali Domestici',
    content: 'Gli animali domestici sono [ANIMALI_AMMESSI] nell\'immobile. Se ammessi, potrebbe essere richiesto un deposito aggiuntivo di €[DEPOSITO_ANIMALI].',
    required: false,
    category: 'special',
    editable: true,
  },
  {
    id: 'termination',
    title: 'Risoluzione del Contratto',
    content: 'Entrambe le parti possono risolvere il contratto con [GIORNI_PREAVVISO] giorni di preavviso scritto. La risoluzione anticipata può comportare la perdita del deposito cauzionale.',
    required: true,
    category: 'termination',
    editable: true,
  },
  {
    id: 'smoking',
    title: 'Divieto di Fumo',
    content: 'È [FUMO_CONSENTITO] fumare all\'interno dell\'immobile. La violazione di questa norma può comportare costi aggiuntivi per la pulizia.',
    required: false,
    category: 'special',
    editable: true,
  },
];

export const contractTemplates: ContractTemplate[] = [
  {
    id: 'standard_residential',
    name: 'Contratto Residenziale Standard',
    description: 'Contratto di locazione completo per affitti residenziali a lungo termine',
    category: 'residential',
    basicClauses: basicClauses.filter(clause => 
      ['property_description', 'rental_period', 'monthly_rent', 'security_deposit', 'maintenance', 'termination'].includes(clause.id)
    ),
    clauses: `CONTRATTO DI LOCAZIONE RESIDENZIALE

Tra il/la Sig./Sig.ra [NOME_LOCATORE], nato/a a [LUOGO_NASCITA_LOCATORE] il [DATA_NASCITA_LOCATORE], residente in [RESIDENZA_LOCATORE], C.F. [CF_LOCATORE] (di seguito "Locatore")

e

il/la Sig./Sig.ra [NOME_CONDUTTORE], nato/a a [LUOGO_NASCITA_CONDUTTORE] il [DATA_NASCITA_CONDUTTORE], residente in [RESIDENZA_CONDUTTORE], C.F. [CF_CONDUTTORE] (di seguito "Conduttore")

si stipula il presente contratto di locazione:

1. OGGETTO
L'immobile sito in [INDIRIZZO] composto da [STANZE] stanze, [BAGNI] bagni, con una superficie di [SUPERFICIE] mq.

2. DURATA
Il contratto ha durata dal [DATA_INIZIO] al [DATA_FINE] per complessivi [DURATA_MESI] mesi.

3. CANONE
Il canone mensile è di €[CANONE_MENSILE] da versare entro il giorno 5 di ogni mese.

4. DEPOSITO CAUZIONALE
È versato un deposito cauzionale di €[DEPOSITO] a garanzia degli obblighi contrattuali.

5. MANUTENZIONE
La manutenzione ordinaria è a carico del conduttore, quella straordinaria del locatore.

6. RISOLUZIONE
Il contratto può essere risolto con preavviso di 30 giorni.

7. FORO COMPETENTE
Per ogni controversia è competente il Foro di [FORO_COMPETENTE].

Data: [DATA_CONTRATTO]

Firma Locatore: ________________    Firma Conduttore: ________________`,
  },
  {
    id: 'student_housing',
    name: 'Contratto per Studenti',
    description: 'Contratto specifico per alloggi studenteschi con termini flessibili',
    category: 'student',
    basicClauses: basicClauses.filter(clause => 
      ['property_description', 'rental_period', 'monthly_rent', 'security_deposit', 'utilities', 'termination'].includes(clause.id)
    ),
    clauses: `CONTRATTO DI LOCAZIONE PER STUDENTI

Tra il/la Sig./Sig.ra [NOME_LOCATORE] (Locatore) e il/la Sig./Sig.ra [NOME_STUDENTE] (Studente)

1. ALLOGGIO STUDENTESCO
Alloggio per studenti sito in [INDIRIZZO] composto da [STANZE] stanze con aree comuni condivise.

2. ANNO ACCADEMICO
Il contratto è valido per l'anno accademico dal [DATA_INIZIO] al [DATA_FINE]. Risoluzione anticipata consentita per motivi di studio con 60 giorni di preavviso.

3. CANONE MENSILE
Canone mensile di €[CANONE_MENSILE] comprensivo di utenze e internet. Pagamento entro il 1° di ogni mese.

4. DEPOSITO CAUZIONALE
Deposito cauzionale di €[DEPOSITO] rimborsabile al termine del contratto.

5. SPAZI COMUNI
Accesso a cucina, soggiorno e lavanderia condivisi. Uso rispettoso richiesto.

6. ORARI DI SILENZIO
Orari di silenzio dalle 22:00 alle 08:00. Rumori eccessivi possono causare risoluzione del contratto.

7. REQUISITI ACCADEMICI
Lo studente deve mantenere lo status di studente attivo. Certificato di iscrizione richiesto annualmente.

Data: [DATA_CONTRATTO]

Firma Locatore: ________________    Firma Studente: ________________`,
  },
  {
    id: 'short_term_rental',
    name: 'Short-Term Rental Agreement',
    description: 'For rentals under 6 months, vacation rentals, or temporary stays',
    category: 'short_term',
    basicClauses: basicClauses.filter(clause => 
      ['property_description', 'rental_period', 'monthly_rent', 'security_deposit', 'utilities'].includes(clause.id)
    ),
    clauses: `SHORT-TERM RENTAL AGREEMENT

1. PROPERTY DESCRIPTION
Furnished accommodation at [ADDRESS] available for short-term rental.

2. RENTAL PERIOD
Rental period from [START_DATE] to [END_DATE]. Maximum stay of 6 months.

3. RENTAL PAYMENT
Total rent of €[MONTHLY_RENT] payable in advance. No monthly payments required.

4. SECURITY DEPOSIT
Security deposit of €[DEPOSIT] required upon check-in. Refunded within 7 days of check-out.

5. FURNISHED ACCOMMODATION
Property is fully furnished. Tenant responsible for any damage to furnishings.

6. UTILITIES INCLUDED
All utilities, internet, and basic amenities included in rental price.

7. CHECK-IN/CHECK-OUT
Check-in after 3 PM, check-out before 11 AM. Key handover required.`,
  },
  {
    id: 'room_sharing',
    name: 'Room Sharing Agreement',
    description: 'For shared rooms or co-living arrangements',
    category: 'residential',
    basicClauses: basicClauses.filter(clause => 
      ['property_description', 'rental_period', 'monthly_rent', 'security_deposit', 'maintenance', 'subletting'].includes(clause.id)
    ),
    clauses: `ROOM SHARING AGREEMENT

1. SHARED ACCOMMODATION
Shared room/apartment at [ADDRESS] with common areas including kitchen, bathroom, and living space.

2. RENTAL PERIOD
Lease from [START_DATE] to [END_DATE] with option to renew.

3. MONTHLY RENT
Monthly rent of €[MONTHLY_RENT] includes shared utilities. Individual responsibility for personal expenses.

4. SECURITY DEPOSIT
Security deposit of €[DEPOSIT] per tenant. Joint responsibility for common area damages.

5. HOUSE RULES
Respectful cohabitation required. Cleaning schedule and house rules to be agreed upon.

6. PERSONAL BELONGINGS
Each tenant responsible for their personal belongings. Shared items require mutual agreement.

7. GUEST POLICY
Overnight guests allowed with prior notice to roommates. Maximum 3 nights per week.`,
  },
  {
    id: 'commercial_lease',
    name: 'Commercial Lease Agreement',
    description: 'For business and commercial property rentals',
    category: 'commercial',
    basicClauses: basicClauses.filter(clause => 
      ['property_description', 'rental_period', 'monthly_rent', 'security_deposit', 'maintenance'].includes(clause.id)
    ),
    clauses: `COMMERCIAL LEASE AGREEMENT

1. COMMERCIAL PROPERTY
Commercial space at [ADDRESS] with [AREA] square meters for business use.

2. LEASE TERM
Commercial lease from [START_DATE] to [END_DATE]. Minimum 2-year term required.

3. MONTHLY RENT
Base rent of €[MONTHLY_RENT] plus applicable taxes and fees. Annual rent increases of 3%.

4. SECURITY DEPOSIT
Security deposit equivalent to 3 months rent (€[DEPOSIT]) required.

5. PERMITTED USE
Property to be used for [BUSINESS_TYPE] only. No residential use permitted.

6. MAINTENANCE
Tenant responsible for interior maintenance. Landlord responsible for structural repairs.

7. INSURANCE
Tenant must maintain commercial liability insurance with minimum €1M coverage.`,
  },
];

export const additionalClauses: ContractClause[] = [
  {
    id: 'parking',
    title: 'Parking',
    content: 'Parking space [PARKING_DETAILS] is included/not included in the rental. Additional parking fees may apply.',
    required: false,
    category: 'special',
    editable: true,
  },
  {
    id: 'internet',
    title: 'Internet & Cable',
    content: 'High-speed internet and cable TV are [INTERNET_INCLUDED]. Installation and monthly fees are the responsibility of [RESPONSIBLE_PARTY].',
    required: false,
    category: 'special',
    editable: true,
  },
  {
    id: 'laundry',
    title: 'Laundry Facilities',
    content: 'Laundry facilities are [LAUNDRY_AVAILABLE] on the premises. Usage fees may apply.',
    required: false,
    category: 'special',
    editable: true,
  },
  {
    id: 'storage',
    title: 'Storage Space',
    content: 'Additional storage space [STORAGE_DETAILS] is available for an additional monthly fee of €[STORAGE_FEE].',
    required: false,
    category: 'special',
    editable: true,
  },
  {
    id: 'renovation',
    title: 'Renovation Policy',
    content: 'Tenant modifications or renovations require written landlord approval. All changes must be restored upon lease termination.',
    required: false,
    category: 'maintenance',
    editable: true,
  },
  {
    id: 'insurance_requirement',
    title: 'Renter\'s Insurance',
    content: 'Tenant must maintain renter\'s insurance with minimum coverage of €[INSURANCE_AMOUNT]. Proof of insurance required annually.',
    required: false,
    category: 'special',
    editable: true,
  },
  {
    id: 'noise_policy',
    title: 'Noise Policy',
    content: 'Quiet hours from [QUIET_START] to [QUIET_END]. Excessive noise complaints may result in lease termination.',
    required: false,
    category: 'special',
    editable: true,
  },
  {
    id: 'emergency_contact',
    title: 'Emergency Contact',
    content: 'Tenant must provide emergency contact information. Landlord contact for emergencies: [EMERGENCY_CONTACT].',
    required: false,
    category: 'basic',
    editable: true,
  },
];
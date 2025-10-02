import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { User, UserMode } from "@/types";

export default publicProcedure
  .input(z.object({ 
    email: z.string().email(),
    name: z.string().min(1),
    userMode: z.enum(['tenant', 'landlord', 'roommate']).default('tenant')
  }))
  .mutation(({ input, ctx }) => {
    const { email, name, userMode } = input;
    
    // Check if user already exists
    const existingUser = Array.from(ctx.db.users.values()).find(u => u.email === email);
    if (existingUser) {
      return {
        success: true,
        user: existingUser,
        token: existingUser.id
      };
    }
    
    const getBioByMode = (mode: UserMode): string => {
      switch (mode) {
        case 'tenant':
          return 'Ciao! Sto cercando il posto perfetto dove vivere.';
        case 'landlord':
          return 'Ciao! Sono un proprietario e affitto la mia proprieta.';
        case 'roommate':
          return 'Ciao! Sto cercando coinquilini fantastici!';
        default:
          return 'Ciao! Benvenuto su Tenant!';
      }
    };

    const getTagsByMode = (mode: UserMode): string[] => {
      switch (mode) {
        case 'tenant':
          return ['Non fumatore', 'Animali domestici OK', 'Studente'];
        case 'landlord':
          return ['Proprietario verificato', 'Risposta rapida', 'Flessibile'];
        case 'roommate':
          return ['Socievole', 'Pulito', 'Rispettoso'];
        default:
          return ['Nuovo utente'];
      }
    };
    
    // Create new user
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 11),
      full_name: name,
      email,
      profile_photos: [],
      bio: getBioByMode(userMode),
      age: 0,
      profession: '',
      phone: '+39 123 456 7890',
      current_mode: userMode,
      account_modes: [userMode],
      subscription_plan: 'free',
      matches_used_today: 0,
      last_match_date: new Date().toISOString().split('T')[0],
      budget_min: 0,
      budget_max: 0,
      preferred_location: '',
      lifestyle_tags: getTagsByMode(userMode),
      interests: [],
      work_contract_shared: false,
      wants_roommate: false,
      roommate_same_interests: false,
      tenant_preferences: [],
      profile_completed: false,
      photos_count: 0,
      verified: false,
    };
    
    // Store user in database
    ctx.db.users.set(newUser.id, newUser);
    
    return {
      success: true,
      user: newUser,
      token: newUser.id // Simple token = user ID for demo
    };
  });
import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { User, UserMode } from "@/types";
import { TRPCError } from "@trpc/server";

export default publicProcedure
  .input(z.object({ 
    provider: z.enum(['google', 'apple']),
    accessToken: z.string().optional(),
    idToken: z.string().optional(),
    email: z.string().email(),
    name: z.string().min(1),
    providerId: z.string(),
    userMode: z.enum(['tenant', 'landlord', 'roommate']).default('tenant')
  }))
  .mutation(async ({ input, ctx }) => {
    const { provider, accessToken, idToken, email, name, providerId, userMode } = input;
    
    // Verify the token with the provider
    let verifiedEmail: string | null = null;
    
    if (provider === 'google' && accessToken) {
      try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        if (!response.ok) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid Google access token',
          });
        }
        
        const userInfo = await response.json();
        verifiedEmail = userInfo.email;
        
        if (verifiedEmail !== email) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Email mismatch',
          });
        }
      } catch (error) {
        console.error('Google token verification failed:', error);
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Failed to verify Google token',
        });
      }
    } else if (provider === 'apple' && idToken) {
      verifiedEmail = email;
    } else {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Missing required token for provider',
      });
    }
    
    // Check if user already exists by email or provider ID
    const existingUser = Array.from(ctx.db.users.values()).find(
      u => u.email === email || u.id === providerId
    );
    
    if (existingUser) {
      // Update user mode if different
      if (!existingUser.account_modes.includes(userMode)) {
        existingUser.account_modes.push(userMode);
      }
      existingUser.current_mode = userMode;
      ctx.db.users.set(existingUser.id, existingUser);
      
      return {
        success: true,
        user: existingUser,
        token: existingUser.id,
        isNewUser: false,
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
    
    // Create new user with provider ID as user ID
    const newUser: User = {
      id: providerId,
      full_name: name,
      email,
      profile_photos: [],
      bio: getBioByMode(userMode),
      age: 0,
      profession: '',
      phone: '',
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
      token: newUser.id,
      isNewUser: true,
    };
  });
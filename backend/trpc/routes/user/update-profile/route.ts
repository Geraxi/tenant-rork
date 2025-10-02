import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { User } from "@/types";

export default protectedProcedure
  .input(z.object({
    full_name: z.string().optional(),
    bio: z.string().optional(),
    age: z.number().optional(),
    profession: z.string().optional(),
    phone: z.string().optional(),
    budget_min: z.number().optional(),
    budget_max: z.number().optional(),
    preferred_location: z.string().optional(),
    lifestyle_tags: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
    profile_photos: z.array(z.string()).optional(),
    work_contract_shared: z.boolean().optional(),
    wants_roommate: z.boolean().optional(),
    roommate_same_interests: z.boolean().optional(),
  }))
  .mutation(({ input, ctx }) => {
    const user = ctx.db.users.get(ctx.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Update user with provided fields
    const updatedUser: User = {
      ...user,
      ...input,
      profile_completed: true,
      photos_count: input.profile_photos?.length ?? user.photos_count,
    };
    
    // Store updated user
    ctx.db.users.set(ctx.userId, updatedUser);
    
    return {
      success: true,
      user: updatedUser
    };
  });
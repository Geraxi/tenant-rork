import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { UserMode } from "@/types";

export default protectedProcedure
  .input(z.object({
    mode: z.enum(['tenant', 'landlord', 'roommate'])
  }))
  .mutation(({ input, ctx }) => {
    const user = ctx.db.users.get(ctx.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const updatedUser = { 
      ...user, 
      current_mode: input.mode as UserMode,
      account_modes: user.account_modes.includes(input.mode as UserMode) 
        ? user.account_modes 
        : [...user.account_modes, input.mode as UserMode]
    };
    
    ctx.db.users.set(ctx.userId, updatedUser);
    
    return {
      success: true,
      user: updatedUser
    };
  });
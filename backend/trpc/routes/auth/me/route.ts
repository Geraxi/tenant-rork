import { protectedProcedure } from "@/backend/trpc/create-context";

export default protectedProcedure
  .query(({ ctx }) => {
    const user = ctx.db.users.get(ctx.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      success: true,
      user
    };
  });
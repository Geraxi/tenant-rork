import { protectedProcedure } from "@/backend/trpc/create-context";

export const getVerificationStatusProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const userId = ctx.userId;
    const user = ctx.db.users.get(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    console.log('Getting verification status for user:', userId);
    console.log('User verification status:', user.verification_status);
    console.log('User verified:', user.verified);

    return {
      verified: user.verified || false,
      status: user.verification_status || null,
      submittedAt: user.verification_submitted_at || null,
    };
  });
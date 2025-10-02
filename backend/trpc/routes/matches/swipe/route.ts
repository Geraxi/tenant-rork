import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { Match, MatchType, MatchStatus } from "@/types";

export default protectedProcedure
  .input(z.object({
    targetUserId: z.string().optional(),
    propertyId: z.string().optional(),
    matchType: z.enum(['property_interest', 'tenant_landlord', 'roommate']),
    action: z.enum(['like', 'pass'])
  }))
  .mutation(({ input, ctx }) => {
    const user = ctx.db.users.get(ctx.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    if (input.action === 'pass') {
      return { success: true, matched: false };
    }
    
    // Check if user can swipe (subscription limits)
    const today = new Date().toISOString().split('T')[0];
    if (user.subscription_plan === 'free') {
      if (user.last_match_date === today && user.matches_used_today >= 10) {
        throw new Error('Daily swipe limit reached. Upgrade to continue.');
      }
    }
    
    // Create match
    const matchId = Math.random().toString(36).substring(2, 11);
    const newMatch: Match = {
      id: matchId,
      user1_id: ctx.userId,
      user2_id: input.targetUserId || '',
      property_id: input.propertyId,
      match_type: input.matchType as MatchType,
      compatibility_score: Math.floor(Math.random() * 40) + 60, // 60-100%
      status: 'active' as MatchStatus,
      created_at: new Date().toISOString(),
    };
    
    ctx.db.matches.set(matchId, newMatch);
    
    // Update user swipe count
    const updatedUser = {
      ...user,
      matches_used_today: user.last_match_date === today ? user.matches_used_today + 1 : 1,
      last_match_date: today,
    };
    ctx.db.users.set(ctx.userId, updatedUser);
    
    return {
      success: true,
      matched: true,
      match: newMatch
    };
  });
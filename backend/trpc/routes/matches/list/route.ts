import { protectedProcedure } from "@/backend/trpc/create-context";

export default protectedProcedure
  .query(({ ctx }) => {
    const user = ctx.db.users.get(ctx.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Get matches where user is involved
    const userMatches = Array.from(ctx.db.matches.values())
      .filter(match => 
        match.user1_id === ctx.userId || 
        match.user2_id === ctx.userId
      )
      .filter(match => match.status === 'active');
    
    // Get match details with user/property info
    const matchesWithDetails = userMatches.map(match => {
      const otherUserId = match.user1_id === ctx.userId ? match.user2_id : match.user1_id;
      const otherUser = ctx.db.users.get(otherUserId);
      const property = match.property_id ? ctx.db.properties.get(match.property_id) : null;
      
      return {
        ...match,
        otherUser,
        property
      };
    });
    
    return {
      success: true,
      matches: matchesWithDetails
    };
  });
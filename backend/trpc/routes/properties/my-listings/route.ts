import { protectedProcedure } from "@/backend/trpc/create-context";

export default protectedProcedure
  .query(({ ctx }) => {
    const user = ctx.db.users.get(ctx.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.current_mode !== 'landlord') {
      throw new Error('Only landlords can view their properties');
    }
    
    // Get properties created by this user
    const userProperties = Array.from(ctx.db.properties.values())
      .filter(property => property.created_by === user.email);
    
    return {
      success: true,
      properties: userProperties
    };
  });
import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { Message } from "@/types";

export default protectedProcedure
  .input(z.object({
    matchId: z.string(),
    content: z.string().min(1)
  }))
  .mutation(({ input, ctx }) => {
    const user = ctx.db.users.get(ctx.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Verify match exists and user is part of it
    const match = ctx.db.matches.get(input.matchId);
    if (!match) {
      throw new Error('Match not found');
    }
    
    if (match.user1_id !== ctx.userId && match.user2_id !== ctx.userId) {
      throw new Error('You are not part of this match');
    }
    
    // Create message
    const messageId = Math.random().toString(36).substring(2, 11);
    const newMessage: Message = {
      id: messageId,
      match_id: input.matchId,
      sender_id: ctx.userId,
      content: input.content,
      read: false,
      created_at: new Date().toISOString(),
    };
    
    ctx.db.messages.set(messageId, newMessage);
    
    return {
      success: true,
      message: newMessage
    };
  });
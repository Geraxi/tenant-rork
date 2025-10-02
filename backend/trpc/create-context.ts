import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { User } from "@/types";

// In-memory database simulation
export const db = {
  users: new Map<string, User>(),
  properties: new Map<string, any>(),
  matches: new Map<string, any>(),
  messages: new Map<string, any>(),
};

// Context creation function
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  // Extract user ID from Authorization header if present
  const authHeader = opts.req.headers.get('authorization');
  let userId: string | null = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    userId = authHeader.substring(7); // Remove 'Bearer ' prefix
  }
  
  return {
    req: opts.req,
    userId,
    db,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});
import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

console.log('🚀 Hono server initializing...');

app.use("*", cors());

app.use("*", async (c, next) => {
  console.log('📥 Incoming request:', c.req.method, c.req.url, c.req.path);
  await next();
  console.log('📤 Response status:', c.res.status);
});

app.get("/", (c) => {
  console.log('✅ Health check endpoint hit');
  return c.json({ status: "ok", message: "API is running" });
});

app.get("/api", (c) => {
  console.log('✅ API root endpoint hit');
  return c.json({ status: "ok", message: "API root" });
});

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      console.error('❌ tRPC error on path:', path);
      console.error('❌ Error:', error);
    },
  })
);

app.all("*", (c) => {
  console.log('⚠️ Unmatched route:', c.req.method, c.req.url, c.req.path);
  return c.json({ error: "Not found", path: c.req.url, method: c.req.method }, 404);
});

console.log('✅ Hono server configured');

export default app;
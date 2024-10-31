import { defineConfig } from "drizzle-kit";

const authToken = Deno.env.get("DB_AUTH_TOKEN");
const dbCredentials = {
  url: Deno.env.get("DB_URL")!,
  ...(authToken != null ? { authToken } : {}),
};

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "turso",
  dbCredentials,
});

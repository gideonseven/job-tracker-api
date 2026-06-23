import { defineConfig } from "drizzle-kit";
import "dotenv/config"; // load .env so DATABASE_URL is available locally too

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Use DATABASE_URL when set (production/Railway, or manually exported locally).
    // Falls back to local Postgres connection if DATABASE_URL is not set.
    url: process.env["DATABASE_URL"] || "postgresql://gideon:localdev@localhost:5432/job_tracker",
  },
});
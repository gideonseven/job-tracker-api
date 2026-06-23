import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";

// In production (Railway), DATABASE_URL is set automatically.
// Locally, it's undefined, so we fall back to individual host/port vars.
const pool = process.env["DATABASE_URL"]
  ? new pg.Pool({
      connectionString: process.env["DATABASE_URL"], // single connection string from Railway
      ssl: { rejectUnauthorized: false }, // Railway's internal Postgres uses a self-signed cert
    })
  : new pg.Pool({
      host: process.env["DATABASE_HOST"], // local dev — from .env
      port: parseInt(process.env["DATABASE_PORT"] || "5432"),
      user: process.env["DATABASE_USER"],
      password: process.env["DATABASE_PASSWORD"],
      database: process.env["DATABASE_NAME"],
    });

export const db = drizzle(pool, { schema });
export default pool;
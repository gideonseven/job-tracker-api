import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";

const pool = new pg.Pool({
  host: "localhost",
  port: 5432,
  user: "gideon",
  password: "localdev",
  database: "job_tracker",
});

export const db = drizzle(pool, { schema });
export default pool;
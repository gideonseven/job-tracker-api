import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        host: "localhost",
        port: 5432,
        user: "gideon",
        password: "localdev",
        database: "job_tracker",
    },
});
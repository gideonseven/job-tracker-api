import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

//setup schema for Drizzle ORM to create the applications table in the database
export const applications = pgTable("applications",{
    id: serial("id").primaryKey(),
    company: text("company").notNull(),
    role: text("role").notNull(),
    status: text("status").notNull().default("Applied"),
    appliedDate: text("applied_date").notNull(),
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
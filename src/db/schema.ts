import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

//setup schema for Drizzle ORM to create the applications table in the database
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id), // ← NEW: links application to its owner
  company: text("company").notNull(),
  role: text("role").notNull(),
  status: text("status").notNull().default("Applied"),
  appliedDate: text("applied_date").notNull(),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
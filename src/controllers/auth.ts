import type {Request, Response} from "express";
import bcrypt from "bcrypt";
import {db } from "../db/index.js";
import {users} from "../db/schema.js";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { signupSchema, loginSchema } from "../schemas/auth.js";

export async function signup(req: Request, res: Response): Promise<void> {
  // Validate input
 const parsed = signupSchema.safeParse(req.body);
if (!parsed.success) {
  res.status(400).json({ error: "Invalid input" });
  return;
}

  const { email, password } = parsed.data;

  // Check if user already exists
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  // Hash password and create user
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await db.insert(users).values({
    email,
    password: hashedPassword,
  }).returning();

  const user = result[0]!;
  res.status(201).json({ id: user.id, email: user.email });
}

export async function login(req: Request, res: Response): Promise<void> {
  // Validate input
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message
 || "Invalid input" });
    return;
  }

  const { email, password } = parsed.data;

  // Find user
  const result = await db.select().from(users).where(eq(users.email, email));
  if (result.length === 0) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const user = result[0]!;

  // Verify password
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  // Create token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env["JWT_SECRET"]!,
    { expiresIn: "7d" }
  );

  res.json({ token });
}
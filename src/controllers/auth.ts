import type {Request, Response} from "express";
import bcrypt from "bcrypt";
import {db } from "../db/index.js";
import {users} from "../db/schema.js";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

export async function signup(req: Request, res: Response): Promise<void>{
    const{ email, password } = req.body;

   // Basic validation
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

   // Check if user already exists
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  // Hash password — 10 salt rounds
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user with hashed password
  const result = await db.insert(users).values({
    email,
    password: hashedPassword,
  }).returning();

    // Return user without password
  const user = result[0]!;
  res.status(201).json({ id: user.id, email: user.email });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  // Find user by email
  const result = await db.select().from(users).where(eq(users.email, email));
  if (result.length === 0) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const user = result[0]!;

  // Verify password against hash
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  // Create JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env["JWT_SECRET"]!,
    { expiresIn: "7d" }
  );

  res.json({ token });
}
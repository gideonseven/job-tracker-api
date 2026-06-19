import type {Request, Response} from "express";
import {db} from "../db/index.js";
import {applications} from "../db/schema.js"; // schema definition, not data
import {and, eq} from "drizzle-orm"; // "equals" operator for WHERE clauses
import { applicationSchema } from "../schemas/application.js";

// GET /applications — return all applications from the database
export async function listApplications(
    req: Request,
    res: Response,
): Promise<void> {
    const {status, company} = req.query;

    // Pagination — default to page 1, 10 items per page
    const page = parseInt(req.query["page"] as string) || 1;
    const limit = parseInt(req.query["limit"] as string) || 10;
    const offset = (page - 1) * limit; // page 1 = skip 0, page 2 = skip 10

    // Build filter conditions
    const conditions = [];

    if (typeof status === "string") {
        conditions.push(eq(applications.status, status));
    }

    if (typeof company === "string") {
        conditions.push(eq(applications.company, company));
    }

    const result = await db
        .select()
        .from(applications)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(applications.id) // consistent ordering — newest last
        .limit(limit)
        .offset(offset);

    res.json({
        data: result,
        page,
        limit,
        count: result.length,
    });
}

// GET /applications/:id — return a single application by ID
export async function getApplication(
    req: Request,
    res: Response,
): Promise<void> {
    const id = parseInt(req.params["id"] as string); // route params are strings, convert to number
    const result = await db
        .select()
        .from(applications)
        .where(eq(applications.id, id)); // WHERE id = ?

    if (result.length === 0) {
        res.status(404).json({error: "Application not found"});
        return;
    }

    res.json(result[0]); // result is always an array, grab the first (and only) row
}

// POST /applications — create a new application
export async function createApplication(req: Request, res: Response): Promise<void> {
  // Validate input
  const parsed = applicationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message || "Invalid input" });
    return;
  }

  const { company, role, status, appliedDate, notes } = parsed.data;

  const result = await db.insert(applications).values({
    company,
    role,
    status,
    appliedDate,
    notes,
  }).returning();

  res.status(201).json(result[0]);
}
// PUT /applications/:id — update an existing application
export async function updateApplication(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params["id"] as string);

  // Validate input
  const parsed = applicationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message || "Invalid input" });
    return;
  }

  const result = await db.update(applications)
    .set(parsed.data)
    .where(eq(applications.id, id))
    .returning();

  if (result.length === 0) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json(result[0]);
}

// DELETE /applications/:id — remove an application
export async function deleteApplication(
    req: Request,
    res: Response,
): Promise<void> {
    const id = parseInt(req.params["id"] as string);

    // .returning() tells us if a row was actually deleted
    const result = await db
        .delete(applications)
        .where(eq(applications.id, id))
        .returning();

    if (result.length === 0) {
        res.status(404).json({error: "Application not found"});
        return;
    }

    res.status(204).send(); // 204 = No Content, standard for successful DELETE
}

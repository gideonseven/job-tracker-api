import type {Request, Response} from "express";
import {db} from "../db/index.js";
import {applications} from "../db/schema.js"; // schema definition, not data
import {and, eq} from "drizzle-orm"; // "equals" operator for WHERE clauses
import { applicationSchema } from "../schemas/application.js";

// GET /applications — return all applications belonging to the logged-in user
export async function listApplications(
    req: Request,
    res: Response,
): Promise<void> {
    const {status, company} = req.query;
    const userId = req.user!.userId; // set by auth middleware

    // Pagination — default to page 1, 10 items per page
    const page = parseInt(req.query["page"] as string) || 1;
    const limit = parseInt(req.query["limit"] as string) || 10;
    const offset = (page - 1) * limit; // page 1 = skip 0, page 2 = skip 10

    // Always scope to the current user — this is what makes data "theirs"
    const conditions = [eq(applications.userId, userId)];

    if (typeof status === "string") {
        conditions.push(eq(applications.status, status));
    }

    if (typeof company === "string") {
        conditions.push(eq(applications.company, company));
    }

    const result = await db
        .select()
        .from(applications)
        .where(and(...conditions))
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

// GET /applications/:id — return a single application, only if it belongs to this user
export async function getApplication(
    req: Request,
    res: Response,
): Promise<void> {
    const id = parseInt(req.params["id"] as string); // route params are strings, convert to number
    const userId = req.user!.userId;

    const result = await db
        .select()
        .from(applications)
        // both conditions must match: right id AND owned by this user
        .where(and(eq(applications.id, id), eq(applications.userId, userId)));

    if (result.length === 0) {
        res.status(404).json({error: "Application not found"});
        return;
    }

    res.json(result[0]); // result is always an array, grab the first (and only) row
}

// POST /applications — create a new application, owned by the logged-in user
export async function createApplication(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;

  // Validate input
  const parsed = applicationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input" });
    return;
  }

  const { company, role, status, appliedDate, notes } = parsed.data;

  const result = await db.insert(applications).values({
    userId, // tag this row with the creator's user id
    company,
    role,
    status,
    appliedDate,
    notes,
  }).returning();

  res.status(201).json(result[0]);
}

// PUT /applications/:id — update an application, only if it belongs to this user
export async function updateApplication(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params["id"] as string);
  const userId = req.user!.userId;

  // Validate input
  const parsed = applicationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message
 || "Invalid input" });
    return;
  }

  const result = await db.update(applications)
    .set(parsed.data)
    .where(and(eq(applications.id, id), eq(applications.userId, userId)))
    .returning();

  if (result.length === 0) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json(result[0]);
}

// DELETE /applications/:id — remove an application, only if it belongs to this user
export async function deleteApplication(
    req: Request,
    res: Response,
): Promise<void> {
    const id = parseInt(req.params["id"] as string);
    const userId = req.user!.userId;

    // .returning() tells us if a row was actually deleted
    const result = await db
        .delete(applications)
        .where(and(eq(applications.id, id), eq(applications.userId, userId)))
        .returning();

    if (result.length === 0) {
        res.status(404).json({error: "Application not found"});
        return;
    }

    res.status(204).send(); // 204 = No Content, standard for successful DELETE
}
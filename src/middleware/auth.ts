import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: number;
  email: string;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers["authorization"];

  if (!header) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  // Extract token from "Bearer <token>"
  const token = header.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Invalid token format" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env["JWT_SECRET"]!) as JwtPayload;

    // Attach user data to the request for controllers to use
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
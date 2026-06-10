import type { Request, Response, NextFunction } from "express";
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function errorHandler(
    err: Error & { type?: string },
    _req: Request,
    res: Response,
    _next: NextFunction,
): void {
    console.error(`[ERROR] ${err.message}`);

    // Handle JSON parse errors (bad request body)
    if (err.type === "entity.parse.failed") {
        res.status(400).json({ error: "Invalid JSON in request body" });
        return;
    }

    // Default: internal server error
    res.status(500).json({ error: "Internal server error" });
}

//handle error for inside controller code
export function asyncWrapper(fn: AsyncHandler) {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
}
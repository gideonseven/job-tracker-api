import express from "express"; //imports the framework
import morgan from "morgan"; //imports the logging middleware
import applicationRoutes from "./routes/applications.js"; //imports the application routes
import { errorHandler } from "./middleware/errorHandler.js";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import { authenticate } from "./middleware/auth.js";

const app = express(); //creates an app instance
app.use(express.json()); // middleware that parses JSON request bodies.
app.use(cors());
app.use(morgan("dev")); // middleware that logs HTTP requests in development format

app.get("/health", (_req, res) => {
    res.json({ status: "ok" }); //health check endpoint
});

// Public routes — no auth needed
app.use("/auth", authRoutes);

// Protected routes — auth required
app.use("/applications", authenticate, applicationRoutes);

app.use(errorHandler);
export default app; //makes it importable by server.ts
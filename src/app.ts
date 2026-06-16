import express from "express"; //imports the framework
import morgan from "morgan"; //imports the logging middleware
import applicationRoutes from "./routes/applications.js"; //imports the application routes
import { errorHandler } from "./middleware/errorHandler.js";
import cors from "cors";
import authRoutes from "./routes/auth.js";

const app = express(); //creates an app instance
app.use(express.json()); // middleware that parses JSON request bodies.
app.use(cors());
app.use(morgan("dev")); // middleware that logs HTTP requests in development format

app.get("/health", (_req, res) => {
    res.json({ status: "ok" }); //health check endpoint
});

app.use("/applications", applicationRoutes); //mounts the application routes at /applications
app.use("/auth", authRoutes);
app.use(errorHandler);
export default app; //makes it importable by server.ts
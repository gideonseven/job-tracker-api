import express from "express"; //imports the framework

const app = express(); //creates an app instance
app.use(express.json()); // middleware that parses JSON request bodies.

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/applications", (_req, res) => {
  res.json(applications);
});

interface Application {
  id: number;
  company: string;
  role: string;
  status: string;
  appliedDate: string;
  notes: string;
}

const applications: Application[] = [
  {
    id: 1,
    company: "BetterLabs",
    role: "Software Engineer",
    status: "Applied",
    appliedDate: "2026-05-15",
    notes: "Perth-based, Town Square product",
  },
  {
    id: 2,
    company: "Canva",
    role: "Android Engineer",
    status: "Applied",
    appliedDate: "2026-05-18",
    notes: "Sydney office",
  },
]; // In-memory storage for job applications

export default app; //makes it importable by server.ts

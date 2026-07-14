import app from "./app.js"; //imports the app instance from app.ts
import pool from "./db/index.js"; //imports the database connection pool from db/index.ts
import { pollGmail } from "./services/gmailPoller.js";

const PORT = 3000;

app.listen(PORT, async() => {
  const result = await pool.query("SELECT NOW()"); //test the database connection
  console.log(`Database connected: ${result.rows[0]?.now}`);
  console.log(`Server is running on port ${PORT}`);
});

// Run Gmail poller on startup
pollGmail();

// Then poll every 15 minutes
const FIFTEEN_MINUTES = 15 * 60 * 1000;
setInterval(pollGmail, FIFTEEN_MINUTES);
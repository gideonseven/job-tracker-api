import dotenv from "dotenv";
import { google } from "googleapis";
dotenv.config();

const GROQ_API_KEY = process.env["GROQ_API_KEY"];

// --- Gmail setup ---
const oauth2Client = new google.auth.OAuth2(
  process.env["GOOGLE_CLIENT_ID"],
  process.env["GOOGLE_CLIENT_SECRET"],
  "http://localhost"
);

oauth2Client.setCredentials({
  refresh_token: process.env["GOOGLE_REFRESH_TOKEN"],
});

const gmail = google.gmail({ version: "v1", auth: oauth2Client });

// Fetch first matching email
const res = await gmail.users.messages.list({
  userId: "me",
  q: "subject:thank you for applying OR subject:application received OR subject:we received your application",
  maxResults: 1,
});

const messages = res.data.messages || [];
if (messages.length === 0) {
  console.log("No matching emails found");
  process.exit(0);
}

const msg = await gmail.users.messages.get({
  userId: "me",
  id: messages[0].id,
  format: "full",
});

const snippet = msg.data.snippet;
console.log("Email snippet:");
console.log(snippet);
console.log("\n");

// --- Groq parsing ---
const prompt = `Extract job application details from this email snippet.
Return ONLY a JSON object with these fields:
- company (string or null if not found)
- role (string or null if not found)
- appliedDate (today's date in YYYY-MM-DD format)

Email:
${snippet}

Return only the JSON object, no explanation, no markdown backticks.`;

const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${GROQ_API_KEY}`,
  },
  body: JSON.stringify({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  }),
});

const data = await response.json();
const text = data.choices?.[0]?.message?.content;

console.log("Raw Groq response:", text);

try {
  const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
  console.log("\nParsed result:");
  console.log(parsed);
} catch {
  console.log("Could not parse as JSON");
}
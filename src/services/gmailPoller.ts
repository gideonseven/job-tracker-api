import { google } from "googleapis";
import { db } from "../db/index.js";
import { applications } from "../db/schema.js";
import { eq } from "drizzle-orm";

// --- Gmail client setup ---
const oauth2Client = new google.auth.OAuth2(
  process.env["GOOGLE_CLIENT_ID"],
  process.env["GOOGLE_CLIENT_SECRET"],
  "http://localhost"
);

oauth2Client.setCredentials({
  refresh_token: process.env["GOOGLE_REFRESH_TOKEN"],
});

const gmail = google.gmail({ version: "v1", auth: oauth2Client });

// --- Parse email with Groq ---
async function parseEmailWithAI(snippet: string): Promise<{
  company: string | null;
  role: string | null;
  appliedDate: string;
} | null> {
  const today = new Date().toISOString().split("T")[0];

  const prompt = `Extract job application details from this email snippet.
Return ONLY a JSON object with these fields:
- company (string or null if not found)
- role (string or null if not found)
- appliedDate (today's date: ${today})

Email:
${snippet}

Return only the JSON object, no explanation, no markdown backticks.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env["GROQ_API_KEY"]}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    }),
  });

  const data = await response.json() as {
    choices?: { message?: { content?: string } }[];
  };

  const text = data.choices?.[0]?.message?.content;
  if (!text) return null;

  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    console.error("[GmailPoller] Could not parse AI response:", text);
    return null;
  }
}

// --- Main polling function ---
export async function pollGmail(): Promise<void> {
  console.log("[GmailPoller] Checking for new job emails...");

  const userId = parseInt(process.env["GMAIL_USER_ID"] || "0");
  if (!userId) {
    console.error("[GmailPoller] GMAIL_USER_ID not set");
    return;
  }

  try {
    const res = await gmail.users.messages.list({
      userId: "me",
      q: "subject:thank you for applying OR subject:application received OR subject:we received your application",
      maxResults: 10,
    });

    const messages = res.data.messages || [];
    console.log(`[GmailPoller] Found ${messages.length} matching emails`);

    for (const message of messages) {
      if (!message.id) continue;

      // Check if already imported — skip if gmailMessageId exists in DB
      const existing = await db
        .select()
        .from(applications)
        .where(eq(applications.gmailMessageId, message.id));

      if (existing.length > 0) {
        console.log(`[GmailPoller] Already imported ${message.id} — skipping`);
        continue;
      }

      // Fetch full message
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "full",
      });

      const snippet = msg.data.snippet;
      if (!snippet) continue;

      // Parse with AI
      const parsed = await parseEmailWithAI(snippet);
      if (!parsed) {
        console.warn(`[GmailPoller] Could not parse email ${message.id} — skipping`);
        continue;
      }

      if (!parsed.company) {
        console.warn(`[GmailPoller] No company found in email ${message.id} — skipping`);
        continue;
      }

      // Insert with gmailMessageId to prevent future duplicates
      await db.insert(applications).values({
        userId,
        company: parsed.company,
        role: parsed.role || "Unknown Role",
        status: "Applied",
        appliedDate: parsed.appliedDate,
        notes: `Auto-imported from Gmail`,
        gmailMessageId: message.id, // ← store the message ID
      });

      console.log(`[GmailPoller] Created: ${parsed.company} — ${parsed.role}`);
    }

    console.log("[GmailPoller] Done.");
  } catch (err) {
    console.error("[GmailPoller] Error:", err);
  }
}
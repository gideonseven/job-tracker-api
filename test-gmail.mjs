import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env["GOOGLE_CLIENT_ID"],
  process.env["GOOGLE_CLIENT_SECRET"],
  "urn:ietf:wg:oauth:2.0:oob"
);

// Set the refresh token — this lets us get new access tokens automatically
oauth2Client.setCredentials({
  refresh_token: process.env["GOOGLE_REFRESH_TOKEN"],
});

const gmail = google.gmail({ version: "v1", auth: oauth2Client });

// Search for recent job-related emails
const res = await gmail.users.messages.list({
  userId: "me",
  q: "subject:application OR subject:applied OR subject:thank you for applying",
  maxResults: 5,
});

const messages = res.data.messages || [];
console.log(`Found ${messages.length} matching emails\n`);

// Read the first one
if (messages.length > 0) {
 const msg = await gmail.users.messages.get({
  userId: "me",
  id: messages[0].id,
  format: "full", // ← was "snippet", must be "full", "metadata", or "minimal"
});

console.log("First email snippet:");
console.log(msg.data.snippet); // snippet is still available in the response data
}
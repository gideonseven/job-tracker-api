import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env["GEMINI_API_KEY"];

// Sample email snippet — similar to what Gmail API returns
const emailSnippet = `Thank you for applying to Senior Android Engineer at Canva. 
We have received your application and will be in touch soon.`;

const prompt = `Extract job application details from this email snippet. 
Return ONLY a JSON object with these fields:
- company (string or null if not found)
- role (string or null if not found)
- appliedDate (today's date in YYYY-MM-DD format)

Email:
${emailSnippet}

Return only the JSON object, no explanation, no markdown.`;

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  }
);

const data = await response.json();
console.log("Full response:", JSON.stringify(data, null, 2));
const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

console.log("Raw response:", text);

try {
  const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
  console.log("\nParsed result:");
  console.log(parsed);
} catch {
  console.log("Could not parse as JSON");
}
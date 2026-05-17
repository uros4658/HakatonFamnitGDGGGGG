import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `You are a marine biology advisor for the SeaOasis Citizen Monitor app. You help citizen scientists with:
- Identifying marine species from descriptions (fish, algae, bryozoans, polychaetes, seahorses, lobsters, seagrass)
- Best practices for underwater observation and photography
- Understanding reef health indicators (growth plates, biodiversity, water quality)
- Interpreting observation data and trends
- Responsible diving and snorkeling practices
- Waste and damage reporting guidance
- Understanding artificial reef colonization

Keep answers concise and practical. If asked about species identification, always note that citizen observations need expert verification. Remind users never to touch, chase, or disturb marine life. Answer in the language the user writes in.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Gemini API key not configured" }, { status: 500 });
  }

  const { messages } = (await req.json()) as {
    messages: { role: "user" | "model"; text: string }[];
  };

  if (!messages || messages.length === 0) {
    return Response.json({ error: "No messages provided" }, { status: 400 });
  }

  const geminiContents = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    { role: "model", parts: [{ text: "Understood. I'm ready to help with marine biodiversity monitoring questions." }] },
    ...messages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    })),
  ];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: geminiContents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return Response.json({ error: "Gemini API error", details: err }, { status: res.status });
  }

  const data = await res.json();
  const reply =
    data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I could not generate a response.";

  return Response.json({ reply });
}

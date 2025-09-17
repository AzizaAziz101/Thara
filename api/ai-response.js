import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Nur POST erlaubt" });
  }

  try {
    const { message } = await req.json();

    if (!message || message.length < 10) {
      return res.status(400).json({ error: "Bitte mehr Details eingeben." });
    }

    const SYSTEM_PROMPT = `
Du bist die freundliche Assistenz eines Coaches. 
Antworte professionell, empathisch und kurz (max. 120 Wörter). 
Kein medizinischer oder rechtlicher Rat.
`;

    // 🔹 Mistral API aufrufen
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`, // Key über Vercel
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistral-tiny",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      return res.status(500).json({ error: "Keine Antwort von Mistral erhalten" });
    }

    res.status(200).json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error("Fehler:", err);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
}

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  // --- CORS headers ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // --- Handle preflight request ---
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // --- Only allow POST ---
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { graph, task } = req.body;
  console.log("Received graph:", graph);
  console.log("Received task:", task);

  if (!graph || !task) {
    return res.status(400).json({ error: "Missing graph or task in request body" });
  }

  const prompt = `
I have this graph:
${JSON.stringify(graph)}

Please solve this task: ${task}

Return only JSON like this:
{
  "path": ["n0","n1","n4"],
  "edges": [{"from":"n0","to":"n1"}, {"from":"n1","to":"n4"}]
}
`;

  try {
    const gptResp = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const text = gptResp.choices[0].message.content;
    console.log("GPT returned:", text);

    let solution;
    try {
      solution = JSON.parse(text);
    } catch (e) {
      console.error("JSON parse error:", e);
      solution = { error: "GPT output not valid JSON", raw: text };
    }

    res.status(200).json({ solution });
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}

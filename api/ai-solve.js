import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*'); // allow all origins
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        // Handle preflight request
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { graph, task } = req.body;

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
            temperature: 0
        });

        const text = gptResp.choices[0].message.content;
        let json;
        try { json = JSON.parse(text); } catch (e) { json = {}; }

        res.status(200).json(json);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
}

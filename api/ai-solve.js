import express from 'express';
import OpenAI from 'openai';
import cors from 'cors';
const app = express();
app.use(cors()); 
app.use(express.json());

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

app.post('/api/solveGraph', async (req,res) => {
    const {graph, question} = req.body;

    const prompt = `
I have this graph:
${JSON.stringify(graph)}

Please solve this task: ${question}

Return only JSON like this:
{
  "path": ["n0","n1","n4"],
  "edges": [{"from":"n0","to":"n1"}, {"from":"n1","to":"n4"}]
}
`;

    const gptResp = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [{role:"user", content: prompt}],
        temperature: 0
    });

    const text = gptResp.choices[0].message.content;
    let json;
    try{ json = JSON.parse(text); } catch(e){ json = {}; }
    res.json(json);
});

app.listen(3000,()=>console.log("Server running on port 3000"));

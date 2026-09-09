// Vercel serverless function using Google Gemini
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { userInput } = req.body;

  if (!userInput || userInput.trim() === '') {
    res.status(400).json({ error: 'Please provide a description of your AI use case.' });
    return;
  }

  const prompt = `
You are an expert in Kenyan data protection law and AI governance. 
Evaluate the following AI use case against the Kenya Data Protection Act, 2019 and the Office of the Data Protection Commissioner's guidance on Artificial Intelligence.

Use case description: ${userInput}

Provide:
1. A compliance score from 0 to 100 (where 100 is fully compliant).
2. A risk level: Low, Medium, or High.
3. A list of key issues (if any) with specific reference to the relevant sections of the Act or guidelines.
4. Recommended actions to improve compliance.

Format your answer exactly like this:
Score: [number]
Risk Level: [Low/Medium/High]
Key Issues:
- [Issue 1]
- [Issue 2]
...
Recommended Actions:
- [Action 1]
- [Action 2]
...
`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Missing Gemini API key' });
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 600,
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error?.message || 'Gemini API error';
      res.status(response.status).json({ error: errMsg });
      return;
    }

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) {
      res.status(500).json({ error: 'No response from Gemini' });
      return;
    }

    res.status(200).json({ result: resultText });
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: error.message });
  }
};
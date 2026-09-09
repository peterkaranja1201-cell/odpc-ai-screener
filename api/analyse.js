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
You are a senior data protection compliance officer in Kenya, expert in the Data Protection Act, 2019 and the ODPC guidance on AI.

Your task is to evaluate the following AI use case and return a compliance assessment.

Use case: ${userInput}

STRICT OUTPUT FORMAT (plain text, no extra commentary):
Score: <a whole number from 0 to 100, no minus sign, no decimals>
Risk Level: <Low, Medium, or High>
Key Issues:
- <one issue per bullet, citing the relevant DPA section or ODPC principle>
- ...
Recommended Actions:
- <one action per bullet>
- ...

Rules:
- Score must be between 0 and 100. 0 means completely non-compliant, 100 means fully compliant.
- Risk Level must be exactly one of: Low, Medium, High.
- If no issues, write "None" under Key Issues.
- Do not include any introductory or concluding sentences.
- Do not use markdown bold or italics, just plain text.
- Use only the sections and order shown above.
- Base your evaluation on the Kenya Data Protection Act 2019 and ODPC AI guidance notes.

Now evaluate.
`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Missing Gemini API key' });
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

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
      maxOutputTokens: 1500,
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
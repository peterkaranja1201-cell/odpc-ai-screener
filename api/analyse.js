// This is a Vercel serverless function that calls OpenAI.
const { OpenAI } = require('openai');

// Initialize OpenAI with your API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  // Only allow POST requests
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

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a data protection compliance assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 600,
    });

    const result = completion.choices[0].message.content;
    res.status(500).json({ error: error.message });
  } catch (error) {
    console.error('OpenAI error:', error);
    res.status(500).json({ error: error.message });
  }
};

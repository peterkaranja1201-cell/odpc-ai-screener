# ComplyKE

An AI-powered web app that evaluates AI use cases against Kenya's Data Protection Act (2019) and ODPC AI guidelines.

## Features
- Input any AI use case description.
- Get a compliance score (0–100).
- See risk level (Low/Medium/High).
- View key issues with legal references.
- Receive recommended actions to improve compliance.
- Copy report for documentation.

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Vercel serverless function (Node.js)
- AI: Google Gemini API (with fallback models)
- Deployment: Vercel

## How to Run Locally
1. Clone the repo.
2. Install dependencies: `npm install`
3. Set environment variable `GEMINI_API_KEY`.
4. Run `vercel dev` (requires Vercel CLI).

## Disclaimer
This tool provides general guidance only and does not constitute legal advice.
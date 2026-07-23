import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      system: 'RICIS-III v7.7 Engine',
      author: 'Dmitry Aleinikov (ORCID: 0009-0004-3226-7700)',
      dois: ['10.5281/zenodo.17872755', '10.5281/zenodo.21517353'],
    });
  });

  // API Route: Gemini RICIS Verification Assistant
  app.post('/api/ricis/verify', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: 'GEMINI_API_KEY environment variable is not set.' });
      }

      const { expression, prompt } = req.body;
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are the formal RICIS-III v7.7 validation engine authored by Dmitry Aleinikov (ORCID: 0009-0004-3226-7700).
Evaluate expression: "${expression}"
User Query: "${prompt || 'Provide step-by-step Phase -1 to Phase 6 trace in Russian and Lean 4 formal code.'}"
Strict Rules:
- L0: Absolute Continuity, L1: Identity Principle (X = X).
- SP1 Locality Rule, SP2 Reduction Priority, SP3 Index Law, SP4 Semantic Priority.
- Axioms A1-A10 (A1: F/0 = ∞_F, A4: 0_F/0_G = F/G, A5: ∞_F/∞_G = F/G, A6: 0_F × ∞_G = F·G).
- Strictly reject Cauchy limits (lim x->a), L'Hopital rule, NaN/Undefined states.
Output in Russian with Lean 4 theorem code.`,
      });

      res.json({ text: response.text });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Verification failed.' });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RICIS-III v7.7 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

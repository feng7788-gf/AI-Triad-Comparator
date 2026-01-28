import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini SDK
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-3-pro-preview';

// --- Configuration ---

const personas = {
  GPT: {
    systemInstruction: "You are GPT-4o, a large language model trained by OpenAI. Respond in a helpful, comprehensive, and professional tone. Be direct and authoritative.",
  },
  GEMINI: {
    systemInstruction: "You are Gemini 2.0 Pro, a multimodal AI model from Google. Respond in a creative, insightful, and user-centric manner. Use formatting effectively.",
  },
  DEEPSEEK: {
    systemInstruction: "You are DeepSeek-R1. You are a specialized reasoning model. You MUST perform a chain-of-thought reasoning process before answering. Enclose your thinking process in <think> tags, like this: <think> ... reasoning steps ... </think>. Then provide the final answer. Your tone is extremely concise, technical, and logical.",
  }
};

// --- Model Functions ---

async function callGPT(question) {
  const start = performance.now();
  try {
    console.log('[GPT] Generating response...');
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: question,
      config: {
        systemInstruction: personas.GPT.systemInstruction,
      }
    });

    const end = performance.now();
    return {
      provider: 'GPT',
      content: response.text || "No response generated.",
      loading: false,
      duration: Math.round(end - start)
    };
  } catch (error) {
    console.error('[GPT] Error:', error);
    const end = performance.now();
    return {
      provider: 'GPT',
      content: "",
      loading: false,
      error: error.message || "Provider Error",
      duration: Math.round(end - start)
    };
  }
}

async function callGemini(question) {
  const start = performance.now();
  try {
    console.log('[Gemini] Generating response...');
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: question,
      config: {
        systemInstruction: personas.GEMINI.systemInstruction,
      }
    });

    const end = performance.now();
    return {
      provider: 'GEMINI',
      content: response.text || "No response generated.",
      loading: false,
      duration: Math.round(end - start)
    };
  } catch (error) {
    console.error('[Gemini] Error:', error);
    const end = performance.now();
    return {
      provider: 'GEMINI',
      content: "",
      loading: false,
      error: error.message || "Provider Error",
      duration: Math.round(end - start)
    };
  }
}

async function callDeepSeek(question) {
  const start = performance.now();
  try {
    console.log('[DeepSeek] Generating response...');
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: question,
      config: {
        systemInstruction: personas.DEEPSEEK.systemInstruction,
        // DeepSeek R1 often benefits from a higher thinking budget simulation (if supported) or just prompt engineering
      }
    });

    const end = performance.now();
    return {
      provider: 'DEEPSEEK',
      content: response.text || "No response generated.",
      loading: false,
      duration: Math.round(end - start)
    };
  } catch (error) {
    console.error('[DeepSeek] Error:', error);
    const end = performance.now();
    return {
      provider: 'DEEPSEEK',
      content: "",
      loading: false,
      error: error.message || "Provider Error",
      duration: Math.round(end - start)
    };
  }
}

// --- Routes ---

app.post('/api/ask', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  console.log(`[Backend] Received question: "${question.substring(0, 50)}..."`);

  try {
    // Parallel Execution with Promise.allSettled to ensure all results are handled even if one fails
    const resultsSettled = await Promise.allSettled([
      callGPT(question),
      callGemini(question),
      callDeepSeek(question)
    ]);

    // Transform settled results to values or error objects
    const results = resultsSettled.map((res, index) => {
      if (res.status === 'fulfilled') {
        return res.value;
      } else {
        // Map index to provider name for fallback error
        const providers = ['GPT', 'GEMINI', 'DEEPSEEK'];
        return {
          provider: providers[index],
          content: "",
          loading: false,
          error: res.reason?.message || "Unknown execution error",
          duration: 0
        };
      }
    });

    res.json(results);

  } catch (error) {
    console.error("Aggregation Error:", error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

app.listen(port, () => {
  console.log(`
  🚀 Server running at http://localhost:${port}
  POST /api/ask endpoint ready.
  `);
});
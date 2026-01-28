import axios from 'axios';
import { ModelResponse } from "../types";

// Using relative path to leverage Vite proxy
const API_URL = '/api/ask';

/**
 * Orchestrates the model calls by sending a single request to the backend.
 * [Diagram Flow]: Frontend -> POST /api/ask -> Backend
 */
export const queryAllModels = async (prompt: string): Promise<ModelResponse[]> => {
  try {
    const response = await axios.post(API_URL, { question: prompt });
    return response.data;
  } catch (error: any) {
    console.error("API Error:", error);
    // Return mock error responses if the server is down so the UI doesn't crash
    const errorMessage = error.response?.data?.error || error.message || "Failed to connect to backend server. Make sure 'node server.js' is running.";
    
    return [
      { provider: 'GPT', content: '', loading: false, error: errorMessage } as any,
      { provider: 'GEMINI', content: '', loading: false, error: errorMessage } as any,
      { provider: 'DEEPSEEK', content: '', loading: false, error: errorMessage } as any
    ];
  }
};
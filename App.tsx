import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import InputArea from './components/InputArea';
import ResponseCard from './components/ResponseCard';
import { ModelProvider, ModelResponse } from './types';
import { queryAllModels } from './services/llmService';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<Record<ModelProvider, ModelResponse>>({
    [ModelProvider.GPT]: { provider: ModelProvider.GPT, content: '', loading: false },
    [ModelProvider.GEMINI]: { provider: ModelProvider.GEMINI, content: '', loading: false },
    [ModelProvider.DEEPSEEK]: { provider: ModelProvider.DEEPSEEK, content: '', loading: false },
  });

  const handleAsk = async (prompt: string) => {
    setLoading(true);
    
    // Set all to loading state
    setResponses(prev => ({
      [ModelProvider.GPT]: { ...prev.GPT, loading: true, error: undefined, content: '' },
      [ModelProvider.GEMINI]: { ...prev.GEMINI, loading: true, error: undefined, content: '' },
      [ModelProvider.DEEPSEEK]: { ...prev.DEEPSEEK, loading: true, error: undefined, content: '' },
    }));

    try {
      // The architecture requirement: Parallel Calls -> Aggregate
      const results = await queryAllModels(prompt);

      // Aggregate results back into state
      const newResponses = { ...responses };
      results.forEach(result => {
        newResponses[result.provider] = result;
      });
      setResponses(newResponses);

    } catch (error) {
      console.error("Aggregation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl pointer-events-none translate-y-1/2"></div>

      {/* Header */}
      <header className="flex items-center justify-center p-6 border-b border-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg shadow-lg shadow-blue-500/20">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-200">
            AI Triad Comparator
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col">
        
        {/* Input Section - Prominent at Top */}
        <div className="w-full flex justify-center mt-4">
          <InputArea onAsk={handleAsk} isLoading={loading} />
        </div>

        {/* Results Grid - 3 Windows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
          <ResponseCard data={responses[ModelProvider.GPT]} />
          <ResponseCard data={responses[ModelProvider.GEMINI]} />
          <ResponseCard data={responses[ModelProvider.DEEPSEEK]} />
        </div>

      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-slate-600 text-xs border-t border-slate-900/50">
        <p>Built with React, Tailwind, and Gemini API</p>
      </footer>
    </div>
  );
};

export default App;

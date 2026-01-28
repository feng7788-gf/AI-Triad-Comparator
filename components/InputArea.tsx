import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface InputAreaProps {
  onAsk: (prompt: string) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onAsk, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onAsk(prompt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex items-end gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800 focus-within:border-slate-600 transition-colors shadow-xl">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything... (e.g., 'Compare Rust and C++ memory management')"
            className="w-full bg-transparent text-slate-200 placeholder-slate-500 p-3 outline-none resize-none h-[60px] focus:h-[100px] transition-all duration-300 rounded-lg"
            disabled={isLoading}
          />
          <div className="pb-1 pr-1">
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className={`p-3 rounded-lg flex items-center justify-center transition-all duration-200 ${
                prompt.trim() && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <Sparkles className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </form>
      <div className="mt-3 flex justify-center gap-6 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>GPT-4o</span>
        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>Gemini 2.0 Pro</span>
        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>DeepSeek R1</span>
      </div>
    </div>
  );
};

export default InputArea;

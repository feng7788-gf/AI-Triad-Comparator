import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ModelProvider, ModelResponse } from '../types';
import { Bot, Zap, Cpu, Clock, AlertCircle, Copy, Check, Brain, ChevronDown, ChevronRight } from 'lucide-react';

interface ResponseCardProps {
  data: ModelResponse;
}

const getProviderConfig = (provider: ModelProvider) => {
  switch (provider) {
    case ModelProvider.GPT:
      return {
        name: 'GPT-4o',
        icon: <Bot className="w-5 h-5" />,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20'
      };
    case ModelProvider.GEMINI:
      return {
        name: 'Gemini 2.0 Pro',
        icon: <Zap className="w-5 h-5" />,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20'
      };
    case ModelProvider.DEEPSEEK:
      return {
        name: 'DeepSeek R1',
        icon: <Cpu className="w-5 h-5" />,
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20'
      };
  }
};

const parseContent = (text: string) => {
  const thinkMatch = text.match(/<think>([\s\S]*?)<\/think>/);
  if (thinkMatch) {
    return {
      thought: thinkMatch[1].trim(),
      answer: text.replace(/<think>[\s\S]*?<\/think>/, '').trim()
    };
  }
  return { thought: null, answer: text };
};

const ResponseCard: React.FC<ResponseCardProps> = ({ data }) => {
  const config = getProviderConfig(data.provider);
  const [copied, setCopied] = useState(false);
  const [showThought, setShowThought] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { thought, answer } = parseContent(data.content);

  return (
    <div className={`flex flex-col h-full rounded-xl border ${config.border} ${config.bg} backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-${config.color.split('-')[1]}-900/20`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${config.border} bg-opacity-30 bg-black`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${config.bg} ${config.color}`}>
            {config.icon}
          </div>
          <div>
            <h3 className={`font-semibold ${config.color}`}>{config.name}</h3>
            {data.duration && !data.loading && (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{(data.duration / 1000).toFixed(2)}s</span>
              </div>
            )}
          </div>
        </div>
        
        {!data.loading && !data.error && data.content && (
            <button 
                onClick={handleCopy}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                title="Copy response"
            >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto min-h-[400px] max-h-[600px] relative scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {data.loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400 animate-pulse">
            <div className={`w-10 h-10 border-2 border-t-transparent rounded-full animate-spin ${config.color.replace('text', 'border')}`}></div>
            <span className="text-sm font-medium">Generating response...</span>
          </div>
        ) : data.error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-400 gap-2 p-4 text-center">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm font-medium">Error generating response</p>
            <p className="text-xs opacity-70">{data.error}</p>
          </div>
        ) : !data.content ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-600">
                <p className="text-sm">Ready to ask</p>
            </div>
        ) : (
          <div className="flex flex-col gap-4">
            
            {/* Thought Process Section (if available) */}
            {thought && (
              <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 overflow-hidden">
                <button 
                  onClick={() => setShowThought(!showThought)}
                  className="w-full flex items-center gap-2 p-3 text-xs font-medium text-slate-400 hover:bg-slate-800/50 transition-colors"
                >
                  <Brain className="w-4 h-4" />
                  <span>Thinking Process</span>
                  <div className="ml-auto">
                    {showThought ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </div>
                </button>
                {showThought && (
                   <div className="p-3 pt-0 text-xs text-slate-500 font-mono border-t border-slate-800/50 leading-relaxed whitespace-pre-wrap">
                      {thought}
                   </div>
                )}
              </div>
            )}

            {/* Main Answer */}
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                  components={{
                      code({node, className, children, ...props}) {
                          const match = /language-(\w+)/.exec(className || '')
                          return match ? (
                              <div className="bg-slate-950 rounded-md my-2 overflow-hidden border border-slate-800">
                                  <div className="px-3 py-1 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-mono">
                                      {match[1]}
                                  </div>
                                  <pre className="p-3 overflow-x-auto">
                                      <code className={className} {...props}>
                                          {children}
                                      </code>
                                  </pre>
                              </div>
                          ) : (
                              <code className="bg-slate-800 px-1.5 py-0.5 rounded text-sm" {...props}>
                                  {children}
                              </code>
                          )
                      }
                  }}
              >
                  {answer}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseCard;

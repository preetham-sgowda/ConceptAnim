import React, { useState } from 'react';
import { Wand2 } from 'lucide-react';

interface InputSectionProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleGenerate();
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
          Turn concepts into <span className="text-indigo-600">motion.</span>
        </h1>
        <p className="text-lg text-slate-600">
          Describe any educational concept, math problem, or algorithm. 
          Our AI will generate the animation scenes, timeline, and rendering code.
        </p>
      </div>

      <div className="relative shadow-xl rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-6 text-lg text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-none resize-none h-40"
          placeholder="e.g. Visualize a binary search tree insertion of the number 42 into an existing tree..."
          disabled={isGenerating}
        />
        <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-t border-slate-100">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
            Pro tip: Be specific about colors and shapes for better results.
          </span>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className={`
              inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white 
              ${!prompt.trim() || isGenerating ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}
              transition-all duration-200
            `}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" />
                Generate
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Quick chips */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {['Bubble Sort Algorithm', 'Pythagorean Theorem', 'Solar System Orbit', 'DNA Replication'].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setPrompt(suggestion)}
            className="inline-flex items-center px-3 py-1.5 rounded-full border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

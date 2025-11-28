import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { InputSection } from './components/InputSection';
import { ResultsDashboard } from './components/ResultsDashboard';
import { generateAnimationData } from './services/geminiService';
import { AppState, GenerationResult } from './types';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async (prompt: string) => {
    setAppState(AppState.GENERATING);
    setErrorMsg(null);
    try {
      if (!process.env.API_KEY) {
         throw new Error("API Key not found. Please set REACT_APP_GEMINI_API_KEY (simulated check).");
      }
      const data = await generateAnimationData(prompt);
      setResult(data);
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setAppState(AppState.ERROR);
      setErrorMsg(err.message || "An unexpected error occurred while generating the animation.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />
      
      {/* Input Section - Always visible but smaller if results exist */}
      <div className={`transition-all duration-500 ease-in-out ${appState === AppState.SUCCESS ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
         {appState !== AppState.SUCCESS && (
            <InputSection onGenerate={handleGenerate} isGenerating={appState === AppState.GENERATING} />
         )}
      </div>

      {/* Error State */}
      {appState === AppState.ERROR && (
        <div className="max-w-3xl mx-auto mt-8 px-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Generation Failed</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errorMsg}</p>
                  <p className="mt-2 text-xs">Make sure your API key is valid and the model is available.</p>
                </div>
                <div className="mt-4">
                    <button 
                        onClick={() => setAppState(AppState.IDLE)}
                        className="text-sm font-medium text-red-600 hover:text-red-500 underline"
                    >
                        Try Again
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Dashboard */}
      {appState === AppState.SUCCESS && result && (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-4 flex justify-between items-center">
                <button 
                    onClick={() => setAppState(AppState.IDLE)}
                    className="text-sm text-slate-500 hover:text-indigo-600 font-medium flex items-center gap-1"
                >
                    &larr; Create New Animation
                </button>
            </div>
            <ResultsDashboard data={result} />
        </>
      )}
    </div>
  );
};

export default App;

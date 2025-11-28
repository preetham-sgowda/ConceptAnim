import React from 'react';
import { Copy } from 'lucide-react';

interface CodeViewerProps {
  code: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-300 font-mono text-sm">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <span className="text-slate-100 font-medium text-xs">generated_scene.py</span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs hover:text-white transition-colors"
        >
          <Copy size={12} />
          Copy
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="whitespace-pre-wrap">
          <code>{code}</code>
        </pre>
      </div>
      <div className="p-2 bg-slate-950 text-center text-xs text-slate-500 border-t border-slate-800">
        Requires Manim Community Edition (pip install manim)
      </div>
    </div>
  );
};

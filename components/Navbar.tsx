import React from 'react';
import { Play, Layers, Github } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Play size={20} fill="currentColor" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">ConceptAnim</span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <span className="border-indigo-500 text-slate-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Generator
              </span>
              <span className="border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer">
                Gallery
              </span>
              <span className="border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer">
                Docs
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <button className="bg-slate-50 p-2 rounded-full text-slate-400 hover:text-slate-500">
              <Github size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

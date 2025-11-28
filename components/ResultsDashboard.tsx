import React, { useState } from 'react';
import { GenerationResult } from '../types';
import { VideoPreview } from './VideoPreview';
import { CodeViewer } from './CodeViewer';
import { TimelineViewer } from './TimelineViewer';
import { JsonViewer } from './JsonViewer';
import { Film, Code, FileJson, Activity } from 'lucide-react';

interface ResultsDashboardProps {
  data: GenerationResult;
}

type Tab = 'preview' | 'timeline' | 'code' | 'json';

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<Tab>('preview');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Sidebar / Tabs */}
        <div className="md:w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Project Assets</h2>
            <p className="text-xs text-slate-500 mt-1 truncate" title={data.summary}>{data.summary}</p>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <TabButton 
              active={activeTab === 'preview'} 
              onClick={() => setActiveTab('preview')} 
              icon={<Film size={18} />} 
              label="Preview Player" 
            />
            <TabButton 
              active={activeTab === 'timeline'} 
              onClick={() => setActiveTab('timeline')} 
              icon={<Activity size={18} />} 
              label="Timeline Logic" 
            />
             <TabButton 
              active={activeTab === 'code'} 
              onClick={() => setActiveTab('code')} 
              icon={<Code size={18} />} 
              label="Manim Code" 
            />
            <TabButton 
              active={activeTab === 'json'} 
              onClick={() => setActiveTab('json')} 
              icon={<FileJson size={18} />} 
              label="Scene JSON" 
            />
          </nav>
          <div className="p-4 bg-indigo-50 border-t border-indigo-100">
             <div className="text-xs text-indigo-800 font-semibold mb-1">Status</div>
             <div className="flex items-center gap-2 text-indigo-600 text-sm">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                Ready to render
             </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white overflow-hidden flex flex-col h-[600px] md:h-auto">
          {activeTab === 'preview' && <VideoPreview data={data} />}
          {activeTab === 'timeline' && <TimelineViewer scenes={data.scenes} />}
          {activeTab === 'code' && <CodeViewer code={data.manim_code} />}
          {activeTab === 'json' && <JsonViewer data={data} />}
        </div>

      </div>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      active 
        ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' 
        : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
    }`}
  >
    <span className="mr-3">{icon}</span>
    {label}
  </button>
);

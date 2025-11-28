import React from 'react';
import { Scene } from '../types';
import { Clock, Circle, ArrowRight, PlayCircle } from 'lucide-react';

interface TimelineViewerProps {
  scenes: Scene[];
}

export const TimelineViewer: React.FC<TimelineViewerProps> = ({ scenes }) => {
  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-6 scrollbar-hide">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {scenes.map((scene, sceneIdx) => (
          <div key={scene.id} className="relative">
            {/* Scene Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm border-2 border-indigo-200">
                    {sceneIdx + 1}
                </div>
                <div>
                    <h3 className="text-md font-bold text-slate-900 uppercase tracking-wide">Scene {sceneIdx + 1}</h3>
                    <p className="text-slate-500 text-sm">{scene.description}</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-slate-400 text-xs font-mono bg-white px-2 py-1 rounded border border-slate-200">
                    <Clock size={12} />
                    {scene.duration}s
                </div>
            </div>

            {/* Timeline Events (Sequence) */}
            <div className="ml-4 pl-8 border-l-2 border-slate-200 space-y-4 pb-4">
                {scene.sequence.sort((a,b) => a.time_offset - b.time_offset).map((event, idx) => (
                    <div key={idx} className="relative group">
                        {/* Dot on line */}
                        <div className="absolute -left-[41px] top-3 w-4 h-4 rounded-full bg-white border-2 border-slate-300 group-hover:border-indigo-500 transition-colors z-10"></div>
                        
                        {/* Card */}
                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-indigo-600 uppercase flex items-center gap-1">
                                    <Clock size={10} />
                                    {event.time_offset}s
                                </span>
                                <span className="text-xs text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                                    {event.target_id}
                                </span>
                            </div>
                            <div className="text-slate-800 text-sm flex items-start gap-2">
                                <PlayCircle size={16} className="text-slate-400 mt-0.5 shrink-0" />
                                <div>
                                    <span className="font-semibold text-slate-700">{event.type}</span>
                                    <span className="text-slate-500 ml-1">- {event.description || "No description provided"}</span>
                                </div>
                            </div>
                            {/* Parameters Peek */}
                            {event.parameters && (
                                <div className="mt-2 text-[10px] font-mono text-slate-400 bg-slate-50 p-1.5 rounded truncate">
                                    PARAMS: {JSON.stringify(event.parameters).replace(/["{}]/g, '').replace(/:/g, ': ')}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            
             {/* Scene Object Summary */}
            <div className="ml-12 mb-8">
                 <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Objects in Scene</h4>
                 <div className="flex flex-wrap gap-2">
                     {scene.objects.map(obj => (
                         <span key={obj.id} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                             <Circle size={8} className={obj.type === 'graph' ? 'text-green-500' : 'text-blue-500'} fill="currentColor" />
                             {obj.id} <span className="text-slate-400">({obj.type})</span>
                         </span>
                     ))}
                 </div>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-center p-8 text-slate-400 text-sm italic">
            End of Animation Sequence
        </div>

      </div>
    </div>
  );
};
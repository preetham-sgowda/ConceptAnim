import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GenerationResult, AnimationObject, Scene, AnimationEvent } from '../types';
import { Play, Pause, SkipBack, SkipForward, Maximize } from 'lucide-react';

interface VideoPreviewProps {
  data: GenerationResult;
}

// --- Constants & Utilities ---
const VIEWBOX_W = 800;
const VIEWBOX_H = 450;
const MANIM_SCALE = 50; // Pixels per Manim unit
const CENTER_X = VIEWBOX_W / 2;
const CENTER_Y = VIEWBOX_H / 2;

const toSVGX = (manimX: number) => CENTER_X + manimX * MANIM_SCALE;
const toSVGY = (manimY: number) => CENTER_Y - manimY * MANIM_SCALE;

// Improved cubic ease-in-out
const ease = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Utility to make code-like math look like real math
const formatMathText = (text: string | undefined): string => {
  if (!text) return "";
  return text
    .replace(/\*/g, '×')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/sqrt/gi, '√')
    .replace(/pi/gi, 'π')
    .replace(/theta/gi, 'θ')
    .replace(/alpha/gi, 'α')
    .replace(/beta/gi, 'β')
    .replace(/delta/gi, 'Δ')
    .replace(/lambda/gi, 'λ')
    .replace(/sigma/gi, 'Σ')
    .replace(/<=/g, '≤')
    .replace(/>=/g, '≥')
    .replace(/!=/g, '≠')
    .replace(/->/g, '→');
};

// Utility to format IDs into readable text if text_content is missing
const formatFallbackText = (id: string): string => {
  if (!id) return "";
  // "main_title" -> "Main Title"
  return id
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

interface RenderState {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  rotation: number;
  color: string;
  highlighted: boolean;
  textContent: string | null;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ data }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [globalTime, setGlobalTime] = useState(0); // Time in seconds
  
  // Calculate total duration
  const totalDuration = useMemo(() => 
    data.scenes.reduce((acc, scene) => acc + scene.duration, 0), 
    [data.scenes]
  );

  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // --- Animation Loop ---
  const animate = (time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time - (lastTimeRef.current * 1000);
    
    const elapsedSeconds = (time - startTimeRef.current) / 1000;
    
    if (elapsedSeconds >= totalDuration) {
      setGlobalTime(totalDuration);
      setIsPlaying(false);
      lastTimeRef.current = 0;
      startTimeRef.current = undefined;
      return;
    }

    setGlobalTime(elapsedSeconds);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      lastTimeRef.current = globalTime;
      startTimeRef.current = undefined;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setGlobalTime(newTime);
    lastTimeRef.current = newTime;
    startTimeRef.current = undefined;
  };

  // --- State Calculation Logic ---
  const getCurrentSceneInfo = (time: number) => {
    let accumulatedTime = 0;
    for (const scene of data.scenes) {
      if (time < accumulatedTime + scene.duration) {
        return { scene, sceneTime: time - accumulatedTime };
      }
      accumulatedTime += scene.duration;
    }
    const lastScene = data.scenes[data.scenes.length - 1];
    return { scene: lastScene, sceneTime: lastScene ? lastScene.duration : 0 };
  };

  const { scene: currentScene, sceneTime } = getCurrentSceneInfo(globalTime);

  // Calculate object states for the current frame
  const objectStates = useMemo(() => {
    if (!currentScene) return {};
    
    const states: Record<string, RenderState> = {};

    // 1. Initialize Objects
    currentScene.objects.forEach(obj => {
      // Defensive coding: Ensure properties exists
      const props = obj.properties || {};
      const startVisible = !currentScene.sequence.some(e => e.target_id === obj.id && (e.type === 'create' || e.type === 'fade_in'));
      
      states[obj.id] = {
        x: props.x ?? 0,
        y: props.y ?? 0,
        scale: 1,
        opacity: startVisible ? 1 : 0,
        rotation: 0,
        color: props.color || '#6366f1',
        highlighted: false,
        textContent: props.text_content || props.label || null
      };
    });

    // 2. Replay events sequentially
    const sortedEvents = [...currentScene.sequence].sort((a, b) => a.time_offset - b.time_offset);

    sortedEvents.forEach(event => {
      const objState = states[event.target_id];
      if (!objState) return;

      const tStart = event.time_offset;
      const tEnd = event.time_offset + event.duration;

      // Skip future events completely
      if (sceneTime < tStart) return;

      // Calculate progress (0 to 1)
      const rawProgress = (sceneTime - tStart) / event.duration;
      // Handle division by zero duration events (instant updates)
      const progress = event.duration === 0 ? 1 : Math.min(Math.max(rawProgress, 0), 1);
      const eased = ease(progress);

      switch (event.type) {
        case 'create':
        case 'fade_in':
           objState.opacity = Math.max(objState.opacity, eased);
           if (event.type === 'create') {
             if (progress < 1) {
                 objState.scale = eased;
             }
           }
           break;
        case 'fade_out':
           objState.opacity = 1 - eased;
           break;
        case 'move':
           if (event.parameters?.target_position) {
             const targetX = event.parameters.target_position[0];
             const targetY = event.parameters.target_position[1];
             
             if (sceneTime >= tEnd) {
                 objState.x = targetX;
                 objState.y = targetY;
             } else {
                 objState.x = objState.x + (targetX - objState.x) * eased;
                 objState.y = objState.y + (targetY - objState.y) * eased;
             }
           }
           break;
        case 'grow':
        case 'scale':
           const factor = event.parameters?.scale_factor || 1.5;
           if (sceneTime >= tEnd) {
             objState.scale *= factor;
           } else {
             const startScale = objState.scale;
             const targetScale = startScale * factor;
             objState.scale = startScale + (targetScale - startScale) * eased;
           }
           break;
        case 'rotate':
           const deg = event.parameters?.degrees || 90;
           if (sceneTime >= tEnd) {
               objState.rotation += deg;
           } else {
               objState.rotation += deg * eased;
           }
           break;
        case 'highlight':
           if (sceneTime >= tStart && sceneTime <= tEnd) {
               objState.highlighted = true;
               const pulse = 1 + Math.sin(progress * Math.PI) * 0.1;
               objState.scale *= pulse;
           } else {
               objState.highlighted = false;
           }
           break;
        case 'change_text':
           // Instant update at tStart
           if (sceneTime >= tStart && event.parameters?.new_content) {
               objState.textContent = event.parameters.new_content;
           }
           break;
        case 'change_color':
           if (sceneTime >= tStart && event.parameters?.new_color) {
              objState.color = event.parameters.new_color;
           }
           break;
      }
    });

    return states;
  }, [currentScene, sceneTime]);

  const renderObject = (obj: AnimationObject) => {
    const state = objectStates[obj.id];
    if (!state || state.opacity < 0.01) return null;
    
    // Defensive access to properties
    const props = obj.properties || {};

    const svgX = toSVGX(state.x);
    const svgY = toSVGY(state.y);
    const transform = `translate(${svgX}, ${svgY}) scale(${state.scale}) rotate(${state.rotation})`;

    // Filter for highlight effect
    const filter = state.highlighted ? "url(#glow)" : undefined;
    const stroke = state.highlighted ? "#fcd34d" : "white"; // Yellow if highlighted
    const strokeWidth = state.highlighted ? 4 : 2;

    const commonProps = {
        transform,
        fill: state.color,
        fillOpacity: state.opacity * 0.9,
        stroke: stroke,
        strokeWidth: strokeWidth,
        filter: filter,
        style: { transition: 'none' }
    };

    switch (obj.type) {
      case 'circle':
        return <circle key={obj.id} r={(props.radius || 1) * MANIM_SCALE} {...commonProps} cx={0} cy={0} />;
      case 'square':
        const w = (props.width || 2) * MANIM_SCALE;
        const h = (props.height || 2) * MANIM_SCALE;
        return <rect key={obj.id} x={-w/2} y={-h/2} width={w} height={h} rx={4} {...commonProps} />;
      case 'text':
        // Intelligent text fallback using dynamic state
        const rawText = state.textContent || formatFallbackText(obj.id);
        const formattedText = formatMathText(rawText);
        const fontSize = props.font_size || 32;
        
        return (
          <text
            key={obj.id}
            {...commonProps}
            x={0}
            y={0}
            fill={state.highlighted ? "#fcd34d" : (state.color || props.color || 'white')}
            fillOpacity={state.opacity}
            fontSize={fontSize}
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="'Inter', 'Times New Roman', serif"
            stroke="#0f172a" 
            strokeWidth="6"
            paintOrder="stroke"
            strokeLinejoin="round"
          >
            {formattedText}
          </text>
        );
      case 'vector':
        return (
             <g key={obj.id} {...commonProps}>
                 <line x1="0" y1="0" x2={MANIM_SCALE} y2="0" stroke={state.color} strokeWidth="6" markerEnd="url(#arrowhead)" />
                 {props.label && (
                   <text 
                      x={MANIM_SCALE / 2} 
                      y={-15} 
                      fill="white" 
                      fontSize="16" 
                      textAnchor="middle"
                      stroke="#0f172a" 
                      strokeWidth="4"
                      paintOrder="stroke"
                    >
                     {formatMathText(props.label)}
                   </text>
                 )}
             </g>
        );
      case 'graph':
      case 'matrix':
         return (
          <g key={obj.id} {...commonProps}>
            <rect x={-40} y={-30} width={80} height={60} fill={state.color} opacity={0.5} stroke="white" strokeDasharray="4" />
            <text 
              y={0} 
              fill="white" 
              fontSize="14" 
              textAnchor="middle" 
              dominantBaseline="middle"
              stroke="#0f172a" 
              strokeWidth="4"
              paintOrder="stroke"
            >
              {formatMathText(state.textContent || obj.type)}
            </text>
          </g>
         );
      default:
        return (
          <g key={obj.id} {...commonProps}>
            <circle r="15" fill={state.color} />
            <text 
              y={35} 
              fill="white" 
              fontSize="12" 
              textAnchor="middle" 
              fillOpacity={1}
              stroke="#0f172a" 
              strokeWidth="4"
              paintOrder="stroke"
            >
              {formatFallbackText(obj.id)}
            </text>
          </g>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden select-none">
        
        {/* Main Viewing Area */}
        <div className="relative shadow-2xl rounded-xl overflow-hidden bg-slate-900 border border-slate-800 aspect-video w-full max-w-5xl group">
            
            {/* 1. Grid Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)',
                backgroundSize: '50px 50px',
            }}></div>
            <div className="absolute top-1/2 left-0 w-full h-px bg-slate-700 opacity-30"></div>
            <div className="absolute left-1/2 top-0 h-full w-px bg-slate-700 opacity-30"></div>

            {/* 2. SVG Rendering Layer */}
            <svg 
              className="absolute inset-0 w-full h-full" 
              viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
              preserveAspectRatio="xMidYMid meet"
            >
               <defs>
                   <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                       <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
                   </marker>
                   {/* Glow Filter for Highlights */}
                   <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                      <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                   </filter>
               </defs>
               {currentScene?.objects.map(renderObject)}
            </svg>

            {/* 3. Current Action Overlay */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none">
                <div className={`
                    px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-indigo-300 font-mono text-xs shadow-xl
                    transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0'}
                `}>
                   {currentScene?.description}
                </div>
            </div>
            
            {/* 4. Play Overlay Button */}
            {!isPlaying && globalTime < totalDuration && (
                <button 
                    onClick={() => setIsPlaying(true)}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-indigo-600/90 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform cursor-pointer backdrop-blur-sm z-10"
                >
                    <Play size={32} fill="currentColor" className="ml-1" />
                </button>
            )}

            <div className="absolute bottom-3 right-4 text-slate-600 font-mono text-[10px] opacity-40">
                ConceptAnim Preview Engine
            </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-slate-900 border-t border-slate-800 px-6 py-4">
         <div className="flex flex-col gap-2 max-w-5xl mx-auto">
             
             {/* Scrubber */}
             <div className="relative w-full h-8 flex items-center group">
                 <input 
                    type="range" 
                    min={0} 
                    max={totalDuration} 
                    step={0.1}
                    value={globalTime}
                    onChange={handleScrub}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 z-20 focus:outline-none"
                 />
                 <div className="absolute right-0 top-0 text-xs font-mono text-slate-400 -mt-4">
                     {globalTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
                 </div>
             </div>

             {/* Buttons */}
             <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setGlobalTime(0)}
                        className="text-slate-400 hover:text-white transition-colors p-2"
                        title="Reset"
                    >
                        <SkipBack size={20} />
                    </button>

                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center hover:bg-slate-200 transition-colors shadow focus:outline-none"
                    >
                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5"/>}
                    </button>

                     <button 
                        onClick={() => setGlobalTime(totalDuration)}
                        className="text-slate-400 hover:text-white transition-colors p-2"
                        title="End"
                    >
                        <SkipForward size={20} />
                    </button>
                 </div>

                 <div className="flex items-center gap-3">
                     <span className="text-xs text-slate-500 font-medium px-2 py-1 bg-slate-800 rounded">
                        SCENE {data.scenes.indexOf(currentScene!) + 1}
                     </span>
                     <button className="text-slate-400 hover:text-white p-2">
                        <Maximize size={18} />
                     </button>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};
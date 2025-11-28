export interface AnimationObject {
  id: string;
  type: 'circle' | 'square' | 'text' | 'graph' | 'vector' | 'matrix' | 'unknown';
  properties: Record<string, any>; // color, radius, text_content, etc.
}

export interface AnimationEvent {
  time_offset: number; // Seconds from start of scene
  target_id: string;
  type: 'create' | 'transform' | 'move' | 'fade_in' | 'fade_out' | 'grow' | 'scale' | 'rotate' | 'highlight' | 'change_text' | 'change_color';
  duration: number;
  parameters?: Record<string, any>; // target_position, scale_factor, degrees, new_content, new_color etc.
  description?: string;
}

export interface Scene {
  id: string;
  description: string;
  duration: number;
  objects: AnimationObject[];
  sequence: AnimationEvent[];
}

export interface GenerationResult {
  scenes: Scene[];
  manim_code: string;
  summary: string;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
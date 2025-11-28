import { GoogleGenAI, Type } from "@google/genai";
import { GenerationResult } from '../types';

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert educational animation engine (ConceptAnim). 
Your goal is to convert natural language descriptions of math, science, or computer science concepts into structured animation data and Manim (Python) code.

INPUT: A user prompt describing a concept (e.g., "Visualize Bubble Sort on [3, 1, 4]", "Explain Pythagoras Theorem").

OUTPUT: A JSON object containing:
1. 'summary': A one-sentence summary.
2. 'scenes': An array of scene objects. 
3. 'manim_code': A valid, complete Python script.

**CORE VISUALIZATION RULE: SHOW THE PROCESS**
- Do not just show the result. You must animate the **logic**.
- If the user asks for "Bubble Sort", show the elements **swapping** positions one by one.
- If the user asks for "Pythagoras", show the squares **forming** on the sides.
- Use 'change_text' to update counters or explanations dynamically.
- Use 'change_color' to indicate states (e.g., Red for comparison, Green for sorted).

**SCENE LOGIC & LAYOUT**:
1. **Narrator Text**: Always create a text object (id: "status_text") at y=-3.0 to explain the current step (e.g., "Comparing 3 and 1...", "Swapping values").
2. **Strict Layout**:
   - Title: y=3.0
   - Main Visuals: y=0 (Center)
   - Status/Steps: y=-3.0
3. **No Overlaps**: Calculate positions. If an object is at x=0, place the next at x=2.

**ANIMATION TYPES & USAGE**:
- **move**: Slide objects to new coordinates. ESSENTIAL for sorting/arranging.
  - *Swap Logic*: To swap Object A and Object B, create two simultaneous 'move' events: A moves to B's pos, B moves to A's pos.
- **change_text**: Update the text content of an object. Use this for variables (x=1 -> x=2) or status updates.
- **change_color**: Change fill color. Use for highlighting active elements.
- **create**: Fade in or grow objects.

**CRITICAL RULES FOR TEXT**:
- **MANDATORY**: 'text' objects MUST have 'text_content'.
- **MATH**: Use Unicode symbols: "θ", "π", "√", "²", "×".

**EXAMPLE SEQUENCE FOR "SWAP A AND B"**:
1. highlight A and B (duration 0.5)
2. update "status_text" to "Swapping..." (duration 0)
3. move A to B.x, move B to A.x (duration 1.0)
4. change_color A to "green" (duration 0.5)

**CANVAS SPECS**:
- Range: X[-7, 7], Y[-3.5, 3.5].
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    manim_code: { type: Type.STRING },
    scenes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          description: { type: Type.STRING },
          duration: { type: Type.NUMBER },
          objects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['circle', 'square', 'text', 'graph', 'vector', 'matrix', 'unknown'] },
                properties: { 
                  type: Type.OBJECT, 
                  properties: {
                    color: { type: Type.STRING, nullable: true },
                    radius: { type: Type.NUMBER, nullable: true },
                    text_content: { type: Type.STRING, nullable: true },
                    label: { type: Type.STRING, nullable: true },
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                    width: { type: Type.NUMBER, nullable: true },
                    height: { type: Type.NUMBER, nullable: true },
                    font_size: { type: Type.NUMBER, nullable: true }
                  },
                  required: ["x", "y"]
                }
              }
            }
          },
          sequence: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time_offset: { type: Type.NUMBER },
                target_id: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['create', 'transform', 'move', 'fade_in', 'fade_out', 'grow', 'scale', 'rotate', 'highlight', 'change_text', 'change_color'] },
                duration: { type: Type.NUMBER },
                description: { type: Type.STRING },
                parameters: { 
                  type: Type.OBJECT,
                  properties: {
                    target_position: { type: Type.ARRAY, items: { type: Type.NUMBER }, nullable: true },
                    scale_factor: { type: Type.NUMBER, nullable: true },
                    degrees: { type: Type.NUMBER, nullable: true },
                    new_content: { type: Type.STRING, nullable: true },
                    new_color: { type: Type.STRING, nullable: true }
                  },
                  nullable: true
                }
              }
            }
          }
        },
        required: ["id", "objects", "sequence", "duration"]
      }
    }
  },
  required: ["summary", "manim_code", "scenes"]
};

export const generateAnimationData = async (prompt: string): Promise<GenerationResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as GenerationResult;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
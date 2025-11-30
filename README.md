# ConceptAnim 🎬

![ConceptAnim Banner](https://img.shields.io/badge/AI-Powered-blue) ![React](https://img.shields.io/badge/React-19-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6) ![License](https://img.shields.io/badge/License-MIT-green)

An AI-powered educational animation generator that transforms natural language descriptions into stunning interactive visualizations and production-ready Manim Python code.

## ✨ Features

### 🤖 AI-Powered Generation
- Describe concepts in plain English
- Google Gemini 2.5 Flash processes your input
- Generates structured animation data automatically

### 🎥 Interactive Preview Player
- Real-time SVG animation engine
- Scrub through timeline with precision
- Play/pause controls with smooth easing
- Frame-perfect rendering at 60 FPS

### 📊 Multiple View Modes
- **Preview**: Watch your animation come to life
- **Timeline**: Inspect every event and timing
- **Code**: Export production-ready Manim Python
- **JSON**: View raw structured data

### 🎨 Smart Animation System
- Simultaneous multi-object animations
- Position interpolation with easing
- Color transitions and highlights
- Text content updates
- Scale, rotate, fade effects

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/conceptanim.git
cd conceptanim

# Install dependencies
npm install

# Create .env file with your API key
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 📖 Usage

### Basic Example

1. **Enter a prompt**:
   ```
   Visualize bubble sort algorithm sorting the array [5, 2, 8, 1, 9]
   ```

2. **Click Generate** and watch the magic happen!

3. **Explore the results**:
   - Preview tab: Interactive animation player
   - Timeline tab: Step-by-step breakdown
   - Code tab: Copy Manim Python code
   - JSON tab: Raw data structure

### Example Prompts

**Algorithms**:
```
Show binary search tree insertion of numbers 7, 3, 11, 1
Animate quicksort partitioning with pivot selection
Visualize Dijkstra's shortest path algorithm
```

**Mathematics**:
```
Explain the Pythagorean theorem with animated squares
Show the unit circle and trigonometric functions
Animate the proof of the sum of first n natural numbers
```

**Science**:
```
Visualize DNA replication process step by step
Show planetary orbits in the solar system
Animate the photoelectric effect
```

**Computer Science**:
```
Demonstrate how a stack data structure works
Show breadth-first search on a graph
Animate the process of merging two sorted arrays
```

## 🏗️ Project Structure

```
conceptanim/
├── components/
│   ├── Navbar.tsx              # Top navigation bar
│   ├── InputSection.tsx        # Prompt input area
│   ├── ResultsDashboard.tsx    # Main results container
│   ├── VideoPreview.tsx        # SVG animation engine
│   ├── TimelineViewer.tsx      # Event timeline display
│   ├── CodeViewer.tsx          # Manim code viewer
│   └── JsonViewer.tsx          # Raw JSON display
├── services/
│   └── geminiService.ts        # AI API integration
├── types.ts                     # TypeScript interfaces
├── App.tsx                      # Main app component
├── .env                         # API keys (not in git)
└── vite.config.ts              # Build configuration
```

## 🎯 How It Works

### 1. AI Prompt Engineering
The system uses carefully crafted prompts to instruct Gemini on:
- Animation principles and best practices
- Layout and positioning rules
- Timing and sequencing logic
- Manim code generation standards

### 2. Structured Output
Gemini returns JSON with strict schema validation:
```typescript
{
  summary: string,
  scenes: Scene[],
  manim_code: string
}
```

### 3. Animation Engine
Custom SVG renderer that:
- Converts Manim coordinates to SVG viewport
- Interpolates between animation states
- Applies cubic easing functions
- Manages object lifecycle and state

### 4. Timeline System
Events are processed chronologically:
- Object creation (fade_in, create)
- Transformations (move, scale, rotate)
- Property changes (color, text)
- Visual effects (highlight, pulse)

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

### Animation Parameters

Customize in `VideoPreview.tsx`:

```typescript
const VIEWBOX_W = 800;        // Canvas width
const VIEWBOX_H = 450;        // Canvas height
const MANIM_SCALE = 50;       // Pixels per Manim unit
const FPS = 60;               // Frame rate (implicit)
```

## 📚 API Reference

### `generateAnimationData(prompt: string)`

**Parameters**:
- `prompt` - Natural language description of the concept

**Returns**:
```typescript
Promise<GenerationResult>
```

**Example**:
```typescript
const result = await generateAnimationData(
  "Show insertion sort on [3, 1, 4, 1, 5]"
);
```

## 🎨 Animation Types

| Type | Description | Example Use |
|------|-------------|-------------|
| `create` | Fade in with scale | Initial object appearance |
| `fade_in` | Opacity 0 → 1 | Smooth entrance |
| `fade_out` | Opacity 1 → 0 | Smooth exit |
| `move` | Position interpolation | Sorting, rearranging |
| `scale` | Size transformation | Emphasis, zoom |
| `rotate` | Rotation animation | Geometric transforms |
| `highlight` | Pulsing effect | Draw attention |
| `change_text` | Update text content | Variables, counters |
| `change_color` | Color transition | State indication |

## 🛠️ Development

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Type Checking

```bash
npx tsc --noEmit
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Maintain existing code style (Prettier/ESLint)
- Add comments for complex animation logic
- Test with multiple prompt types
- Update documentation for new features

## 📝 Todo / Roadmap

- [ ] Add more animation presets
- [ ] Support for 3D animations
- [ ] Export to video format (MP4)
- [ ] Animation library/gallery
- [ ] Collaborative editing
- [ ] Custom color themes
- [ ] Audio narration sync
- [ ] Mobile responsive design improvements
- [ ] Offline mode with cached animations
- [ ] Animation speed controls

## ⚠️ Limitations

- Requires active internet connection (AI API)
- API rate limits apply (Gemini free tier)
- Complex 3D animations not yet supported
- Canvas size limited to viewport
- Manim code may need manual refinement for edge cases

## 🐛 Troubleshooting

### API Key Not Working
```bash
# Verify .env file exists and has correct format
cat .env
# Should show: GEMINI_API_KEY=your_key

# Restart dev server after .env changes
npm run dev
```

### Animation Not Playing
- Check browser console for errors
- Verify JSON structure in JSON tab
- Ensure scene duration > 0
- Check that objects have valid coordinates

### Slow Performance
- Reduce number of simultaneous animations
- Simplify prompt for fewer objects
- Close other browser tabs
- Use Chrome/Firefox for best performance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** - AI model powering the generation
- **Manim Community** - Animation framework inspiration
- **3Blue1Brown** - Educational animation pioneer
- **React Team** - Amazing frontend framework
- **Lucide Icons** - Beautiful icon library

## 📧 Contact

**Project Maintainer**: Your Name
- GitHub: [@yourusername](https://github.com/yourusername)
- Twitter: [@yourhandle](https://twitter.com/yourhandle)
- Email: your.email@example.com

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

---

**Made with ❤️ for educators, students, and visual learners everywhere**

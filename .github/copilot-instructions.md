# Felicity's Fossil Garden - AI Coding Instructions

## Project Overview
A **React 19 + Vite + Tailwind v4** sight words learning app for 6-year-olds. Uses gamification (eggs → creatures) with Leitner spaced repetition. Deployed to **GitHub Pages** at `/felicity-sight-words/`.

## Architecture

### Data Flow
1. **Words** (`src/data/words.js`) - Static Fry 50 high-frequency words with Heart Word phonics metadata
2. **Progress** (`useLeitner` hook) - Per-word learning state persisted to `localStorage`
3. **Session** - Selects due words via Leitner box intervals, tracks correct/incorrect, triggers mastery

### Key Components
| Component | Purpose |
|-----------|---------|
| `App.jsx` | Screen router (`GARDEN` ↔ `SESSION`) |
| `Garden.jsx` | Hub showing eggs (in-progress), creatures (mastered), start button |
| `Session.jsx` | Learning session with 3 phases: warmup → main → cooldown |
| `WordCard.jsx` | Self-report mode ("Got it!" / "Help me") with TTS and phonics overlay |
| `WordChoice.jsx` | Tap-to-select mode (4 options) - used for new words and Box 1 |
| `Egg.jsx` | Visual egg with crack progression (Box 1-4) + `HatchingAnimation` overlay |

### Interaction Modes
- **WordChoice**: For `isNew` or `box <= 1` words - child taps correct word from 4 options
- **WordCard**: For `box >= 2` words - child self-reports with "Got it!" or "Help me" buttons

### Leitner Spaced Repetition System
```
Box 0: Not started (word not yet introduced)
Box 1: Review every session
Box 2: Every 2 sessions  
Box 3: Every 4 sessions
Box 4: Every 8 sessions (maintenance)
Mastery: 3+ consecutive correct, 3+ sessions, <3s avg response → hatches creature
```

## Development Commands
```bash
npm run dev      # Start Vite dev server (localhost:5173)
npm run build    # Production build (outputs to dist/)
npm run preview  # Preview production build locally
```

## Deployment
Configured for GitHub Pages in `vite.config.js`:
```javascript
base: '/felicity-sight-words/'
```

## Key Conventions

### Word Data Structure
Each word in `words.js` follows this pattern - preserve structure when adding words:
```javascript
{ id: 1, word: "the", phonemes: ["th", "ə"], graphemes: ["th", "e"], heartParts: [1], type: "heart" }
// heartParts: indices of graphemes that need "heart memory" (irregular phonics)
// type: "heart" (irregular) or "flash" (decodable)
```

### Styling Patterns
- **Tailwind v4** with `@import "tailwindcss"` (no `@tailwind` directives)
- **Custom color tokens** in `tailwind.config.js`: `garden-*`, `egg-*`, `dino-*`
- Touch-optimized: use `.touch-btn` class for all interactive elements (48px min)
- Gradient backgrounds, `backdrop-blur-sm`, `drop-shadow` for depth
- Custom animations in `index.css`: `animate-wobble`, `animate-glow`, `animate-bounce-soft`, `celebrate`
- Font: **Nunito** (loaded via Google Fonts in `index.html`)

### Text-to-Speech
```javascript
const speak = (text, rate = 0.8) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  }
};
```

### State Persistence
Progress stored in `localStorage` key `felicity-sight-words-progress`. Structure:
```javascript
{ progress: { [wordId]: WordProgress }, sessionNumber: number, lastSaved: ISO string }
```

### Session Structure
Sessions organize words into phases for optimal learning:
1. **Warmup** (3 mastered words) - Easy wins to build confidence
2. **Main** (learning + new words interleaved) - Core practice
3. **Cooldown** (2 mastered words) - End on positive note

## UI/UX Guidelines
- Target audience: 6-year-olds on touch devices
- 85% success rate target - warmup with mastered words, end positively
- Session limit: 10 minutes max, 15 words max
- Immediate audio+visual feedback on all interactions
- Large text (5xl-7xl), high contrast, emoji-rich
- Mobile-first: `user-scalable=no`, tap highlight disabled

## Adding New Features
- **New words**: Add to `WORDS` array in `words.js` with phonics data
- **New creatures**: Add to `CREATURES` array with `id`, `name`, `emoji`, `colors[]`
- **New praise/encouragement**: Add to `PRAISE_PHRASES` or `ENCOURAGEMENT_PHRASES` arrays
- **New animations**: Define keyframes in `index.css`, add utility class

# Felicity's Fossil Garden - AI Coding Instructions

## Overview
React 19 + Vite + Tailwind v4 sight words app for 6-year-olds. Gamified Leitner spaced repetition: practice words → crack eggs → hatch creatures. Deployed to GitHub Pages at `/felicity-sight-words/`.

## Architecture

### Data Flow
1. **Words** (`src/data/words.js`) - Static Fry 50 high-frequency words with Heart Word phonics metadata
2. **Progress** (`useLeitner` hook) - Per-word learning state persisted to `localStorage`
3. **Session** - Selects due words via Leitner box intervals, tracks correct/incorrect, triggers mastery

```
words.js (static) → useLeitner hook (state + localStorage) → App (router) → Garden/Session
```

- **`App.jsx`**: Two-screen router (`GARDEN` ↔ `SESSION`)
- **`useLeitner.js`**: All learning logic - box progression, mastery checks, session word selection
- **`words.js`**: Fry 50 words with phonics metadata (`WORDS`, `CREATURES`, phrase arrays)

### Key Components
| Component | Purpose |
|-----------|---------|
| `App.jsx` | Screen router (`GARDEN` ↔ `SESSION`), owns `useLeitner` hook |
| `Garden.jsx` | Hub showing eggs (in-progress), creatures (mastered), start button |
| `Session.jsx` | Learning session with 3 phases: warmup → main → cooldown |
| `WordCard.jsx` | Self-report mode ("Got it!" / "Help me") with TTS + phonics hints |
| `WordChoice` | Tap-to-select from 4 options (export from `WordCard.jsx`) |
| `Egg.jsx` | Visual egg with crack progression (Box 1-4) + `HatchingAnimation` |

### Interaction Modes
- **WordChoice**: For `isNew` or `box <= 1` words - child taps correct word from 4 options
- **WordCard**: For `box >= 2` words - child self-reports with "Got it!" or "Help me"

### Leitner Box System (in `useLeitner.js`)
```
Box 0: Not introduced | Box 1: Every session | Box 2: Every 2 | Box 3: Every 4 | Box 4: Every 8
Mastery: consecutiveCorrect >= 3 && sessions >= 3 && avgResponseTime < 3000ms
```

### Session Phases (in `Session.jsx`)
Words organized as: **Warmup** (3 mastered) → **Main** (learning + new interleaved) → **Cooldown** (2 mastered)

## Commands
```bash
npm run dev      # Vite dev server on localhost:5173
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

## Key Patterns

### Word Data Structure
```javascript
{ id: 1, word: "the", phonemes: ["th", "ə"], graphemes: ["th", "e"], heartParts: [1], type: "heart" }
// heartParts: grapheme indices needing "heart memory" (irregular phonics)
// type: "heart" (irregular) | "flash" (decodable)
```

### Styling (Tailwind v4)
- Use `@import "tailwindcss"` (not `@tailwind` directives)
- **`.touch-btn`** class required for all interactive elements (48px min touch target)
- Custom animations in `index.css`: `animate-wobble`, `animate-glow`, `animate-bounce-soft`, `celebrate`
- Visual depth: `bg-white/20 backdrop-blur-sm`, `drop-shadow-lg`, gradient backgrounds
- Font: **Nunito** via Google Fonts

### Text-to-Speech Helper (in `WordCard.jsx`)
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
localStorage key: `felicity-sight-words-progress`
```javascript
{ progress: { [wordId]: WordProgress }, sessionNumber: number, lastSaved: ISO }
```

### Session Structure
Sessions organize words into phases for optimal learning:
1. **Warmup** (up to 3 mastered words) - Easy wins to build confidence
2. **Main** (learning + new words interleaved) - Core practice
3. **Cooldown** (2 mastered words) - End on positive note

## UI/UX Rules
- **Target**: 6-year-olds on touch devices
- 85% success rate target - warmup with mastered words, end positively
- Large text (`text-5xl` to `text-7xl`), high contrast, emoji-rich
- Immediate audio + visual feedback on all interactions
- Session limits: 10 min max, 15 words max, 3 new words max per session

## Extending the App
| To add | Location | Structure |
|--------|----------|-----------|
| New words | `WORDS[]` in `words.js` | `{id, word, phonemes, graphemes, heartParts, type}` |
| New creatures | `CREATURES[]` in `words.js` | `{id, name, emoji, colors[]}` |
| Praise/encouragement | Arrays in `words.js` | Simple strings |
| Animations | `index.css` | `@keyframes` + `.animate-*` class |

## Egg Visual Progression (in `Egg.jsx`)
Box 0-1: dim/small → Box 2: glowing → Box 3-4: wobbling + cracks → Mastered: `HatchingAnimation` overlay

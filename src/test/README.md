# Unit Tests for Felicity's Fossil Garden

This directory contains comprehensive unit tests for the core game logic.

## Test Coverage

### 1. useLeitner.test.js (25 tests)
Tests the Leitner spaced repetition system hook:

**Initialization**
- Word progress initialization for all 50 words
- Session number starts at 1
- Loading progress from localStorage

**Session Word Selection**
- Returns new words when none have been started
- Respects maxNew parameter (default 3)
- Box 1 words appear every session
- Box 2 words appear every 2 sessions
- Box 3 words appear every 4 sessions
- Box 4 words appear every 8 sessions
- Includes mastered words for maintenance

**Answer Recording**
- Updates stats (timesSeen, timesCorrect, timesIncorrect, etc.)
- Moves words up boxes on correct answers (max box 4)
- Resets consecutiveCorrect and moves to box 1 on incorrect
- Tracks response times and session history

**Mastery Conditions**
- Requires 3+ consecutive correct answers
- Requires seen in 3+ unique sessions
- Requires average response time < 3 seconds
- Assigns random creature and color on mastery
- Sets box to 4 on mastery

**Session Management**
- startSession initializes session stats
- endSession increments session number
- Session stats track correct/incorrect/mastered words

**Statistics**
- Calculates total words, words started, words mastered
- Returns creature collection with metadata

**Utility Functions**
- getWord returns word with progress
- resetProgress clears all progress

**Persistence**
- Saves to localStorage after changes
- Loads from localStorage on initialization

### 2. words.test.js (34 tests)
Tests data structure validity and consistency:

**WORDS Array (Fry First 50 High-Frequency Words)**
- Contains exactly 50 words
- All IDs are unique and sequential (1-50)
- Required fields: id, word, phonemes, graphemes, heartParts, type
- Types are either "heart" (irregular) or "flash" (decodable)
- Phonemes and graphemes arrays are non-empty
- heartParts indices are within graphemes bounds
- Heart words have non-empty heartParts
- Flash words have empty heartParts
- No duplicate words
- Graphemes combine to form the word

**CREATURES Array**
- At least 5 creature types
- Unique IDs for all creatures
- Required fields: id, name, emoji, colors
- Colors in valid hex format (#rrggbb)
- Contains T-Rex and Triceratops

**PRAISE_PHRASES Array**
- At least 5 phrases
- All non-empty strings
- Contains positive language
- All phrases are unique

**ENCOURAGEMENT_PHRASES Array**
- At least 3 phrases
- All non-empty strings
- Contains supportive language
- All phrases are unique

**Data Consistency**
- Proper distribution of heart vs flash words
- Consistent structure across all entries

### 3. audio.test.js (28 tests)
Tests audio playback utilities:

**Speech Synthesis (TTS)**
- Uses window.speechSynthesis API
- Cancels previous speech before speaking
- Sets correct speech rate and pitch
- Handles missing speechSynthesis gracefully

**Word Audio**
- Creates Audio elements with correct path
- Converts words to lowercase for file lookup
- Falls back to TTS when audio files don't exist
- Loads audio elements
- Handles missing Audio API

**Audio Control**
- stopAudio cancels all playback
- Handles missing APIs gracefully

**Preloading**
- Attempts to preload multiple words
- Checks if audio files exist via fetch
- Handles network errors gracefully
- Converts words to lowercase
- Creates Audio elements for existing files

**Edge Cases**
- Handles special characters in words
- Handles very long phrases
- Handles empty strings
- Handles rate parameter edge values

## Running Tests

```bash
# Run all tests once
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Test Technology Stack

- **Vitest**: Fast unit test framework (Vite-native)
- **@testing-library/react**: React component testing utilities
- **@testing-library/jest-dom**: Custom matchers for DOM assertions
- **@testing-library/user-event**: User interaction simulation
- **jsdom**: Browser environment simulation for Node.js

## Test Setup

Tests use mocked browser APIs to avoid dependencies:
- `localStorage` - Mocked for progress persistence
- `speechSynthesis` - Mocked for TTS functionality  
- `Audio` - Mocked for audio playback
- `fetch` - Mocked for audio file checks

See `src/test/setup.js` for global test configuration.

## Writing New Tests

1. Create test file in `src/test/` directory
2. Import necessary testing utilities
3. Use `describe` blocks to group related tests
4. Use `beforeEach` for test setup
5. Use `it` or `test` for individual test cases
6. Mock browser APIs as needed

Example:
```javascript
import { describe, it, expect, beforeEach } from 'vitest';

describe('MyComponent', () => {
  beforeEach(() => {
    // Setup code
  });

  it('should do something', () => {
    // Test code
    expect(result).toBe(expected);
  });
});
```

## Test Maintenance

- Run tests before committing changes
- Update tests when changing core logic
- Add tests for new features
- Keep test data in sync with production data
- Document complex test scenarios

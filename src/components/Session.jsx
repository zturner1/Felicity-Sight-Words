import React, { useState, useEffect, useCallback } from 'react';
import { WORDS, CREATURES } from '../data/words';
import WordCard, { WordChoice } from './WordCard';
import { HatchingAnimation } from './Egg';

// Session phases
const PHASES = {
  WARMUP: 'warmup',
  MAIN: 'main',
  COOLDOWN: 'cooldown',
  COMPLETE: 'complete',
};

export function Session({ 
  wordsForSession, 
  onAnswer, 
  onComplete, 
  onExit,
  sessionStats,
  progress 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState(PHASES.WARMUP);
  const [sessionWords, setSessionWords] = useState([]);
  const [hatchingCreature, setHatchingCreature] = useState(null);
  const [startTime] = useState(Date.now());

  // Organize words into phases
  useEffect(() => {
    const mastered = wordsForSession.filter(w => w.isMaintenance);
    const learning = wordsForSession.filter(w => !w.isMaintenance && !w.isNew);
    const newWords = wordsForSession.filter(w => w.isNew);

    // Session structure:
    // Warmup: 3-5 mastered words (easy wins)
    // Main: Learning words interleaved with new words
    // Cooldown: 2-3 mastered words (positive ending)

    const warmup = mastered.slice(0, Math.min(3, mastered.length));
    const cooldown = mastered.slice(3, 5);
    
    // Interleave learning and new words
    const main = [];
    const maxLen = Math.max(learning.length, newWords.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < learning.length) main.push(learning[i]);
      if (i < newWords.length) main.push(newWords[i]);
    }

    setSessionWords([
      ...warmup.map(w => ({ ...w, phase: PHASES.WARMUP })),
      ...main.map(w => ({ ...w, phase: PHASES.MAIN })),
      ...cooldown.map(w => ({ ...w, phase: PHASES.COOLDOWN })),
    ]);
  }, [wordsForSession]);

  const currentWord = sessionWords[currentIndex];

  // Check for session time limit (10 minutes)
  useEffect(() => {
    const checkTime = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000 / 60;
      if (elapsed >= 10) {
        setPhase(PHASES.COMPLETE);
      }
    }, 10000);
    return () => clearInterval(checkTime);
  }, [startTime]);

  // Handle answer
  const handleAnswer = useCallback((wordId, correct, responseTime) => {
    onAnswer(wordId, correct, responseTime);

    // Check if word was just mastered
    const wordProgress = progress[wordId];
    if (wordProgress && !wordProgress.mastered) {
      // Check if this answer caused mastery
      const updatedCorrect = wordProgress.consecutiveCorrect + (correct ? 1 : 0);
      const uniqueSessions = new Set([...wordProgress.sessionsSeenIn]).size;
      const avgTime = [...wordProgress.responseTimes, responseTime].reduce((a, b) => a + b, 0) / 
                      (wordProgress.responseTimes.length + 1);
      
      if (correct && updatedCorrect >= 3 && uniqueSessions >= 2 && avgTime < 3000) {
        // Show hatching animation!
        const creature = CREATURES.find(c => c.id === wordProgress.creatureId) || 
                        CREATURES[Math.floor(Math.random() * CREATURES.length)];
        setHatchingCreature({
          creature,
          color: creature.colors[Math.floor(Math.random() * creature.colors.length)],
          word: WORDS.find(w => w.id === wordId)?.word,
        });
        return; // Don't advance yet, wait for hatching animation
      }
    }

    advanceToNext();
  }, [onAnswer, progress]);

  const advanceToNext = () => {
    if (currentIndex < sessionWords.length - 1) {
      setCurrentIndex(i => i + 1);
      
      // Update phase based on next word
      const nextWord = sessionWords[currentIndex + 1];
      if (nextWord) {
        setPhase(nextWord.phase);
      }
    } else {
      setPhase(PHASES.COMPLETE);
    }
  };

  const handleHatchComplete = () => {
    setHatchingCreature(null);
    advanceToNext();
  };

  // Get display options for word choice mode
  const getWordOptions = (word) => {
    const options = [word.word];
    const otherWords = WORDS.filter(w => w.id !== word.id);
    
    // Pick 3 random distractor words
    while (options.length < 4 && otherWords.length > 0) {
      const idx = Math.floor(Math.random() * otherWords.length);
      options.push(otherWords[idx].word);
      otherWords.splice(idx, 1);
    }
    
    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
  };

  // Session complete screen
  if (phase === PHASES.COMPLETE) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 drop-shadow-lg">
          Great Practice!
        </h2>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8 w-full max-w-sm">
          <div className="grid grid-cols-2 gap-4 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300">
                {sessionStats.correct}
              </div>
              <div className="text-sm opacity-80">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {sessionStats.wordsReviewed}
              </div>
              <div className="text-sm opacity-80">Words</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-300">
                {sessionStats.wordsMastered.length}
              </div>
              <div className="text-sm opacity-80">Hatched!</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </div>
              <div className="text-sm opacity-80">Time</div>
            </div>
          </div>
        </div>

        <button
          onClick={onComplete}
          className="touch-btn px-10 py-5 bg-gradient-to-b from-yellow-400 to-orange-500
                     text-white text-2xl font-bold rounded-2xl shadow-xl"
        >
          Back to Garden 🌿
        </button>
      </div>
    );
  }

  // Loading state
  if (!currentWord) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-white">Loading...</div>
      </div>
    );
  }

  // Hatching animation overlay
  if (hatchingCreature) {
    return (
      <HatchingAnimation
        creature={hatchingCreature.creature}
        color={hatchingCreature.color}
        onComplete={handleHatchComplete}
      />
    );
  }

  // Determine card type based on word state
  const useChoiceMode = currentWord.isNew || (currentWord.progress?.box || 0) <= 1;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-green-700/50 backdrop-blur-sm p-3 flex items-center justify-between">
        <button
          onClick={onExit}
          className="touch-btn w-12 h-12 bg-white/20 text-white text-xl rounded-full"
        >
          ✕
        </button>
        
        <div className="flex items-center gap-2 text-white">
          <span className="text-sm opacity-80">
            {phase === PHASES.WARMUP && '🔥 Warm-up'}
            {phase === PHASES.MAIN && '📚 Learning'}
            {phase === PHASES.COOLDOWN && '🌙 Cool-down'}
          </span>
          <span className="font-bold">
            {currentIndex + 1} / {sessionWords.length}
          </span>
        </div>

        <div className="flex items-center gap-1 text-white">
          <span className="text-yellow-300 font-bold">{sessionStats.correct}</span>
          <span className="text-xl">⭐</span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-2 bg-white/20">
        <div 
          className="h-full bg-yellow-400 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / sessionWords.length) * 100}%` }}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center">
        {useChoiceMode ? (
          <WordChoice
            word={currentWord}
            options={getWordOptions(currentWord)}
            onAnswer={handleAnswer}
          />
        ) : (
          <WordCard
            word={currentWord}
            onAnswer={handleAnswer}
            showPhonics={true}
          />
        )}
      </main>
    </div>
  );
}

export default Session;

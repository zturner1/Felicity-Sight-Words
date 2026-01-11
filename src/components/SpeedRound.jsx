import React, { useState, useEffect, useCallback } from 'react';
import { WORDS, PRAISE_PHRASES } from '../data/words';
import { speakWord, speakPhrase } from '../utils/audio';

function SpeedRound({ progress, onExit }) {
  const [currentWord, setCurrentWord] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [showFeedback, setShowFeedback] = useState(null);
  const [wordsCompleted, setWordsCompleted] = useState(0);

  // Get words the child has seen
  const getGameWords = useCallback(() => {
    const seenWords = Object.values(progress)
      .filter(p => p.box >= 1)
      .map(p => WORDS.find(w => w.id === p.wordId))
      .filter(Boolean);
    
    return seenWords.length >= 5 ? seenWords : WORDS.slice(0, 10);
  }, [progress]);

  const [gameWords] = useState(getGameWords);

  // Pick next word
  const nextWord = useCallback(() => {
    const word = gameWords[Math.floor(Math.random() * gameWords.length)];
    setCurrentWord(word);
    speakWord(word.word);
  }, [gameWords]);

  // Initialize game
  useEffect(() => {
    nextWord();
  }, [nextWord]);

  // Timer countdown
  useEffect(() => {
    if (gameOver) return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameOver(true);
          speakPhrase(`Great job! You got ${score} points!`);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, score]);

  // Handle tap - they know it!
  const handleKnowIt = () => {
    const points = 10 + (streak * 5); // Bonus for streaks
    setScore(s => s + points);
    setStreak(s => s + 1);
    setWordsCompleted(w => w + 1);
    setShowFeedback({ type: 'correct', points });
    
    setTimeout(() => {
      setShowFeedback(null);
      nextWord();
    }, 400);
  };

  // Handle skip
  const handleSkip = () => {
    setStreak(0);
    setShowFeedback({ type: 'skip' });
    
    setTimeout(() => {
      setShowFeedback(null);
      nextWord();
    }, 400);
  };

  // Hear word again
  const handleHear = () => {
    if (currentWord) {
      speakWord(currentWord.word);
    }
  };

  // Game over screen
  if (gameOver) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl mb-6">⚡</div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 drop-shadow-lg">
          Speed Round Complete!
        </h2>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8 w-full max-w-sm">
          <div className="grid grid-cols-2 gap-4 text-white">
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-300">
                {score}
              </div>
              <div className="text-sm opacity-80">Points</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-300">
                {wordsCompleted}
              </div>
              <div className="text-sm opacity-80">Words</div>
            </div>
          </div>
        </div>

        <button
          onClick={onExit}
          className="touch-btn px-10 py-5 bg-gradient-to-b from-yellow-400 to-orange-500
                     text-white text-2xl font-bold rounded-2xl shadow-xl"
        >
          Back to Garden 🌿
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-green-700/50 backdrop-blur-sm p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button
            onClick={onExit}
            className="touch-btn px-4 py-2 bg-white/20 text-white rounded-xl text-lg"
          >
            ← Exit
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow">
            ⚡ Speed Round
          </h1>
          <div className="text-white text-xl font-bold">
            {timeLeft}s
          </div>
        </div>
      </header>

      {/* Score bar */}
      <div className="bg-white/10 px-4 py-2 flex justify-center gap-8 text-white">
        <span className="text-xl">🏆 {score}</span>
        <span className="text-xl">🔥 {streak} streak</span>
      </div>

      {/* Main game area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Feedback overlay */}
        {showFeedback && (
          <div className={`absolute text-4xl font-bold animate-bounce ${
            showFeedback.type === 'correct' ? 'text-yellow-300' : 'text-white/50'
          }`}>
            {showFeedback.type === 'correct' ? `+${showFeedback.points}!` : 'Skip'}
          </div>
        )}

        {/* Word display */}
        <div className="text-6xl sm:text-7xl md:text-8xl font-extrabold text-white drop-shadow-lg mb-12">
          {currentWord?.word}
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 sm:gap-6">
          <button
            onClick={handleHear}
            className="touch-btn w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 text-white text-3xl rounded-full shadow-lg"
          >
            🔊
          </button>
          
          <button
            onClick={handleKnowIt}
            className="touch-btn px-10 py-6 sm:px-16 sm:py-8 bg-green-500 text-white 
                       text-3xl sm:text-4xl font-bold rounded-2xl shadow-lg"
          >
            ✓ Know it!
          </button>
          
          <button
            onClick={handleSkip}
            className="touch-btn w-16 h-16 sm:w-20 sm:h-20 bg-orange-400 text-white text-2xl rounded-full shadow-lg"
          >
            Skip
          </button>
        </div>
      </main>

      {/* Instructions */}
      <footer className="p-4 text-center">
        <p className="text-white/80 text-lg">
          Tap "Know it!" for every word you can read! ⚡
        </p>
      </footer>
    </div>
  );
}

export default SpeedRound;

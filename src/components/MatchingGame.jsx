import React, { useState, useEffect, useCallback } from 'react';
import { WORDS, PRAISE_PHRASES } from '../data/words';

// Text-to-speech helper
const speak = (text, rate = 0.8) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }
};

function MatchingGame({ progress, onExit }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [startTime] = useState(Date.now());

  // Initialize game with word pairs
  useEffect(() => {
    // Get words that have been seen (box >= 1) for practice, or use first 6 words
    const seenWords = Object.values(progress)
      .filter(p => p.box >= 1)
      .map(p => WORDS.find(w => w.id === p.wordId))
      .filter(Boolean);
    
    const wordsToUse = seenWords.length >= 6 
      ? seenWords.slice(0, 6)
      : WORDS.slice(0, 6);

    // Create pairs (each word appears twice)
    const pairs = [...wordsToUse, ...wordsToUse].map((word, index) => ({
      id: index,
      wordId: word.id,
      word: word.word,
    }));

    // Shuffle cards
    const shuffled = pairs.sort(() => Math.random() - 0.5);
    setCards(shuffled);
  }, [progress]);

  // Handle card flip
  const handleCardClick = useCallback((cardId) => {
    if (isChecking) return;
    if (flipped.includes(cardId)) return;
    if (matched.includes(cardId)) return;
    if (flipped.length >= 2) return;

    const card = cards.find(c => c.id === cardId);
    speak(card.word);

    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsChecking(true);

      const [first, second] = newFlipped;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);

      if (firstCard.wordId === secondCard.wordId) {
        // Match found!
        setTimeout(() => {
          const praise = PRAISE_PHRASES[Math.floor(Math.random() * PRAISE_PHRASES.length)];
          speak(praise.replace(/[^\w\s]/g, ''));
          setMatched(prev => [...prev, first, second]);
          setFlipped([]);
          setIsChecking(false);
        }, 600);
      } else {
        // No match - flip back
        setTimeout(() => {
          setFlipped([]);
          setIsChecking(false);
        }, 1200);
      }
    }
  }, [cards, flipped, matched, isChecking]);

  // Check for game complete
  useEffect(() => {
    if (cards.length > 0 && matched.length === cards.length) {
      setGameComplete(true);
      speak("Amazing! You found all the matches!");
    }
  }, [matched, cards.length]);

  // Game complete screen
  if (gameComplete) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 drop-shadow-lg">
          You Did It!
        </h2>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8 w-full max-w-sm">
          <div className="grid grid-cols-2 gap-4 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300">
                {matched.length / 2}
              </div>
              <div className="text-sm opacity-80">Pairs Found</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {moves}
              </div>
              <div className="text-sm opacity-80">Moves</div>
            </div>
            <div className="text-center col-span-2">
              <div className="text-3xl font-bold text-green-300">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </div>
              <div className="text-sm opacity-80">Time</div>
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
            ← Back
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow">
            🧠 Memory Match
          </h1>
          <div className="text-white text-lg">
            Moves: {moves}
          </div>
        </div>
      </header>

      {/* Game board */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 max-w-lg w-full">
          {cards.map((card) => {
            const isFlipped = flipped.includes(card.id);
            const isMatched = matched.includes(card.id);

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={isFlipped || isMatched || isChecking}
                className={`
                  touch-btn aspect-square rounded-xl text-2xl sm:text-3xl font-bold
                  transition-all duration-300 transform
                  ${isFlipped || isMatched
                    ? 'bg-white text-green-700 scale-105 shadow-xl'
                    : 'bg-gradient-to-b from-purple-500 to-purple-700 text-white shadow-lg hover:scale-105'
                  }
                  ${isMatched ? 'ring-4 ring-yellow-400 animate-pulse' : ''}
                `}
              >
                {isFlipped || isMatched ? (
                  <span>{card.word}</span>
                ) : (
                  <span className="text-4xl">❓</span>
                )}
              </button>
            );
          })}
        </div>
      </main>

      {/* Instructions */}
      <footer className="p-4 text-center">
        <p className="text-white/80 text-lg">
          Tap cards to find matching word pairs! 🎯
        </p>
      </footer>
    </div>
  );
}

export default MatchingGame;

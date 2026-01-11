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

// Shuffle array helper
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Single card component
function Card({ card, isFlipped, isMatched, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isMatched}
      className={`
        touch-btn aspect-square w-full
        rounded-2xl text-3xl sm:text-4xl font-bold
        transition-all duration-300 transform
        ${isMatched 
          ? 'bg-green-400 text-white scale-95 opacity-70' 
          : isFlipped 
            ? 'bg-white text-purple-700 shadow-lg scale-105' 
            : 'bg-gradient-to-b from-purple-400 to-purple-600 text-white shadow-md hover:scale-105'
        }
        ${disabled && !isMatched ? 'cursor-not-allowed' : ''}
      `}
    >
      {isFlipped || isMatched ? (
        <span className={isMatched ? 'line-through opacity-60' : ''}>
          {card.word}
        </span>
      ) : (
        <span className="text-4xl">❓</span>
      )}
    </button>
  );
}

export function MemoryMatch({ progress, onComplete, onRecordAnswer }) {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [startTime] = useState(Date.now());

  // Initialize game with words from progress
  useEffect(() => {
    // Get words that have been started (box >= 1) for matching practice
    const availableWords = Object.values(progress)
      .filter(p => p.box >= 1)
      .map(p => WORDS.find(w => w.id === p.wordId))
      .filter(Boolean);

    // If not enough started words, use first words from WORDS
    let gameWords = availableWords.length >= 4 
      ? availableWords 
      : WORDS.slice(0, 6);

    // Take 4-6 words for the game (8-12 cards)
    gameWords = shuffleArray(gameWords).slice(0, 6);

    // Create pairs (each word appears twice)
    const cardPairs = gameWords.flatMap((word, index) => [
      { id: `${word.id}-a`, wordId: word.id, word: word.word, pairIndex: index },
      { id: `${word.id}-b`, wordId: word.id, word: word.word, pairIndex: index },
    ]);

    setCards(shuffleArray(cardPairs));
  }, [progress]);

  // Handle card click
  const handleCardClick = useCallback((index) => {
    if (isChecking || flippedIndices.includes(index)) return;
    if (matchedPairs.includes(cards[index].pairIndex)) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // Speak the word
    speak(cards[index].word);

    // If two cards are flipped, check for match
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsChecking(true);

      const [first, second] = newFlipped;
      const isMatch = cards[first].pairIndex === cards[second].pairIndex;

      setTimeout(() => {
        if (isMatch) {
          // Match found!
          const praise = PRAISE_PHRASES[Math.floor(Math.random() * PRAISE_PHRASES.length)];
          speak(praise.replace(/[^\w\s]/g, ''));
          
          setMatchedPairs(prev => [...prev, cards[first].pairIndex]);
          
          // Record as correct answer for the word
          if (onRecordAnswer) {
            onRecordAnswer(cards[first].wordId, true, 2000);
          }

          // Check if game is complete
          const newMatchedCount = matchedPairs.length + 1;
          if (newMatchedCount === cards.length / 2) {
            setTimeout(() => setGameComplete(true), 500);
          }
        }
        
        setFlippedIndices([]);
        setIsChecking(false);
      }, isMatch ? 800 : 1200);
    }
  }, [cards, flippedIndices, isChecking, matchedPairs, onRecordAnswer]);

  // Game complete screen
  if (gameComplete) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const stars = moves <= cards.length / 2 + 2 ? 3 : moves <= cards.length / 2 + 5 ? 2 : 1;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 drop-shadow-lg">
          You Did It!
        </h2>
        
        <div className="text-5xl mb-6">
          {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8 w-full max-w-sm">
          <div className="grid grid-cols-2 gap-4 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300">{moves}</div>
              <div className="text-sm opacity-80">Moves</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{elapsed}s</div>
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

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <button
          onClick={onComplete}
          className="touch-btn px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white font-bold"
        >
          ← Back
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow">
          🧠 Memory Match
        </h1>
        <div className="text-white font-bold bg-white/20 px-4 py-2 rounded-xl">
          Moves: {moves}
        </div>
      </header>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
            style={{ width: `${(matchedPairs.length / (cards.length / 2)) * 100}%` }}
          />
        </div>
        <p className="text-white/80 text-sm mt-1 text-center">
          {matchedPairs.length} / {cards.length / 2} pairs found
        </p>
      </div>

      {/* Card grid */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-lg">
          {cards.map((card, index) => (
            <Card
              key={card.id}
              card={card}
              isFlipped={flippedIndices.includes(index)}
              isMatched={matchedPairs.includes(card.pairIndex)}
              onClick={() => handleCardClick(index)}
              disabled={isChecking}
            />
          ))}
        </div>
      </div>

      {/* Instructions */}
      <p className="text-center text-white/70 mt-4 text-lg">
        Tap cards to find matching pairs! 🔊
      </p>
    </div>
  );
}

export default MemoryMatch;

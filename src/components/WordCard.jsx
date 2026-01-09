import React, { useState, useEffect, useRef } from 'react';
import { PRAISE_PHRASES, ENCOURAGEMENT_PHRASES } from '../data/words';
import Egg from './Egg';

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

export function WordCard({ word, onAnswer, showPhonics = true }) {
  const [phase, setPhase] = useState('show'); // show, respond, feedback
  const [startTime, setStartTime] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showHeartParts, setShowHeartParts] = useState(false);

  useEffect(() => {
    // Speak the word when shown
    setPhase('show');
    setFeedback(null);
    setShowHeartParts(false);
    
    const timer = setTimeout(() => {
      speak(word.word);
      setStartTime(Date.now());
      setPhase('respond');
    }, 500);

    return () => clearTimeout(timer);
  }, [word.id]);

  const handleResponse = (correct) => {
    const responseTime = Date.now() - startTime;
    
    if (correct) {
      const praise = PRAISE_PHRASES[Math.floor(Math.random() * PRAISE_PHRASES.length)];
      setFeedback({ type: 'correct', message: praise });
      speak(praise.replace(/[^\w\s]/g, ''));
    } else {
      const encourage = ENCOURAGEMENT_PHRASES[Math.floor(Math.random() * ENCOURAGEMENT_PHRASES.length)];
      setFeedback({ type: 'incorrect', message: encourage });
      setShowHeartParts(true);
      speak(`${encourage} The word is ${word.word}.`);
    }

    setPhase('feedback');
    
    setTimeout(() => {
      onAnswer(word.id, correct, responseTime);
    }, correct ? 1500 : 2500);
  };

  // Render heart parts for phonics support
  const renderWordWithHeartParts = () => {
    if (!showPhonics || word.type !== 'heart' || !showHeartParts) {
      return <span>{word.word}</span>;
    }

    return (
      <span className="flex items-center justify-center gap-1">
        {word.graphemes.map((g, i) => (
          <span
            key={i}
            className={`
              relative px-2 py-1 rounded-lg
              ${word.heartParts.includes(i) 
                ? 'bg-pink-500/30 border-2 border-pink-400' 
                : 'bg-green-500/30 border-2 border-green-400'}
            `}
          >
            {g}
            {word.heartParts.includes(i) && (
              <span className="absolute -top-3 -right-2 text-lg">❤️</span>
            )}
          </span>
        ))}
      </span>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Egg visualization */}
      <div className="mb-8">
        <Egg 
          box={word.progress?.box || 1} 
          isAnimating={feedback?.type === 'correct'}
          size="lg"
        />
      </div>

      {/* Word display */}
      <div 
        className={`
          text-5xl sm:text-6xl md:text-7xl font-extrabold text-white 
          drop-shadow-lg tracking-wide mb-8
          ${feedback?.type === 'correct' ? 'celebrate text-yellow-300' : ''}
          ${feedback?.type === 'incorrect' ? 'text-white/80' : ''}
        `}
      >
        {renderWordWithHeartParts()}
      </div>

      {/* Feedback message */}
      {feedback && (
        <div 
          className={`
            text-2xl sm:text-3xl font-bold mb-8 text-center
            ${feedback.type === 'correct' ? 'text-yellow-300' : 'text-white/90'}
          `}
        >
          {feedback.message}
        </div>
      )}

      {/* Response buttons */}
      {phase === 'respond' && (
        <div className="flex gap-4 sm:gap-8">
          <button
            onClick={() => speak(word.word)}
            className="touch-btn w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 text-white text-3xl rounded-full shadow-lg"
            aria-label="Hear word again"
          >
            🔊
          </button>
          
          <button
            onClick={() => handleResponse(true)}
            className="touch-btn px-8 py-4 sm:px-12 sm:py-6 bg-green-500 text-white 
                       text-2xl sm:text-3xl font-bold rounded-2xl shadow-lg"
          >
            Got it! ✓
          </button>
          
          <button
            onClick={() => handleResponse(false)}
            className="touch-btn px-8 py-4 sm:px-12 sm:py-6 bg-orange-400 text-white 
                       text-2xl sm:text-3xl font-bold rounded-2xl shadow-lg"
          >
            Help me
          </button>
        </div>
      )}

      {/* Phonics hint for heart words */}
      {showHeartParts && word.type === 'heart' && (
        <div className="mt-6 text-center text-white/80 text-lg">
          <span className="inline-flex items-center gap-2">
            ❤️ = tricky part to learn by heart
          </span>
        </div>
      )}
    </div>
  );
}

export function WordChoice({ word, options, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setSelected(null);
    setFeedback(null);
    speak(`Touch the word: ${word.word}`);
    setStartTime(Date.now());
  }, [word.id]);

  const handleSelect = (option) => {
    if (selected) return;
    
    const correct = option === word.word;
    const responseTime = Date.now() - startTime;
    
    setSelected(option);
    setFeedback(correct ? 'correct' : 'incorrect');
    
    if (correct) {
      speak(PRAISE_PHRASES[Math.floor(Math.random() * PRAISE_PHRASES.length)].replace(/[^\w\s]/g, ''));
    } else {
      speak(`That's ${option}. The word is ${word.word}.`);
    }

    setTimeout(() => {
      onAnswer(word.id, correct, responseTime);
    }, correct ? 1500 : 2500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Prompt */}
      <div className="text-2xl sm:text-3xl text-white/90 font-semibold mb-8 text-center">
        Touch the word: <span className="text-yellow-300 font-bold">{word.word}</span>
      </div>

      {/* Hear again button */}
      <button
        onClick={() => speak(word.word)}
        className="touch-btn w-16 h-16 bg-blue-500 text-white text-3xl rounded-full shadow-lg mb-8"
        aria-label="Hear word again"
      >
        🔊
      </button>

      {/* Word options */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-md">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            disabled={selected !== null}
            className={`
              touch-btn py-6 sm:py-8 text-3xl sm:text-4xl font-bold rounded-2xl shadow-lg
              transition-all duration-200
              ${selected === null 
                ? 'bg-white text-gray-800 active:bg-gray-100' 
                : option === word.word
                  ? 'bg-green-500 text-white scale-105'
                  : selected === option
                    ? 'bg-red-400 text-white opacity-70'
                    : 'bg-white/50 text-gray-500'
              }
            `}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {feedback && (
        <div 
          className={`
            mt-8 text-2xl font-bold
            ${feedback === 'correct' ? 'text-yellow-300' : 'text-white/90'}
          `}
        >
          {feedback === 'correct' ? '🌟 Great job! 🌟' : `The word is "${word.word}"`}
        </div>
      )}
    </div>
  );
}

export default WordCard;

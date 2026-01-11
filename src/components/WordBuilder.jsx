import React, { useState, useEffect, useCallback } from 'react';
import { WORDS, PRAISE_PHRASES } from '../data/words';
import { speakWord, speakPhrase } from '../utils/audio';

function WordBuilder({ progress, onExit }) {
  const [currentWord, setCurrentWord] = useState(null);
  const [letters, setLetters] = useState([]);
  const [answer, setAnswer] = useState([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [totalRounds] = useState(8);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Get words for the game (prefer shorter words for building)
  const getGameWords = useCallback(() => {
    const seenWords = Object.values(progress)
      .filter(p => p.box >= 1)
      .map(p => WORDS.find(w => w.id === p.wordId))
      .filter(Boolean)
      .filter(w => w.word.length <= 5); // Prefer shorter words
    
    const defaultWords = WORDS.filter(w => w.word.length <= 5).slice(0, 15);
    return seenWords.length >= 5 ? seenWords : defaultWords;
  }, [progress]);

  // Set up a new word
  const nextWord = useCallback(() => {
    const gameWords = getGameWords();
    const word = gameWords[Math.floor(Math.random() * gameWords.length)];
    setCurrentWord(word);
    
    // Shuffle the letters
    const wordLetters = word.word.toUpperCase().split('');
    const shuffled = [...wordLetters].sort(() => Math.random() - 0.5);
    
    // Make sure it's actually shuffled (not same order)
    while (shuffled.join('') === wordLetters.join('') && wordLetters.length > 1) {
      shuffled.sort(() => Math.random() - 0.5);
    }
    
    setLetters(shuffled.map((letter, index) => ({ id: index, letter, used: false })));
    setAnswer([]);
    setFeedback(null);
    
    speakWord(word.word);
  }, [getGameWords]);

  // Initialize
  useEffect(() => {
    nextWord();
  }, []);

  // Add letter to answer
  const handleLetterClick = (letterId) => {
    const letterObj = letters.find(l => l.id === letterId);
    if (!letterObj || letterObj.used) return;

    // Mark letter as used
    setLetters(prev => prev.map(l => 
      l.id === letterId ? { ...l, used: true } : l
    ));
    
    // Add to answer
    const newAnswer = [...answer, letterObj];
    setAnswer(newAnswer);

    // Check if complete
    if (newAnswer.length === currentWord.word.length) {
      const builtWord = newAnswer.map(l => l.letter).join('');
      const correct = builtWord.toLowerCase() === currentWord.word.toLowerCase();
      
      if (correct) {
        setScore(s => s + 1);
        setFeedback('correct');
        const praise = PRAISE_PHRASES[Math.floor(Math.random() * PRAISE_PHRASES.length)];
        speakPhrase(praise.replace(/[^\w\s]/g, ''));
        
        setTimeout(() => {
          if (round >= totalRounds) {
            setGameOver(true);
            speakPhrase(`Amazing! You built ${score + 1} words!`);
          } else {
            setRound(r => r + 1);
            nextWord();
          }
        }, 1500);
      } else {
        setFeedback('incorrect');
        speakPhrase(`Not quite! The word is ${currentWord.word}`);
        
        setTimeout(() => {
          // Reset this round
          setLetters(prev => prev.map(l => ({ ...l, used: false })));
          setAnswer([]);
          setFeedback(null);
        }, 2000);
      }
    }
  };

  // Remove letter from answer
  const handleAnswerClick = (index) => {
    if (feedback) return;
    
    const letterObj = answer[index];
    
    // Mark letter as unused
    setLetters(prev => prev.map(l => 
      l.id === letterObj.id ? { ...l, used: false } : l
    ));
    
    // Remove from answer
    setAnswer(prev => prev.filter((_, i) => i !== index));
  };

  // Clear all
  const handleClear = () => {
    if (feedback) return;
    setLetters(prev => prev.map(l => ({ ...l, used: false })));
    setAnswer([]);
  };

  // Hear word again
  const handleHear = () => {
    if (currentWord) {
      speakWord(currentWord.word);
    }
  };

  // Game over screen
  if (gameOver) {
    const percentage = Math.round((score / totalRounds) * 100);
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl mb-6">🔤</div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 drop-shadow-lg">
          Word Builder Complete!
        </h2>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8 w-full max-w-sm">
          <div className="text-center text-white">
            <div className="text-5xl font-bold text-yellow-300 mb-2">
              {score}/{totalRounds}
            </div>
            <div className="text-xl opacity-80">{percentage}% built correctly</div>
            <div className="text-4xl mt-4">
              {percentage >= 80 ? '🏆🏆🏆' : percentage >= 60 ? '🏆🏆' : '🏆'}
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

  if (!currentWord) return null;

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
            🔤 Word Builder
          </h1>
          <div className="text-white text-lg">
            {round}/{totalRounds}
          </div>
        </div>
      </header>

      {/* Score */}
      <div className="bg-white/10 px-4 py-2 flex justify-center text-white">
        <span className="text-xl">🏆 {score} built</span>
      </div>

      {/* Main game area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Hear button */}
        <button
          onClick={handleHear}
          className="touch-btn w-20 h-20 bg-blue-500 text-white text-4xl rounded-full shadow-lg mb-6"
        >
          🔊
        </button>
        
        <p className="text-white/80 text-xl mb-4">Build the word you hear!</p>

        {/* Answer slots */}
        <div className={`flex gap-2 sm:gap-3 mb-8 p-4 rounded-xl ${
          feedback === 'correct' ? 'bg-green-500/30' :
          feedback === 'incorrect' ? 'bg-red-500/30' :
          'bg-white/10'
        }`}>
          {Array.from({ length: currentWord.word.length }).map((_, index) => (
            <button
              key={index}
              onClick={() => handleAnswerClick(index)}
              disabled={feedback !== null}
              className={`
                w-14 h-14 sm:w-16 sm:h-16 rounded-lg text-3xl sm:text-4xl font-bold
                flex items-center justify-center shadow-lg
                transition-all
                ${answer[index]
                  ? 'bg-yellow-400 text-green-800'
                  : 'bg-white/30 border-2 border-dashed border-white/50'
                }
              `}
            >
              {answer[index]?.letter || ''}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`text-2xl font-bold mb-4 ${
            feedback === 'correct' ? 'text-green-300' : 'text-red-300'
          }`}>
            {feedback === 'correct' ? '✓ Correct!' : `The word is "${currentWord.word}"`}
          </div>
        )}

        {/* Letter tiles */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-md">
          {letters.map((letterObj) => (
            <button
              key={letterObj.id}
              onClick={() => handleLetterClick(letterObj.id)}
              disabled={letterObj.used || feedback !== null}
              className={`
                w-14 h-14 sm:w-16 sm:h-16 rounded-xl text-3xl sm:text-4xl font-bold
                shadow-lg transition-all
                ${letterObj.used
                  ? 'bg-gray-400/30 text-white/30'
                  : 'bg-white text-green-700 hover:scale-110 active:scale-95'
                }
              `}
            >
              {letterObj.letter}
            </button>
          ))}
        </div>

        {/* Clear button */}
        {answer.length > 0 && !feedback && (
          <button
            onClick={handleClear}
            className="touch-btn mt-6 px-6 py-3 bg-orange-400 text-white rounded-xl text-lg font-bold"
          >
            Clear All
          </button>
        )}
      </main>
    </div>
  );
}

export default WordBuilder;

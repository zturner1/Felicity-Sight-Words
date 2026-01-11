import React, { useState, useEffect, useCallback } from 'react';
import { WORDS, PRAISE_PHRASES } from '../data/words';
import { speakWord, speakPhrase } from '../utils/audio';

// Simple sentences with blanks for sight words
const SENTENCES = [
  { template: "___ cat is big.", answer: "the", hint: "🐱" },
  { template: "I can see ___.", answer: "you", hint: "👀" },
  { template: "___ dog ran fast.", answer: "a", hint: "🐕" },
  { template: "We go ___ school.", answer: "to", hint: "🏫" },
  { template: "The bird is ___ the tree.", answer: "in", hint: "🌳" },
  { template: "This ___ my book.", answer: "is", hint: "📖" },
  { template: "I ___ you.", answer: "and", hint: "❤️" },
  { template: "___ went to the park.", answer: "he", hint: "🏃" },
  { template: "It ___ a sunny day.", answer: "was", hint: "☀️" },
  { template: "This is ___ me.", answer: "for", hint: "🎁" },
  { template: "The cup is ___ the table.", answer: "on", hint: "🥤" },
  { template: "You ___ my friend.", answer: "are", hint: "🤝" },
  { template: "___ played together.", answer: "they", hint: "👫" },
  { template: "Look ___ the stars.", answer: "at", hint: "⭐" },
  { template: "I will ___ there soon.", answer: "be", hint: "🏠" },
  { template: "I ___ a new toy.", answer: "have", hint: "🧸" },
  { template: "___ love ice cream.", answer: "we", hint: "🍦" },
  { template: "___ is your name?", answer: "what", hint: "❓" },
  { template: "___ my friends came.", answer: "all", hint: "👨‍👩‍👧‍👦" },
  { template: "I ___ do it!", answer: "can", hint: "💪" },
  { template: "___ said hello.", answer: "she", hint: "👋" },
  { template: "___ do you feel?", answer: "how", hint: "😊" },
  { template: "___ will you come?", answer: "when", hint: "🕐" },
  { template: "Is this ___ hat?", answer: "your", hint: "🎩" },
  { template: "I like ___ or that.", answer: "this", hint: "👈" },
];

function SentenceFill({ progress, onExit }) {
  const [currentSentence, setCurrentSentence] = useState(null);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [totalRounds] = useState(10);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Get available sentences based on words the child knows
  const getAvailableSentences = useCallback(() => {
    const knownWords = Object.values(progress)
      .filter(p => p.box >= 1)
      .map(p => WORDS.find(w => w.id === p.wordId)?.word)
      .filter(Boolean);

    // Filter sentences where the answer is a known word, or use all if not enough
    const available = SENTENCES.filter(s => knownWords.includes(s.answer));
    return available.length >= 5 ? available : SENTENCES;
  }, [progress]);

  // Pick a new sentence
  const nextSentence = useCallback(() => {
    const available = getAvailableSentences();
    const sentence = available[Math.floor(Math.random() * available.length)];
    setCurrentSentence(sentence);
    
    // Generate 4 options including the correct answer
    const wrongAnswers = SENTENCES
      .filter(s => s.answer !== sentence.answer)
      .map(s => s.answer)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [sentence.answer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
    setSelected(null);
    setFeedback(null);
    
    speakPhrase(sentence.template.replace("___", "blank"));
  }, [getAvailableSentences]);

  // Initialize
  useEffect(() => {
    nextSentence();
  }, []);

  // Handle option selection
  const handleSelect = (option) => {
    if (selected) return;
    
    setSelected(option);
    const correct = option === currentSentence.answer;
    
    if (correct) {
      setScore(s => s + 1);
      setFeedback('correct');
      const praise = PRAISE_PHRASES[Math.floor(Math.random() * PRAISE_PHRASES.length)];
      speakPhrase(praise.replace(/[^\w\s]/g, ''));
    } else {
      setFeedback('incorrect');
      speakPhrase(`The answer is ${currentSentence.answer}`);
    }

    setTimeout(() => {
      if (round >= totalRounds) {
        setGameOver(true);
        speakPhrase(`Great job! You got ${correct ? score + 1 : score} out of ${totalRounds}!`);
      } else {
        setRound(r => r + 1);
        nextSentence();
      }
    }, correct ? 1500 : 2500);
  };

  // Game over screen
  if (gameOver) {
    const percentage = Math.round((score / totalRounds) * 100);
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl mb-6">📝</div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 drop-shadow-lg">
          Sentences Complete!
        </h2>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8 w-full max-w-sm">
          <div className="text-center text-white">
            <div className="text-5xl font-bold text-yellow-300 mb-2">
              {score}/{totalRounds}
            </div>
            <div className="text-xl opacity-80">{percentage}% correct</div>
            <div className="text-4xl mt-4">
              {percentage >= 80 ? '🌟🌟🌟' : percentage >= 60 ? '🌟🌟' : '🌟'}
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

  if (!currentSentence) return null;

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
            📝 Fill the Blank
          </h1>
          <div className="text-white text-lg">
            {round}/{totalRounds}
          </div>
        </div>
      </header>

      {/* Score */}
      <div className="bg-white/10 px-4 py-2 flex justify-center text-white">
        <span className="text-xl">⭐ {score} correct</span>
      </div>

      {/* Main game area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Hint emoji */}
        <div className="text-5xl mb-4">{currentSentence.hint}</div>
        
        {/* Sentence with blank */}
        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-8 px-4">
          {currentSentence.template.split("___").map((part, i, arr) => (
            <React.Fragment key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className={`inline-block min-w-[80px] mx-2 px-4 py-1 rounded-lg border-4 border-dashed ${
                  feedback === 'correct' ? 'border-green-400 bg-green-400/30' :
                  feedback === 'incorrect' ? 'border-red-400 bg-red-400/30' :
                  'border-yellow-300'
                }`}>
                  {selected || '?'}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Hear sentence button */}
        <button
          onClick={() => speakPhrase(currentSentence.template.replace("___", "blank"))}
          className="touch-btn w-14 h-14 bg-blue-500 text-white text-2xl rounded-full shadow-lg mb-8"
        >
          🔊
        </button>

        {/* Word options */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-md">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={selected !== null}
              className={`
                touch-btn py-4 sm:py-5 rounded-xl text-2xl sm:text-3xl font-bold
                transition-all shadow-lg
                ${selected === option
                  ? option === currentSentence.answer
                    ? 'bg-green-500 text-white scale-105'
                    : 'bg-red-500 text-white'
                  : selected && option === currentSentence.answer
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-green-700 hover:scale-105'
                }
              `}
            >
              {option}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

export default SentenceFill;

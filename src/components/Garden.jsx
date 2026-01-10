import React from 'react';
import { WORDS, CREATURES } from '../data/words';
import Egg from './Egg';

export function Garden({ progress, onStartSession, onStartMatching }) {
  const allProgress = Object.values(progress);
  
  // Get stats
  const mastered = allProgress.filter(p => p.mastered);
  const inProgress = allProgress.filter(p => p.box >= 1 && !p.mastered);
  const notStarted = allProgress.filter(p => p.box === 0);

  // Get creatures with their words
  const creatures = mastered.map(p => {
    const word = WORDS.find(w => w.id === p.wordId);
    const creature = CREATURES.find(c => c.id === p.creatureId);
    return { ...p, word: word?.word, creature };
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-green-700/50 backdrop-blur-sm p-4 shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold text-white text-center drop-shadow">
          🦕 Felicity's Fossil Garden 🌿
        </h1>
        <div className="flex justify-center gap-4 mt-2 text-white/90 text-sm sm:text-base">
          <span>🥚 {inProgress.length} eggs</span>
          <span>•</span>
          <span>🦖 {mastered.length} creatures</span>
          <span>•</span>
          <span>📚 {WORDS.length} words total</span>
        </div>
      </header>

      {/* Main garden area */}
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        {/* Start session buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <button
            onClick={onStartSession}
            className="touch-btn px-8 py-5 sm:px-12 sm:py-6 
                       bg-gradient-to-b from-yellow-400 to-orange-500
                       text-white text-2xl sm:text-3xl font-bold 
                       rounded-2xl shadow-xl
                       hover:from-yellow-300 hover:to-orange-400
                       active:scale-95 transition-all"
          >
            🌟 Start Learning! 🌟
          </button>
          <button
            onClick={onStartMatching}
            className="touch-btn px-8 py-5 sm:px-10 sm:py-6 
                       bg-gradient-to-b from-purple-500 to-purple-700
                       text-white text-2xl sm:text-3xl font-bold 
                       rounded-2xl shadow-xl
                       hover:from-purple-400 hover:to-purple-600
                       active:scale-95 transition-all"
          >
            🧠 Memory Match
          </button>
        </div>

        {/* Creatures section */}
        {creatures.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 drop-shadow">
              My Creatures ({creatures.length})
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {creatures.map((c) => (
                <div 
                  key={c.wordId}
                  className="flex flex-col items-center p-3 bg-white/20 rounded-xl backdrop-blur-sm"
                >
                  <div 
                    className="text-4xl sm:text-5xl mb-2 animate-bounce-soft cursor-pointer"
                    style={{ 
                      filter: `drop-shadow(0 0 8px ${c.creatureColor})`,
                    }}
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        const utterance = new SpeechSynthesisUtterance(c.word);
                        utterance.rate = 0.8;
                        window.speechSynthesis.speak(utterance);
                      }
                    }}
                  >
                    {c.creature?.emoji || '🦕'}
                  </div>
                  <span className="text-white font-bold text-sm sm:text-base">
                    {c.word}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Eggs section */}
        {inProgress.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 drop-shadow">
              Growing Eggs ({inProgress.length})
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {inProgress.map((p) => {
                const word = WORDS.find(w => w.id === p.wordId);
                return (
                  <div 
                    key={p.wordId}
                    className="flex flex-col items-center"
                  >
                    <Egg box={p.box} size="sm" />
                    <span className="mt-2 text-white/80 font-semibold text-sm">
                      {word?.word}
                    </span>
                    <span className="text-white/60 text-xs">
                      Box {p.box}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Not started preview */}
        {notStarted.length > 0 && (
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-white/70 mb-4 drop-shadow">
              Waiting to Discover ({notStarted.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {notStarted.slice(0, 20).map((p) => {
                const word = WORDS.find(w => w.id === p.wordId);
                return (
                  <span 
                    key={p.wordId}
                    className="px-3 py-1 bg-white/10 rounded-full text-white/50 text-sm"
                  >
                    {word?.word}
                  </span>
                );
              })}
              {notStarted.length > 20 && (
                <span className="px-3 py-1 text-white/50 text-sm">
                  +{notStarted.length - 20} more
                </span>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Empty state */}
      {mastered.length === 0 && inProgress.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div className="text-6xl mb-4">🥚</div>
          <p className="text-xl text-white/90 font-semibold mb-2">
            Your garden is empty!
          </p>
          <p className="text-white/70 mb-6">
            Start learning to plant eggs and hatch creatures!
          </p>
        </div>
      )}
    </div>
  );
}

export default Garden;

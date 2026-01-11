import React, { useState, useEffect } from 'react';
import { useLeitner } from './hooks/useLeitner';
import Garden from './components/Garden';
import Session from './components/Session';
import MemoryMatch from './components/MemoryMatch';

// App screens
const SCREENS = {
  GARDEN: 'garden',
  SESSION: 'session',
  MEMORY_MATCH: 'memory_match',
};

function App() {
  const [screen, setScreen] = useState(SCREENS.GARDEN);
  const [sessionWords, setSessionWords] = useState([]);
  
  const {
    progress,
    sessionStats,
    getWordsForSession,
    recordAnswer,
    startSession,
    endSession,
    getStats,
  } = useLeitner();

  // Start a new learning session
  const handleStartSession = () => {
    const words = getWordsForSession(3, 15); // max 3 new, 15 total
    
    if (words.length === 0) {
      alert('No words due for practice! Come back later.');
      return;
    }
    
    setSessionWords(words);
    startSession();
    setScreen(SCREENS.SESSION);
  };

  // Handle session complete
  const handleSessionComplete = () => {
    endSession();
    setScreen(SCREENS.GARDEN);
  };

  // Handle exit session early
  const handleExitSession = () => {
    if (sessionStats.wordsReviewed > 0) {
      endSession();
    }
    setScreen(SCREENS.GARDEN);
  };

  // Start memory match game
  const handleStartMemoryMatch = () => {
    setScreen(SCREENS.MEMORY_MATCH);
  };

  // Handle memory match complete
  const handleMemoryMatchComplete = () => {
    setScreen(SCREENS.GARDEN);
  };

  // Render current screen
  return (
    <div className="min-h-screen font-['Nunito']">
      {screen === SCREENS.GARDEN && (
        <Garden
          progress={progress}
          onStartSession={handleStartSession}
          onStartMemoryMatch={handleStartMemoryMatch}
        />
      )}
      
      {screen === SCREENS.SESSION && (
        <Session
          wordsForSession={sessionWords}
          onAnswer={recordAnswer}
          onComplete={handleSessionComplete}
          onExit={handleExitSession}
          sessionStats={sessionStats}
          progress={progress}
        />
      )}

      {screen === SCREENS.MEMORY_MATCH && (
        <MemoryMatch
          progress={progress}
          onComplete={handleMemoryMatchComplete}
          onRecordAnswer={recordAnswer}
        />
      )}
    </div>
  );
}

export default App;

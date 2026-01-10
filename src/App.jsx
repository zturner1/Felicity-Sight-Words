import React, { useState, useEffect } from 'react';
import { useLeitner } from './hooks/useLeitner';
import Garden from './components/Garden';
import Session from './components/Session';
import MatchingGame from './components/MatchingGame';

// App screens
const SCREENS = {
  GARDEN: 'garden',
  SESSION: 'session',
  MATCHING: 'matching',
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

  // Start matching game
  const handleStartMatching = () => {
    setScreen(SCREENS.MATCHING);
  };

  // Exit matching game
  const handleExitMatching = () => {
    setScreen(SCREENS.GARDEN);
  };

  // Render current screen
  return (
    <div className="min-h-screen font-['Nunito']">
      {screen === SCREENS.GARDEN && (
        <Garden
          progress={progress}
          onStartSession={handleStartSession}
          onStartMatching={handleStartMatching}
        />
      )}

      {screen === SCREENS.MATCHING && (
        <MatchingGame
          progress={progress}
          onExit={handleExitMatching}
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
    </div>
  );
}

export default App;

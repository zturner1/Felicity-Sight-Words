import { useState, useEffect, useCallback } from 'react';
import { WORDS, CREATURES } from '../data/words';

const STORAGE_KEY = 'felicity-sight-words-progress';

// Initial state for a word
const createWordProgress = (wordId) => ({
  wordId,
  box: 0, // 0 = not started, 1-4 = Leitner boxes
  timesSeen: 0,
  timesCorrect: 0,
  timesIncorrect: 0,
  consecutiveCorrect: 0,
  sessionsSeenIn: [],
  lastSeen: null,
  responseTimes: [],
  mastered: false,
  masteredDate: null,
  creatureId: null,
  creatureColor: null,
});

// Get a random creature for hatching
const getRandomCreature = () => {
  const creature = CREATURES[Math.floor(Math.random() * CREATURES.length)];
  const color = creature.colors[Math.floor(Math.random() * creature.colors.length)];
  return { creatureId: creature.id, creatureColor: color };
};

export function useLeitner() {
  const [progress, setProgress] = useState({});
  const [sessionNumber, setSessionNumber] = useState(1);
  const [sessionStats, setSessionStats] = useState({
    wordsReviewed: 0,
    correct: 0,
    incorrect: 0,
    newWordsIntroduced: 0,
    wordsMastered: [],
    startTime: null,
  });

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setProgress(parsed.progress || {});
      setSessionNumber(parsed.sessionNumber || 1);
    } else {
      // Initialize progress for all words
      const initial = {};
      WORDS.forEach(w => {
        initial[w.id] = createWordProgress(w.id);
      });
      setProgress(initial);
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    if (Object.keys(progress).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        progress,
        sessionNumber,
        lastSaved: new Date().toISOString(),
      }));
    }
  }, [progress, sessionNumber]);

  // Get words due for review based on Leitner boxes
  const getWordsForSession = useCallback((maxNew = 3, maxReview = 20) => {
    const now = sessionNumber;
    const words = [];
    
    // Box 1: Every session
    // Box 2: Every 2 sessions
    // Box 3: Every 4 sessions
    // Box 4: Every 8 sessions (maintenance)
    
    const boxIntervals = { 1: 1, 2: 2, 3: 4, 4: 8 };
    
    // Collect words due for review
    Object.values(progress).forEach(p => {
      if (p.box >= 1 && !p.mastered) {
        const interval = boxIntervals[p.box];
        const lastSession = p.sessionsSeenIn[p.sessionsSeenIn.length - 1] || 0;
        if (now - lastSession >= interval) {
          words.push({ ...WORDS.find(w => w.id === p.wordId), progress: p, isReview: true });
        }
      }
    });

    // Add mastered words for maintenance (sample a few)
    const masteredWords = Object.values(progress)
      .filter(p => p.mastered)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    masteredWords.forEach(p => {
      words.push({ ...WORDS.find(w => w.id === p.wordId), progress: p, isReview: true, isMaintenance: true });
    });

    // Add new words if we have room
    let newCount = 0;
    Object.values(progress).forEach(p => {
      if (p.box === 0 && newCount < maxNew && words.length < maxReview) {
        words.push({ ...WORDS.find(w => w.id === p.wordId), progress: p, isNew: true });
        newCount++;
      }
    });

    // Shuffle to interleave
    return words.sort(() => Math.random() - 0.5);
  }, [progress, sessionNumber]);

  // Record an answer
  const recordAnswer = useCallback((wordId, correct, responseTime) => {
    setProgress(prev => {
      const p = { ...prev[wordId] };
      const now = new Date().toISOString();
      
      p.timesSeen++;
      p.lastSeen = now;
      p.responseTimes.push(responseTime);
      
      if (!p.sessionsSeenIn.includes(sessionNumber)) {
        p.sessionsSeenIn.push(sessionNumber);
      }

      if (correct) {
        p.timesCorrect++;
        p.consecutiveCorrect++;
        
        // Move up a box (max 4)
        if (p.box < 4) {
          p.box++;
        }
        
        // Check for mastery: 2+ consecutive correct across 2+ sessions
        const uniqueSessions = new Set(p.sessionsSeenIn).size;
        const avgResponseTime = p.responseTimes.reduce((a, b) => a + b, 0) / p.responseTimes.length;
        
        if (p.consecutiveCorrect >= 2 && uniqueSessions >= 2 && avgResponseTime < 3000 && !p.mastered) {
          p.mastered = true;
          p.masteredDate = now;
          p.box = 4;
          
          // Assign a creature!
          const { creatureId, creatureColor } = getRandomCreature();
          p.creatureId = creatureId;
          p.creatureColor = creatureColor;
          
          setSessionStats(s => ({
            ...s,
            wordsMastered: [...s.wordsMastered, wordId],
          }));
        }
      } else {
        p.timesIncorrect++;
        p.consecutiveCorrect = 0;
        // Return to box 1
        p.box = 1;
      }

      return { ...prev, [wordId]: p };
    });

    // Update session stats
    setSessionStats(s => ({
      ...s,
      wordsReviewed: s.wordsReviewed + 1,
      correct: s.correct + (correct ? 1 : 0),
      incorrect: s.incorrect + (correct ? 0 : 1),
    }));
  }, [sessionNumber]);

  // Start a new session
  const startSession = useCallback(() => {
    setSessionStats({
      wordsReviewed: 0,
      correct: 0,
      incorrect: 0,
      newWordsIntroduced: 0,
      wordsMastered: [],
      startTime: Date.now(),
    });
  }, []);

  // End the current session
  const endSession = useCallback(() => {
    setSessionNumber(n => n + 1);
    return sessionStats;
  }, [sessionStats]);

  // Get overall stats
  const getStats = useCallback(() => {
    const all = Object.values(progress);
    return {
      totalWords: WORDS.length,
      wordsStarted: all.filter(p => p.box >= 1).length,
      wordsMastered: all.filter(p => p.mastered).length,
      wordsInProgress: all.filter(p => p.box >= 1 && !p.mastered).length,
      creatures: all.filter(p => p.creatureId).map(p => ({
        wordId: p.wordId,
        word: WORDS.find(w => w.id === p.wordId)?.word,
        creatureId: p.creatureId,
        creatureColor: p.creatureColor,
        masteredDate: p.masteredDate,
      })),
    };
  }, [progress]);

  // Get word by ID with progress
  const getWord = useCallback((wordId) => {
    const word = WORDS.find(w => w.id === wordId);
    return word ? { ...word, progress: progress[wordId] } : null;
  }, [progress]);

  // Reset all progress (for testing)
  const resetProgress = useCallback(() => {
    const initial = {};
    WORDS.forEach(w => {
      initial[w.id] = createWordProgress(w.id);
    });
    setProgress(initial);
    setSessionNumber(1);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    progress,
    sessionNumber,
    sessionStats,
    getWordsForSession,
    recordAnswer,
    startSession,
    endSession,
    getStats,
    getWord,
    resetProgress,
  };
}

export default useLeitner;

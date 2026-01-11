import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLeitner } from '../hooks/useLeitner';
import { WORDS } from '../data/words';

// Mock data factories
const createMockWordProgress = (overrides = {}) => ({
  wordId: 1,
  box: 0,
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
  ...overrides,
});

const createMockProgress = (words) => ({
  progress: words.reduce((acc, word) => {
    acc[word.wordId] = createMockWordProgress(word);
    return acc;
  }, {}),
  sessionNumber: 1,
});

describe('useLeitner Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.getItem.mockReturnValue(null);
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize progress for all words', () => {
      const { result } = renderHook(() => useLeitner());
      
      expect(Object.keys(result.current.progress)).toHaveLength(WORDS.length);
      
      // Check first word has correct initial structure
      const firstWordProgress = result.current.progress[1];
      expect(firstWordProgress).toEqual({
        wordId: 1,
        box: 0,
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
    });

    it('should initialize session number to 1', () => {
      const { result } = renderHook(() => useLeitner());
      expect(result.current.sessionNumber).toBe(1);
    });

    it('should load progress from localStorage if available', () => {
      const mockProgress = createMockProgress([{
        wordId: 1,
        box: 2,
        timesSeen: 5,
        timesCorrect: 4,
        timesIncorrect: 1,
        consecutiveCorrect: 2,
        sessionsSeenIn: [1, 2],
        lastSeen: '2026-01-01T00:00:00.000Z',
        responseTimes: [1000, 1500, 2000, 1200, 1800],
      }]);
      mockProgress.sessionNumber = 3;
      
      localStorage.getItem.mockReturnValue(JSON.stringify(mockProgress));
      
      const { result } = renderHook(() => useLeitner());
      
      expect(result.current.progress[1].box).toBe(2);
      expect(result.current.progress[1].timesSeen).toBe(5);
      expect(result.current.sessionNumber).toBe(3);
    });
  });

  describe('getWordsForSession', () => {
    it('should return new words when no words have been started', () => {
      const { result } = renderHook(() => useLeitner());
      
      act(() => {
        result.current.startSession();
      });
      
      const words = result.current.getWordsForSession(3, 10);
      
      expect(words.length).toBeGreaterThan(0);
      expect(words.length).toBeLessThanOrEqual(3);
      expect(words.every(w => w.isNew)).toBe(true);
    });

    it('should respect maxNew parameter', () => {
      const { result } = renderHook(() => useLeitner());
      
      const words = result.current.getWordsForSession(2, 10);
      
      const newWords = words.filter(w => w.isNew);
      expect(newWords.length).toBeLessThanOrEqual(2);
    });

    it('should return words in box 1 every session', () => {
      const mockProgress = createMockProgress([{
        wordId: 1,
        box: 1,
        timesSeen: 3,
        timesCorrect: 2,
        timesIncorrect: 1,
        consecutiveCorrect: 1,
        sessionsSeenIn: [1],
        lastSeen: '2026-01-01T00:00:00.000Z',
        responseTimes: [1500, 1800, 1600],
      }]);
      mockProgress.sessionNumber = 2;
      
      localStorage.getItem.mockReturnValue(JSON.stringify(mockProgress));
      
      const { result } = renderHook(() => useLeitner());
      
      const words = result.current.getWordsForSession(3, 10);
      
      const box1Words = words.filter(w => w.progress?.box === 1);
      expect(box1Words.length).toBeGreaterThan(0);
    });

    it('should return words in box 2 every 2 sessions', () => {
      const mockProgress = createMockProgress([{
        wordId: 1,
        box: 2,
        timesSeen: 5,
        timesCorrect: 5,
        timesIncorrect: 0,
        consecutiveCorrect: 2,
        sessionsSeenIn: [1, 2],
        lastSeen: '2026-01-01T00:00:00.000Z',
        responseTimes: [1500, 1800, 1600, 1400, 1700],
      }]);
      mockProgress.sessionNumber = 4;
      
      localStorage.getItem.mockReturnValue(JSON.stringify(mockProgress));
      
      const { result } = renderHook(() => useLeitner());
      
      const words = result.current.getWordsForSession(3, 10);
      
      const box2Words = words.filter(w => w.progress?.box === 2);
      expect(box2Words.length).toBeGreaterThan(0);
    });

    it('should include some mastered words for maintenance', () => {
      const mockProgress = createMockProgress([
        {
          wordId: 1,
          box: 4,
          timesSeen: 10,
          timesCorrect: 10,
          timesIncorrect: 0,
          consecutiveCorrect: 5,
          sessionsSeenIn: [1, 2, 3, 4],
          lastSeen: '2026-01-01T00:00:00.000Z',
          responseTimes: [1500, 1400, 1300, 1200, 1100, 1000, 900, 800, 700, 600],
          mastered: true,
          masteredDate: '2026-01-01T00:00:00.000Z',
          creatureId: 'trex',
          creatureColor: '#84cc16',
        },
        {
          wordId: 2,
          box: 4,
          timesSeen: 8,
          timesCorrect: 8,
          timesIncorrect: 0,
          consecutiveCorrect: 4,
          sessionsSeenIn: [1, 2, 3],
          lastSeen: '2026-01-01T00:00:00.000Z',
          responseTimes: [1600, 1500, 1400, 1300, 1200, 1100, 1000, 900],
          mastered: true,
          masteredDate: '2026-01-01T00:00:00.000Z',
          creatureId: 'owl',
          creatureColor: '#a855f7',
        },
      ]);
      mockProgress.sessionNumber = 5;
      
      localStorage.getItem.mockReturnValue(JSON.stringify(mockProgress));
      
      const { result } = renderHook(() => useLeitner());
      
      const words = result.current.getWordsForSession(3, 10);
      
      const masteredWords = words.filter(w => w.progress?.mastered);
      expect(masteredWords.length).toBeGreaterThan(0);
    });
  });

  describe('recordAnswer', () => {
    it('should update word stats on correct answer', () => {
      const { result } = renderHook(() => useLeitner());
      
      act(() => {
        result.current.startSession();
        result.current.recordAnswer(1, true, 1500);
      });
      
      const wordProgress = result.current.progress[1];
      expect(wordProgress.timesSeen).toBe(1);
      expect(wordProgress.timesCorrect).toBe(1);
      expect(wordProgress.timesIncorrect).toBe(0);
      expect(wordProgress.consecutiveCorrect).toBe(1);
      expect(wordProgress.responseTimes).toEqual([1500]);
      expect(wordProgress.sessionsSeenIn).toEqual([1]);
      expect(wordProgress.lastSeen).toBeTruthy();
    });

    it('should move word up a box on correct answer', () => {
      const { result } = renderHook(() => useLeitner());
      
      act(() => {
        result.current.startSession();
        result.current.recordAnswer(1, true, 1500);
      });
      
      expect(result.current.progress[1].box).toBe(1);
      
      act(() => {
        result.current.recordAnswer(1, true, 1400);
      });
      
      expect(result.current.progress[1].box).toBe(2);
    });

    it('should not exceed box 4', () => {
      const mockProgress = {
        progress: {
          1: {
            wordId: 1,
            box: 4,
            timesSeen: 8,
            timesCorrect: 8,
            timesIncorrect: 0,
            consecutiveCorrect: 5,
            sessionsSeenIn: [1, 2, 3],
            lastSeen: '2026-01-01T00:00:00.000Z',
            responseTimes: [1500, 1400, 1300, 1200, 1100, 1000, 900, 800],
            mastered: false,
            masteredDate: null,
            creatureId: null,
            creatureColor: null,
          },
        },
        sessionNumber: 4,
      };
      
      localStorage.getItem.mockReturnValue(JSON.stringify(mockProgress));
      
      const { result } = renderHook(() => useLeitner());
      
      act(() => {
        result.current.startSession();
        result.current.recordAnswer(1, true, 1000);
      });
      
      expect(result.current.progress[1].box).toBe(4);
    });

    it('should reset consecutiveCorrect and move to box 1 on incorrect answer', () => {
      const mockProgress = {
        progress: {
          1: {
            wordId: 1,
            box: 3,
            timesSeen: 6,
            timesCorrect: 6,
            timesIncorrect: 0,
            consecutiveCorrect: 2,
            sessionsSeenIn: [1, 2],
            lastSeen: '2026-01-01T00:00:00.000Z',
            responseTimes: [1500, 1400, 1300, 1200, 1100, 1000],
            mastered: false,
            masteredDate: null,
            creatureId: null,
            creatureColor: null,
          },
        },
        sessionNumber: 3,
      };
      
      localStorage.getItem.mockReturnValue(JSON.stringify(mockProgress));
      
      const { result } = renderHook(() => useLeitner());
      
      act(() => {
        result.current.startSession();
        result.current.recordAnswer(1, false, 3500);
      });
      
      const wordProgress = result.current.progress[1];
      expect(wordProgress.box).toBe(1);
      expect(wordProgress.consecutiveCorrect).toBe(0);
      expect(wordProgress.timesIncorrect).toBe(1);
    });

    it('should achieve mastery with 3+ consecutive correct, 3+ sessions, and <3s avg', () => {
      const mockProgress = {
        progress: {
          1: {
            wordId: 1,
            box: 3,
            timesSeen: 6,
            timesCorrect: 6,
            timesIncorrect: 0,
            consecutiveCorrect: 2,
            sessionsSeenIn: [1, 2],
            lastSeen: '2026-01-01T00:00:00.000Z',
            responseTimes: [2000, 1800, 1600, 1400, 1200, 1000],
            mastered: false,
            masteredDate: null,
            creatureId: null,
            creatureColor: null,
          },
        },
        sessionNumber: 3,
      };
      
      localStorage.getItem.mockReturnValue(JSON.stringify(mockProgress));
      
      const { result } = renderHook(() => useLeitner());
      
      act(() => {
        result.current.startSession();
        result.current.recordAnswer(1, true, 1000);
      });
      
      const wordProgress = result.current.progress[1];
      expect(wordProgress.mastered).toBe(true);
      expect(wordProgress.masteredDate).toBeTruthy();
      expect(wordProgress.creatureId).toBeTruthy();
      expect(wordProgress.creatureColor).toBeTruthy();
      expect(wordProgress.box).toBe(4);
    });

    it('should not achieve mastery if avg response time >= 3s', () => {
      const mockProgress = {
        progress: {
          1: {
            wordId: 1,
            box: 3,
            timesSeen: 6,
            timesCorrect: 6,
            timesIncorrect: 0,
            consecutiveCorrect: 2,
            sessionsSeenIn: [1, 2],
            lastSeen: '2026-01-01T00:00:00.000Z',
            responseTimes: [3500, 3200, 3000, 2900, 2800, 2700],
            mastered: false,
            masteredDate: null,
            creatureId: null,
            creatureColor: null,
          },
        },
        sessionNumber: 3,
      };
      
      localStorage.getItem.mockReturnValue(JSON.stringify(mockProgress));
      
      const { result } = renderHook(() => useLeitner());
      
      act(() => {
        result.current.startSession();
        result.current.recordAnswer(1, true, 3000);
      });
      
      expect(result.current.progress[1].mastered).toBe(false);
    });

    it('should not achieve mastery with less than 3 sessions', () => {
      const mockProgress = {
        progress: {
          1: {
            wordId: 1,
            box: 3,
            timesSeen: 4,
            timesCorrect: 4,
            timesIncorrect: 0,
            consecutiveCorrect: 2,
            sessionsSeenIn: [1],
            lastSeen: '2026-01-01T00:00:00.000Z',
            responseTimes: [1500, 1400, 1300, 1200],
            mastered: false,
            masteredDate: null,
            creatureId: null,
            creatureColor: null,
          },
        },
        sessionNumber: 2,
      };
      
      localStorage.getItem.mockReturnValue(JSON.stringify(mockProgress));
      
      const { result } = renderHook(() => useLeitner());
      
      act(() => {
        result.current.startSession();
        result.current.recordAnswer(1, true, 1100);
      });
      
      expect(result.current.progress[1].mastered).toBe(false);
    });

    it('should update session stats', () => {
      const { result } = renderHook(() => useLeitner());
      
      act(() => {
        result.current.startSession();
        result.current.recordAnswer(1, true, 1500);
        result.current.recordAnswer(2, false, 3500);
      });
      
      expect(result.current.sessionStats.wordsReviewed).toBe(2);
      expect(result.current.sessionStats.correct).toBe(1);
      expect(result.current.sessionStats.incorrect).toBe(1);
    });

    it('should add mastered words to session stats', () => {
      const mockProgress = {
        progress: {
          1: {
            wordId: 1,
            box: 3,
            timesSeen: 6,
            timesCorrect: 6,
            timesIncorrect: 0,
            consecutiveCorrect: 2,
            sessionsSeenIn: [1, 2],
            lastSeen: '2026-01-01T00:00:00.000Z',
            responseTimes: [2000, 1800, 1600, 1400, 1200, 1000],
            mastered: false,
            masteredDate: null,
            creatureId: null,
            creatureColor: null,
          },
        },
        sessionNumber: 3,
      };
      
      localStorage.getItem.mockReturnValue(JSON.stringify(mockProgress));
      
      const { result } = renderHook(() => useLeitner());
      
      act(() => {
        result.current.startSession();
        result.current.recordAnswer(1, true, 1000);
      });
      
      expect(result.current.sessionStats.wordsMastered).toContain(1);
    });
  });

  describe('Session Management', () => {
    it('should start a session with initial stats', () => {
      const { result } = renderHook(() => useLeitner());
      
      act(() => {
        result.current.startSession();
      });
      
      expect(result.current.sessionStats).toEqual({
        wordsReviewed: 0,
        correct: 0,
        incorrect: 0,
        newWordsIntroduced: 0,
        wordsMastered: [],
        startTime: expect.any(Number),
      });
    });

    it('should increment session number on endSession', () => {
      const { result } = renderHook(() => useLeitner());
      
      const initialSessionNumber = result.current.sessionNumber;
      
      act(() => {
        result.current.startSession();
        result.current.endSession();
      });
      
      expect(result.current.sessionNumber).toBe(initialSessionNumber + 1);
    });

    it('should return session stats on endSession', () => {
      const { result } = renderHook(() => useLeitner());
      
      act(() => {
        result.current.startSession();
        result.current.recordAnswer(1, true, 1500);
      });
      
      let stats;
      act(() => {
        stats = result.current.endSession();
      });
      
      expect(stats.wordsReviewed).toBe(1);
      expect(stats.correct).toBe(1);
    });
  });

  describe('Statistics', () => {
    it('should calculate overall stats correctly', () => {
      const mockProgress = {
        progress: {
          1: {
            wordId: 1,
            box: 4,
            timesSeen: 10,
            timesCorrect: 10,
            timesIncorrect: 0,
            consecutiveCorrect: 5,
            sessionsSeenIn: [1, 2, 3, 4],
            lastSeen: '2026-01-01T00:00:00.000Z',
            responseTimes: [1500, 1400, 1300, 1200, 1100, 1000, 900, 800, 700, 600],
            mastered: true,
            masteredDate: '2026-01-01T00:00:00.000Z',
            creatureId: 'trex',
            creatureColor: '#84cc16',
          },
          2: {
            wordId: 2,
            box: 2,
            timesSeen: 5,
            timesCorrect: 4,
            timesIncorrect: 1,
            consecutiveCorrect: 2,
            sessionsSeenIn: [1, 2],
            lastSeen: '2026-01-01T00:00:00.000Z',
            responseTimes: [1800, 1700, 1600, 1500, 1400],
            mastered: false,
            masteredDate: null,
            creatureId: null,
            creatureColor: null,
          },
          3: {
            wordId: 3,
            box: 0,
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
          },
        },
        sessionNumber: 5,
      };
      
      localStorage.getItem.mockReturnValue(JSON.stringify(mockProgress));
      
      const { result } = renderHook(() => useLeitner());
      
      const stats = result.current.getStats();
      
      expect(stats.totalWords).toBe(WORDS.length);
      expect(stats.wordsStarted).toBe(2);
      expect(stats.wordsMastered).toBe(1);
      expect(stats.wordsInProgress).toBe(1);
      expect(stats.creatures).toHaveLength(1);
      expect(stats.creatures[0]).toEqual({
        wordId: 1,
        word: 'the',
        creatureId: 'trex',
        creatureColor: '#84cc16',
        masteredDate: '2026-01-01T00:00:00.000Z',
      });
    });
  });

  describe('getWord', () => {
    it('should return word with progress', () => {
      const { result } = renderHook(() => useLeitner());
      
      const word = result.current.getWord(1);
      
      expect(word).toBeTruthy();
      expect(word.id).toBe(1);
      expect(word.word).toBe('the');
      expect(word.progress).toBeTruthy();
      expect(word.progress.wordId).toBe(1);
    });

    it('should return null for invalid word ID', () => {
      const { result } = renderHook(() => useLeitner());
      
      const word = result.current.getWord(999);
      
      expect(word).toBeNull();
    });
  });

  describe('resetProgress', () => {
    it('should reset all progress to initial state', () => {
      const mockProgress = {
        progress: {
          1: {
            wordId: 1,
            box: 4,
            timesSeen: 10,
            timesCorrect: 10,
            timesIncorrect: 0,
            consecutiveCorrect: 5,
            sessionsSeenIn: [1, 2, 3, 4],
            lastSeen: '2026-01-01T00:00:00.000Z',
            responseTimes: [1500, 1400, 1300, 1200, 1100, 1000, 900, 800, 700, 600],
            mastered: true,
            masteredDate: '2026-01-01T00:00:00.000Z',
            creatureId: 'trex',
            creatureColor: '#84cc16',
          },
        },
        sessionNumber: 5,
      };
      
      localStorage.getItem.mockReturnValue(JSON.stringify(mockProgress));
      
      const { result } = renderHook(() => useLeitner());
      
      act(() => {
        result.current.resetProgress();
      });
      
      expect(result.current.sessionNumber).toBe(1);
      expect(result.current.progress[1].box).toBe(0);
      expect(result.current.progress[1].mastered).toBe(false);
      expect(localStorage.removeItem).toHaveBeenCalledWith('felicity-sight-words-progress');
    });
  });

  describe('localStorage persistence', () => {
    it('should save progress to localStorage', () => {
      const { result } = renderHook(() => useLeitner());
      
      act(() => {
        result.current.startSession();
        result.current.recordAnswer(1, true, 1500);
      });
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'felicity-sight-words-progress',
        expect.stringContaining('"wordId":1')
      );
    });
  });
});

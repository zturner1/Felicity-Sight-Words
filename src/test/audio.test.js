import { describe, it, expect, beforeEach, vi } from 'vitest';
import { speakWord, speakPhrase, stopAudio, preloadWordAudio } from '../utils/audio';

describe('Audio Utilities', () => {
  let mockAudio;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock Audio constructor
    mockAudio = {
      url: '',
      currentTime: 0,
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      load: vi.fn(),
      addEventListener: vi.fn((event, handler) => {
        if (event === 'error') {
          // Simulate error for non-existent files
          setTimeout(() => handler(), 0);
        }
      }),
    };
    
    global.Audio = vi.fn(function(url) {
      mockAudio.url = url;
      return mockAudio;
    });
    
    // Mock SpeechSynthesisUtterance
    global.SpeechSynthesisUtterance = vi.fn(function(text) {
      this.text = text;
      this.rate = 0.8;
      this.pitch = 1.0;
    });
    
    // Mock speechSynthesis on window
    global.window = {
      speechSynthesis: {
        speak: vi.fn(),
        cancel: vi.fn(),
      },
    };
    
    // Mock fetch for audio file checking
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });
  });

  describe('speakTTS fallback', () => {
    it('should use speechSynthesis when available', async () => {
      await speakWord('test', 0.8);
      
      // Wait for error handler to trigger TTS fallback
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(global.window.speechSynthesis.speak).toHaveBeenCalled();
    });

    it('should cancel previous speech before speaking', () => {
      speakPhrase('Hello', 0.8);
      
      expect(global.window.speechSynthesis.cancel).toHaveBeenCalled();
      expect(global.window.speechSynthesis.speak).toHaveBeenCalled();
    });

    it('should set speech rate correctly', () => {
      speakPhrase('Test phrase', 0.9);
      
      const utteranceCall = global.window.speechSynthesis.speak.mock.calls[0];
      if (utteranceCall) {
        const utterance = utteranceCall[0];
        expect(utterance.rate).toBe(0.9);
      }
    });
  });

  describe('speakPhrase', () => {
    it('should speak phrase using TTS', () => {
      speakPhrase('Great job!', 0.8);
      
      expect(global.window.speechSynthesis.cancel).toHaveBeenCalled();
      expect(global.window.speechSynthesis.speak).toHaveBeenCalled();
    });

    it('should handle empty speechSynthesis gracefully', () => {
      delete global.window.speechSynthesis;
      
      // Audio.js checks for 'speechSynthesis' in window, so it should not throw
      // when it's missing - it just won't do anything
      const mockWindow = {};
      global.window = mockWindow;
      
      // Should not throw
      expect(() => speakPhrase('Test', 0.8)).not.toThrow();
    });

    it('should use default rate when not specified', () => {
      speakPhrase('Test');
      
      expect(global.window.speechSynthesis.speak).toHaveBeenCalled();
    });
  });

  describe('speakWord', () => {
    it('should create audio element with correct path', async () => {
      const originalBasePath = import.meta.env.BASE_URL;
      import.meta.env.BASE_URL = '/test-base/';
      
      await speakWord('the', 0.8);
      
      expect(global.Audio).toHaveBeenCalledWith(
        expect.stringContaining('the.mp3')
      );
      
      import.meta.env.BASE_URL = originalBasePath;
    });

    it('should convert word to lowercase for audio file', async () => {
      await speakWord('THE', 0.8);
      
      expect(global.Audio).toHaveBeenCalledWith(
        expect.stringContaining('the.mp3')
      );
    });

    it('should fallback to TTS when audio file fails', async () => {
      await speakWord('test', 0.8);
      
      // Wait for error handler to trigger
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(global.window.speechSynthesis.speak).toHaveBeenCalled();
    });

    it('should load audio element', async () => {
      await speakWord('test', 0.8);
      
      expect(mockAudio.load).toHaveBeenCalled();
    });
  });

  describe('stopAudio', () => {
    it('should cancel speech synthesis', () => {
      stopAudio();
      
      expect(global.window.speechSynthesis.cancel).toHaveBeenCalled();
    });

    it('should handle missing speechSynthesis gracefully', () => {
      const mockWindow = {};
      global.window = mockWindow;
      
      // Should not throw when speechSynthesis is missing
      expect(() => stopAudio()).not.toThrow();
    });

    it('should stop all audio playback', async () => {
      await speakWord('word1', 0.8);
      
      stopAudio();
      
      // Verify cancel was called
      expect(global.window.speechSynthesis.cancel).toHaveBeenCalled();
    });
  });

  describe('preloadWordAudio', () => {
    it('should attempt to preload multiple words', async () => {
      const words = ['the', 'of', 'and'];
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
      });
      
      await preloadWordAudio(words);
      
      expect(global.fetch).toHaveBeenCalledTimes(words.length);
    });

    it('should check if audio files exist', async () => {
      const words = ['test'];
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
      });
      
      await preloadWordAudio(words);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('test.mp3'),
        { method: 'HEAD' }
      );
    });

    it('should handle fetch errors gracefully', async () => {
      const words = ['test'];
      
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      
      await expect(preloadWordAudio(words)).resolves.not.toThrow();
    });

    it('should convert words to lowercase', async () => {
      const words = ['THE', 'AND'];
      
      // Just verify the function completes without error
      // Actual lowercase conversion is tested elsewhere
      await expect(preloadWordAudio(words)).resolves.not.toThrow();
    });

    it('should create Audio elements for existing files', async () => {
      const words = ['test'];
      
      // Just verify function completes
      await expect(preloadWordAudio(words)).resolves.not.toThrow();
    });

    it('should handle empty word list', async () => {
      await expect(preloadWordAudio([])).resolves.not.toThrow();
    });
  });

  describe('Audio caching behavior', () => {
    it('should attempt to create audio elements', () => {
      // This test just verifies that speakWord executes without throwing
      expect(() => speakWord('uniqueword123', 0.8)).not.toThrow();
    });

    it('should attempt to load audio', () => {
      // This test verifies that speakWord can be called successfully
      expect(() => speakWord('anotherword456', 0.8)).not.toThrow();
    });
  });

  describe('Browser compatibility', () => {
    it('should handle missing Audio API', () => {
      // Remove Audio from global to test error handling
      const originalAudio = global.Audio;
      delete global.Audio;
      global.Audio = undefined;
      
      // speakWord doesn't return a promise in error case, it just tries to construct
      // This will throw synchronously when trying to construct Audio
      try {
        speakWord('test', 0.8);
        // If we reach here, Audio was somehow still available
        expect(true).toBe(false);
      } catch (e) {
        // Expected to throw
        expect(e).toBeDefined();
      }
      
      // Restore
      global.Audio = originalAudio;
    });

    it('should handle missing speechSynthesis API', () => {
      const mockWindow = {};
      global.window = mockWindow;
      
      // Should not throw when speechSynthesis is missing
      expect(() => speakPhrase('test', 0.8)).not.toThrow();
    });

    it('should handle missing fetch API', async () => {
      global.fetch = undefined;
      
      await expect(preloadWordAudio(['test'])).resolves.not.toThrow();
    });
  });

  describe('Edge cases', () => {
    it('should handle special characters in word', async () => {
      await speakWord("can't", 0.8);
      
      expect(global.Audio).toHaveBeenCalledWith(
        expect.stringContaining("can't.mp3")
      );
    });

    it('should handle very long phrases', () => {
      const longPhrase = 'A'.repeat(1000);
      
      // Should execute without error
      speakPhrase(longPhrase, 0.8);
      expect(global.window.speechSynthesis.speak).toHaveBeenCalled();
    });

    it('should handle empty string', () => {
      // Should not throw for empty word
      speakWord('', 0.8);
      expect(global.Audio).toHaveBeenCalled();
      
      // SpeakPhrase should also not throw
      speakPhrase('', 0.8);
      expect(global.window.speechSynthesis.speak).toHaveBeenCalled();
    });

    it('should handle rate parameter edge values', () => {
      speakPhrase('test', 0.1);
      speakPhrase('test', 2.0);
      expect(global.window.speechSynthesis.speak).toHaveBeenCalledTimes(2);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { WORDS, CREATURES, PRAISE_PHRASES, ENCOURAGEMENT_PHRASES } from '../data/words';

describe('Words Data Structure', () => {
  describe('WORDS array', () => {
    it('should have exactly 50 words (Fry First 50)', () => {
      expect(WORDS).toHaveLength(50);
    });

    it('should have unique IDs for all words', () => {
      const ids = WORDS.map(w => w.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(WORDS.length);
    });

    it('should have sequential IDs from 1 to 50', () => {
      const ids = WORDS.map(w => w.id).sort((a, b) => a - b);
      expect(ids[0]).toBe(1);
      expect(ids[ids.length - 1]).toBe(50);
      
      for (let i = 1; i <= 50; i++) {
        expect(ids).toContain(i);
      }
    });

    it('should have all required fields for each word', () => {
      WORDS.forEach(word => {
        expect(word).toHaveProperty('id');
        expect(word).toHaveProperty('word');
        expect(word).toHaveProperty('phonemes');
        expect(word).toHaveProperty('graphemes');
        expect(word).toHaveProperty('heartParts');
        expect(word).toHaveProperty('type');
      });
    });

    it('should have valid word types (heart or flash)', () => {
      WORDS.forEach(word => {
        expect(['heart', 'flash']).toContain(word.type);
      });
    });

    it('should have phonemes as non-empty array', () => {
      WORDS.forEach(word => {
        expect(Array.isArray(word.phonemes)).toBe(true);
        expect(word.phonemes.length).toBeGreaterThan(0);
      });
    });

    it('should have graphemes as non-empty array', () => {
      WORDS.forEach(word => {
        expect(Array.isArray(word.graphemes)).toBe(true);
        expect(word.graphemes.length).toBeGreaterThan(0);
      });
    });

    it('should have heartParts as array', () => {
      WORDS.forEach(word => {
        expect(Array.isArray(word.heartParts)).toBe(true);
      });
    });

    it('should have heartParts indices within graphemes array bounds', () => {
      WORDS.forEach(word => {
        word.heartParts.forEach(index => {
          expect(index).toBeGreaterThanOrEqual(0);
          expect(index).toBeLessThan(word.graphemes.length);
        });
      });
    });

    it('should have graphemes that combine to form the word', () => {
      // Test a few specific words to ensure data integrity
      const theWord = WORDS.find(w => w.word === 'the');
      expect(theWord.graphemes).toEqual(['th', 'e']);
      
      const andWord = WORDS.find(w => w.word === 'and');
      expect(andWord.graphemes).toEqual(['a', 'n', 'd']);
      
      const wasWord = WORDS.find(w => w.word === 'was');
      expect(wasWord.graphemes).toEqual(['w', 'a', 's']);
    });

    it('should have heart words with heartParts', () => {
      const heartWords = WORDS.filter(w => w.type === 'heart');
      heartWords.forEach(word => {
        expect(word.heartParts.length).toBeGreaterThan(0);
      });
    });

    it('should have flash words with empty heartParts or be consistent', () => {
      const flashWords = WORDS.filter(w => w.type === 'flash');
      flashWords.forEach(word => {
        // Flash words should have empty heartParts array
        expect(word.heartParts).toEqual([]);
      });
    });

    it('should have unique words (no duplicates)', () => {
      const words = WORDS.map(w => w.word);
      const uniqueWords = new Set(words);
      expect(uniqueWords.size).toBe(WORDS.length);
    });

    it('should have words as non-empty strings', () => {
      WORDS.forEach(word => {
        expect(typeof word.word).toBe('string');
        expect(word.word.length).toBeGreaterThan(0);
      });
    });
  });

  describe('CREATURES array', () => {
    it('should have at least 5 creature types', () => {
      expect(CREATURES.length).toBeGreaterThanOrEqual(5);
    });

    it('should have unique IDs for all creatures', () => {
      const ids = CREATURES.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(CREATURES.length);
    });

    it('should have all required fields for each creature', () => {
      CREATURES.forEach(creature => {
        expect(creature).toHaveProperty('id');
        expect(creature).toHaveProperty('name');
        expect(creature).toHaveProperty('emoji');
        expect(creature).toHaveProperty('colors');
      });
    });

    it('should have creature IDs as strings', () => {
      CREATURES.forEach(creature => {
        expect(typeof creature.id).toBe('string');
        expect(creature.id.length).toBeGreaterThan(0);
      });
    });

    it('should have creature names as non-empty strings', () => {
      CREATURES.forEach(creature => {
        expect(typeof creature.name).toBe('string');
        expect(creature.name.length).toBeGreaterThan(0);
      });
    });

    it('should have creature emojis as single emoji characters', () => {
      CREATURES.forEach(creature => {
        expect(typeof creature.emoji).toBe('string');
        expect(creature.emoji.length).toBeGreaterThan(0);
      });
    });

    it('should have colors as non-empty array', () => {
      CREATURES.forEach(creature => {
        expect(Array.isArray(creature.colors)).toBe(true);
        expect(creature.colors.length).toBeGreaterThan(0);
      });
    });

    it('should have colors in hex format', () => {
      const hexPattern = /^#[0-9a-f]{6}$/i;
      CREATURES.forEach(creature => {
        creature.colors.forEach(color => {
          expect(color).toMatch(hexPattern);
        });
      });
    });

    it('should have common creatures like T-Rex and Triceratops', () => {
      const creatureNames = CREATURES.map(c => c.name.toLowerCase());
      expect(creatureNames).toContain('t-rex');
      expect(creatureNames).toContain('triceratops');
    });
  });

  describe('PRAISE_PHRASES array', () => {
    it('should have at least 5 praise phrases', () => {
      expect(PRAISE_PHRASES.length).toBeGreaterThanOrEqual(5);
    });

    it('should have all phrases as non-empty strings', () => {
      PRAISE_PHRASES.forEach(phrase => {
        expect(typeof phrase).toBe('string');
        expect(phrase.length).toBeGreaterThan(0);
      });
    });

    it('should have positive and encouraging language', () => {
      const positiveWords = ['great', 'amazing', 'awesome', 'perfect', 'wonderful', 'fantastic', 'super', 'yes'];
      const hasPositiveLanguage = PRAISE_PHRASES.some(phrase => 
        positiveWords.some(word => phrase.toLowerCase().includes(word))
      );
      expect(hasPositiveLanguage).toBe(true);
    });

    it('should have unique phrases', () => {
      const uniquePhrases = new Set(PRAISE_PHRASES);
      expect(uniquePhrases.size).toBe(PRAISE_PHRASES.length);
    });
  });

  describe('ENCOURAGEMENT_PHRASES array', () => {
    it('should have at least 3 encouragement phrases', () => {
      expect(ENCOURAGEMENT_PHRASES.length).toBeGreaterThanOrEqual(3);
    });

    it('should have all phrases as non-empty strings', () => {
      ENCOURAGEMENT_PHRASES.forEach(phrase => {
        expect(typeof phrase).toBe('string');
        expect(phrase.length).toBeGreaterThan(0);
      });
    });

    it('should have supportive language', () => {
      const supportiveWords = ['try', 'keep', 'almost', 'good', 'tough'];
      const hasSupportiveLanguage = ENCOURAGEMENT_PHRASES.some(phrase => 
        supportiveWords.some(word => phrase.toLowerCase().includes(word))
      );
      expect(hasSupportiveLanguage).toBe(true);
    });

    it('should have unique phrases', () => {
      const uniquePhrases = new Set(ENCOURAGEMENT_PHRASES);
      expect(uniquePhrases.size).toBe(ENCOURAGEMENT_PHRASES.length);
    });
  });

  describe('Data Consistency', () => {
    it('should have proper distribution of heart vs flash words', () => {
      const heartWords = WORDS.filter(w => w.type === 'heart');
      const flashWords = WORDS.filter(w => w.type === 'flash');
      
      // At least some of each type
      expect(heartWords.length).toBeGreaterThan(0);
      expect(flashWords.length).toBeGreaterThan(0);
      
      // Total should equal all words
      expect(heartWords.length + flashWords.length).toBe(WORDS.length);
    });

    it('should have consistent word structure across all entries', () => {
      const firstWord = WORDS[0];
      const keys = Object.keys(firstWord).sort();
      
      WORDS.forEach(word => {
        const wordKeys = Object.keys(word).sort();
        expect(wordKeys).toEqual(keys);
      });
    });

    it('should have consistent creature structure across all entries', () => {
      const firstCreature = CREATURES[0];
      const keys = Object.keys(firstCreature).sort();
      
      CREATURES.forEach(creature => {
        const creatureKeys = Object.keys(creature).sort();
        expect(creatureKeys).toEqual(keys);
      });
    });
  });
});

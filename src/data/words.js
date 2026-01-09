// Fry First 50 High-Frequency Words
// Each word includes phonics data for Heart Word methodology

export const WORDS = [
  // Words 1-10
  { id: 1, word: "the", phonemes: ["th", "ə"], graphemes: ["th", "e"], heartParts: [1], type: "heart" },
  { id: 2, word: "of", phonemes: ["ə", "v"], graphemes: ["o", "f"], heartParts: [0, 1], type: "heart" },
  { id: 3, word: "and", phonemes: ["a", "n", "d"], graphemes: ["a", "n", "d"], heartParts: [], type: "flash" },
  { id: 4, word: "a", phonemes: ["ə"], graphemes: ["a"], heartParts: [0], type: "heart" },
  { id: 5, word: "to", phonemes: ["t", "oo"], graphemes: ["t", "o"], heartParts: [1], type: "heart" },
  { id: 6, word: "in", phonemes: ["i", "n"], graphemes: ["i", "n"], heartParts: [], type: "flash" },
  { id: 7, word: "is", phonemes: ["i", "z"], graphemes: ["i", "s"], heartParts: [1], type: "heart" },
  { id: 8, word: "you", phonemes: ["y", "oo"], graphemes: ["y", "ou"], heartParts: [1], type: "heart" },
  { id: 9, word: "that", phonemes: ["th", "a", "t"], graphemes: ["th", "a", "t"], heartParts: [], type: "flash" },
  { id: 10, word: "it", phonemes: ["i", "t"], graphemes: ["i", "t"], heartParts: [], type: "flash" },
  
  // Words 11-20
  { id: 11, word: "he", phonemes: ["h", "ee"], graphemes: ["h", "e"], heartParts: [1], type: "heart" },
  { id: 12, word: "was", phonemes: ["w", "u", "z"], graphemes: ["w", "a", "s"], heartParts: [1, 2], type: "heart" },
  { id: 13, word: "for", phonemes: ["f", "or"], graphemes: ["f", "or"], heartParts: [], type: "flash" },
  { id: 14, word: "on", phonemes: ["o", "n"], graphemes: ["o", "n"], heartParts: [], type: "flash" },
  { id: 15, word: "are", phonemes: ["ar"], graphemes: ["are"], heartParts: [0], type: "heart" },
  { id: 16, word: "as", phonemes: ["a", "z"], graphemes: ["a", "s"], heartParts: [1], type: "heart" },
  { id: 17, word: "with", phonemes: ["w", "i", "th"], graphemes: ["w", "i", "th"], heartParts: [], type: "flash" },
  { id: 18, word: "his", phonemes: ["h", "i", "z"], graphemes: ["h", "i", "s"], heartParts: [2], type: "heart" },
  { id: 19, word: "they", phonemes: ["th", "ay"], graphemes: ["th", "ey"], heartParts: [1], type: "heart" },
  { id: 20, word: "I", phonemes: ["eye"], graphemes: ["I"], heartParts: [0], type: "heart" },
  
  // Words 21-30
  { id: 21, word: "at", phonemes: ["a", "t"], graphemes: ["a", "t"], heartParts: [], type: "flash" },
  { id: 22, word: "be", phonemes: ["b", "ee"], graphemes: ["b", "e"], heartParts: [1], type: "heart" },
  { id: 23, word: "this", phonemes: ["th", "i", "s"], graphemes: ["th", "i", "s"], heartParts: [], type: "flash" },
  { id: 24, word: "have", phonemes: ["h", "a", "v"], graphemes: ["h", "a", "ve"], heartParts: [1], type: "heart" },
  { id: 25, word: "from", phonemes: ["f", "r", "o", "m"], graphemes: ["f", "r", "o", "m"], heartParts: [], type: "flash" },
  { id: 26, word: "or", phonemes: ["or"], graphemes: ["or"], heartParts: [], type: "flash" },
  { id: 27, word: "one", phonemes: ["w", "u", "n"], graphemes: ["o", "n", "e"], heartParts: [0, 2], type: "heart" },
  { id: 28, word: "had", phonemes: ["h", "a", "d"], graphemes: ["h", "a", "d"], heartParts: [], type: "flash" },
  { id: 29, word: "by", phonemes: ["b", "eye"], graphemes: ["b", "y"], heartParts: [1], type: "heart" },
  { id: 30, word: "words", phonemes: ["w", "er", "d", "z"], graphemes: ["w", "or", "d", "s"], heartParts: [], type: "flash" },
  
  // Words 31-40
  { id: 31, word: "but", phonemes: ["b", "u", "t"], graphemes: ["b", "u", "t"], heartParts: [], type: "flash" },
  { id: 32, word: "not", phonemes: ["n", "o", "t"], graphemes: ["n", "o", "t"], heartParts: [], type: "flash" },
  { id: 33, word: "what", phonemes: ["w", "u", "t"], graphemes: ["wh", "a", "t"], heartParts: [0, 1], type: "heart" },
  { id: 34, word: "all", phonemes: ["aw", "l"], graphemes: ["a", "ll"], heartParts: [0], type: "heart" },
  { id: 35, word: "were", phonemes: ["w", "er"], graphemes: ["w", "ere"], heartParts: [1], type: "heart" },
  { id: 36, word: "we", phonemes: ["w", "ee"], graphemes: ["w", "e"], heartParts: [1], type: "heart" },
  { id: 37, word: "when", phonemes: ["w", "e", "n"], graphemes: ["wh", "e", "n"], heartParts: [], type: "flash" },
  { id: 38, word: "your", phonemes: ["y", "or"], graphemes: ["y", "our"], heartParts: [1], type: "heart" },
  { id: 39, word: "can", phonemes: ["k", "a", "n"], graphemes: ["c", "a", "n"], heartParts: [], type: "flash" },
  { id: 40, word: "said", phonemes: ["s", "e", "d"], graphemes: ["s", "ai", "d"], heartParts: [1], type: "heart" },
  
  // Words 41-50
  { id: 41, word: "there", phonemes: ["th", "air"], graphemes: ["th", "ere"], heartParts: [1], type: "heart" },
  { id: 42, word: "use", phonemes: ["y", "oo", "z"], graphemes: ["u", "s", "e"], heartParts: [0, 1], type: "heart" },
  { id: 43, word: "an", phonemes: ["a", "n"], graphemes: ["a", "n"], heartParts: [], type: "flash" },
  { id: 44, word: "each", phonemes: ["ee", "ch"], graphemes: ["ea", "ch"], heartParts: [], type: "flash" },
  { id: 45, word: "which", phonemes: ["w", "i", "ch"], graphemes: ["wh", "i", "ch"], heartParts: [], type: "flash" },
  { id: 46, word: "she", phonemes: ["sh", "ee"], graphemes: ["sh", "e"], heartParts: [1], type: "heart" },
  { id: 47, word: "do", phonemes: ["d", "oo"], graphemes: ["d", "o"], heartParts: [1], type: "heart" },
  { id: 48, word: "how", phonemes: ["h", "ow"], graphemes: ["h", "ow"], heartParts: [], type: "flash" },
  { id: 49, word: "their", phonemes: ["th", "air"], graphemes: ["th", "eir"], heartParts: [1], type: "heart" },
  { id: 50, word: "if", phonemes: ["i", "f"], graphemes: ["i", "f"], heartParts: [], type: "flash" },
];

// Creature types for rewards
export const CREATURES = [
  { id: "trex", name: "T-Rex", emoji: "🦖", colors: ["#84cc16", "#22c55e", "#16a34a"] },
  { id: "tric", name: "Triceratops", emoji: "🦕", colors: ["#3b82f6", "#6366f1", "#8b5cf6"] },
  { id: "fox", name: "Fox", emoji: "🦊", colors: ["#f97316", "#fb923c", "#fdba74"] },
  { id: "owl", name: "Owl", emoji: "🦉", colors: ["#a855f7", "#c084fc", "#d8b4fe"] },
  { id: "bunny", name: "Bunny", emoji: "🐰", colors: ["#ec4899", "#f472b6", "#f9a8d4"] },
  { id: "turtle", name: "Turtle", emoji: "🐢", colors: ["#14b8a6", "#2dd4bf", "#5eead4"] },
  { id: "lion", name: "Lion", emoji: "🦁", colors: ["#eab308", "#facc15", "#fde047"] },
  { id: "elephant", name: "Elephant", emoji: "🐘", colors: ["#6b7280", "#9ca3af", "#d1d5db"] },
  { id: "dragon", name: "Dragon", emoji: "🐉", colors: ["#dc2626", "#ef4444", "#f87171"] },
  { id: "unicorn", name: "Unicorn", emoji: "🦄", colors: ["#d946ef", "#e879f9", "#f0abfc"] },
];

// Praise phrases for correct answers
export const PRAISE_PHRASES = [
  "Great job! 🌟",
  "You got it! ⭐",
  "Amazing! 🎉",
  "Super reading! 📚",
  "Awesome! 🦖",
  "Perfect! ✨",
  "Wonderful! 🌈",
  "Yes! You're a star! 💫",
  "Fantastic! 🎊",
  "Way to go! 🏆",
];

// Encouragement for incorrect answers
export const ENCOURAGEMENT_PHRASES = [
  "Almost! Let's try again.",
  "Oops! This one's tricky.",
  "Good try! Watch carefully.",
  "That's a tough one!",
  "Keep going, you've got this!",
];

export default WORDS;

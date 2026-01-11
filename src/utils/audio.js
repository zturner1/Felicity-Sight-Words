// Audio utility for playing recorded words or falling back to TTS

// Cache for audio elements
const audioCache = {};

// Check if an audio file exists
const audioExists = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

// Preload audio files for words
export const preloadWordAudio = async (words) => {
  const basePath = import.meta.env.BASE_URL + 'audio/words/';
  
  for (const word of words) {
    const url = `${basePath}${word.toLowerCase()}.mp3`;
    if (!audioCache[word.toLowerCase()]) {
      const exists = await audioExists(url);
      if (exists) {
        audioCache[word.toLowerCase()] = new Audio(url);
      }
    }
  }
};

// Speak a word - uses recorded audio if available, otherwise TTS
export const speakWord = (word, rate = 0.8) => {
  const lowerWord = word.toLowerCase();
  const basePath = import.meta.env.BASE_URL + 'audio/words/';
  const audioUrl = `${basePath}${lowerWord}.mp3`;
  
  // Try cached audio first
  if (audioCache[lowerWord]) {
    audioCache[lowerWord].currentTime = 0;
    audioCache[lowerWord].play().catch(() => {
      // Fallback to TTS if audio fails
      speakTTS(word, rate);
    });
    return;
  }
  
  // Try to load and play audio file
  const audio = new Audio(audioUrl);
  audio.addEventListener('canplaythrough', () => {
    audioCache[lowerWord] = audio;
    audio.play();
  }, { once: true });
  
  audio.addEventListener('error', () => {
    // Fallback to TTS if no audio file
    speakTTS(word, rate);
  }, { once: true });
  
  audio.load();
};

// Speak a phrase - always uses TTS (for praise, instructions, etc.)
export const speakPhrase = (text, rate = 0.8) => {
  speakTTS(text, rate);
};

// Text-to-speech fallback
const speakTTS = (text, rate = 0.8) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }
};

// Stop any playing audio
export const stopAudio = () => {
  // Stop all cached audio
  Object.values(audioCache).forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
  
  // Stop TTS
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

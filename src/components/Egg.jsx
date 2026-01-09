import React from 'react';

// Egg stages based on box level
// Box 0: Hidden/not started
// Box 1: Just planted (small, buried)
// Box 2: Emerged (visible, glowing)
// Box 3: Wobbling (cracking)
// Box 4: About to hatch (big cracks)
// Mastered: Hatched (creature visible)

export function Egg({ box, isAnimating, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-16 h-20',
    md: 'w-24 h-32 sm:w-32 sm:h-40',
    lg: 'w-32 h-40 sm:w-40 sm:h-52',
  };

  const getEggStyle = () => {
    switch (box) {
      case 0:
        return 'opacity-30 scale-75';
      case 1:
        return 'opacity-70 scale-90';
      case 2:
        return 'opacity-90 animate-glow';
      case 3:
        return 'animate-wobble';
      case 4:
        return 'animate-wobble scale-105';
      default:
        return '';
    }
  };

  const getCracks = () => {
    if (box < 3) return null;
    
    return (
      <>
        {/* Crack lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 130"
        >
          {box >= 3 && (
            <>
              <path
                d="M50 20 L45 35 L55 45 L48 60"
                stroke="#92400e"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M70 40 L60 50 L65 65"
                stroke="#92400e"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </>
          )}
          {box >= 4 && (
            <>
              <path
                d="M30 50 L40 55 L35 70 L42 80"
                stroke="#92400e"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M55 70 L60 85 L50 95"
                stroke="#92400e"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </>
          )}
        </svg>
      </>
    );
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${getEggStyle()} transition-all duration-500`}>
      {/* Glow effect */}
      {box >= 2 && (
        <div className="absolute inset-0 rounded-[50%] rounded-b-[60%] bg-yellow-300/30 blur-xl animate-pulse" />
      )}
      
      {/* Egg shell */}
      <div
        className={`
          relative w-full h-full
          bg-gradient-to-b from-amber-100 via-amber-200 to-amber-300
          rounded-[50%] rounded-b-[60%]
          border-4 border-amber-400
          shadow-lg
          ${isAnimating ? 'animate-bounce' : ''}
        `}
      >
        {/* Highlight */}
        <div className="absolute top-4 left-4 w-4 h-6 bg-white/40 rounded-full rotate-[-20deg]" />
        
        {/* Speckles */}
        <div className="absolute top-8 right-6 w-2 h-2 bg-amber-400/50 rounded-full" />
        <div className="absolute top-12 right-4 w-1.5 h-1.5 bg-amber-400/50 rounded-full" />
        <div className="absolute top-6 left-8 w-1.5 h-1.5 bg-amber-400/50 rounded-full" />
        
        {/* Cracks overlay */}
        {getCracks()}
      </div>
      
      {/* Nest at bottom */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[120%]">
        <div className="h-4 bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-full opacity-80" />
        <div className="flex justify-center -mt-1">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-6 bg-amber-700 rounded-b-full mx-0.5"
              style={{ transform: `rotate(${(i - 3) * 15}deg)` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function HatchingAnimation({ creature, color, onComplete }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="text-center animate-bounce">
        <div 
          className="text-8xl sm:text-9xl mb-4 drop-shadow-2xl"
          style={{ filter: `drop-shadow(0 0 20px ${color})` }}
        >
          {creature.emoji}
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
          A {creature.name} hatched! 🎉
        </p>
        <button
          onClick={onComplete}
          className="mt-6 px-8 py-4 bg-white rounded-full text-xl font-bold text-green-600 
                     shadow-lg active:scale-95 transition-transform touch-manipulation"
        >
          Yay! 🌟
        </button>
      </div>
    </div>
  );
}

export default Egg;

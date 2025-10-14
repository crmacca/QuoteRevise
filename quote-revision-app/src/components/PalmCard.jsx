import React, { useState, useEffect, useRef } from 'react';

const PalmCard = ({ 
  quote, 
  showBack = false, 
  onFlip,
  children,
  autoFlip = false,
  flipDelay = 10000 
}) => {
  const [isFlipped, setIsFlipped] = useState(showBack);
  const [timeLeft, setTimeLeft] = useState(flipDelay / 1000);
  const [isHolding, setIsHolding] = useState(false);

  useEffect(() => {
    setIsFlipped(showBack);
  }, [showBack]);

  useEffect(() => {
    if (autoFlip && !isFlipped) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsFlipped(true);
            if (onFlip) onFlip();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [autoFlip, isFlipped, onFlip]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (onFlip) onFlip();
  };

  const handleHoldStart = () => {
    setIsHolding(true);
  };

  const handleHoldEnd = () => {
    setIsHolding(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className={`flip-card ${isFlipped && !isHolding ? 'flipped' : ''}`}>
        <div className="flip-card-inner" style={{ minHeight: '600px' }}>
          {/* Front of card */}
          <div className="flip-card-front">
            <div className="paper-texture rounded-lg p-12 h-full flex items-center justify-center overflow-auto">
              <p 
                className="text-3xl text-center leading-loose max-w-full"
                style={{ fontFamily: 'var(--font-palm)' }}
              >
                {quote}
              </p>
            </div>
            {autoFlip && !isFlipped && (
              <div className="text-center mt-6 text-gray-600 font-bold text-lg">
                {timeLeft}s
              </div>
            )}
          </div>

          {/* Back of card */}
          <div className="flip-card-back">
            <div className="paper-texture rounded-lg p-12 h-full overflow-auto">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Hold to reveal button - only show when card is flipped */}
      {isFlipped && (
        <div className="text-center mt-6">
          <button
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            className="px-8 py-3 bg-stone-200 text-zinc-700 rounded-md hover:bg-stone-300 transition-colors font-semibold select-none border border-stone-300"
          >
            {isHolding ? '👀 Showing Answer' : 'Hold to Peek'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PalmCard;
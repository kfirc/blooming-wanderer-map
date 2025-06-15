import React, { useRef, useEffect, useState } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

type LottieInstance = { play: () => void; goToAndStop: (frame: number, isFrame: boolean) => void };

type MapHeaderProps = {
  onInfoClick?: () => void;
};

const MapHeader: React.FC<MapHeaderProps> = ({ onInfoClick }) => {
  const coffeeRef = useRef<Player | null>(null);
  const infoLottie = useRef<LottieInstance | null>(null);
  const [infoLottieReady, setInfoLottieReady] = useState(false);

  // Play info animation once when the ref is set (after mount)
  useEffect(() => {
    if (infoLottieReady && infoLottie.current) {
      infoLottie.current.goToAndStop(0, true);
      infoLottie.current.play();
    }
  }, [infoLottieReady]);

  const handleInfoClick = () => {
    if (onInfoClick) {
      onInfoClick();
    } // else do nothing
  };

  return (
    <div className="absolute top-4 left-4 z-30 flex items-center space-x-3">
      {/* Logo and Title */}
      <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
        <div className="header-logo-container relative group cursor-pointer">
          <img src="/title.jpg" alt="Bloom Israel" className="h-10 w-10 rounded-full object-cover" />
          <svg 
            className="header-logo-circle absolute -top-1 -left-1 w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
            viewBox="0 0 48 48"
          >
            <circle
              cx="24"
              cy="24"
              r="22"
              fill="none"
              stroke="url(#headerProgressGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="138 0"
              transform="rotate(-90 24 24)"
            />
            <defs>
              <linearGradient id="headerProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#16a34a" />
                <stop offset="50%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold bg-gradient-to-r from-green-700 to-purple-700 bg-clip-text text-transparent leading-tight flex items-end gap-1">
            Bloom <span className="text-xs align-baseline">IL</span>
          </span>
        </div>
        {/* Buttons */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={handleInfoClick}
            className="p-2 rounded-full hover:bg-gray-100 transition flex items-center justify-center"
            aria-label="מידע על הדף"
            style={{ width: 36, height: 36, marginLeft: 10, paddingTop: 13 }}
            onMouseEnter={() => {
              infoLottie.current?.goToAndStop(0, true);
              infoLottie.current?.play();
            }}
            onMouseLeave={() => {
              infoLottie.current?.goToAndStop(39, true);
            }}
          >
            <Player
              lottieRef={instance => {
                infoLottie.current = instance as LottieInstance;
                setInfoLottieReady(!!instance);
              }}
              autoplay={false}
              loop={false}
              src="/information.lottie"
              style={{ height: 28, width: 28, marginTop: -4 }}
              keepLastFrame
            />
          </button>
          <a
            href="https://coff.ee/kfirco"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-yellow-100 transition flex items-center justify-center"
            aria-label="Buy me a coffee"
            style={{ width: 36, height: 36 }}
            onMouseEnter={() => coffeeRef.current?.play()}
            onMouseLeave={() => coffeeRef.current?.stop()}
          >
            <Player
              ref={coffeeRef}
              autoplay={false}
              loop={false}
              src="/coffee.lottie"
              style={{ height: 50, width: 50, marginTop: -10 }}
              keepLastFrame
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default MapHeader;

import React, { useRef, useState } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { MapStyle } from '../types/BloomReport';

type LottieInstance = { play: () => void; goToAndStop: (frame: number, isFrame: boolean) => void };

type MapHeaderProps = {
  onInfoClick?: () => void;
  onMapStyleClick?: () => void;
};

const MapHeader: React.FC<MapHeaderProps> = ({ onInfoClick, onMapStyleClick }) => {
  const coffeeRef = useRef<Player | null>(null);
  const infoLottie = useRef<LottieInstance | null>(null);
  const mapLottie = useRef<LottieInstance | null>(null);
  const [infoLottieReady, setInfoLottieReady] = useState(false);
  const [mapLottieReady, setMapLottieReady] = useState(false);

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
        <div className="flex items-center gap-1 ml-4">
          {/* Map Style Button */}
          {onMapStyleClick && (
            <button
              onClick={onMapStyleClick}
              className="p-2 rounded-full hover:bg-gray-100 transition flex items-center justify-center"
              aria-label="סגנונות מפה"
              style={{ width: 44, height: 44 }}
              onMouseEnter={() => {
                if (mapLottie.current) {
                  mapLottie.current.goToAndStop(0, true);
                  mapLottie.current.play();
                }
              }}
              onMouseLeave={() => {
                if (mapLottie.current) {
                  mapLottie.current.goToAndStop(177, true);
                }
              }}
            >
              <Player
                lottieRef={instance => {
                  mapLottie.current = instance as LottieInstance;
                  setMapLottieReady(!!instance);
                }}
                autoplay={false}
                loop={true}
                src="/map.lottie"
                style={{ height: 40, width: 40, marginTop: 2 }}
                keepLastFrame
              />
            </button>
          )}
          <button
            onClick={handleInfoClick}
            className="p-2 rounded-full hover:bg-gray-100 transition flex items-center justify-center"
            aria-label="מידע על הדף"
            style={{ width: 40, height: 40 }}
            onMouseEnter={() => {
              if (infoLottie.current) {
                infoLottie.current.goToAndStop(0, true);
                infoLottie.current.play();
              }
            }}
            onMouseLeave={() => {
              if (infoLottie.current) {
                infoLottie.current.goToAndStop(0, true);
              }
            }}
          >
                          <Player
              lottieRef={instance => {
                infoLottie.current = instance as LottieInstance;
                setInfoLottieReady(!!instance);
              }}
              autoplay={false}
              loop={true}
              src="/information2.lottie"
              style={{ height: 36, width: 36 }}
              keepLastFrame
            />
          </button>
          <a
            href="https://coff.ee/kfirco"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-yellow-100 transition flex items-center justify-center"
            aria-label="Buy me a coffee"
            style={{ width: 44, height: 44 }}
            onMouseEnter={() => {
              if (coffeeRef.current) {
                coffeeRef.current.play();
              }
            }}
            onMouseLeave={() => {
              if (coffeeRef.current) {
                coffeeRef.current.stop();
              }
            }}
          >
            <Player
              ref={coffeeRef}
              autoplay={false}
              loop={true}
              src="/coffee.lottie"
              style={{ height: 60, width: 60, marginTop: -12 }}
              keepLastFrame
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default MapHeader;

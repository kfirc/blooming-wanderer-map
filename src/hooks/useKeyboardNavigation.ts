import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';

interface UseKeyboardNavigationProps {
  map: L.Map | null;
  mapLoaded: boolean;
}

interface KeyState {
  ArrowUp: boolean;
  ArrowDown: boolean;
  ArrowLeft: boolean;
  ArrowRight: boolean;
}

export const useKeyboardNavigation = ({ map, mapLoaded }: UseKeyboardNavigationProps) => {
  const keysRef = useRef<KeyState>({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  });
  
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);

  // Movement configuration
  const MOVEMENT_CONFIG = {
    PAN_SPEED: 350, // pixels per second (increased for faster movement)
    ACCELERATION_FACTOR: 1.5, // Speed multiplier for diagonal movement
    SMOOTH_FACTOR: 0.88, // Smoothing for easing movement (slightly more responsive)
    MIN_FPS: 60, // Minimum frame rate for smooth animation
  };

  const smoothPan = useCallback(() => {
    if (!map || !mapLoaded) return;

    const now = performance.now();
    const deltaTime = (now - lastUpdateRef.current) / 1000; // Convert to seconds
    lastUpdateRef.current = now;

    // Skip if delta time is too large (e.g., page was inactive)
    if (deltaTime > 0.1) {
      animationFrameRef.current = requestAnimationFrame(smoothPan);
      return;
    }

    const { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } = keysRef.current;
    
    // Check if any arrow key is pressed
    const hasActiveKeys = ArrowUp || ArrowDown || ArrowLeft || ArrowRight;
    
    if (!hasActiveKeys) {
      // Stop animation if no keys are pressed
      return;
    }

    // Calculate movement direction
    let deltaX = 0;
    let deltaY = 0;

    if (ArrowLeft) deltaX -= 1;
    if (ArrowRight) deltaX += 1;
    if (ArrowUp) deltaY -= 1;
    if (ArrowDown) deltaY += 1;

    // Apply diagonal movement acceleration and normalization
    const isDiagonal = (Math.abs(deltaX) + Math.abs(deltaY)) === 2;
    const speed = MOVEMENT_CONFIG.PAN_SPEED * deltaTime;
    
    if (isDiagonal) {
      // Normalize diagonal movement and apply acceleration
      const normalizedSpeed = speed * MOVEMENT_CONFIG.ACCELERATION_FACTOR * 0.707; // 0.707 ≈ 1/√2
      deltaX *= normalizedSpeed;
      deltaY *= normalizedSpeed;
    } else {
      // Regular movement
      deltaX *= speed;
      deltaY *= speed;
    }

    // Apply smooth factor for more natural feeling
    deltaX *= MOVEMENT_CONFIG.SMOOTH_FACTOR;
    deltaY *= MOVEMENT_CONFIG.SMOOTH_FACTOR;

    // Get current map center and calculate new center
    const currentCenter = map.getCenter();
    const pixelBounds = map.getSize();
    const currentZoom = map.getZoom();
    
    // Convert pixel movement to lat/lng based on current zoom level
    const latLngDelta = map.containerPointToLatLng([deltaX, deltaY]);
    const centerPoint = map.latLngToContainerPoint(currentCenter);
    const newCenterPoint = L.point(centerPoint.x + deltaX, centerPoint.y + deltaY);
    const newCenter = map.containerPointToLatLng(newCenterPoint);

    // Apply the pan with smooth animation
    map.panTo(newCenter, {
      animate: true,
      duration: 1 / MOVEMENT_CONFIG.MIN_FPS, // Smooth frame-based duration
      easeLinearity: 0.1, // Linear easing for consistent movement
      noMoveStart: true, // Prevent move events from firing repeatedly
    });

    // Continue animation
    animationFrameRef.current = requestAnimationFrame(smoothPan);
  }, [map, mapLoaded]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip if map is not ready
    if (!map || !mapLoaded) return;

    // Check if it's an arrow key
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

    // Prevent default browser behavior (page scrolling)
    e.preventDefault();
    e.stopPropagation();

    const key = e.key as keyof KeyState;
    
    // Only start movement if this key wasn't already pressed (prevent key repeat issues)
    if (!keysRef.current[key]) {
      keysRef.current[key] = true;
      
      // Initialize timing for smooth animation
      lastUpdateRef.current = performance.now();
      
      // Start smooth panning animation if not already running
      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(smoothPan);
      }
    }
  }, [map, mapLoaded, smoothPan]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

    const key = e.key as keyof KeyState;
    keysRef.current[key] = false;

    // Check if all keys are released
    const hasActiveKeys = Object.values(keysRef.current).some(Boolean);
    
    if (!hasActiveKeys && animationFrameRef.current) {
      // Stop animation when all keys are released
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (!mapLoaded) return;

    // Add keyboard event listeners
    document.addEventListener('keydown', handleKeyDown, { passive: false });
    document.addEventListener('keyup', handleKeyUp, { passive: false });

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      
      // Cancel any ongoing animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
      
      // Reset key states
      keysRef.current = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
      };
    };
  }, [mapLoaded, handleKeyDown, handleKeyUp]);

  // Handle page visibility changes to prevent stuck keys
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Reset all keys when page becomes hidden
        keysRef.current = {
          ArrowUp: false,
          ArrowDown: false,
          ArrowLeft: false,
          ArrowRight: false,
        };
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = undefined;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
}; 
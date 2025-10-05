import { useEffect, useState, useRef, useCallback } from 'react';

// Import all astronaut images
import helmetOnImg from '/assets/hangman-states/helmet-on.png';
import helmetOffImg from '/assets/hangman-states/helmet-off.png';
import eyeClosedImg from '/assets/hangman-states/eye-closed.png';
import eyeLeftImg from '/assets/hangman-states/eye-left.png';
import eyeRightImg from '/assets/hangman-states/eye-right.png';
import wearingHelmet1Img from '/assets/hangman-states/wearing helmet state 1.png';
import wearingHelmet2Img from '/assets/hangman-states/wearing helmet state 2.png';

// Configuration
const TARGET_HEIGHT = 360;
const FPS = 24;
const TRANSITION_FRAME_DURATION = 500; // 500ms per transition frame (slower transitions)
const IDLE_ACTION_INTERVAL = { min: 2000, max: 5000 }; // Random idle actions every 2-5 seconds

// Image mapping
const IMAGE_MAP = {
  'helmet-on': helmetOnImg,
  'helmet-off': helmetOffImg,
  'eye-closed': eyeClosedImg,
  'eye-left': eyeLeftImg,
  'eye-right': eyeRightImg,
  'wearing helmet state 1': wearingHelmet1Img,
  'wearing helmet state 2': wearingHelmet2Img
};

// Animation states
const STATES = {
  HELMET_ON: 'helmet-on',
  HELMET_OFF: 'helmet-off',
  TRANSITIONING_TO_OFF: 'transitioning-to-off',
  TRANSITIONING_TO_ON: 'transitioning-to-on'
};

// Transition sequences
const HELMET_OFF_TRANSITION = [
  'wearing helmet state 1',
  'wearing helmet state 2', 
  'helmet-off'
];

const HELMET_ON_TRANSITION = [
  'wearing helmet state 2',
  'wearing helmet state 1',
  'helmet-on'
];

// Static chest light brightness
const getChestBrightness = () => {
  return 0.8; // Static 80% brightness
};

// Preload images utility
const preloadImages = async (imagePaths) => {
  return Promise.all(imagePaths.map(src => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }));
};

const AstronautIdle = ({ 
  height = TARGET_HEIGHT, 
  className = '', 
  onReady,
  backgroundAlpha = 0 
}) => {
  const [currentState, setCurrentState] = useState(STATES.HELMET_ON);
  const [currentImage, setCurrentImage] = useState('helmet-on');
  const [isVisible, setIsVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [animationTime, setAnimationTime] = useState(0);
  const [transitionFrame, setTransitionFrame] = useState(0);
  const [lastIdleAction, setLastIdleAction] = useState(0);
  const [nextIdleAction, setNextIdleAction] = useState(0);
  const [currentEyeAction, setCurrentEyeAction] = useState(null);
  
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);

  // Intersection Observer for visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Preload images
  useEffect(() => {
    const imagePaths = [
      helmetOnImg,
      helmetOffImg,
      eyeClosedImg,
      eyeLeftImg,
      eyeRightImg,
      wearingHelmet1Img,
      wearingHelmet2Img
    ];

    preloadImages(imagePaths)
      .then(() => {
        setIsLoaded(true);
        if (onReady) onReady();
      })
      .catch((error) => {
        console.error('Failed to load astronaut images:', error);
      });
  }, [onReady]);

  // Handle helmet toggle
  const handleHelmetToggle = useCallback(() => {
    if (currentState === STATES.HELMET_ON) {
      setCurrentState(STATES.TRANSITIONING_TO_OFF);
      setTransitionFrame(0);
    } else if (currentState === STATES.HELMET_OFF) {
      setCurrentState(STATES.TRANSITIONING_TO_ON);
      setTransitionFrame(0);
    }
  }, [currentState]);

  // Get current frame data
  const getCurrentFrameData = useCallback(() => {
    const chestBrightness = getChestBrightness();
    
    let imageSrc = currentImage;
    let headTiltOffset = 0;
    
    // Handle transitions
    if (currentState === STATES.TRANSITIONING_TO_OFF) {
      imageSrc = HELMET_OFF_TRANSITION[transitionFrame] || 'helmet-off';
    } else if (currentState === STATES.TRANSITIONING_TO_ON) {
      imageSrc = HELMET_ON_TRANSITION[transitionFrame] || 'helmet-on';
    }
    
    // Handle eye actions in helmet-off state
    if (currentState === STATES.HELMET_OFF) {
      if (currentEyeAction) {
        // Currently performing an eye action
        if (currentEyeAction.type === 'blink') {
          imageSrc = 'eye-closed';
        } else if (currentEyeAction.type === 'look-left') {
          imageSrc = 'eye-left';
          headTiltOffset = 1;
        } else if (currentEyeAction.type === 'look-right') {
          imageSrc = 'eye-right';
          headTiltOffset = -1;
        }
      } else if (animationTime > nextIdleAction) {
        // Time for a new eye action
        const actionType = Math.random();
        if (actionType < 0.4) {
          // Blink
          setCurrentEyeAction({ type: 'blink', startTime: animationTime, duration: 200 });
          setNextIdleAction(animationTime + 2000 + Math.random() * 3000); // Next action in 2-5 seconds
        } else if (actionType < 0.7) {
          // Look left
          setCurrentEyeAction({ type: 'look-left', startTime: animationTime, duration: 1000 });
          setNextIdleAction(animationTime + 2000 + Math.random() * 3000);
        } else {
          // Look right
          setCurrentEyeAction({ type: 'look-right', startTime: animationTime, duration: 1000 });
          setNextIdleAction(animationTime + 2000 + Math.random() * 3000);
        }
      }
    }
    
    return {
      imageSrc: IMAGE_MAP[imageSrc] || helmetOnImg,
      headTiltOffset,
      chestBrightness
    };
  }, [currentState, currentImage, animationTime, transitionFrame, nextIdleAction, currentEyeAction]);

  // Animation loop
  const animate = useCallback((time) => {
    if (!isVisible || !isLoaded) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    const deltaTime = time - lastTimeRef.current;
    const frameInterval = 1000 / FPS; // ~41.67ms for 24 FPS
    
    if (deltaTime >= frameInterval) {
      setAnimationTime(prev => prev + frameInterval);
      lastTimeRef.current = time;
      
      // Clear finished eye actions
      if (currentEyeAction && animationTime > currentEyeAction.startTime + currentEyeAction.duration) {
        setCurrentEyeAction(null);
      }
      
      // Handle transitions with slower timing
      if (currentState === STATES.TRANSITIONING_TO_OFF) {
        // Check if enough time has passed for next transition frame
        const transitionTime = transitionFrame * TRANSITION_FRAME_DURATION;
        if (animationTime >= transitionTime) {
          setTransitionFrame(prev => {
            const next = prev + 1;
            if (next >= HELMET_OFF_TRANSITION.length) {
              setCurrentState(STATES.HELMET_OFF);
              setCurrentImage('helmet-off');
              setNextIdleAction(animationTime + 2000); // Start idle actions after 2 seconds
              return 0;
            }
            return next;
          });
        }
      } else if (currentState === STATES.TRANSITIONING_TO_ON) {
        // Check if enough time has passed for next transition frame
        const transitionTime = transitionFrame * TRANSITION_FRAME_DURATION;
        if (animationTime >= transitionTime) {
          setTransitionFrame(prev => {
            const next = prev + 1;
            if (next >= HELMET_ON_TRANSITION.length) {
              setCurrentState(STATES.HELMET_ON);
              setCurrentImage('helmet-on');
              setCurrentEyeAction(null); // Clear any eye actions when helmet goes back on
              return 0;
            }
            return next;
          });
        }
      }
    }
    
    animationRef.current = requestAnimationFrame(animate);
  }, [isVisible, isLoaded, currentState, animationTime, transitionFrame]);

  // Start animation loop
  useEffect(() => {
    if (isLoaded && isVisible) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isLoaded, isVisible, animate]);

  if (!isLoaded) {
    return (
      <div ref={containerRef} className={`pixel-wrap ${className}`} style={{ 
        width: '100%', 
        height: '100%',
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        overflow: 'visible'
      }}>
        <div className="flex items-center justify-center h-full text-slate-400">
          Loading astronaut...
        </div>
      </div>
    );
  }

  const frameData = getCurrentFrameData();

  return (
    <div
      ref={containerRef}
      className={`pixel-wrap ${className}`}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        overflow: 'visible',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        cursor: 'pointer', // Make it clear it's clickable
      }}
      onClick={handleHelmetToggle}
    >
      {/* Chest light effect */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: `rgba(0, 150, 255, ${frameData.chestBrightness})`,
          boxShadow: `0 0 ${frameData.chestBrightness * 10}px rgba(0, 150, 255, ${frameData.chestBrightness * 0.5})`,
          zIndex: 1,
        }}
      />
      
      {/* Main astronaut image with head tilt */}
      <img
        src={frameData.imageSrc}
        alt="Astronaut"
        style={{
          width: `${height}px`,
          height: 'auto',
          objectFit: 'contain',
          imageRendering: 'pixelated',
          display: 'block',
          transform: `translateX(${frameData.headTiltOffset}px)`,
          transition: 'none', // Disable CSS transitions for precise frame control
          zIndex: 2,
        }}
      />
      
      {/* Click instruction overlay */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px 8px',
          fontSize: '10px',
          borderRadius: '4px',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        Click to toggle helmet
      </div>
      
    </div>
  );
};

export default AstronautIdle;
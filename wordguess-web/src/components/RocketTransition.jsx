// src/components/RocketTransition.jsx
import { useEffect, useState } from "react";

// Import rocket transition 2 assets
import rocketIdle1 from "../assets/Rocket/rocket-transition 2/rocket-idle-1.png";
import rocketIdle2 from "../assets/Rocket/rocket-transition 2/rocket-idle-2.png";
import rocketIdle3 from "../assets/Rocket/rocket-transition 2/rocket-idle-3.png";
import rocketIdle4 from "../assets/Rocket/rocket-transition 2/rocket-idle-4.png";

import rocketLaunch1 from "../assets/Rocket/rocket-transition 2/rocket-launch-1.png";
import rocketLaunch2 from "../assets/Rocket/rocket-transition 2/rocket-launch-2.png";
import rocketLaunch3 from "../assets/Rocket/rocket-transition 2/rocket-launch-3.png";
import rocketLaunch4 from "../assets/Rocket/rocket-transition 2/rocket-launch-4.png";
import rocketLaunch5 from "../assets/Rocket/rocket-transition 2/rocket-launch-5.png";
import rocketLaunch6 from "../assets/Rocket/rocket-transition 2/rocket-launch-6.png";
import rocketLaunch7 from "../assets/Rocket/rocket-transition 2/rocket-launch-7.png";
import rocketLaunch8 from "../assets/Rocket/rocket-transition 2/rocket-launch-8.png";

import rocketAcross1 from "../assets/Rocket/rocket-transition 2/rocket-across-1.png";
import rocketAcross2 from "../assets/Rocket/rocket-transition 2/rocket-across-2.png";
import rocketAcross3 from "../assets/Rocket/rocket-transition 2/rocket-across-3.png";
import rocketAcross4 from "../assets/Rocket/rocket-transition 2/rocket-across-4.png";
import rocketAcross5 from "../assets/Rocket/rocket-transition 2/rocket-across-5.png";
import rocketAcross6 from "../assets/Rocket/rocket-transition 2/rocket-across-6.png";
import rocketAcross7 from "../assets/Rocket/rocket-transition 2/rocket-across-7.png";
import rocketAcross8 from "../assets/Rocket/rocket-transition 2/rocket-across-8.png";

import explosion1 from "../assets/Rocket/rocket-transition 2/explosion-1.png";
import explosion2 from "../assets/Rocket/rocket-transition 2/explosion-2.png";
import explosion3 from "../assets/Rocket/rocket-transition 2/explosion-3.png";
import explosion4 from "../assets/Rocket/rocket-transition 2/explosion-4.png";
import explosion5 from "../assets/Rocket/rocket-transition 2/explosion-5.png";
import explosion6 from "../assets/Rocket/rocket-transition 2/explosion-6.png";

import smoke1 from "../assets/Rocket/rocket-transition 2/smoke-1.png";
import smoke2 from "../assets/Rocket/rocket-transition 2/smoke-2.png";
import smoke3 from "../assets/Rocket/rocket-transition 2/smoke-3.png";
import smoke4 from "../assets/Rocket/rocket-transition 2/smoke-4.png";
import smoke5 from "../assets/Rocket/rocket-transition 2/smoke-5.png";

export default function RocketTransition({ isTransitioning = false, onComplete }) {
  const [rocketPosition, setRocketPosition] = useState({ x: 0, y: 100 }); // Start from bottom
  const [showRocket, setShowRocket] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [showSmoke, setShowSmoke] = useState(false);
  const [smokeFrame, setSmokeFrame] = useState(0);

  // Simple rocket animation - just use launch frames
  const rocketFrames = [rocketLaunch1, rocketLaunch2, rocketLaunch3, rocketLaunch4, rocketLaunch5, rocketLaunch6, rocketLaunch7, rocketLaunch8];
  const smokeFrames = [smoke1, smoke2, smoke3, smoke4, smoke5];

  useEffect(() => {
    if (isTransitioning) {
      // Rocket appears from bottom and starts launch animation
      setShowRocket(true);
      setRocketPosition({ x: 0, y: 100 }); // Start from bottom
      
      // Play launch animation once (no looping) with upward movement
      let frameIndex = 0;
      const rocketAnimation = setInterval(() => {
        setCurrentFrame(frameIndex);
        
        // Move rocket up during animation
        const progress = frameIndex / rocketFrames.length;
        const newY = 100 - (progress * 120); // Move from y:100 to y:-20 (off screen)
        setRocketPosition({ x: 0, y: newY });
        
        frameIndex++;
        
        // Stop when we reach the last frame
        if (frameIndex >= rocketFrames.length) {
          clearInterval(rocketAnimation);
          // Start smoke effect after rocket animation
          setShowSmoke(true);
          setShowRocket(false);
        }
      }, 150); // Frame rate for launch animation

      // Start heavy smoke animation after rocket finishes
      const smokeDelay = setTimeout(() => {
        let smokeIndex = 0;
        const smokeAnimation = setInterval(() => {
          setSmokeFrame(smokeIndex);
          smokeIndex++;
          
          // Longer smoke animation for smooth transition
          if (smokeIndex >= smokeFrames.length * 2) { // Double the smoke frames
            clearInterval(smokeAnimation);
            // Complete transition after heavy smoke
            if (onComplete) onComplete();
          }
        }, 150); // Slower frame rate for smoother smoke
      }, 1200); // Start smoke after rocket animation (8 frames × 150ms)

      return () => {
        clearInterval(rocketAnimation);
        clearTimeout(smokeDelay);
      };
    } else {
      setRocketPosition({ x: 0, y: 100 }); // Reset to bottom
      setShowRocket(false);
      setShowSmoke(false);
      setCurrentFrame(0);
      setSmokeFrame(0);
    }
  }, [isTransitioning, onComplete]);

  if (!showRocket && !showSmoke) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Rocket Animation - appears from bottom, fills entire screen */}
      {showRocket && (
        <div 
          className="fixed w-screen h-screen"
          style={{
            top: 0,
            left: 0,
            transform: `translateY(${rocketPosition.y}px)`,
            zIndex: 100
          }}
        >
          <img 
            src={rocketFrames[currentFrame]} 
            alt="Rocket Launch" 
            className="w-screen h-screen object-cover"
            style={{ 
              imageRendering: "pixelated",
              opacity: 1,
              width: "100vw",
              height: "100vh",
              objectFit: "cover",
              position: "absolute",
              top: 0,
              left: 0
            }}
          />
        </div>
      )}

      {/* Heavy Smoke Effect - covers StartScreen and transitions to next page */}
      {showSmoke && (
        <div className="fixed inset-0 w-screen h-screen">
          {/* Multiple smoke layers for heavy effect */}
          <img 
            src={smokeFrames[smokeFrame]} 
            alt="Smoke Transition" 
            className="w-screen h-screen object-cover"
            style={{ 
              imageRendering: "pixelated",
              opacity: 1,
              zIndex: 101,
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              objectFit: "cover"
            }}
          />
          {/* Additional smoke layer for more coverage */}
          <img 
            src={smokeFrames[(smokeFrame + 1) % smokeFrames.length]} 
            alt="Smoke Layer 2" 
            className="w-screen h-screen object-cover absolute inset-0"
            style={{ 
              imageRendering: "pixelated",
              opacity: 0.8,
              zIndex: 102,
              objectFit: "cover"
            }}
          />
          {/* Third smoke layer for maximum coverage */}
          <img 
            src={smokeFrames[(smokeFrame + 2) % smokeFrames.length]} 
            alt="Smoke Layer 3" 
            className="w-screen h-screen object-cover absolute inset-0"
            style={{ 
              imageRendering: "pixelated",
              opacity: 0.6,
              zIndex: 103,
              objectFit: "cover"
            }}
          />
        </div>
      )}
    </div>
  );
}

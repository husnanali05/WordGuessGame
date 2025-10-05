// src/components/AnimatedSpaceBackground.jsx
import { useEffect, useState } from "react";

// Import Blue Version assets
import blueBack from "../assets/Blue Version/layered/blue-back.png";
import blueStars from "../assets/Blue Version/layered/blue-stars.png";
import blueWithStars from "../assets/Blue Version/layered/blue-with-stars.png";
import planetBig from "../assets/Blue Version/layered/prop-planet-big.png";
import planetSmall from "../assets/Blue Version/layered/prop-planet-small.png";
import asteroid1 from "../assets/Blue Version/layered/asteroid-1.png";
import asteroid2 from "../assets/Blue Version/layered/asteroid-2.png";

console.log("🌌 AnimatedSpaceBackground: Assets loaded:", {
  blueBack,
  blueStars,
  planetBig,
  planetSmall,
  asteroid1,
  asteroid2
});

export default function AnimatedSpaceBackground({ isTransitioning = false }) {
  const [animationPhase, setAnimationPhase] = useState(0);

  // Animation loop for continuous movement - seamless looping
  useEffect(() => {
    console.log("🌌 AnimatedSpaceBackground: Starting animation loop");
    let startTime = Date.now();
    let animationId;
    
    const animate = (currentTime) => {
      const elapsed = (currentTime - startTime) / 1000; // Convert to seconds
      const phase = (elapsed * 30) % 360; // 30 degrees per second, seamless loop
      setAnimationPhase(phase);
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);

    return () => {
      console.log("🌌 AnimatedSpaceBackground: Cleaning up animation loop");
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  console.log("🌌 AnimatedSpaceBackground: Rendering with phase:", animationPhase);

  return (
    <div className="absolute inset-0 overflow-hidden">
      
      {/* Static space background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${blueBack})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          imageRendering: "pixelated",
        }}
      />

      {/* Animated stars layer */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: `url(${blueStars})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          imageRendering: "pixelated",
          transform: `translateX(${Math.sin(animationPhase * Math.PI / 180 * 0.5) * 15}px) translateY(${Math.cos(animationPhase * Math.PI / 180 * 0.3) * 10}px)`
        }}
      />
      
      {/* Additional star field layer */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `url(${blueWithStars})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          imageRendering: "pixelated",
          transform: `translateX(${Math.cos(animationPhase * Math.PI / 180 * 0.3) * 20}px) translateY(${Math.sin(animationPhase * Math.PI / 180 * 0.4) * 15}px)`
        }}
      />
      
      {/* Floating star particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full opacity-80"
          style={{
            left: `${20 + (i * 4) % 60}%`,
            top: `${10 + (i * 7) % 80}%`,
            transform: `
              translateX(${Math.sin(animationPhase * Math.PI / 180 * (0.5 + i * 0.1)) * 30}px) 
              translateY(${Math.cos(animationPhase * Math.PI / 180 * (0.3 + i * 0.05)) * 20}px)
            `,
            animation: `twinkle ${2 + (i % 3)}s ease-in-out infinite alternate`
          }}
        />
      ))}

      {/* Big planet - slow orbit with seamless looping */}
      <div
        className="absolute top-1/4 right-1/4 w-32 h-32 opacity-90"
        style={{
          backgroundImage: `url(${planetBig})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          imageRendering: "pixelated",
          transform: `
            translateX(${Math.sin(animationPhase * Math.PI / 180 * 0.5) * 40}px) 
            translateY(${Math.cos(animationPhase * Math.PI / 180 * 0.3) * 25}px)
            rotate(${animationPhase * 0.2}deg)
          `
        }}
      />
      

      {/* Small planet - faster orbit with seamless looping */}
      <div
        className="absolute top-1/3 left-1/3 w-20 h-20 opacity-85"
        style={{
          backgroundImage: `url(${planetSmall})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          imageRendering: "pixelated",
          transform: `
            translateX(${Math.sin(animationPhase * Math.PI / 180 * 0.8) * 50}px) 
            translateY(${Math.cos(animationPhase * Math.PI / 180 * 0.6) * 30}px)
            rotate(${-animationPhase * 0.3}deg)
          `
        }}
      />
      
      {/* Third planet - medium size */}
      <div
        className="absolute bottom-1/4 left-1/5 w-24 h-24 opacity-80"
        style={{
          backgroundImage: `url(${planetBig})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          imageRendering: "pixelated",
          transform: `
            translateX(${Math.cos(animationPhase * Math.PI / 180 * 0.6) * 35}px) 
            translateY(${Math.sin(animationPhase * Math.PI / 180 * 0.4) * 25}px)
            rotate(${animationPhase * 0.15}deg)
          `
        }}
      />
      
      {/* Fourth planet - small distant */}
      <div
        className="absolute top-1/6 right-1/6 w-16 h-16 opacity-70"
        style={{
          backgroundImage: `url(${planetSmall})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          imageRendering: "pixelated",
          transform: `
            translateX(${Math.sin(animationPhase * Math.PI / 180 * 1.2) * 25}px) 
            translateY(${Math.cos(animationPhase * Math.PI / 180 * 0.8) * 15}px)
            rotate(${-animationPhase * 0.25}deg)
          `
        }}
      />

      {/* Asteroid 1 - floating movement with seamless looping */}
      <div
        className="absolute top-1/2 left-1/6 w-16 h-16 opacity-70"
        style={{
          backgroundImage: `url(${asteroid1})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          imageRendering: "pixelated",
          transform: `
            translateX(${Math.sin(animationPhase * Math.PI / 180 * 1.2) * 35}px) 
            translateY(${Math.cos(animationPhase * Math.PI / 180 * 0.9) * 20}px)
            rotate(${animationPhase * 0.4}deg)
          `
        }}
      />

      {/* Asteroid 2 - different floating pattern with seamless looping */}
      <div
        className="absolute bottom-1/3 right-1/6 w-14 h-14 opacity-65"
        style={{
          backgroundImage: `url(${asteroid2})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          imageRendering: "pixelated",
          transform: `
            translateX(${Math.cos(animationPhase * Math.PI / 180 * 1.0) * 40}px) 
            translateY(${Math.sin(animationPhase * Math.PI / 180 * 0.7) * 25}px)
            rotate(${-animationPhase * 0.35}deg)
          `
        }}
      />

      {/* Additional floating elements for seamless looping */}
      {/* Extra asteroid for more movement */}
      <div
        className="absolute top-2/3 left-1/4 w-12 h-12 opacity-60"
        style={{
          backgroundImage: `url(${asteroid1})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          imageRendering: "pixelated",
          transform: `
            translateX(${Math.cos(animationPhase * Math.PI / 180 * 1.5) * 30}px) 
            translateY(${Math.sin(animationPhase * Math.PI / 180 * 1.1) * 18}px)
            rotate(${animationPhase * 0.5}deg)
          `
        }}
      />

      {/* Small floating element */}
      <div
        className="absolute bottom-1/4 left-1/2 w-10 h-10 opacity-50"
        style={{
          backgroundImage: `url(${asteroid2})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          imageRendering: "pixelated",
          transform: `
            translateX(${Math.sin(animationPhase * Math.PI / 180 * 1.8) * 20}px) 
            translateY(${Math.cos(animationPhase * Math.PI / 180 * 1.3) * 12}px)
            rotate(${-animationPhase * 0.45}deg)
          `
        }}
      />
      
      {/* Additional asteroids for more movement */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`asteroid-extra-${i}`}
          className="absolute opacity-60"
          style={{
            width: `${12 + (i % 3) * 4}px`,
            height: `${12 + (i % 3) * 4}px`,
            left: `${10 + (i * 12) % 80}%`,
            top: `${15 + (i * 8) % 70}%`,
            backgroundImage: `url(${i % 2 === 0 ? asteroid1 : asteroid2})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            imageRendering: "pixelated",
            transform: `
              translateX(${Math.sin(animationPhase * Math.PI / 180 * (1.0 + i * 0.2)) * (20 + i * 5)}px) 
              translateY(${Math.cos(animationPhase * Math.PI / 180 * (0.7 + i * 0.15)) * (15 + i * 3)}px)
              rotate(${(i % 2 === 0 ? 1 : -1) * animationPhase * (0.3 + i * 0.05)}deg)
            `
          }}
        />
      ))}

      {/* Transition effect - fade out during transition */}
      <div
        className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
        style={{
          background: "radial-gradient(120% 120% at 50% 50%, transparent 40%, rgba(0,0,0,0.15) 100%)",
        }}
      />
      
      {/* CSS Animations */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

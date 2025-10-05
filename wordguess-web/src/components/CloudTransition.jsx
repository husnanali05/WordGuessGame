// src/components/CloudTransition.jsx
import { useState, useEffect } from "react";
import ParallaxBand from "./ParallaxBand";

import sky from "../assets/bg/sky.png";
import cloudNear from "../assets/bg/cloud-near.png";
import cloudMid from "../assets/bg/cloud-mid.png";
import cloudFar from "../assets/bg/cloud-far.png";
import cloudBack from "../assets/bg/cloud-back.png";

export default function CloudTransition({ 
  isTransitioning, 
  onTransitionComplete,
  children 
}) {
  const [transitionPhase, setTransitionPhase] = useState("idle"); // idle, opening, open

  useEffect(() => {
    if (isTransitioning && transitionPhase === "idle") {
      setTransitionPhase("opening");
      // Complete transition after animation
      setTimeout(() => {
        setTransitionPhase("open");
        onTransitionComplete?.();
      }, 2000); // 2 second transition
    }
  }, [isTransitioning, transitionPhase, onTransitionComplete]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Static sky background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${sky})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          imageRendering: "pixelated",
        }}
      />

      {/* Cloud layers with transition animation */}
      <div className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out ${
        transitionPhase === "opening" ? "translate-x-full" : 
        transitionPhase === "open" ? "translate-x-full" : 
        "translate-x-0"
      }`}>
        <ParallaxBand src={cloudBack} speed={180} direction="left" opacity={0.9} cover="cover" />
        <ParallaxBand src={cloudFar} speed={130} direction="right" opacity={0.95} cover="cover" />
        <ParallaxBand src={cloudMid} speed={95} direction="left" opacity={1} cover="cover" />
        <ParallaxBand src={cloudNear} speed={70} direction="left" opacity={1} cover="cover" />
      </div>

      {/* Vignette overlay */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-[2000ms] ease-in-out ${
          transitionPhase === "opening" ? "opacity-0" : 
          transitionPhase === "open" ? "opacity-0" : 
          "opacity-100"
        }`}
        style={{
          background:
            "radial-gradient(120% 120% at 50% 50%, transparent 40%, rgba(0,0,0,0.25) 100%)",
        }}
      />

      {/* Content that appears after transition */}
      {transitionPhase === "open" && (
        <div className="absolute inset-0 animate-fade">
          {children}
        </div>
      )}
    </div>
  );
}

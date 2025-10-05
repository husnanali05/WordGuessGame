// src/components/StartScreen.jsx
import PixelStartButton from "./PixelStartButton";
import ParallaxBand from "./ParallaxBand";
import ShuffleTitle from "./ShuffleTitle";
import AnimatedSpaceBackground from "./AnimatedSpaceBackground";

import sky from "../assets/bg/sky.png";
import cloudNear from "../assets/bg/cloud-near.png";
import cloudMid from "../assets/bg/cloud-mid.png";
import cloudFar from "../assets/bg/cloud-far.png";
import cloudBack from "../assets/bg/cloud-back.png";

export default function StartScreen({
  onStart,
  loading = false,
  title = "WORD GUESS GAME",
  isTransitioning = false,
  onTransitionComplete,
  playerName = "",
  onPlayerNameChange = () => {},
}) {
  return (
    <div className="relative w-screen h-screen overflow-hidden text-white">
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

      {/* Cloud layers with infinite looping (no transition effects) */}
      <ParallaxBand src={cloudBack} speed={180} direction="left" opacity={0.9} cover="cover" />
      <ParallaxBand src={cloudFar} speed={130} direction="right" opacity={0.95} cover="cover" />
      <ParallaxBand src={cloudMid} speed={95} direction="right" opacity={1} cover="cover" />
      <ParallaxBand src={cloudNear} speed={70} direction="left" opacity={1} cover="cover" />

      {/* Vignette - fades out during transition */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-[2000ms] ease-in-out ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
        style={{
          background:
            "radial-gradient(120% 120% at 50% 50%, transparent 40%, rgba(0,0,0,0.25) 100%)",
        }}
      />

          {/* Foreground UI */}
          <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-6">
            {/* Title with smooth arcade transition */}
            <div className={`transition-all duration-1000 ease-in-out ${
              isTransitioning ? "opacity-0 scale-95 translate-y-[-20px]" : "opacity-100 scale-100 translate-y-0"
            }`}>
              <ShuffleTitle
                text={title}
                duration={1.25}         // total animation time
                delay={0.15}            // small delay before start
                interval={28}           // flicker speed
                className="font-silkscreen text-4xl sm:text-5xl md:text-7xl xl:text-8xl tracking-[0.05em] text-yellow-300 drop-shadow-[3px_3px_0_#000] mb-10"
              />
            </div>

            {/* Username Input */}
            <div className={`transition-all duration-1000 ease-in-out ${
              isTransitioning ? "opacity-0 scale-95 translate-y-[10px]" : "opacity-100 scale-100 translate-y-0"
            }`}>
              <div className="mb-6">
                <label 
                  className="block text-lg font-semibold mb-3 text-yellow-300"
                  style={{
                    fontFamily: 'Silkscreen, monospace',
                    textShadow: '2px 2px 0px #000'
                  }}
                >
                  ENTER YOUR NAME
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => onPlayerNameChange(e.target.value)}
                  placeholder="Type your name here..."
                  className="w-full max-w-md px-4 py-3 bg-slate-800/80 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 focus:outline-none transition-colors text-center font-semibold"
                  maxLength={32}
                  style={{
                    fontFamily: 'Silkscreen, monospace',
                    fontSize: '18px'
                  }}
                />
                <div className="text-sm text-slate-300 mt-2">
                  {playerName.length}/32 characters
                </div>
              </div>
            </div>

            {/* Button with smooth arcade transition */}
            <div className={`transition-all duration-1000 ease-in-out ${
              isTransitioning ? "opacity-0 scale-110 translate-y-[20px]" : "opacity-100 scale-100 translate-y-0"
            }`}>
              <div className="transform transition-transform duration-150 ease-out hover:scale-105 active:scale-95">
                <PixelStartButton
                  onClick={() => {
                    if (!playerName.trim()) {
                      alert("Please enter your name first!");
                      return;
                    }
                    console.log("Start button clicked!");
                    onStart();
                  }}
                  disabled={loading || !playerName.trim()}
                  minPx={240}
                  vw={26}
                  maxPx={520}
                  aspectW={220}
                  aspectH={90}
                />
              </div>
            </div>

            {/* Loading text with smooth arcade transition */}
            <div className={`transition-all duration-1000 ease-in-out ${
              isTransitioning ? "opacity-0 translate-y-[10px]" : "opacity-100 translate-y-0"
            }`}>
              {loading && <p className="mt-4 text-slate-200">Starting…</p>}
            </div>
          </div>
    </div>
  );
}

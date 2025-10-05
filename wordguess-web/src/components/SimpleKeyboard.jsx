// src/components/SimpleKeyboard.jsx
import { useState, useEffect } from "react";

// Import keyboard assets - using static imports for better reliability
import keyA from "../assets/SimpleKeys/Classic/Dark/Single PNGs/A.png";
import keyB from "../assets/SimpleKeys/Classic/Dark/Single PNGs/B.png";
import keyC from "../assets/SimpleKeys/Classic/Dark/Single PNGs/C.png";
import keyD from "../assets/SimpleKeys/Classic/Dark/Single PNGs/D.png";
import keyE from "../assets/SimpleKeys/Classic/Dark/Single PNGs/E.png";
import keyF from "../assets/SimpleKeys/Classic/Dark/Single PNGs/F.png";
import keyG from "../assets/SimpleKeys/Classic/Dark/Single PNGs/G.png";
import keyH from "../assets/SimpleKeys/Classic/Dark/Single PNGs/H.png";
import keyI from "../assets/SimpleKeys/Classic/Dark/Single PNGs/I.png";
import keyJ from "../assets/SimpleKeys/Classic/Dark/Single PNGs/J.png";
import keyK from "../assets/SimpleKeys/Classic/Dark/Single PNGs/K.png";
import keyL from "../assets/SimpleKeys/Classic/Dark/Single PNGs/L.png";
import keyM from "../assets/SimpleKeys/Classic/Dark/Single PNGs/M.png";
import keyN from "../assets/SimpleKeys/Classic/Dark/Single PNGs/N.png";
import keyO from "../assets/SimpleKeys/Classic/Dark/Single PNGs/O.png";
import keyP from "../assets/SimpleKeys/Classic/Dark/Single PNGs/P.png";
import keyQ from "../assets/SimpleKeys/Classic/Dark/Single PNGs/Q.png";
import keyR from "../assets/SimpleKeys/Classic/Dark/Single PNGs/R.png";
import keyS from "../assets/SimpleKeys/Classic/Dark/Single PNGs/S.png";
import keyT from "../assets/SimpleKeys/Classic/Dark/Single PNGs/T.png";
import keyU from "../assets/SimpleKeys/Classic/Dark/Single PNGs/U.png";
import keyV from "../assets/SimpleKeys/Classic/Dark/Single PNGs/V.png";
import keyW from "../assets/SimpleKeys/Classic/Dark/Single PNGs/W.png";
import keyX from "../assets/SimpleKeys/Classic/Dark/Single PNGs/X.png";
import keyY from "../assets/SimpleKeys/Classic/Dark/Single PNGs/Y.png";
import keyZ from "../assets/SimpleKeys/Classic/Dark/Single PNGs/Z.png";

// Key mapping
const keyImages = {
  A: keyA, B: keyB, C: keyC, D: keyD, E: keyE, F: keyF, G: keyG, H: keyH,
  I: keyI, J: keyJ, K: keyK, L: keyL, M: keyM, N: keyN, O: keyO, P: keyP,
  Q: keyQ, R: keyR, S: keyS, T: keyT, U: keyU, V: keyV, W: keyW, X: keyX,
  Y: keyY, Z: keyZ
};

const getKeyImage = (letter) => keyImages[letter];

export default function SimpleKeyboard({ 
  onKeyPress, 
  guessedLetters = [], 
  gameStatus = "playing",
  theme = "Dark" 
}) {
  const [pressedKey, setPressedKey] = useState("");

  // Handle real keyboard input
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toUpperCase();
      
      // Only handle letter keys
      if (!/^[A-Z]$/.test(key)) return;
      
      // Check if key is already guessed or game is not playing
      if (gameStatus !== "playing" || guessedLetters.includes(key)) return;
      
      // Prevent default behavior
      event.preventDefault();
      
      // Simulate key press
      setPressedKey(key);
      setTimeout(() => setPressedKey(""), 150);
      
      // Call the key press handler
      onKeyPress(key);
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onKeyPress, guessedLetters, gameStatus]);

  const handleKeyClick = (letter) => {
    if (gameStatus !== "playing" || guessedLetters.includes(letter)) return;
    
    setPressedKey(letter);
    setTimeout(() => setPressedKey(""), 150);
    onKeyPress(letter);
  };

  const handleKeyDown = (letter) => {
    if (gameStatus !== "playing" || guessedLetters.includes(letter)) return;
    setPressedKey(letter);
  };

  const handleKeyUp = (letter) => {
    setPressedKey("");
  };

  const isKeyGuessed = (letter) => guessedLetters.includes(letter);
  const isKeyPressed = (letter) => pressedKey === letter;

  const getKeyStyle = (letter) => {
    const baseStyle = {
      backgroundImage: `url(${getKeyImage(letter)})`,
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      imageRendering: "pixelated",
      width: "60px",
      height: "60px",
      border: "3px solid #374151",
      borderRadius: "8px",
      cursor: gameStatus !== "playing" || isKeyGuessed(letter) ? "not-allowed" : "pointer",
      opacity: isKeyGuessed(letter) ? 0.4 : 1,
      transform: isKeyPressed(letter) ? "scale(0.95)" : "scale(1)",
      transition: "all 0.1s ease",
      filter: isKeyGuessed(letter) ? "grayscale(100%)" : "none",
      boxShadow: isKeyPressed(letter) 
        ? "0 4px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(0,0,0,0.2)" 
        : "0 2px 4px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.1)",
      backgroundColor: isKeyGuessed(letter) ? "#1f2937" : "#374151"
    };

    return baseStyle;
  };

  const keyboardLayout = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"]
  ];

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-slate-800/60 border-2 border-slate-700 rounded-xl shadow-[6px_6px_0_#000]">
      <div className="text-center mb-2">
        <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: 'Silkscreen, monospace' }}>
          KEYBOARD
        </h3>
        <p className="text-sm text-slate-300">
          Click keys or use your physical keyboard
        </p>
      </div>
      
      {keyboardLayout.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-3">
          {row.map((letter) => (
            <button
              key={letter}
              onClick={() => handleKeyClick(letter)}
              onMouseDown={() => handleKeyDown(letter)}
              onMouseUp={() => handleKeyUp(letter)}
              onMouseLeave={() => handleKeyUp(letter)}
              disabled={gameStatus !== "playing" || isKeyGuessed(letter)}
              style={getKeyStyle(letter)}
              className="select-none hover:scale-105 active:scale-95"
              aria-label={`Guess ${letter}`}
            />
          ))}
        </div>
      ))}
      
      <div className="mt-2 text-xs text-slate-400 text-center">
        Press any letter on your keyboard or click the keys above
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import StartScreen from "./components/StartScreen";
import TopicSelection from "./components/TopicSelection";
import Leaderboard from "./components/Leaderboard";
import PlayerNameBox from "./components/PlayerNameBox";
import PlayerHistory from "./components/PlayerHistory";
import AstronautIdle from "./components/AstronautIdle";
import SimpleKeyboard from "./components/SimpleKeyboard";
import AnimatedSpaceBackground from "./components/AnimatedSpaceBackground";
import heartImg from "/assets/hangman-states/heart.png";
import trophyImg from "/assets/hangman-states/trophy.png";
import hintImg from "/assets/hangman-states/hint.png";

// import { API_BASE } from './config.js'; // Not needed in offline mode

export default function App() {
  const [playerName, setPlayerName] = useState(() => {
    // Load player name from localStorage on component mount
    return localStorage.getItem("wg_player") || "";
  });
  const [currentScreen, setCurrentScreen] = useState("start"); // "start", "topic", "game"
  const [currentTopic, setCurrentTopic] = useState("");
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameData, setGameData] = useState(null);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [gameStatus, setGameStatus] = useState("playing");
  const [loading, setLoading] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(3);

  console.log("App rendered:", { 
    playerName, 
    currentScreen, 
    gameData, 
    currentTopic, 
    currentLevel,
    loading 
  });

  // Debug state changes
  useEffect(() => {
    console.log("🔄 State changed:", {
      currentScreen,
      currentLevel,
      gameStatus,
      gameData: gameData ? {
        game_id: gameData.game_id,
        word: gameData.word,
        status: gameData.status,
        level: gameData.level
      } : null,
      loading
    });
  }, [currentScreen, currentLevel, gameStatus, gameData, loading]);

  // Debug screen changes specifically
  useEffect(() => {
    console.log("📺 Screen changed to:", currentScreen);
    if (currentScreen === "topic") {
      console.log("📺 Topic selection screen activated");
    }
  }, [currentScreen]);

  // Handle player name changes and save to localStorage
  const handlePlayerNameChange = (newName) => {
    console.log("👤 Player name changed:", newName);
    setPlayerName(newName);
    localStorage.setItem("wg_player", newName);
    console.log("👤 Player name saved to localStorage");
  };

  const handleGuess = async (letter) => {
    console.log("🎹 Keyboard clicked:", letter);
    console.log("🎹 Game data:", gameData);
    console.log("🎹 Game status:", gameStatus);

    if (!gameData || gameStatus !== "playing") {
      console.log("🎹 Cannot make guess - game not ready");
      return;
    }

    // Check if this is a fallback game (no API calls needed)
    if (gameData.game_id && gameData.game_id.startsWith('fallback_')) {
      console.log("🎹 Using fallback guess logic");
      handleFallbackGuess(letter);
      return;
    }

    // Always use offline logic
    console.log("🎹 Using offline guess logic");
    handleFallbackGuess(letter);
  };

  const handleFallbackGuess = (letter) => {
    console.log("🎹 Processing fallback guess:", letter);
    
    if (!gameData || gameStatus !== "playing") {
      return;
    }

    const word = gameData.answer || gameData.word;
    const currentGuessed = [...guessedLetters];
    
    // Add letter to guessed if not already guessed
    if (!currentGuessed.includes(letter)) {
      currentGuessed.push(letter);
      setGuessedLetters(currentGuessed);
    }

    // Check if letter is in the word
    const isCorrect = word.includes(letter);
    
    if (!isCorrect) {
      // Wrong guess - lose a life
      const newLives = (gameData.lives || 6) - 1;
      setGameData(prev => ({ ...prev, lives: newLives }));
      
      if (newLives <= 0) {
        setGameStatus("lost");
        setGameData(prev => ({ ...prev, status: "lost" }));
      }
    }

    // Update masked word
    const newMasked = word.split('').map(char => 
      currentGuessed.includes(char) ? char : '_'
    ).join(' ');
    
    setGameData(prev => ({ ...prev, masked: newMasked }));

    // Check if word is complete
    if (!newMasked.includes('_')) {
      setGameStatus("won");
      setGameData(prev => ({ ...prev, status: "won" }));
    }
  };

  const handleHint = async () => {
    console.log("💡 Hint function called!");
    console.log("💡 Hints remaining:", hintsRemaining);
    console.log("💡 Game data:", gameData);
    console.log("💡 Game status:", gameStatus);
    
    // Always allow hint if we have hints remaining
    if (hintsRemaining <= 0) {
      console.log("💡 No hints remaining");
      return;
    }

    if (!gameData || !gameData.game_id) {
      console.log("💡 No game data or game ID");
      return;
    }

    // Check if this is a fallback game (no API calls needed)
    if (gameData.game_id && gameData.game_id.startsWith('fallback_')) {
      console.log("💡 Using fallback hint logic");
      handleFallbackHint();
      return;
    }

    // Always use offline logic
    console.log("💡 Using offline hint logic");
    handleFallbackHint();
  };

  const handleFallbackHint = () => {
    console.log("💡 Processing fallback hint");
    
    if (!gameData || hintsRemaining <= 0) {
      return;
    }

    const word = gameData.answer || gameData.word;
    const currentGuessed = [...guessedLetters];
    
    // Find an unrevealed letter
    const unrevealedLetters = word.split('').filter(char => !currentGuessed.includes(char));
    
    if (unrevealedLetters.length > 0) {
      // Pick a random unrevealed letter
      const hintLetter = unrevealedLetters[Math.floor(Math.random() * unrevealedLetters.length)];
      currentGuessed.push(hintLetter);
      
      // Update game state
      setGuessedLetters(currentGuessed);
      setHintsRemaining(prev => prev - 1);
      
      // Update masked word
      const newMasked = word.split('').map(char => 
        currentGuessed.includes(char) ? char : '_'
      ).join(' ');
      
      setGameData(prev => ({ ...prev, masked: newMasked }));
      
      // Check if word is complete
      if (!newMasked.includes('_')) {
        setGameStatus("won");
        setGameData(prev => ({ ...prev, status: "won" }));
      }
    }
  };

  const nextLevel = async () => {
    console.log("🚀 Next Level function called!");
    console.log("🚀 Current game data:", gameData);
    console.log("🚀 Current level:", currentLevel);
    
    // Check if we have valid game data
    if (!gameData || !gameData.game_id) {
      console.error("🚀 No valid game data available!");
      alert("No valid game data available for next level");
      return;
    }
    
    // Always use offline logic for next level
    console.log("🚀 Using offline next level logic");
    setLoading(true);
    
    // Create new fallback game for next level
    const fallbackWords = {
      animals: ["CAT", "DOG", "BAT", "RAT", "COW", "PIG", "FOX", "BEE", "ANT", "OWL"],
      food: ["PIE", "TEA", "HAM", "JAM", "BUN", "EGG", "OAT", "NUT", "FIG", "YAM"],
      sports: ["RUN", "BOX", "SKI", "ROW", "JOG", "GYM", "WIN", "TIE", "BAT", "NET"],
      technology: ["CPU", "RAM", "USB", "APP", "WEB", "NET"],
      nature: ["SKY", "SUN", "SEA", "OAK", "DEW", "FOG", "MUD", "BAY", "DAM", "IVY"],
      space: ["SUN", "ORB", "RAY", "SKY", "UFO", "ION", "GAS", "RED", "DIM", "HOT"],
      music: ["RAP", "POP", "HIP", "JAZ", "DUO", "BAR", "KEY", "BOP", "HIT", "JAM"],
      movies: ["ACT", "SET", "CUT", "DVD", "CGI", "VFX", "RUN", "HIT", "BIO", "WAR"],
      science: ["DNA", "ION", "LAB", "RAY", "GAS", "ORE", "WAX", "OIL", "AIR", "ICE"],
      travel: ["JET", "BUS", "CAR", "MAP", "BAG", "VAN", "SKY", "SEA", "BAY", "ZIP"]
    };
    
    const topicWords = fallbackWords[currentTopic] || fallbackWords.animals;
    const selectedWord = topicWords[Math.floor(Math.random() * topicWords.length)];
    const masked = selectedWord.split('').map(() => '_').join(' ');
    
    const newLevel = currentLevel + 1;
    const fallbackGame = {
      game_id: "fallback_" + Date.now(),
      masked: masked,
      lives: 6,
      status: "playing",
      guessed: [],
      word_length: selectedWord.length,
      answer: selectedWord,
      word: selectedWord
    };
    
    setGameData(fallbackGame);
    setGuessedLetters([]);
    setGameStatus("playing");
    setHintsRemaining(3);
    setCurrentLevel(newLevel);
    setCurrentScreen("game");
    setLoading(false);
    
    console.log("🚀 Offline next level created:", newLevel);
  };

  const submitScore = async (gameResult) => {
    // Offline mode - no score submission
    console.log("📊 Score tracking disabled in offline mode");
    console.log("📊 Game result:", {
      player: playerName,
      won: gameResult.status === "won",
      word: gameResult.answer || "",
      level: currentLevel
    });
  };

  // Simple screen routing
  if (currentScreen === "topic") {
    return (
      <TopicSelection 
        onTopicSelect={async (topic) => {
          console.log("🎯 Topic selected:", topic);
          setCurrentTopic(topic);
          setCurrentLevel(1);
          setLoading(true);
          
          // Always use fallback mode in production for now
          console.log("🎯 Using fallback mode - creating offline game");
          
          // Fallback: Create a game with predefined words
          console.log("🎯 Creating fallback game...");
          const fallbackWords = {
            animals: ["CAT", "DOG", "BAT", "RAT", "COW", "PIG", "FOX", "BEE", "ANT", "OWL"],
            food: ["PIE", "TEA", "HAM", "JAM", "BUN", "EGG", "OAT", "NUT", "FIG", "YAM"],
            sports: ["RUN", "BOX", "SKI", "ROW", "JOG", "GYM", "WIN", "TIE", "BAT", "NET"],
            technology: ["CPU", "RAM", "USB", "APP", "WEB", "NET"],
            nature: ["SKY", "SUN", "SEA", "OAK", "DEW", "FOG", "MUD", "BAY", "DAM", "IVY"],
            space: ["SUN", "ORB", "RAY", "SKY", "UFO", "ION", "GAS", "RED", "DIM", "HOT"],
            music: ["RAP", "POP", "HIP", "JAZ", "DUO", "BAR", "KEY", "BOP", "HIT", "JAM"],
            movies: ["ACT", "SET", "CUT", "DVD", "CGI", "VFX", "RUN", "HIT", "BIO", "WAR"],
            science: ["DNA", "ION", "LAB", "RAY", "GAS", "ORE", "WAX", "OIL", "AIR", "ICE"],
            travel: ["JET", "BUS", "CAR", "MAP", "BAG", "VAN", "SKY", "SEA", "BAY", "ZIP"]
          };
          
          const topicWords = fallbackWords[topic] || fallbackWords.animals;
          const selectedWord = topicWords[Math.floor(Math.random() * topicWords.length)];
          const masked = selectedWord.split('').map(() => '_').join(' ');
          
          const fallbackGame = {
            game_id: "fallback_" + Date.now(),
            masked: masked,
            lives: 6,
            status: "playing",
            guessed: [],
            word_length: selectedWord.length,
            answer: selectedWord,
            word: selectedWord
          };
          setGameData(fallbackGame);
          setGuessedLetters([]);
          setGameStatus("playing");
          setHintsRemaining(3); // Reset hints for new game
          setCurrentScreen("game");
          console.log("🎯 Fallback game created");
          setLoading(false);
          console.log("🎯 Loading set to false");
        }}
        playerName={playerName}
      />
    );
  }

  // Game screen with actual game logic
  if (currentScreen === "game") {
    if (loading) {
      return (
        <div className="min-h-screen text-white relative">
          {/* Same animated space background as game screen */}
          <AnimatedSpaceBackground isTransitioning={false} />
          
          <div className="relative z-10 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Silkscreen, monospace' }}>
                {gameData ? 'LOADING NEXT LEVEL...' : 'STARTING GAME...'}
              </h1>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <div className="mt-4 text-sm text-slate-400">
                Generating AI word for {currentTopic}...
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!gameData) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center text-white">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Silkscreen, monospace' }}>
              NO GAME DATA
            </h1>
            <button
              onClick={() => setCurrentScreen("start")}
              className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
            >
              Back to Start
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen text-white relative">
        {/* Animated Space Background with Blue Version assets */}
        <AnimatedSpaceBackground isTransitioning={false} />
        
        <div className="relative z-10 w-full">
          {/* Header with Title and Player Name */}
          <div className="flex justify-between items-center mb-8 px-6 pt-6">
            <div className="flex-1"></div>
            <h1 
              className="text-5xl font-bold pixel-title" 
              style={{ 
                fontFamily: 'Silkscreen, monospace',
                textShadow: '2px 2px 0px #000, 4px 4px 0px #333',
                animation: 'pixelGlow 2s ease-in-out infinite alternate, pixelFloat 3s ease-in-out infinite'
              }}
            >
              WORD GUESS GAME
            </h1>
            <div className="flex-1 flex justify-end">
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-slate-400 mb-1" style={{ fontFamily: 'Silkscreen, monospace' }}>
                    PLAYER
          </div>
                  <div 
                    className="text-xl font-bold text-white"
                    style={{ 
                      fontFamily: 'Silkscreen, monospace',
                      textShadow: '1px 1px 0px #000'
                    }}
                  >
                    {playerName || 'Guest'}
                  </div>
                </div>
              </div>
            </div>
            </div>

          {/* Trophy Icon - Fixed Position */}
          <div className="fixed top-4 right-32 z-50">
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="trophy-button bg-slate-800/80 border border-slate-700 rounded-full p-3 shadow-[4px_4px_0_#000] hover:bg-slate-700/80"
              style={{ fontFamily: 'Silkscreen, monospace' }}
            >
              <img
                src={trophyImg}
                alt="🏆"
                className="w-6 h-6"
                style={{ imageRendering: 'pixelated' }}
              />
            </button>
          </div>

          {/* Game Layout - Character on Left, Keyboard on Right */}
          <div className="flex h-[calc(100vh-200px)] gap-4 px-4">
            
            {/* Character Box - Left Side */}
            <div className="flex-1">
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 shadow-[6px_6px_0_#000] h-full">
                <div className="h-full flex flex-col">
                  <h3 className="text-xl font-bold mb-6 text-center" style={{ fontFamily: 'Silkscreen, monospace' }}>
                    ASTRONAUT
                  </h3>
                  <div className="flex-1 relative">
                    <AstronautIdle height={500} />
                  </div>
                </div>
              </div>
            </div>

            {/* Keyboard Box - Right Side */}
            <div className="flex-1">
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 shadow-[6px_6px_0_#000] h-full flex flex-col">
                
                {/* Game Info */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Level {currentLevel}</h2>
                    <div className="flex items-center gap-4">
                      <div className="text-base text-slate-300">
                        Topic: {currentTopic} | Word Length: {gameData.word?.length || gameData.word_length || 3}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: gameData.lives || 6 }, (_, i) => (
                            <img
                              key={i}
                              src={heartImg}
                              alt="❤️"
                              className="w-6 h-6"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: hintsRemaining }, (_, i) => (
                            <img
                              key={i}
                              src={hintImg}
                              alt="💡"
                              className="w-6 h-6"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          ))}
                        </div>
                        <button
                          onClick={handleHint}
                          className="ml-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-bold transition-colors"
                          style={{ fontFamily: 'Silkscreen, monospace' }}
                        >
                          HINT ({hintsRemaining})
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Word Display */}
                  <div className="text-center mb-6">
                    <div className="text-4xl font-mono tracking-wider text-yellow-300 mb-3">
                      {gameData.masked || "_______"}
                    </div>
                    <div className="text-base text-slate-400 mb-3">
                      {gameData.word?.length || gameData.word_length || 3} letters
            </div>

                    {/* Guessed Letters */}
                    {guessedLetters.length > 0 && (
                      <div className="text-base text-slate-300">
                        Guessed: <span className="font-mono text-blue-300">{guessedLetters.join(', ')}</span>
                </div>
              )}
            </div>

                  {/* Game Status */}
                  {gameStatus === "won" && (
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-green-400 mb-3">🎉 YOU WON! 🎉</div>
                      <div className="text-base text-slate-300 mb-3">The word was: <span className="font-bold text-yellow-300">{gameData.answer || gameData.word}</span></div>
                          <div
                            onClick={nextLevel}
                        className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 font-bold text-base"
                        style={{
                          cursor: 'pointer',
                          zIndex: 9999,
                          position: 'relative',
                          pointerEvents: 'auto',
                          display: 'inline-block',
                          userSelect: 'none'
                        }}
                      >
                        Next Level
                      </div>
                    </div>
                  )}

                  {gameStatus === "lost" && (
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-red-400 mb-3">💀 GAME OVER 💀</div>
                      <div className="text-base text-slate-300 mb-3">The word was: <span className="font-bold text-yellow-300">{gameData.answer || gameData.word}</span></div>
                          <div
                            onClick={() => setCurrentScreen("topic")}
                        className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 font-bold text-base"
                        style={{
                          cursor: 'pointer',
                          zIndex: 9999,
                          position: 'relative',
                          pointerEvents: 'auto',
                          display: 'inline-block',
                          userSelect: 'none'
                        }}
                      >
                        Try New Topic
                      </div>
                    </div>
                  )}
                </div>

                {/* Keyboard */}
                {gameStatus === "playing" && (
                  <div className="flex-1">
                    <SimpleKeyboard 
                      onKeyPress={handleGuess}
                      guessedLetters={guessedLetters}
                      gameStatus={gameStatus}
                    />
                  </div>
                )}

                {/* Back Button */}
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setCurrentScreen("start")}
                    className="px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 text-base font-bold"
                  >
                    Back to Start
                  </button>
                </div>
              </div>
            </div>
            </div>

          <>

            {/* Leaderboard Popup */}
            {showLeaderboard && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
                <div className="leaderboard-popup bg-slate-800 border border-slate-700 rounded-xl shadow-[8px_8px_0_#000] max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
                  <div className="p-4 border-b border-slate-700">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold" style={{ fontFamily: 'Silkscreen, monospace' }}>
                        🏆 LEADERBOARD & HISTORY
                  </h2>
                  <button
                        onClick={() => setShowLeaderboard(false)}
                        className="text-slate-400 hover:text-white text-2xl"
                  >
                        ×
                  </button>
                    </div>
                  </div>
                  <div className="p-4 flex-1 overflow-y-auto leaderboard-scroll">
                    <div className="space-y-6">
                      <Leaderboard />
                      <PlayerHistory playerName={playerName} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
        <StartScreen 
          onStart={() => setCurrentScreen("topic")} 
          loading={false} 
          isTransitioning={false}
          playerName={playerName}
          onPlayerNameChange={handlePlayerNameChange}
        />
      
    </div>
  );
}
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

import { API_BASE } from './config.js';

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

    try {
      console.log("🎹 Making API call for guess:", letter);
      const response = await fetch(`${API_BASE}/api/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: gameData.game_id,
          letter: letter
        })
      });

      if (!response.ok) throw new Error('Failed to make guess');

      const data = await response.json();
      console.log("🎹 Guess result:", data);
      console.log("🎹 Word length after guess:", data.word_length);
      console.log("🎹 Actual word length:", data.word?.length);
      setGameData(data);
      setGuessedLetters(data.guessed || []);
      setGameStatus(data.status || "playing");

      if (data.status === "won" || data.status === "lost") {
        // Game over - submit score
        await submitScore(data);
      }
    } catch (error) {
      console.error("🎹 Error making guess:", error);
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

    try {
      console.log("💡 Making API call for hint...");
      const response = await fetch(`${API_BASE}/api/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: gameData.game_id
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get hint: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log("💡 Hint response:", data);
      
      // Update game state with hint response
      setGameData(prev => ({
        ...prev,
        masked: data.masked,
        guessed: data.guessed,
        lives: data.lives,
        status: data.status
      }));
      
      setGuessedLetters(data.guessed || []);
      setHintsRemaining(prev => prev - 1);
      
      // Check if the word is now complete (all letters revealed)
      const isWordComplete = !data.masked.includes('_');
      if (isWordComplete) {
        console.log("💡 Word completed with hint!");
        setGameStatus("won");
        // Submit score for winning with hint
        await submitScore({
          ...gameData,
          status: "won",
          masked: data.masked,
          guessed: data.guessed
        });
      }
      
    } catch (error) {
      console.error("💡 Error getting hint:", error);
      // Silent error handling - just log to console
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
    
    try {
      setLoading(true);
      console.log("🚀 Making API call to next-level...");
      console.log("🚀 API_BASE:", API_BASE);
      console.log("🚀 Game ID:", gameData.game_id);
      
      const response = await fetch(`${API_BASE}/api/next-level`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          game_id: gameData.game_id
        })
      });
      
      console.log("🚀 API response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("🚀 API error response:", errorText);
        throw new Error(`Failed to advance level: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log("🚀 Next level response:", data);
      
      console.log("🚀 Updating state with new data...");
      console.log("🚀 New game data from API:", data);
      setGameData(data);
      setGuessedLetters(data.guessed || []);
      setGameStatus(data.status || "playing");
      setHintsRemaining(3); // Reset hints for new level
      const newLevel = currentLevel + 1;
      console.log("🚀 Setting new level:", newLevel);
      setCurrentLevel(newLevel);
      console.log("🚀 Setting screen to game");
      setCurrentScreen("game");
      
      console.log("🚀 Level advanced successfully to:", newLevel);
      console.log("🚀 Updated game state:", {
        gameData: data,
        currentLevel: newLevel,
        gameStatus: data.status || "playing"
      });
      // Level advanced successfully - no alert needed
    } catch (error) {
      console.error("🚀 Error advancing level:", error);
      // Silent error handling - just log to console
    } finally {
      setLoading(false);
      console.log("🚀 Loading set to false");
    }
  };

  const submitScore = async (gameResult) => {
    if (!gameResult || !playerName) return;
    
    try {
      const scoreData = {
        player: playerName,
        won: gameResult.status === "won",
        word: gameResult.answer || "",
        word_length: gameResult.word_length || 0,
        mistakes: 6 - (gameResult.lives || 0),
        correct: gameResult.guessed?.length || 0,
        accuracy: gameResult.guessed?.length ? (gameResult.guessed.filter(l => gameResult.answer?.includes(l)).length / gameResult.guessed.length) * 100 : 0,
        duration_ms: Date.now() - (gameData?.startTime || Date.now()),
        level: currentLevel
      };
      
      const response = await fetch(`${API_BASE}/api/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoreData)
      });
      
      if (response.ok) {
        console.log("Score submitted successfully");
      }
    } catch (error) {
      console.error("Error submitting score:", error);
    }
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
          
          try {
            console.log("🎯 Making API call to start game...");
            const response = await fetch(`${API_BASE}/api/new-game`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ topic, level: 1 })
            });
            
            console.log("🎯 API response status:", response.status);
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error("🎯 API error response:", errorText);
              throw new Error(`Failed to start game: ${response.status} ${errorText}`);
            }
            
            const data = await response.json();
            console.log("🎯 Game started successfully:", data);
            console.log("🎯 Word length from API:", data.word_length);
            console.log("🎯 Actual word length:", data.word?.length);
                setGameData(data);
                setGuessedLetters(data.guessed || []);
                setGameStatus(data.status || "playing");
                setHintsRemaining(3); // Reset hints for new game
                setCurrentScreen("game");
                console.log("🎯 Screen set to game");
          } catch (error) {
            console.error("🎯 Error starting game:", error);
            alert(`Failed to start game: ${error.message}`);
            
            // Fallback: Create a test game if API fails
            console.log("🎯 Creating fallback game...");
            const fallbackGame = {
              game_id: "test123",
              masked: "_ _ _",
              lives: 6,
              status: "playing",
              guessed: [],
              word_length: 3,
              answer: "CAT"
            };
            setGameData(fallbackGame);
            setGuessedLetters([]);
            setGameStatus("playing");
            setCurrentScreen("game");
            console.log("🎯 Fallback game created");
          } finally {
            setLoading(false);
            console.log("🎯 Loading set to false");
          }
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
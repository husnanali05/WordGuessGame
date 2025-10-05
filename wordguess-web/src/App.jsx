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
    console.log("🚀 Current topic:", currentTopic);
    
    // Check if we have valid game data
    if (!gameData || !gameData.game_id) {
      console.error("🚀 No valid game data available!");
      alert("No valid game data available for next level");
      return;
    }
    
    // Always use offline logic for next level
    console.log("🚀 Using offline next level logic");
      setLoading(true);
    
    // Add a short delay to show loading screen briefly
    setTimeout(() => {
    
    // Create new fallback game for next level with progressive word lengths
    const fallbackWords = {
      animals: {
        3: ["CAT", "DOG", "BAT", "RAT", "COW", "PIG", "FOX", "BEE", "ANT", "OWL"],
        4: ["BEAR", "LION", "WOLF", "DEER", "FISH", "BIRD", "FROG", "CRAB", "GOAT", "DUCK"],
        5: ["TIGER", "EAGLE", "SHARK", "WHALE", "MOUSE", "SNAKE", "HORSE", "SHEEP", "ZEBRA", "PANDA"],
        6: ["RABBIT", "TURTLE", "SPIDER", "MONKEY", "DOLPHIN", "PENGUIN", "GIRAFFE", "ELEPHANT"]
      },
      food: {
        3: ["PIE", "TEA", "HAM", "JAM", "BUN", "EGG", "OAT", "NUT", "FIG", "YAM"],
        4: ["CAKE", "SOUP", "SALAD", "PIZZA", "BREAD", "RICE", "MEAT", "FISH", "MILK", "BEER"],
        5: ["PASTA", "STEAK", "APPLE", "BANANA", "CHERRY", "GRAPE", "LEMON", "ONION", "CARROT", "POTATO"],
        6: ["ORANGE", "COFFEE", "BUTTER", "CHEESE", "CHICKEN", "SANDWICH", "COOKIES", "CANDY"]
      },
      sports: {
        3: ["RUN", "BOX", "SKI", "ROW", "JOG", "GYM", "WIN", "TIE", "BAT", "NET"],
        4: ["GOLF", "SWIM", "BIKE", "JUMP", "KICK", "THROW", "CATCH", "DIVE", "RACE", "TEAM"],
        5: ["TENNIS", "HOCKEY", "SOCCER", "BOWLING", "CYCLING", "RUNNING", "SURFING", "CLIMBING"],
        6: ["BASKETBALL", "FOOTBALL", "BASEBALL", "VOLLEYBALL", "WRESTLING", "SWIMMING"]
      },
      technology: {
        3: ["CPU", "RAM", "USB", "APP", "WEB", "NET"],
        4: ["CODE", "DATA", "FILE", "LINK", "MAIL", "BLOG", "WIFI", "CHIP", "DISK", "MOUSE"],
        5: ["EMAIL", "VIDEO", "AUDIO", "PHONE", "TABLET", "LAPTOP", "SERVER", "ROUTER"],
        6: ["SCREEN", "KEYBOARD", "MONITOR", "CAMERA", "SPEAKER", "PRINTER", "SCANNER"]
      },
      nature: {
        3: ["SKY", "SUN", "SEA", "OAK", "DEW", "FOG", "MUD", "BAY", "DAM", "IVY"],
        4: ["TREE", "FLOWER", "GRASS", "ROCK", "SAND", "SNOW", "RAIN", "WIND", "FIRE", "WAVE"],
        5: ["FOREST", "RIVER", "MOUNTAIN", "DESERT", "OCEAN", "STORM", "CLOUD", "STAR"],
        6: ["GARDEN", "VALLEY", "CANYON", "VOLCANO", "GLACIER", "WATERFALL", "THUNDER"]
      },
      space: {
        3: ["SUN", "ORB", "RAY", "SKY", "UFO", "ION", "GAS", "RED", "DIM", "HOT"],
        4: ["MOON", "STAR", "PLANET", "ROCKET", "COMET", "METEOR", "GALAXY", "NEBULA"],
        5: ["EARTH", "MARS", "VENUS", "JUPITER", "SATURN", "NEPTUNE", "URANUS", "PLUTO"],
        6: ["ASTEROID", "SATELLITE", "TELESCOPE", "SPACESHIP", "ASTRONAUT", "GALAXY"]
      },
      music: {
        3: ["RAP", "POP", "HIP", "JAZ", "DUO", "BAR", "KEY", "BOP", "HIT", "JAM"],
        4: ["ROCK", "JAZZ", "BLUES", "SOUL", "FOLK", "PUNK", "METAL", "BEAT", "SONG", "BAND"],
        5: ["PIANO", "GUITAR", "DRUMS", "BASS", "VIOLIN", "TRUMPET", "FLUTE", "SAXOPHONE"],
        6: ["MUSICIAN", "CONCERT", "MELODY", "HARMONY", "RHYTHM", "LYRICS", "CHORUS"]
      },
      movies: {
        3: ["ACT", "SET", "CUT", "DVD", "CGI", "VFX", "RUN", "HIT", "BIO", "WAR"],
        4: ["FILM", "MOVIE", "SCENE", "ACTOR", "DIRECTOR", "SCRIPT", "CAMERA", "LIGHT"],
        5: ["COMEDY", "ACTION", "HORROR", "DRAMA", "THRILLER", "ROMANCE", "FANTASY", "SCIENCE"],
        6: ["CINEMA", "THEATER", "STUDIO", "PRODUCER", "SCREENPLAY", "DIRECTOR", "ACTOR"]
      },
      science: {
        3: ["DNA", "ION", "LAB", "RAY", "GAS", "ORE", "WAX", "OIL", "AIR", "ICE"],
        4: ["ATOM", "CELL", "BONE", "BLOOD", "BRAIN", "HEART", "LUNG", "LIVER", "KIDNEY"],
        5: ["CHEMISTRY", "PHYSICS", "BIOLOGY", "GEOLOGY", "ASTRONOMY", "MEDICINE", "RESEARCH"],
        6: ["EXPERIMENT", "HYPOTHESIS", "THEORY", "DISCOVERY", "INVENTION", "TECHNOLOGY"]
      },
      travel: {
        3: ["JET", "BUS", "CAR", "MAP", "BAG", "VAN", "SKY", "SEA", "BAY", "ZIP"],
        4: ["PLANE", "TRAIN", "BOAT", "SHIP", "BIKE", "WALK", "RIDE", "TRIP", "TOUR", "TRIP"],
        5: ["HOTEL", "BEACH", "MOUNTAIN", "CITY", "COUNTRY", "ISLAND", "DESERT", "FOREST"],
        6: ["VACATION", "ADVENTURE", "JOURNEY", "PASSPORT", "LUGGAGE", "DESTINATION", "EXPLORER"]
      }
    };
    
    console.log("🚀 Available topics:", Object.keys(fallbackWords));
    console.log("🚀 Current topic:", currentTopic);
    
    // Get words for current topic and level
    const newLevel = currentLevel + 1;
    const topicWords = fallbackWords[currentTopic] || fallbackWords.animals;
    const wordLength = Math.min(3 + newLevel - 1, 6); // Progressive: 3, 4, 5, 6 letters
    const wordsForLength = topicWords[wordLength] || topicWords[3];
    console.log("🚀 Selected topic words for length", wordLength, ":", wordsForLength);
    
    const selectedWord = wordsForLength[Math.floor(Math.random() * wordsForLength.length)];
    console.log("🚀 Selected word:", selectedWord);
    
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
    
    console.log("🚀 Creating new game:", fallbackGame);
    
      setGameData(fallbackGame);
      setGuessedLetters([]);
      setGameStatus("playing");
      setHintsRemaining(3);
      setCurrentLevel(newLevel);
      setCurrentScreen("game");
      setLoading(false);
      
      console.log("🚀 Offline next level created:", newLevel);
      console.log("🚀 New game data set:", fallbackGame);
    }, 800); // Reduced from longer delay to just 800ms
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
          
          // Fallback: Create a game with predefined words (Level 1 = 3 letters)
          console.log("🎯 Creating fallback game...");
          const fallbackWords = {
            animals: {
              3: ["CAT", "DOG", "BAT", "RAT", "COW", "PIG", "FOX", "BEE", "ANT", "OWL"],
              4: ["BEAR", "LION", "WOLF", "DEER", "FISH", "BIRD", "FROG", "CRAB", "GOAT", "DUCK"],
              5: ["TIGER", "EAGLE", "SHARK", "WHALE", "MOUSE", "SNAKE", "HORSE", "SHEEP", "ZEBRA", "PANDA"],
              6: ["RABBIT", "TURTLE", "SPIDER", "MONKEY", "DOLPHIN", "PENGUIN", "GIRAFFE", "ELEPHANT"]
            },
            food: {
              3: ["PIE", "TEA", "HAM", "JAM", "BUN", "EGG", "OAT", "NUT", "FIG", "YAM"],
              4: ["CAKE", "SOUP", "SALAD", "PIZZA", "BREAD", "RICE", "MEAT", "FISH", "MILK", "BEER"],
              5: ["PASTA", "STEAK", "APPLE", "BANANA", "CHERRY", "GRAPE", "LEMON", "ONION", "CARROT", "POTATO"],
              6: ["ORANGE", "COFFEE", "BUTTER", "CHEESE", "CHICKEN", "SANDWICH", "COOKIES", "CANDY"]
            },
            sports: {
              3: ["RUN", "BOX", "SKI", "ROW", "JOG", "GYM", "WIN", "TIE", "BAT", "NET"],
              4: ["GOLF", "SWIM", "BIKE", "JUMP", "KICK", "THROW", "CATCH", "DIVE", "RACE", "TEAM"],
              5: ["TENNIS", "HOCKEY", "SOCCER", "BOWLING", "CYCLING", "RUNNING", "SURFING", "CLIMBING"],
              6: ["BASKETBALL", "FOOTBALL", "BASEBALL", "VOLLEYBALL", "WRESTLING", "SWIMMING"]
            },
            technology: {
              3: ["CPU", "RAM", "USB", "APP", "WEB", "NET"],
              4: ["CODE", "DATA", "FILE", "LINK", "MAIL", "BLOG", "WIFI", "CHIP", "DISK", "MOUSE"],
              5: ["EMAIL", "VIDEO", "AUDIO", "PHONE", "TABLET", "LAPTOP", "SERVER", "ROUTER"],
              6: ["SCREEN", "KEYBOARD", "MONITOR", "CAMERA", "SPEAKER", "PRINTER", "SCANNER"]
            },
            nature: {
              3: ["SKY", "SUN", "SEA", "OAK", "DEW", "FOG", "MUD", "BAY", "DAM", "IVY"],
              4: ["TREE", "FLOWER", "GRASS", "ROCK", "SAND", "SNOW", "RAIN", "WIND", "FIRE", "WAVE"],
              5: ["FOREST", "RIVER", "MOUNTAIN", "DESERT", "OCEAN", "STORM", "CLOUD", "STAR"],
              6: ["GARDEN", "VALLEY", "CANYON", "VOLCANO", "GLACIER", "WATERFALL", "THUNDER"]
            },
            space: {
              3: ["SUN", "ORB", "RAY", "SKY", "UFO", "ION", "GAS", "RED", "DIM", "HOT"],
              4: ["MOON", "STAR", "PLANET", "ROCKET", "COMET", "METEOR", "GALAXY", "NEBULA"],
              5: ["EARTH", "MARS", "VENUS", "JUPITER", "SATURN", "NEPTUNE", "URANUS", "PLUTO"],
              6: ["ASTEROID", "SATELLITE", "TELESCOPE", "SPACESHIP", "ASTRONAUT", "GALAXY"]
            },
            music: {
              3: ["RAP", "POP", "HIP", "JAZ", "DUO", "BAR", "KEY", "BOP", "HIT", "JAM"],
              4: ["ROCK", "JAZZ", "BLUES", "SOUL", "FOLK", "PUNK", "METAL", "BEAT", "SONG", "BAND"],
              5: ["PIANO", "GUITAR", "DRUMS", "BASS", "VIOLIN", "TRUMPET", "FLUTE", "SAXOPHONE"],
              6: ["MUSICIAN", "CONCERT", "MELODY", "HARMONY", "RHYTHM", "LYRICS", "CHORUS"]
            },
            movies: {
              3: ["ACT", "SET", "CUT", "DVD", "CGI", "VFX", "RUN", "HIT", "BIO", "WAR"],
              4: ["FILM", "MOVIE", "SCENE", "ACTOR", "DIRECTOR", "SCRIPT", "CAMERA", "LIGHT"],
              5: ["COMEDY", "ACTION", "HORROR", "DRAMA", "THRILLER", "ROMANCE", "FANTASY", "SCIENCE"],
              6: ["CINEMA", "THEATER", "STUDIO", "PRODUCER", "SCREENPLAY", "DIRECTOR", "ACTOR"]
            },
            science: {
              3: ["DNA", "ION", "LAB", "RAY", "GAS", "ORE", "WAX", "OIL", "AIR", "ICE"],
              4: ["ATOM", "CELL", "BONE", "BLOOD", "BRAIN", "HEART", "LUNG", "LIVER", "KIDNEY"],
              5: ["CHEMISTRY", "PHYSICS", "BIOLOGY", "GEOLOGY", "ASTRONOMY", "MEDICINE", "RESEARCH"],
              6: ["EXPERIMENT", "HYPOTHESIS", "THEORY", "DISCOVERY", "INVENTION", "TECHNOLOGY"]
            },
            travel: {
              3: ["JET", "BUS", "CAR", "MAP", "BAG", "VAN", "SKY", "SEA", "BAY", "ZIP"],
              4: ["PLANE", "TRAIN", "BOAT", "SHIP", "BIKE", "WALK", "RIDE", "TRIP", "TOUR", "TRIP"],
              5: ["HOTEL", "BEACH", "MOUNTAIN", "CITY", "COUNTRY", "ISLAND", "DESERT", "FOREST"],
              6: ["VACATION", "ADVENTURE", "JOURNEY", "PASSPORT", "LUGGAGE", "DESTINATION", "EXPLORER"]
            }
          };
          
          // Level 1 starts with 3-letter words
          const topicWords = fallbackWords[topic] || fallbackWords.animals;
          const wordsForLength = topicWords[3]; // Level 1 = 3 letters
          const selectedWord = wordsForLength[Math.floor(Math.random() * wordsForLength.length)];
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
    <div className="min-h-screen text-white relative overflow-x-hidden">
        {/* Animated Space Background with Blue Version assets */}
        <AnimatedSpaceBackground isTransitioning={false} />
        
        <div className="relative z-10 w-full min-h-screen">
          {/* Header with Title and Player Name - Responsive */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 px-2 sm:px-4 pt-2 sm:pt-4 gap-2">
            <div className="flex-1"></div>
            <h1 
              className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold pixel-title text-center" 
              style={{ 
                fontFamily: 'Silkscreen, monospace',
                textShadow: '2px 2px 0px #000, 4px 4px 0px #333',
                animation: 'pixelGlow 2s ease-in-out infinite alternate, pixelFloat 3s ease-in-out infinite'
              }}
            >
              WORD GUESS GAME
            </h1>
            <div className="flex-1 flex justify-end">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="text-right">
                  <div className="text-xs text-slate-400 mb-1" style={{ fontFamily: 'Silkscreen, monospace' }}>
                    PLAYER
          </div>
                  <div 
                    className="text-sm sm:text-base font-bold text-white"
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

          {/* Trophy Icon - Responsive Fixed Position */}
          <div className="fixed top-2 sm:top-4 right-4 sm:right-8 lg:right-32 z-50">
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="trophy-button bg-slate-800/80 border border-slate-700 rounded-full p-2 sm:p-3 shadow-[4px_4px_0_#000] hover:bg-slate-700/80 transition-all"
              style={{ fontFamily: 'Silkscreen, monospace' }}
            >
              <img
                src={trophyImg}
                alt="🏆"
                className="w-5 h-5 sm:w-6 sm:h-6"
                style={{ imageRendering: 'pixelated' }}
              />
            </button>
          </div>

          {/* Game Layout - Responsive: Stack on mobile, side-by-side on desktop */}
          <div className="flex flex-col lg:flex-row min-h-[600px] lg:h-[calc(100vh-200px)] gap-4 px-2 sm:px-4 pb-4">
            
            {/* Character Box - Full width on mobile, half on desktop */}
            <div className="w-full lg:flex-1">
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 sm:p-6 shadow-[6px_6px_0_#000] h-full">
                <div className="h-full flex flex-col">
                  <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center" style={{ fontFamily: 'Silkscreen, monospace' }}>
                    ASTRONAUT
                  </h3>
                  <div className="flex-1 relative min-h-[200px] sm:min-h-[300px] lg:min-h-[400px]">
                    <div className="w-full h-full flex items-center justify-center">
                      <AstronautIdle height={300} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Keyboard Box - Full width on mobile, half on desktop */}
            <div className="w-full lg:flex-1">
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 sm:p-6 shadow-[6px_6px_0_#000] h-full flex flex-col">
                
                {/* Game Info - Responsive Layout */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4">
                    <h2 className="text-xl sm:text-2xl font-bold">Level {currentLevel}</h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="text-sm sm:text-base text-slate-300">
                        Topic: {currentTopic} | Word Length: {gameData.word?.length || gameData.word_length || 3}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: gameData.lives || 6 }, (_, i) => (
                            <img
                              key={i}
                              src={heartImg}
                              alt="❤️"
                              className="w-5 h-5 sm:w-6 sm:h-6"
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
                              className="w-5 h-5 sm:w-6 sm:h-6"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          ))}
                        </div>
                        <button
                          onClick={handleHint}
                          className="px-2 sm:px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs sm:text-sm font-bold transition-colors"
                          style={{ fontFamily: 'Silkscreen, monospace' }}
                        >
                          HINT ({hintsRemaining})
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Word Display - Responsive */}
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-mono tracking-wider text-yellow-300 mb-2 sm:mb-3 break-all">
                      {gameData.masked || "_______"}
                    </div>
                    <div className="text-sm sm:text-base text-slate-400 mb-2 sm:mb-3">
                      {gameData.word?.length || gameData.word_length || 3} letters
            </div>

                    {/* Guessed Letters - Responsive */}
                    {guessedLetters.length > 0 && (
                      <div className="text-sm sm:text-base text-slate-300">
                        Guessed: <span className="font-mono text-blue-300 break-all">{guessedLetters.join(', ')}</span>
                </div>
              )}
            </div>

                  {/* Game Status - Responsive */}
                  {gameStatus === "won" && (
                    <div className="text-center mb-4 sm:mb-6">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-400 mb-2 sm:mb-3">🎉 YOU WON! 🎉</div>
                      <div className="text-sm sm:text-base text-slate-300 mb-2 sm:mb-3">The word was: <span className="font-bold text-yellow-300">{gameData.answer || gameData.word}</span></div>
                          <div
                            onClick={nextLevel}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 rounded-lg hover:bg-green-700 font-bold text-sm sm:text-base cursor-pointer transition-colors"
                        style={{
                          fontFamily: 'Silkscreen, monospace',
                          userSelect: 'none'
                        }}
                      >
                        Next Level
                      </div>
                    </div>
                  )}

                  {gameStatus === "lost" && (
                    <div className="text-center mb-4 sm:mb-6">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-400 mb-2 sm:mb-3">💀 GAME OVER 💀</div>
                      <div className="text-sm sm:text-base text-slate-300 mb-2 sm:mb-3">The word was: <span className="font-bold text-yellow-300">{gameData.answer || gameData.word}</span></div>
                          <div
                            onClick={() => setCurrentScreen("topic")}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 rounded-lg hover:bg-blue-700 font-bold text-sm sm:text-base cursor-pointer transition-colors"
                        style={{
                          fontFamily: 'Silkscreen, monospace',
                          userSelect: 'none'
                        }}
                      >
                        Try New Topic
                      </div>
                    </div>
                  )}
                </div>

                {/* Keyboard - Responsive */}
                {gameStatus === "playing" && (
                  <div className="flex-1 min-h-0">
                    <div className="h-full overflow-auto">
                    <SimpleKeyboard 
                      onKeyPress={handleGuess}
                      guessedLetters={guessedLetters}
                      gameStatus={gameStatus}
                    />
                    </div>
                  </div>
                )}

                {/* Back Button - Responsive */}
                <div className="mt-4 sm:mt-6 text-center">
                  <button
                    onClick={() => setCurrentScreen("start")}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 rounded-lg hover:bg-red-700 text-sm sm:text-base font-bold transition-colors"
                    style={{ fontFamily: 'Silkscreen, monospace' }}
                  >
                    Back to Start
                  </button>
                </div>
              </div>
            </div>
            </div>

          <>

            {/* Leaderboard Popup - Responsive */}
            {showLeaderboard && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-2 sm:p-4">
                <div className="leaderboard-popup bg-slate-800 border border-slate-700 rounded-xl shadow-[8px_8px_0_#000] max-w-4xl w-full max-h-[90vh] sm:max-h-[80vh] flex flex-col">
                  <div className="p-3 sm:p-4 border-b border-slate-700">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ fontFamily: 'Silkscreen, monospace' }}>
                        🏆 LEADERBOARD & HISTORY
                  </h2>
                  <button
                        onClick={() => setShowLeaderboard(false)}
                        className="text-slate-400 hover:text-white text-xl sm:text-2xl p-1"
                  >
                        ×
                  </button>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 flex-1 overflow-y-auto leaderboard-scroll">
                    <div className="space-y-4 sm:space-y-6">
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
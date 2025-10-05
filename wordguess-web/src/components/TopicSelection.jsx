import React, { useState } from "react";
import ParallaxBand from "./ParallaxBand";

// Import cloud background assets
import cloudBack from "../assets/bg/cloud-back.png";
import cloudFar from "../assets/bg/cloud-far.png";
import cloudMid from "../assets/bg/cloud-mid.png";
import cloudNear from "../assets/bg/cloud-near.png";
import sky from "../assets/bg/sky.png";

const TOPICS = [
  { id: "animals", name: "Animals", emoji: "🐾", description: "Wild and domestic creatures" },
  { id: "food", name: "Food & Drinks", emoji: "🍕", description: "Delicious meals and beverages" },
  { id: "sports", name: "Sports", emoji: "⚽", description: "Games and athletic activities" },
  { id: "technology", name: "Technology", emoji: "💻", description: "Computers, gadgets, and tech" },
  { id: "nature", name: "Nature", emoji: "🌿", description: "Plants, weather, and environment" },
  { id: "space", name: "Space", emoji: "🚀", description: "Astronomy and space exploration" },
  { id: "music", name: "Music", emoji: "🎵", description: "Instruments, genres, and artists" },
  { id: "movies", name: "Movies & TV", emoji: "🎬", description: "Films, shows, and entertainment" },
  { id: "science", name: "Science", emoji: "🔬", description: "Chemistry, physics, and discoveries" },
  { id: "travel", name: "Travel", emoji: "✈️", description: "Places, countries, and adventures" }
];

export default function TopicSelection({ onTopicSelect, playerName }) {
  const [selectedTopic, setSelectedTopic] = useState("");

  console.log("TopicSelection component rendered with playerName:", playerName);

  const handleStart = () => {
    console.log("🎯 START JOURNEY button clicked!");
    console.log("🎯 Selected topic:", selectedTopic);
    console.log("🎯 onTopicSelect function:", onTopicSelect);
    
    if (!selectedTopic) {
      alert("Please select a topic first!");
      return;
    }
    
    console.log("🎯 Calling onTopicSelect with:", selectedTopic);
    try {
      onTopicSelect(selectedTopic);
      console.log("🎯 onTopicSelect called successfully");
    } catch (error) {
      console.error("🎯 Error calling onTopicSelect:", error);
    }
  };

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

      {/* Cloud layers with infinite looping (same as StartScreen) */}
      <ParallaxBand src={cloudBack} speed={180} direction="left" opacity={0.9} cover="cover" />
      <ParallaxBand src={cloudFar} speed={130} direction="right" opacity={0.95} cover="cover" />
      <ParallaxBand src={cloudMid} speed={95} direction="right" opacity={1} cover="cover" />
      <ParallaxBand src={cloudNear} speed={70} direction="left" opacity={1} cover="cover" />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-6">
        {/* Title */}
        <div className="mb-8">
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
            style={{
              fontFamily: 'Silkscreen, monospace',
              color: '#60A5FA',
              textShadow: '3px 3px 0px #1E40AF, 6px 6px 0px #1E3A8A',
              letterSpacing: '0.1em'
            }}
          >
            CHOOSE YOUR TOPIC
          </h1>
          <p className="text-lg text-slate-300 mb-2">
            Welcome, <span className="text-yellow-400 font-bold">{playerName}</span>!
          </p>
          <p className="text-sm text-slate-400">
            Select a topic to start your unlimited word journey
          </p>
          <div className="mt-4 text-sm text-slate-500">
            Debug: TopicSelection component is working!
          </div>
        </div>

        {/* Topic Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 max-w-4xl">
          {TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                selectedTopic === topic.id
                  ? 'border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-400/30'
                  : 'border-slate-600 bg-slate-800/60 hover:border-slate-500 hover:bg-slate-700/60'
              }`}
            >
              <div className="text-3xl mb-2">{topic.emoji}</div>
              <div className="font-semibold text-sm text-white mb-1">{topic.name}</div>
              <div className="text-xs text-slate-400">{topic.description}</div>
            </button>
          ))}
        </div>

        {/* Start Button */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleStart}
            disabled={!selectedTopic}
            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform ${
              selectedTopic
                ? 'bg-green-600 hover:bg-green-700 hover:scale-105 text-white shadow-lg shadow-green-600/30'
                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
            }`}
            style={{
              fontFamily: 'Silkscreen, monospace',
              textShadow: selectedTopic ? '2px 2px 0px #000' : 'none'
            }}
          >
            {selectedTopic ? 'START JOURNEY' : 'SELECT A TOPIC'}
          </button>
          
          {selectedTopic && (
            <div className="text-sm text-green-400 animate-pulse">
              ✓ Topic selected: {TOPICS.find(t => t.id === selectedTopic)?.name}
            </div>
          )}
          
        </div>

        {/* Game Rules */}
        <div className="mt-8 max-w-2xl">
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
            <h3 className="font-semibold text-yellow-400 mb-3" style={{ fontFamily: 'Silkscreen, monospace' }}>
              HOW TO PLAY
            </h3>
            <div className="text-sm text-slate-300 space-y-2 text-left">
              <div>• <strong>Level 1:</strong> Guess 3-letter words</div>
              <div>• <strong>Level 2:</strong> Guess 4-letter words</div>
              <div>• <strong>Level 3:</strong> Guess 5-letter words</div>
              <div>• <strong>And so on...</strong> Each level adds 1 letter!</div>
              <div>• <strong>Unlimited levels</strong> - How far can you go?</div>
              <div>• <strong>AI-generated words</strong> based on your chosen topic</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

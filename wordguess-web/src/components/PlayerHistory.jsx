import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5001";

export default function PlayerHistory({ playerName }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch player scores from API
  useEffect(() => {
    if (!playerName || playerName === "guest") {
      setScores([]);
      return;
    }
    const fetchPlayerScores = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API}/api/player/${encodeURIComponent(playerName)}/scores?limit=50`);
        if (!response.ok) {
          throw new Error(`Backend unavailable (${response.status})`);
        }
        const data = await response.json();
        setScores(data);
      } catch (err) {
        console.error('Player scores fetch error:', err);
        setError('Backend server is currently unavailable. Please try again later.');
        setScores([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayerScores();
  }, [playerName]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (durationMs) => {
    return Math.round(durationMs / 1000);
  };

  if (!playerName || playerName === "guest") {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 shadow-[6px_6px_0_#000]">
        <h3 className="font-silkscreen uppercase tracking-wider text-sm text-slate-300 mb-4">
          YOUR HISTORY
        </h3>
        <div className="text-center py-8 text-slate-400">
          Set a player name to see your game history
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 shadow-[6px_6px_0_#000]">
        <h3 className="font-silkscreen uppercase tracking-wider text-sm text-slate-300 mb-4">
          YOUR HISTORY
        </h3>
        <div className="text-center py-8 text-slate-400">Loading your scores...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 shadow-[6px_6px_0_#000]">
        <h3 className="font-silkscreen uppercase tracking-wider text-sm text-slate-300 mb-4">
          YOUR HISTORY
        </h3>
        <div className="text-center py-8 text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 shadow-[6px_6px_0_#000]">
      <h3 className="font-silkscreen uppercase tracking-wider text-sm text-slate-300 mb-4">
        YOUR HISTORY
      </h3>
      
      {scores.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <div className="mb-2">📊</div>
          <div>Game history temporarily unavailable</div>
          <div className="text-xs text-slate-500 mt-2">Backend server is being updated. Check back soon!</div>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {scores.map((score) => (
            <div 
              key={score.id}
              className="flex items-center justify-between p-2 bg-slate-700/40 rounded-lg hover:bg-slate-700/60 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  score.won ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {score.won ? 'W' : 'L'}
                </span>
                <span className="font-bold text-blue-400">{score.score}</span>
                <span className="px-2 py-1 rounded text-xs bg-purple-600 text-white">
                  L{score.level || 1}
                </span>
                <span className="text-slate-300 text-sm">
                  {score.mistakes} mistakes
                </span>
                <span className="text-slate-400 text-sm">
                  {formatTime(score.duration_ms)}s
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span className="font-mono">{score.word || 'N/A'}</span>
                <span>•</span>
                <span>{formatDate(score.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {scores.length > 0 && (
        <div className="mt-3 text-xs text-slate-500 text-center">
          Showing {scores.length} recent games
        </div>
      )}
    </div>
  );
}

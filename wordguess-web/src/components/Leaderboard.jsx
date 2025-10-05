import React, { useState, useEffect } from "react";
import { API_BASE } from "../config.js";

const API = API_BASE;

export default function Leaderboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch leaderboard data from API
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        console.log('Fetching leaderboard from:', `${API}/api/leaderboard?limit=20`);
        setLoading(true);
        setError("");
        const response = await fetch(`${API}/api/leaderboard?limit=20`);
        if (!response.ok) {
          throw new Error(`Backend unavailable (${response.status})`);
        }
        const data = await response.json();
        setScores(data);
      } catch (err) {
        console.error('Leaderboard fetch error:', err);
        setError(`Backend server is currently unavailable. Please try again later.`);
        setScores([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (durationMs) => {
    return Math.round(durationMs / 1000);
  };

  if (loading) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 shadow-[6px_6px_0_#000]">
        <h3 className="font-silkscreen uppercase tracking-wider text-sm text-slate-300 mb-4">TOP SCORES</h3>
        <div className="text-center py-8 text-slate-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 shadow-[6px_6px_0_#000]">
        <h3 className="font-silkscreen uppercase tracking-wider text-sm text-slate-300 mb-4">TOP SCORES</h3>
        <div className="text-center py-8 text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 shadow-[6px_6px_0_#000] min-h-[300px]">
      <h3 className="font-silkscreen uppercase tracking-wider text-sm text-slate-300 mb-4">TOP SCORES</h3>
      
      {scores.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <div className="mb-2">🏆</div>
          <div>Leaderboard temporarily unavailable</div>
          <div className="text-xs text-slate-500 mt-2">Backend server is being updated. Check back soon!</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-2 px-1 text-slate-300">#</th>
                    <th className="text-left py-2 px-1 text-slate-300">Player</th>
                    <th className="text-left py-2 px-1 text-slate-300">Score</th>
                    <th className="text-left py-2 px-1 text-slate-300">Level</th>
                    <th className="text-left py-2 px-1 text-slate-300">Result</th>
                    <th className="text-left py-2 px-1 text-slate-300">Mistakes</th>
                    <th className="text-left py-2 px-1 text-slate-300">Time(s)</th>
                    <th className="text-left py-2 px-1 text-slate-300">Word</th>
                    <th className="text-left py-2 px-1 text-slate-300">Date</th>
                  </tr>
                </thead>
            <tbody>
              {scores.map((score, index) => (
                <tr 
                  key={score.id}
                  className={`border-b border-slate-700/50 hover:bg-slate-700/40 transition will-change-transform hover:-translate-y-[1px] ${
                    index === 0 ? 'text-yellow-300' : 
                    index === 1 ? 'text-slate-200' : 
                    index === 2 ? 'text-amber-200' : 
                    'text-slate-200'
                  }`}
                >
                  <td className="py-2 px-1 font-bold">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </td>
                      <td className="py-2 px-1 font-semibold">{score.player}</td>
                      <td className="py-2 px-1 font-bold text-blue-400">{score.score}</td>
                      <td className="py-2 px-1">
                        <span className="px-2 py-1 rounded text-xs bg-purple-600 text-white">
                          L{score.level || 1}
                        </span>
                      </td>
                      <td className="py-2 px-1">
                        <span className={`px-2 py-1 rounded text-xs ${
                          score.won ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                          {score.won ? 'Won' : 'Lost'}
                        </span>
                      </td>
                      <td className="py-2 px-1">{score.mistakes}</td>
                      <td className="py-2 px-1">{formatTime(score.duration_ms)}</td>
                      <td className="py-2 px-1 font-mono text-xs">{score.word || 'N/A'}</td>
                      <td className="py-2 px-1 text-xs text-slate-400">{formatDate(score.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

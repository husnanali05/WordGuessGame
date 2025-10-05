import React from "react";

export default function PlayerNameBox({ playerName, onPlayerNameChange, readOnly = false }) {
  // Handle name changes and notify parent
  const handleNameChange = (newName) => {
    if (readOnly) return; // Don't allow changes in read-only mode
    const trimmedName = newName.slice(0, 32); // Limit to 32 chars
    if (onPlayerNameChange) {
      onPlayerNameChange(trimmedName);
    }
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 shadow-[6px_6px_0_#000] min-h-[200px]">
      <h3 className="font-silkscreen uppercase tracking-wider text-sm text-slate-300 mb-3">
        PLAYER NAME
      </h3>
      
      <div className="space-y-2">
        <input
          type="text"
          value={playerName || ""}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Enter your name"
          readOnly={readOnly}
          className={`w-full px-3 py-2 border-2 rounded-lg text-white placeholder-slate-400 transition-colors ${
            readOnly 
              ? "bg-slate-600 border-slate-500 text-slate-300 cursor-not-allowed" 
              : "bg-slate-700 border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          }`}
          maxLength={32}
        />
        
        <div className="text-xs text-slate-400">
          {(playerName || "").length}/32 characters
        </div>
        
        <div className="text-xs text-slate-500">
          {readOnly 
            ? "Your name is set from the start screen and cannot be changed during the game."
            : "Your name will be saved locally and used for score submissions."
          }
        </div>
      </div>
    </div>
  );
}

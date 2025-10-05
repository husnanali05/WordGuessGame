import React, { useState } from 'react';
import SpriteAnimator from './SpriteAnimator';

// Example usage of SpriteAnimator component
export default function SpriteAnimatorExample() {
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(2);

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold text-white mb-4">SpriteAnimator Examples</h2>
      
      {/* Astronaut Animation */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Astronaut Idle Animation</h3>
        <div className="flex items-center space-x-4">
          <SpriteAnimator
            src="/assets/hangman-states/astronot.png"
            frameCount={12}
            frameWidth={64}
            frameHeight={64}
            speed={speed}
            paused={paused}
            className="scale-[2]"
            alt="Astronaut idle animation"
          />
          
          <div className="space-y-2">
            <button 
              onClick={() => setPaused(!paused)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {paused ? 'Play' : 'Pause'}
            </button>
            
            <div className="space-y-1">
              <label className="text-white text-sm">Speed: {speed}s</label>
              <input 
                type="range" 
                min="0.5" 
                max="5" 
                step="0.5" 
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-32"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Different Sizes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Different Sizes</h3>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <SpriteAnimator
              src="/assets/hangman-states/astronot.png"
              frameCount={12}
              frameWidth={64}
              frameHeight={64}
              speed={1}
              className="scale-[1]"
              alt="Small astronaut"
            />
            <p className="text-white text-sm mt-2">1x Scale</p>
          </div>
          
          <div className="text-center">
            <SpriteAnimator
              src="/assets/hangman-states/astronot.png"
              frameCount={12}
              frameWidth={64}
              frameHeight={64}
              speed={1}
              className="scale-[2]"
              alt="Medium astronaut"
            />
            <p className="text-white text-sm mt-2">2x Scale</p>
          </div>
          
          <div className="text-center">
            <SpriteAnimator
              src="/assets/hangman-states/astronot.png"
              frameCount={12}
              frameWidth={64}
              frameHeight={64}
              speed={1}
              className="scale-[4]"
              alt="Large astronaut"
            />
            <p className="text-white text-sm mt-2">4x Scale</p>
          </div>
        </div>
      </div>

      {/* Usage Code Example */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Usage Code</h3>
        <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`import SpriteAnimator from './SpriteAnimator';

<SpriteAnimator
  src="/assets/hangman-states/astronot.png"
  frameCount={12}
  frameWidth={64}
  frameHeight={64}
  speed={2}
  className="scale-[4]"
  alt="Astronaut idle animation"
/>`}
        </pre>
      </div>
    </div>
  );
}

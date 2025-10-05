import React, { useRef, useEffect, useState } from "react";

export default function SpriteAnimator({
  src,
  frameWidth,
  frameHeight,
  frameCount,
  fps = 8,
  scale = 3,
  offsetX = 0,
  offsetY = 0,
  className = "",
}) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [spriteImage, setSpriteImage] = useState(null);

  // Load the sprite sheet image
  useEffect(() => {
    console.log('Loading sprite image:', src);
    const img = new Image();
    img.onload = () => {
      console.log('Sprite image loaded successfully, dimensions:', img.width, 'x', img.height);
      setSpriteImage(img);
    };
    img.onerror = (e) => {
      console.error('Failed to load sprite image:', src, e);
    };
    img.src = src;
  }, [src]);

  // Animation loop
  useEffect(() => {
    if (!spriteImage) return;

    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % frameCount);
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [spriteImage, frameCount, fps]);

  // Calculate source position for current frame
  const sourceX = currentFrame * frameWidth;
  const sourceY = 0;

  return (
    <div 
      className={`inline-block ${className}`}
      style={{
        width: `${frameWidth * scale}px`,
        height: `${frameHeight * scale}px`,
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {!spriteImage ? (
        <div 
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: 'white'
          }}
        >
          Loading...
        </div>
      ) : (
        <div
          style={{
            width: `${frameWidth * scale}px`,
            height: `${frameHeight * scale}px`,
            backgroundImage: `url(${src})`,
            backgroundSize: `${frameWidth * frameCount * scale}px ${frameHeight * scale}px`,
            backgroundPosition: `-${sourceX * scale}px 0`,
            backgroundRepeat: 'no-repeat',
            imageRendering: 'pixelated',
            imageRendering: 'crisp-edges'
          }}
        />
      )}
    </div>
  );
}

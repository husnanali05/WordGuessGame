// src/components/PixelStartButton.jsx
import { useEffect, useState } from "react";

export default function PixelStartButton({
  onClick,
  disabled = false,
  width = 300,   // ⬅ default size bumped up
  height = 150,   // ⬅ default size bumped up
  ariaLabel = "Start Game",
}) {
  const NORMAL   = "/assets/buttons/start-normal.png";
  const HOVER    = "/assets/buttons/start-hover.png";
  const ACTIVE   = "/assets/buttons/start-active.png";
  const DISABLED = "/assets/buttons/start-disabled.png";

  const [bg, setBg] = useState(disabled ? DISABLED : NORMAL);

  // keep in sync if parent toggles disabled
  useEffect(() => {
    setBg(disabled ? DISABLED : NORMAL);
  }, [disabled]);

  // keyboard accessibility
  function onKeyDown(e) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setBg(ACTIVE);
    }
  }
  function onKeyUp(e) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setBg(HOVER);
      onClick?.();
    }
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setBg(HOVER)}
      onMouseLeave={() => setBg(disabled ? DISABLED : NORMAL)}
      onMouseDown={() => !disabled && setBg(ACTIVE)}
      onMouseUp={() => !disabled && setBg(HOVER)}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      className="outline-none select-none"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundImage: `url(${bg})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "contain",
        imageRendering: "pixelated",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    />
  );
}

// Seamless horizontal scroll using two panels.
export default function ParallaxBand({
  src,
  speed = 80,          // seconds per loop (slower = smoother)
  direction = "left",  // "left" | "right"
  opacity = 1,
  y = 0,               // optional vertical offset in px (if needed)
  cover = "cover",     // "cover" | "contain" | e.g. "auto 100%"
}) {
  const anim = direction === "left" ? "scrollLeft" : "scrollRight";

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ opacity, transform: `translateY(${y}px)` }}
    >
      <div
        className="absolute top-0 left-0 h-full flex will-change-transform"
        // 200% width → two halves (100% + 100%)
        style={{
          width: "200%",
          animation: `${anim} ${speed}s linear infinite`,
        }}
      >
        {/* panel 1 */}
        <div
          className="h-full"
          style={{
            width: "50%",
            backgroundImage: `url(${src})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: cover,
            imageRendering: "pixelated",
          }}
        />
        {/* panel 2 */}
        <div
          className="h-full"
          style={{
            width: "50%",
            backgroundImage: `url(${src})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: cover,
            imageRendering: "pixelated",
          }}
        />
      </div>
    </div>
  );
}

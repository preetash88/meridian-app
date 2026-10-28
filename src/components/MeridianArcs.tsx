/** Decorative globe wireframe. The brand motif: lines of longitude and latitude. */
export function MeridianArcs({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const stroke = tone === "dark" ? "var(--color-ink)" : "var(--color-paper)";
  const meridians = [70, 140, 205];
  const parallels = [-175, -110, -45, 45, 110, 175];
  return (
    <svg viewBox="0 0 600 600" fill="none" className={className} aria-hidden="true">
      <g stroke={stroke} strokeOpacity={tone === "dark" ? 0.13 : 0.18} strokeWidth="1.25">
        <circle cx="300" cy="300" r="262" />
        {meridians.map((rx) => (
          <ellipse key={rx} cx="300" cy="300" rx={rx} ry="262" />
        ))}
        <line x1="300" y1="38" x2="300" y2="562" />
        <line x1="38" y1="300" x2="562" y2="300" />
        {parallels.map((d) => {
          const half = Math.sqrt(262 ** 2 - d ** 2);
          return <ellipse key={d} cx="300" cy={300 + d} rx={half} ry={half * 0.14} />;
        })}
      </g>
      {/* One highlighted meridian */}
      <ellipse
        cx="300"
        cy="300"
        rx="140"
        ry="262"
        stroke={tone === "dark" ? "var(--color-verdigris)" : "var(--color-verdigris-bright)"}
        strokeWidth="2"
        strokeOpacity="0.9"
      />
    </svg>
  );
}

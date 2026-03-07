export function PresenterTopProgress({
  total,
  progressPercent,
}: {
  total: number;
  progressPercent: number;
}) {
  const segmentCount = Math.max(total, 1);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30">
      <div className="relative h-[4px] w-full overflow-hidden bg-white/30">
        <div
          className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,#86efac_0%,#22c55e_46%,#15803d_100%)] transition-[width] duration-300"
          style={{ width: `${progressPercent}%` }}
        />
        <div
          className="absolute inset-0 grid gap-px bg-white/12"
          style={{ gridTemplateColumns: `repeat(${segmentCount}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: segmentCount }, (_, index) => (
            <span key={index} aria-hidden className="bg-transparent" />
          ))}
        </div>
      </div>
    </div>
  );
}

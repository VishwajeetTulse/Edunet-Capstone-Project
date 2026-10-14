import React from 'react';

interface Props {
  score: number;
  thresholds: [number, number];
}

const SCALE_MAX = 2;

// Horizontal three-band scale with a marker for the score.
export default function RiskGauge({ score, thresholds }: Props) {
  const [t0, t1] = thresholds;
  const pct = (v: number) => `${(Math.min(Math.max(v, 0), SCALE_MAX) / SCALE_MAX) * 100}%`;

  return (
    <div className="pt-8 pb-2">
      <div className="relative">
        {/* Marker */}
        <div
          className="absolute -top-7 -translate-x-1/2 flex flex-col items-center transition-[left] duration-700 ease-out"
          style={{ left: pct(score) }}
        >
          <span className="font-mono text-xs bg-ink text-card px-1.5 py-0.5 rounded">{score.toFixed(2)}</span>
          <span className="w-px h-3 bg-ink" />
        </div>

        <div className="flex h-3 rounded-sm overflow-hidden">
          <div className="bg-low" style={{ width: pct(t0) }} />
          <div className="bg-mid" style={{ width: `calc(${pct(t1)} - ${pct(t0)})` }} />
          <div className="bg-high flex-1" />
        </div>
      </div>

      <div className="relative h-10 mt-2 text-xs">
        <span className="absolute left-0 text-muted">Low</span>
        <span className="absolute -translate-x-1/2 font-mono text-faint" style={{ left: pct(t0) }}>{t0.toFixed(2)}</span>
        <span className="absolute -translate-x-1/2 font-mono text-faint" style={{ left: pct(t1) }}>{t1.toFixed(2)}</span>
        <span className="absolute right-0 text-muted">High</span>
        <span className="absolute top-5 -translate-x-1/2 text-muted" style={{ left: `calc((${pct(t0)} + ${pct(t1)}) / 2)` }}>Mild</span>
      </div>
    </div>
  );
}

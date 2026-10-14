import React from 'react';

type Step = 'selection' | 'assessment' | 'results';

const STEPS: { id: Step; label: string }[] = [
  { id: 'selection', label: 'Start' },
  { id: 'assessment', label: 'Questions' },
  { id: 'results', label: 'Result' },
];

interface Props {
  step: Step;
  onHome: () => void;
}

export default function Navbar({ step, onHome }: Props) {
  const current = STEPS.findIndex((s) => s.id === step);

  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <button type="button" onClick={onHome} className="flex items-baseline gap-2 text-left">
          <span className="font-serif text-xl font-semibold tracking-tight text-ink">Screen Balance</span>
          <span className="hidden sm:inline text-xs text-faint">internet use check</span>
        </button>

        <ol className="flex items-center gap-3 sm:gap-5 text-xs sm:text-sm">
          {STEPS.map((s, i) => (
            <li
              key={s.id}
              className={`flex items-center gap-1.5 ${i === current ? 'text-ink font-medium' : i < current ? 'text-muted' : 'text-faint'}`}
            >
              <span
                className={`font-mono text-[11px] w-5 h-5 rounded-full grid place-items-center border ${
                  i === current ? 'bg-ink text-card border-ink' : 'border-line'
                }`}
              >
                {i + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </li>
          ))}
        </ol>
      </div>
    </header>
  );
}

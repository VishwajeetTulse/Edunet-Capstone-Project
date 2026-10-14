import React from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import RiskGauge from './RiskGauge';
import type { AssessmentData } from './AssessmentForm';

export interface ResultsData {
  prediction_score: number;
  original_score: number;
  sii_index: number;
  stress_factor: number;
  thresholds?: [number, number];
}

interface Props {
  data: ResultsData;
  answers: AssessmentData;
  onEdit: () => void;
  onReset: () => void;
}

// Fallback in case an older backend doesn't send thresholds.
const DEFAULT_THRESHOLDS: [number, number] = [0.55, 1.08];

const LEVELS = [
  {
    name: 'Low',
    color: 'bg-low',
    text: 'text-low',
    summary: 'Nothing here points to a problem with internet use.',
    advice: [
      'Whatever the current routine is, it seems to be working.',
      'Worth checking in again if sleep or mood changes.',
    ],
  },
  {
    name: 'Mild',
    color: 'bg-mid',
    text: 'text-mid',
    summary: 'A few early signs that screens may be taking up more room than they should.',
    advice: [
      'Try a fixed "screens off" time an hour before bed.',
      'Swap some evening screen time for something active, even a walk.',
      'Talk about it openly instead of setting strict rules straight away.',
    ],
  },
  {
    name: 'High',
    color: 'bg-high',
    text: 'text-high',
    summary: 'The answers look a lot like young people in the study whose internet use was causing real trouble.',
    advice: [
      'Have a calm conversation about how they feel when they are offline.',
      'Agree on small, specific limits together and review them weekly.',
      'If sleep, school or friendships are clearly suffering, a GP or school counsellor is a good next step.',
    ],
  },
];

type Effect = 'up' | 'down' | 'flat';

function factors(a: AssessmentData, stress: number): { label: string; value: string; effect: Effect }[] {
  const bmi = a.weight / (a.height / 100) ** 2;
  return [
    { label: 'Screen time', value: `${a.hours} h a day`, effect: a.hours >= 5 ? 'up' : a.hours <= 2 ? 'down' : 'flat' },
    { label: 'Sleep', value: a.sds >= 60 ? 'struggles' : a.sds >= 45 ? 'up and down' : 'sleeps well', effect: a.sds >= 55 ? 'up' : a.sds <= 35 ? 'down' : 'flat' },
    { label: 'Physical activity', value: a.paq >= 4 ? 'a lot' : a.paq >= 2.5 ? 'some' : 'hardly any', effect: a.paq < 2 ? 'up' : a.paq >= 4 ? 'down' : 'flat' },
    { label: 'Mood and friends', value: a.cgas >= 90 ? 'thriving' : a.cgas >= 75 ? 'doing okay' : a.cgas >= 60 ? 'finding it hard' : 'withdrawn', effect: a.cgas < 70 ? 'up' : a.cgas >= 85 ? 'down' : 'flat' },
    { label: 'Stress signals', value: `${Math.round(stress * 100)} / 100`, effect: stress > 0.5 ? 'up' : stress < 0.2 ? 'down' : 'flat' },
    { label: 'BMI', value: bmi.toFixed(1), effect: bmi >= 27 ? 'up' : 'flat' },
  ];
}

const EFFECT_STYLE: Record<Effect, { mark: string; cls: string; sr: string }> = {
  up: { mark: '+', cls: 'text-high border-high/40', sr: 'pushes the score up' },
  down: { mark: '−', cls: 'text-low border-low/40', sr: 'pulls the score down' },
  flat: { mark: '·', cls: 'text-faint border-line', sr: 'about average' },
};

export default function ResultsDashboard({ data, answers, onEdit, onReset }: Props) {
  const level = LEVELS[Math.min(Math.max(data.sii_index, 0), 2)];
  const thresholds = data.thresholds ?? DEFAULT_THRESHOLDS;
  const rows = factors(answers, data.stress_factor);

  return (
    <div className="rise grid lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
      <div className="bg-card border border-line rounded-md p-6 sm:p-8">
        <p className="text-sm text-muted">Estimated level of problematic internet use</p>
        <div className="flex items-center gap-3 mt-2">
          <span className={`w-3.5 h-3.5 rounded-full ${level.color}`} />
          <h1 className={`font-serif text-5xl font-semibold ${level.text}`}>{level.name}</h1>
        </div>
        <p className="mt-4 text-lg leading-relaxed max-w-xl">{level.summary}</p>

        <RiskGauge score={data.prediction_score} thresholds={thresholds} />

        <h2 className="font-serif text-xl font-semibold mt-6 mb-3">What might help</h2>
        <ul className="space-y-2.5">
          {level.advice.map((t) => (
            <li key={t} className="flex gap-3 text-muted leading-relaxed">
              <span className={`mt-2.5 w-1.5 h-1.5 rounded-full shrink-0 ${level.color}`} />
              {t}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-line">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 border border-line hover:border-ink px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Change answers
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 bg-ink hover:bg-accent-dark text-card px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Start over
          </button>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="border border-line rounded-md bg-card p-5">
          <h2 className="font-medium mb-1">What stands out in the answers</h2>
          <p className="text-xs text-faint mb-4">A rough guide based on how each answer compares with typical values in the study.</p>
          <ul className="divide-y divide-line">
            {rows.map((r) => {
              const e = EFFECT_STYLE[r.effect];
              return (
                <li key={r.label} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="flex items-center gap-3">
                    <span className={`w-5 h-5 grid place-items-center rounded border font-mono text-xs ${e.cls}`} aria-hidden>
                      {e.mark}
                    </span>
                    {r.label}
                    <span className="sr-only">{e.sr}</span>
                  </span>
                  <span className="font-mono text-xs text-muted">{r.value}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <details className="border border-line rounded-md bg-card p-5 text-sm group">
          <summary className="cursor-pointer font-medium list-none flex justify-between">
            How the score was worked out
            <span className="text-faint group-open:rotate-45 transition-transform">+</span>
          </summary>
          <dl className="mt-4 space-y-2 font-mono text-xs">
            <div className="flex justify-between"><dt className="text-muted">Ensemble prediction</dt><dd>{data.original_score.toFixed(3)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Vitals adjustment</dt><dd>{(data.prediction_score - data.original_score >= 0 ? '+' : '') + (data.prediction_score - data.original_score).toFixed(3)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2"><dt className="text-muted">Final score</dt><dd>{data.prediction_score.toFixed(3)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Band cut-offs</dt><dd>{thresholds.map((t) => t.toFixed(2)).join(' / ')}</dd></div>
          </dl>
          <p className="mt-4 text-muted leading-relaxed">
            LightGBM, XGBoost and CatBoost each predict a number, and we average the three. The cut-offs
            between bands were tuned to agree as closely as possible with the real ratings in the training data.
          </p>
        </details>
      </aside>
    </div>
  );
}

import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { AssessmentData } from './AssessmentForm';

interface Persona {
  id: string;
  name: string;
  blurb: string;
  data: AssessmentData;
}

const PERSONAS: Persona[] = [
  {
    id: 'gamer',
    name: 'Late-night gamer',
    blurb: 'Plays most evenings, sleeps badly and rarely gets outside.',
    data: {
      age: 16, sex: 1, hours: 10, height: 175, weight: 80,
      hr: 85, systolic: 130, diastolic: 85,
      sds: 60, paq: 1.5, cgas: 60,
    },
  },
  {
    id: 'student',
    name: 'Busy student',
    blurb: 'Lots of screen time for school, sleeps fine, moves a little.',
    data: {
      age: 15, sex: 1, hours: 6, height: 160, weight: 55,
      hr: 75, systolic: 115, diastolic: 75,
      sds: 30, paq: 2.5, cgas: 75,
    },
  },
  {
    id: 'athlete',
    name: 'School athlete',
    blurb: 'Trains most days, light phone use, gets along well with friends.',
    data: {
      age: 17, sex: 1, hours: 2, height: 180, weight: 75,
      hr: 60, systolic: 110, diastolic: 70,
      sds: 30, paq: 4.5, cgas: 90,
    },
  },
];

const sleepLabel = (sds: number) => (sds >= 65 ? 'Poor' : sds >= 45 ? 'Fair' : 'Good');
const activityLabel = (paq: number) => (paq >= 4 ? 'High' : paq >= 2.5 ? 'Some' : 'Low');

interface Props {
  onSelect: (data: AssessmentData) => void;
  onCustom: () => void;
}

export default function PersonaSelector({ onSelect, onCustom }: Props) {
  return (
    <div className="rise space-y-16">
      {/* Intro */}
      <section className="grid md:grid-cols-[1.4fr_1fr] gap-10 items-end">
        <div>
          <p className="text-sm font-medium text-accent mb-4">For parents, teachers and students</p>
          <h1 className="font-serif text-4xl sm:text-5xl leading-[1.1] font-semibold tracking-tight">
            Is screen time starting to get in the way?
          </h1>
          <p className="mt-5 text-lg text-muted max-w-xl leading-relaxed">
            Answer a few questions about sleep, activity, mood and daily screen use. We compare the
            answers with data from more than 2,700 young people and give a rough idea of where things stand.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onCustom}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-card px-6 py-3 rounded-md font-medium transition-colors"
            >
              Start the check
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-sm text-faint">Takes about 2 minutes. Nothing is saved.</span>
          </div>
        </div>

        <aside className="border border-line bg-card rounded-md p-5 text-sm">
          <h2 className="font-medium mb-3">Handy to have nearby</h2>
          <ul className="space-y-2 text-muted">
            <li className="flex justify-between gap-4 border-b border-line pb-2"><span>Height and weight</span><span className="text-faint">needed</span></li>
            <li className="flex justify-between gap-4 border-b border-line pb-2"><span>Rough daily screen hours</span><span className="text-faint">needed</span></li>
            <li className="flex justify-between gap-4"><span>Heart rate and blood pressure</span><span className="text-faint">optional</span></li>
          </ul>
        </aside>
      </section>

      {/* Sample profiles */}
      <section>
        <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-3 mb-2">
          <h2 className="font-serif text-2xl font-semibold">Or try a sample profile</h2>
          <span className="text-sm text-faint hidden sm:block">You can change any answer after</span>
        </div>

        <ul>
          {PERSONAS.map((p) => (
            <li key={p.id} className="border-b border-line">
              <button
                type="button"
                onClick={() => onSelect(p.data)}
                className="group w-full grid grid-cols-[1fr_auto] sm:grid-cols-[1.2fr_2fr_auto] gap-x-6 gap-y-2 items-center py-5 text-left hover:bg-card transition-colors px-2 -mx-2 rounded"
              >
                <div>
                  <div className="font-medium text-lg">{p.name}</div>
                  <div className="text-sm text-muted">Age {p.data.age}</div>
                </div>
                <p className="text-muted text-sm sm:text-base col-span-2 sm:col-span-1 row-start-2 sm:row-start-auto">
                  {p.blurb}
                </p>
                <div className="flex items-center gap-5 row-start-1 col-start-2 sm:col-start-auto">
                  <dl className="hidden md:flex gap-5 font-mono text-[13px] text-muted">
                    <div><dt className="text-faint">screen</dt><dd className="text-ink">{p.data.hours}h</dd></div>
                    <div><dt className="text-faint">sleep</dt><dd className="text-ink">{sleepLabel(p.data.sds)}</dd></div>
                    <div><dt className="text-faint">activity</dt><dd className="text-ink">{activityLabel(p.data.paq)}</dd></div>
                  </dl>
                  <ArrowRight className="w-5 h-5 text-faint group-hover:text-accent group-hover:translate-x-0.5 transition" />
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section id="how" className="grid md:grid-cols-3 gap-8 border-t border-line pt-10">
        <div>
          <span className="font-mono text-[13px] text-faint">01</span>
          <h3 className="font-medium mt-1 mb-2">You answer</h3>
          <p className="text-sm text-muted leading-relaxed">
            Age, body measurements, screen hours, sleep, activity and how things are going socially.
            If you don&apos;t know your heart rate or blood pressure, we estimate them from how stressed you feel.
          </p>
        </div>
        <div>
          <span className="font-mono text-[13px] text-faint">02</span>
          <h3 className="font-medium mt-1 mb-2">The model scores it</h3>
          <p className="text-sm text-muted leading-relaxed">
            Three gradient boosting models (LightGBM, XGBoost and CatBoost) each predict a score and
            we average them. Training used data from the Healthy Brain Network study.
          </p>
        </div>
        <div>
          <span className="font-mono text-[13px] text-faint">03</span>
          <h3 className="font-medium mt-1 mb-2">You see where it lands</h3>
          <p className="text-sm text-muted leading-relaxed">
            The score is placed on a three-band scale: low, mild or high. You also get a short note on
            what is pushing it up or down.
          </p>
        </div>
      </section>
    </div>
  );
}

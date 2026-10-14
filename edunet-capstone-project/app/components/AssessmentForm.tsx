import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export interface AssessmentData {
  age: number;
  sex: number;
  hours: number;
  height: number;
  weight: number;
  hr: number;
  systolic: number;
  diastolic: number;
  sds: number;  // Sleep Disturbance Scale raw score, higher is worse (roughly 20 to 90)
  paq: number;  // Physical Activity Questionnaire, 1 (low) to 5 (high)
  cgas: number; // Children's Global Assessment Scale, 1 to 100, higher is better
}

interface Props {
  initialData?: AssessmentData | null;
  onSubmit: (data: AssessmentData) => void;
  isLoading: boolean;
}

const DEFAULTS: AssessmentData = {
  age: 15, sex: 0, hours: 4, height: 165, weight: 60,
  hr: 75, systolic: 120, diastolic: 80,
  sds: 40, paq: 2.5, cgas: 75,
};

// Each friendly answer maps to a representative value on the clinical scale the model was trained on.
const ACTIVITY = [
  { value: 1.5, label: 'Hardly any', hint: 'Mostly sitting' },
  { value: 3.0, label: 'Some', hint: 'A few times a week' },
  { value: 4.5, label: 'A lot', hint: 'Sport or exercise most days' },
];
const SLEEP = [
  { value: 30, label: 'Sleeps well', hint: 'Falls asleep easily' },
  { value: 50, label: 'Up and down', hint: 'Some rough nights' },
  { value: 70, label: 'Struggles', hint: 'Often tired or awake late' },
];
const SOCIAL = [
  { value: 50, label: 'Keeps to themself', hint: 'Avoids friends and groups' },
  { value: 65, label: 'Finding it hard', hint: 'Some trouble at school or home' },
  { value: 80, label: 'Doing okay', hint: 'Gets along with most people' },
  { value: 95, label: 'Thriving', hint: 'Lots of friends, joins in' },
];

// Snap a stored value to the nearest option so sample profiles still highlight something.
const nearest = (opts: { value: number }[], v: number) =>
  opts.reduce((a, b) => (Math.abs(b.value - v) < Math.abs(a.value - v) ? b : a)).value;

const toNum = (s: string, fallback: number) => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : fallback;
};

function Section({ n, title, note, children }: { n: string; title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="grid md:grid-cols-[200px_1fr] gap-x-10 gap-y-4 py-8 border-b border-line last:border-b-0">
      <div>
        <span className="font-mono text-[13px] text-faint">{n}</span>
        <h3 className="font-serif text-xl font-semibold mt-1">{title}</h3>
        {note && <p className="text-sm text-muted mt-2 leading-relaxed">{note}</p>}
      </div>
      <div className="space-y-7">{children}</div>
    </section>
  );
}

function Field({ label, aside, children }: { label: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 mb-2.5">
        <label className="text-sm font-medium">{label}</label>
        {aside}
      </div>
      {children}
    </div>
  );
}

function Choice({ options, value, onChange }: {
  options: { value: number; label: string; hint?: string }[];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className={`grid gap-2 ${options.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : options.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'}`}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={`text-left px-3.5 py-3 rounded-md border transition-colors ${
              active ? 'border-accent bg-accent-soft' : 'border-line bg-card hover:border-faint'
            }`}
          >
            <div className={`text-sm font-medium ${active ? 'text-accent-dark' : ''}`}>{o.label}</div>
            {o.hint && <div className="text-[13px] text-muted mt-0.5">{o.hint}</div>}
          </button>
        );
      })}
    </div>
  );
}

function NumberInput({ value, unit, onChange, ...rest }: {
  value: number; unit: string; onChange: (v: number) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>) {
  return (
    <div className="flex items-center border border-line bg-card rounded-md focus-within:border-accent transition-colors">
      <input
        type="number"
        inputMode="decimal"
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => onChange(toNum(e.target.value, NaN))}
        className="w-full bg-transparent px-3 py-2.5 font-mono text-sm outline-none"
        {...rest}
      />
      <span className="pr-3 text-[13px] text-faint whitespace-nowrap">{unit}</span>
    </div>
  );
}

export default function AssessmentForm({ initialData, onSubmit, isLoading }: Props) {
  // Sample profiles and edited answers already carry vitals, so don't overwrite them with estimates.
  const [mode, setMode] = useState<'estimate' | 'manual'>(initialData ? 'manual' : 'estimate');
  const [stressLevel, setStressLevel] = useState(5);
  const [formData, setFormData] = useState<AssessmentData>(() =>
    initialData
      ? { ...DEFAULTS, ...initialData }
      : { ...DEFAULTS, hr: Math.round(60 + 5 * 3.5), systolic: 105 + 5 * 3, diastolic: 65 + 5 * 2 }
  );

  const set = (field: keyof AssessmentData, value: number) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // When the user doesn't know their vitals, estimate them from how stressed they feel.
  const applyStress = (level: number) => {
    setStressLevel(level);
    setFormData((prev) => ({
      ...prev,
      hr: Math.round(60 + level * 3.5),
      systolic: Math.round(105 + level * 3),
      diastolic: Math.round(65 + level * 2),
    }));
  };

  const bmi = formData.weight / (formData.height / 100) ** 2;
  const bmiOk = Number.isFinite(bmi) && bmi > 8 && bmi < 70;
  const valid =
    bmiOk &&
    [formData.hr, formData.systolic, formData.diastolic].every((v) => Number.isFinite(v) && v > 0);

  const stressWord =
    stressLevel <= 3 ? 'pretty calm' : stressLevel <= 6 ? 'a bit on edge' : stressLevel <= 8 ? 'quite stressed' : 'very stressed';

  return (
    <form
      className="bg-card border border-line rounded-md px-5 sm:px-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSubmit(formData);
      }}
    >
      <Section n="01" title="About them" note="The person the check is for. Ages 8 to 19 match the study data best.">
        <Field label="Age" aside={<span className="font-mono text-sm">{formData.age} years</span>}>
          <input
            type="range" min={8} max={19} step={1}
            value={formData.age}
            onChange={(e) => set('age', parseInt(e.target.value))}
          />
          <div className="flex justify-between text-[13px] text-faint mt-1.5 font-mono"><span>8</span><span>19</span></div>
        </Field>

        <Field label="Sex">
          <Choice
            options={[{ value: 0, label: 'Female' }, { value: 1, label: 'Male' }]}
            value={formData.sex}
            onChange={(v) => set('sex', v)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Height">
            <NumberInput value={formData.height} unit="cm" min={90} max={220} onChange={(v) => set('height', v)} />
          </Field>
          <Field label="Weight">
            <NumberInput value={formData.weight} unit="kg" min={15} max={200} onChange={(v) => set('weight', v)} />
          </Field>
        </div>
        <p className="text-sm text-muted -mt-3">
          BMI works out to <span className="font-mono text-ink">{bmiOk ? bmi.toFixed(1) : '--'}</span>
        </p>
      </Section>

      <Section n="02" title="Daily habits" note="Think about a normal school week, not holidays.">
        <Field
          label="Time on screens outside school"
          aside={<span className="font-mono text-sm">{formData.hours >= 16 ? '16+' : formData.hours} h / day</span>}
        >
          <input
            type="range" min={0} max={16} step={1}
            value={formData.hours}
            onChange={(e) => set('hours', parseInt(e.target.value))}
          />
          <div className="flex justify-between text-[13px] text-faint mt-1.5 font-mono"><span>0</span><span>8</span><span>16+</span></div>
        </Field>

        <Field label="Physical activity">
          <Choice options={ACTIVITY} value={nearest(ACTIVITY, formData.paq)} onChange={(v) => set('paq', v)} />
        </Field>

        <Field label="Sleep">
          <Choice options={SLEEP} value={nearest(SLEEP, formData.sds)} onChange={(v) => set('sds', v)} />
        </Field>
      </Section>

      <Section n="03" title="Mood and friends" note="How they've been getting on at home, at school and with friends lately.">
        <Field label="Day to day, they are">
          <Choice options={SOCIAL} value={nearest(SOCIAL, formData.cgas)} onChange={(v) => set('cgas', v)} />
        </Field>
      </Section>

      <Section n="04" title="Heart and stress" note="Heart rate and blood pressure carry a lot of weight in the model.">
        <div className="inline-flex border border-line rounded-md p-1 bg-paper text-sm">
          {([
            ['estimate', "I don't know them"],
            ['manual', 'I have the numbers'],
          ] as const).map(([m, label]) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => {
                setMode(m);
                if (m === 'estimate') applyStress(stressLevel);
              }}
              className={`px-3.5 py-1.5 rounded transition-colors ${mode === m ? 'bg-card shadow-sm font-medium' : 'text-muted hover:text-ink'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'estimate' ? (
          <div className="space-y-5">
            <Field label="How stressed or anxious do they feel these days?" aside={<span className="text-sm text-muted">{stressWord}</span>}>
              <input
                type="range" min={1} max={10} step={1}
                value={stressLevel}
                onChange={(e) => applyStress(parseInt(e.target.value))}
              />
              <div className="flex justify-between text-[13px] text-faint mt-1.5"><span>Relaxed</span><span>Very stressed</span></div>
            </Field>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm border-l-2 border-line pl-4">
              <span className="text-muted">We&apos;ll assume about</span>
              <span><span className="font-mono">{formData.hr}</span> <span className="text-muted">bpm</span></span>
              <span><span className="font-mono">{formData.systolic}/{formData.diastolic}</span> <span className="text-muted">mmHg</span></span>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Resting heart rate">
              <NumberInput value={formData.hr} unit="bpm" min={30} max={200} onChange={(v) => set('hr', v)} />
            </Field>
            <Field label="Systolic (top)">
              <NumberInput value={formData.systolic} unit="mmHg" min={60} max={220} onChange={(v) => set('systolic', v)} />
            </Field>
            <Field label="Diastolic (bottom)">
              <NumberInput value={formData.diastolic} unit="mmHg" min={30} max={150} onChange={(v) => set('diastolic', v)} />
            </Field>
          </div>
        )}
      </Section>

      <div className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-line">
        <p className="text-sm text-muted">
          {valid ? 'All set. You can come back and change answers afterwards.' : 'Check height, weight and the vitals fields.'}
        </p>
        <button
          type="submit"
          disabled={isLoading || !valid}
          className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed text-card px-6 py-3 rounded-md font-medium transition-colors min-w-[180px]"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-card/30 border-t-card rounded-full animate-spin" />
              Working it out
            </>
          ) : (
            <>
              See the result
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

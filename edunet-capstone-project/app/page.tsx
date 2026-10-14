"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import PersonaSelector from "./components/PersonaSelector";
import AssessmentForm, { type AssessmentData } from "./components/AssessmentForm";
import ResultsDashboard, { type ResultsData } from "./components/ResultsDashboard";
import { ArrowLeft } from "lucide-react";

type Step = 'selection' | 'assessment' | 'results';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('selection');
  const [formData, setFormData] = useState<AssessmentData | null>(null);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const go = (step: Step) => {
    setError(null);
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startOver = () => {
    setFormData(null);
    setResults(null);
    go('selection');
  };

  const handlePersonaSelect = (data: AssessmentData) => {
    setFormData(data);
    go('assessment');
  };

  const handleCustomStart = () => {
    setFormData(null); // Form falls back to its defaults
    go('assessment');
  };

  const handleSubmit = async (data: AssessmentData) => {
    setIsLoading(true);
    setError(null);

    const bmi = parseFloat((data.weight / ((data.height / 100) ** 2)).toFixed(2));

    // Keys must match the raw dataset column names the backend expects
    const payload = {
      features: {
        "Basic_Demos-Age": data.age,
        "Basic_Demos-Sex": data.sex,
        "PreInt_EduHx-computerinternet_hoursday": data.hours,
        "Physical-Height": data.height,
        "Physical-Weight": data.weight,
        "Physical-BMI": bmi,
        "Physical-HeartRate": data.hr,
        "Physical-Systolic_BP": data.systolic,
        "Physical-Diastolic_BP": data.diastolic,
        "SDS-SDS_Total_Raw": data.sds || 40,
        "PAQ_C-PAQ_C_Total": data.paq || 2.5,
        "CGAS-CGAS_Score": data.cgas || 75
      }
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prediction");
      }

      setResults(await response.json());
      setFormData(data);
      go('results');
    } catch (err) {
      console.error(err);
      setError("We couldn't reach the prediction server. If you're running this locally, check that the backend is up on port 8000.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar step={currentStep} onHome={startOver} />

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {currentStep === 'assessment' && (
          <button
            type="button"
            onClick={() => go('selection')}
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}

        {error && (
          <div role="alert" className="border-l-4 border-high bg-card px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {currentStep === 'selection' && (
          <PersonaSelector onSelect={handlePersonaSelect} onCustom={handleCustomStart} />
        )}

        {currentStep === 'assessment' && (
          <div className="rise">
            <div className="mb-8 max-w-2xl">
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight">A few questions</h1>
              <p className="text-muted mt-3 leading-relaxed">
                Go with your best guess. There are no right answers, and rough numbers are fine.
              </p>
            </div>
            <AssessmentForm
              // Remount when the starting data changes so the form picks it up
              key={formData ? JSON.stringify(formData) : 'blank'}
              initialData={formData}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        )}

        {currentStep === 'results' && results && formData && (
          <ResultsDashboard
            data={results}
            answers={formData}
            onEdit={() => go('assessment')}
            onReset={startOver}
          />
        )}
      </main>

      <footer className="border-t border-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-sm text-muted">
          Trained on the Child Mind Institute Healthy Brain Network dataset.
        </div>
      </footer>
    </div>
  );
}

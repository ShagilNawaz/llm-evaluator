import { useState, useCallback } from 'react';
import ResponseCard from '../components/ResponseCard';
import DimensionRater from '../components/DimensionRater';
import VerdictForm from '../components/VerdictForm';
import { generateResponses, saveEvaluation } from '../services/api';
import { getEmptyScores, DIMENSIONS } from '../utils/scores';

const STEPS = {
  IDLE: 'idle',
  GENERATING: 'generating',
  EVALUATING: 'evaluating',
  SUBMITTING: 'submitting',
  DONE: 'done',
};

function StepIndicator({ step }) {
  const steps = [
    { key: 'input', label: 'Prompt', done: step !== STEPS.IDLE },
    { key: 'compare', label: 'Compare', done: step === STEPS.EVALUATING || step === STEPS.SUBMITTING || step === STEPS.DONE },
    { key: 'evaluate', label: 'Evaluate', done: step === STEPS.SUBMITTING || step === STEPS.DONE },
    { key: 'submit', label: 'Submit', done: step === STEPS.DONE },
  ];

  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300
            ${s.done ? 'text-accent-400' : step === STEPS.IDLE && i === 0 ? 'text-brand-400' : 'text-gray-600'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-300
              ${s.done
                ? 'bg-accent-500/20 border-accent-500/50 text-accent-400'
                : step === STEPS.IDLE && i === 0
                  ? 'bg-brand-500/20 border-brand-500/50 text-brand-400'
                  : 'bg-gray-800 border-gray-700 text-gray-600'}`}>
              {s.done ? '✓' : i + 1}
            </span>
            <span className="hidden sm:block">{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-8 h-px transition-all duration-300 ${s.done ? 'bg-accent-500/40' : 'bg-gray-800'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Home({ toast }) {
  const [step, setStep] = useState(STEPS.IDLE);
  const [prompt, setPrompt] = useState('');
  const [responseA, setResponseA] = useState('');
  const [responseB, setResponseB] = useState('');
  const [scoresA, setScoresA] = useState(getEmptyScores());
  const [scoresB, setScoresB] = useState(getEmptyScores());
  const [verdict, setVerdict] = useState('');
  const [justification, setJustification] = useState('');
  const [evaluatorName, setEvaluatorName] = useState('');
  const [errors, setErrors] = useState({});
  const [savedId, setSavedId] = useState(null);
  const [provider, setProvider] = useState('');

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || prompt.trim().length < 10) {
      setErrors({ prompt: 'Please enter a prompt of at least 10 characters.' });
      return;
    }
    setErrors({});
    setStep(STEPS.GENERATING);
    setResponseA('');
    setResponseB('');

    try {
      const data = await generateResponses(prompt.trim());
      setResponseA(data.responseA);
      setResponseB(data.responseB);
      setProvider(data.provider || '');
      setStep(STEPS.EVALUATING);
    } catch (err) {
      toast.error(err.message || 'Failed to generate responses. Check your API config.');
      setStep(STEPS.IDLE);
    }
  }, [prompt, toast]);

  const handleScoreChange = useCallback((responseKey, dimension, value) => {
    if (responseKey === 'A') {
      setScoresA(prev => ({ ...prev, [dimension]: value }));
    } else {
      setScoresB(prev => ({ ...prev, [dimension]: value }));
    }
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!evaluatorName.trim()) newErrors.evaluatorName = 'Name is required.';
    if (!verdict) newErrors.verdict = 'Please select a verdict.';
    if (!justification.trim() || justification.trim().length < 20) {
      newErrors.justification = 'Justification must be at least 20 characters.';
    }
    const missingA = DIMENSIONS.filter(d => !scoresA[d.key]);
    const missingB = DIMENSIONS.filter(d => !scoresB[d.key]);
    if (missingA.length > 0 || missingB.length > 0) {
      newErrors.scores = `Please rate all dimensions for ${[
        missingA.length ? 'Response A' : null,
        missingB.length ? 'Response B' : null,
      ].filter(Boolean).join(' and ')}.`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setStep(STEPS.SUBMITTING);

    try {
      const result = await saveEvaluation({
        prompt,
        responseA,
        responseB,
        scoresA,
        scoresB,
        verdict,
        justification,
        evaluatorName,
      });
      setSavedId(result._id || result.id);
      setStep(STEPS.DONE);
      toast.success('Evaluation saved successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to save evaluation.');
      setStep(STEPS.EVALUATING);
    }
  }, [prompt, responseA, responseB, scoresA, scoresB, verdict, justification, evaluatorName, toast]);

  const handleReset = () => {
    setStep(STEPS.IDLE);
    setPrompt('');
    setResponseA('');
    setResponseB('');
    setScoresA(getEmptyScores());
    setScoresB(getEmptyScores());
    setVerdict('');
    setJustification('');
    setErrors({});
    setSavedId(null);
    setProvider('');
  };

  const isGenerating = step === STEPS.GENERATING;
  const isEvaluating = step === STEPS.EVALUATING;
  const isSubmitting = step === STEPS.SUBMITTING;
  const isDone = step === STEPS.DONE;
  const showResponses = isGenerating || isEvaluating || isSubmitting || isDone;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl text-white mb-1">
              Response <span className="text-gradient">Evaluator</span>
            </h1>
            <p className="text-sm text-gray-500">
              Generate two Claude responses and evaluate them across 6 quality dimensions
            </p>
          </div>
          <StepIndicator step={step} />
        </div>
      </div>

      {/* Prompt Section */}
      <div className="card p-5 mb-6 animate-slide-up">
        <label className="label-base">Prompt</label>
        <div className="flex gap-3">
          <textarea
            value={prompt}
            onChange={e => {
              setPrompt(e.target.value);
              if (errors.prompt) setErrors(prev => ({ ...prev, prompt: undefined }));
            }}
            disabled={isGenerating || isSubmitting || isDone}
            rows={3}
            placeholder="Enter a prompt to generate two AI responses for comparison... (e.g. 'Explain the difference between supervised and unsupervised learning')"
            className={`input-base resize-none flex-1 ${errors.prompt ? 'border-danger-500/50' : ''}`}
          />
        </div>
        {errors.prompt && <p className="mt-1.5 text-xs text-danger-400">{errors.prompt}</p>}
        {errors.scores && (
          <p className="mt-2 text-xs text-danger-400 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {errors.scores}
          </p>
        )}

        <div className="flex items-center gap-3 mt-4">
          {!isDone ? (
            <button
              onClick={handleGenerate}
              disabled={isGenerating || isSubmitting || !prompt.trim()}
              className="btn-primary"
            >
              {isGenerating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {showResponses ? 'Regenerate' : 'Generate Responses'}
                </>
              )}
            </button>
          ) : (
            <button onClick={handleReset} className="btn-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              New Evaluation
            </button>
          )}

          {isGenerating && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              Calling AI API twice in parallel2026
            </div>
          )}
        </div>
      </div>

      {/* Success banner */}
      {isDone && (
        <div className="mb-6 px-5 py-4 rounded-2xl bg-accent-500/10 border border-accent-500/30 flex items-center gap-3 animate-slide-up">
          <svg className="w-5 h-5 text-accent-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-accent-400">Evaluation saved!</p>
            <p className="text-xs text-gray-500 mt-0.5">View it in the History tab. Start a new evaluation anytime.</p>
          </div>
        </div>
      )}

      {/* Side-by-side responses */}
      {showResponses && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 animate-slide-up animate-delay-100">
          <ResponseCard variant="A" text={responseA} loading={isGenerating} provider={provider} />
          <ResponseCard variant="B" text={responseB} loading={isGenerating} provider={provider} />
        </div>
      )}

      {/* Rating section */}
      {(isEvaluating || isSubmitting || isDone) && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 animate-slide-up animate-delay-200">
            <DimensionRater
              variant="A"
              scores={scoresA}
              onChange={(dim, val) => handleScoreChange('A', dim, val)}
              disabled={isDone || isSubmitting}
            />
            <DimensionRater
              variant="B"
              scores={scoresB}
              onChange={(dim, val) => handleScoreChange('B', dim, val)}
              disabled={isDone || isSubmitting}
            />
          </div>

          <div className="animate-slide-up animate-delay-300">
            <VerdictForm
              verdict={verdict}
              justification={justification}
              evaluatorName={evaluatorName}
              onVerdictChange={setVerdict}
              onJustificationChange={setJustification}
              onEvaluatorNameChange={setEvaluatorName}
              disabled={isDone || isSubmitting}
              errors={errors}
            />
          </div>

          {!isDone && (
            <div className="mt-4 flex justify-end animate-slide-up animate-delay-400">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary text-base px-8 py-3"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Save Evaluation
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

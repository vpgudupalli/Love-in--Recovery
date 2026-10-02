"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Likert = 1 | 2 | 3 | 4 | 5;
type Question = { text: string; dimension: string };
type Answers = Record<number, Likert>;

const attachmentQuestions: Question[] = [
  { text: "I feel comfortable depending on someone I trust.", dimension: "secure" },
  { text: "I can talk openly about my needs without fearing the relationship will end.", dimension: "secure" },
  { text: "When someone I care about seems distant, I quickly worry I may lose them.", dimension: "anxious" },
  { text: "I often need reassurance that a partner still cares about me.", dimension: "anxious" },
  { text: "I prefer to handle difficult feelings on my own rather than rely on a partner.", dimension: "avoidant" },
  { text: "Too much emotional closeness can make me want more distance.", dimension: "avoidant" },
  { text: "I want closeness, but I sometimes pull away when it begins to feel vulnerable.", dimension: "fearful" },
  { text: "Past hurt can make it difficult for me to fully trust even when I want connection.", dimension: "fearful" },
  { text: "During conflict, I can stay connected while also giving myself and my partner space.", dimension: "secure" },
  { text: "Unanswered messages can make me assume something is wrong between us.", dimension: "anxious" },
  { text: "I sometimes minimize my needs so I do not have to depend on someone else.", dimension: "avoidant" },
  { text: "I may alternate between seeking closeness and protecting myself by withdrawing.", dimension: "fearful" },
];

const enneagramQuestions: Question[] = [
  { text: "I notice what could be improved and feel responsible for doing things the right way.", dimension: "1" },
  { text: "Being helpful and needed by people I care about feels important to me.", dimension: "2" },
  { text: "I am motivated by goals, progress, and being effective.", dimension: "3" },
  { text: "I value authenticity and want my relationships to feel emotionally meaningful.", dimension: "4" },
  { text: "I like to understand things deeply and need enough privacy and personal space.", dimension: "5" },
  { text: "I think ahead about risks and value loyalty, preparation, and trust.", dimension: "6" },
  { text: "I am drawn to possibilities, variety, and experiences that keep life engaging.", dimension: "7" },
  { text: "I protect my independence and am comfortable being direct when something matters.", dimension: "8" },
  { text: "I prefer harmony and often look for common ground during disagreement.", dimension: "9" },
  { text: "I can be hard on myself when I fall short of my standards.", dimension: "1" },
  { text: "I often notice what others need before they ask.", dimension: "2" },
  { text: "I naturally adapt my approach to accomplish what I set out to do.", dimension: "3" },
  { text: "I spend time understanding my feelings and what makes my experience unique.", dimension: "4" },
  { text: "I conserve my time and energy so I can think before I engage.", dimension: "5" },
  { text: "Consistency and knowing where I stand help me feel secure in relationships.", dimension: "6" },
  { text: "When things feel limiting, I quickly look for another option or a positive direction.", dimension: "7" },
  { text: "I would rather address a problem directly than leave an important issue unspoken.", dimension: "8" },
  { text: "I sometimes put my own priorities aside to keep the peace.", dimension: "9" },
];

const typeNames: Record<string, string> = {
  "1": "Type 1 · Principled",
  "2": "Type 2 · Supportive",
  "3": "Type 3 · Driven",
  "4": "Type 4 · Individual",
  "5": "Type 5 · Observant",
  "6": "Type 6 · Loyal",
  "7": "Type 7 · Exploratory",
  "8": "Type 8 · Assertive",
  "9": "Type 9 · Harmonizing",
};

const attachmentNames: Record<string, string> = {
  secure: "Secure-leaning",
  anxious: "Anxious-leaning",
  avoidant: "Avoidant-leaning",
  fearful: "Fearful-avoidant-leaning",
};

const steps = [
  { title: "Age confirmation", body: "Recovery in Love is for adults 18 and older.", field: "I confirm I am 18 or older" },
  { title: "About you", body: "Start with the basics you want potential matches to know.", field: "First name" },
  { title: "Dating preferences", body: "Choose age range, distance, relationship type, and who you want to meet.", field: "Long-term relationship" },
  { title: "Recovery preferences", body: "Tell us your boundaries and what kind of partner lifestyle works for you.", field: "Sober partner preferred" },
  { title: "Relationship goals", body: "Define what commitment and support look like to you.", field: "Intentional and long-term" },
  { title: "Mental-health disclosure", body: "Optional. You control whether this stays private or is shared after matching.", field: "Keep private for now" },
  { title: "Attachment self-reflection", body: "Answer 12 original questions about closeness, trust, reassurance, and independence. This is a self-reflection tool, not a diagnosis.", field: "" },
  { title: "Enneagram-style self-reflection", body: "Answer 18 original questions to see which of nine personality themes are strongest for you. This is not an official or clinical Enneagram assessment.", field: "" },
  { title: "Recovery compatibility", body: "Your answers help explain recovery and lifestyle alignment.", field: "Compatibility questionnaire" },
  { title: "Privacy controls", body: "Set separate visibility for profile, recovery, assessment, and mental-health information.", field: "Matches only" },
  { title: "Photo verification", body: "Identity verification can be enabled before public launch.", field: "Verification pending" },
  { title: "Preview", body: "Review your profile before you start discovering people.", field: "Ready to explore" },
];

function score(questions: Question[], answers: Answers) {
  const totals: Record<string, number> = {};
  questions.forEach((q, i) => { totals[q.dimension] = (totals[q.dimension] || 0) + (answers[i] || 0); });
  return Object.entries(totals).sort((a, b) => b[1] - a[1]);
}

function Assessment({ questions, answers, setAnswers, resultLabel }: {
  questions: Question[];
  answers: Answers;
  setAnswers: (answers: Answers) => void;
  resultLabel: (key: string) => string;
}) {
  const ranking = useMemo(() => score(questions, answers), [questions, answers]);
  const complete = Object.keys(answers).length === questions.length;
  return (
    <div className="assessmentWrap">
      <div className="assessmentScale"><span>Strongly disagree</span><span>Strongly agree</span></div>
      {questions.map((q, i) => (
        <div className="assessmentQuestion" key={q.text}>
          <p><strong>{i + 1}.</strong> {q.text}</p>
          <div className="likertRow" role="radiogroup" aria-label={q.text}>
            {([1,2,3,4,5] as Likert[]).map(v => (
              <button key={v} type="button" className={answers[i] === v ? "likert active" : "likert"} onClick={() => setAnswers({...answers, [i]: v})} aria-pressed={answers[i] === v}>{v}</button>
            ))}
          </div>
        </div>
      ))}
      {complete && ranking[0] && (
        <div className="assessmentResult">
          <div className="eyebrow">Your current reflection</div>
          <h2>{resultLabel(ranking[0][0])}</h2>
          <p>This result summarizes your answers today. People can show more than one pattern, and results may change with experience and context.</p>
          {ranking[1] && <p><strong>Secondary theme:</strong> {resultLabel(ranking[1][0])}</p>}
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [stepAnswers, setStepAnswers] = useState<Record<number, string>>({});
  const [attachmentAnswers, setAttachmentAnswers] = useState<Answers>({});
  const [enneagramAnswers, setEnneagramAnswers] = useState<Answers>({});
  const current = steps[step];
  const attachmentComplete = Object.keys(attachmentAnswers).length === attachmentQuestions.length;
  const enneagramComplete = Object.keys(enneagramAnswers).length === enneagramQuestions.length;
  const canContinue = step === 0 ? ageConfirmed : step === 6 ? attachmentComplete : step === 7 ? enneagramComplete : true;

  return (
    <main className="onboardingShell">
      <section className={step === 6 || step === 7 ? "onboardingPanel assessmentPanel" : "onboardingPanel"}>
        <Link href="/" className="brand">Recovery in Love</Link>
        <div className="progressTrack"><div style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
        <div className="eyebrow">Step {step + 1} of {steps.length}</div>
        <h1>{current.title}</h1>
        <p className="sectionIntro">{current.body}</p>

        {step === 6 ? (
          <Assessment questions={attachmentQuestions} answers={attachmentAnswers} setAnswers={setAttachmentAnswers} resultLabel={(key) => attachmentNames[key]} />
        ) : step === 7 ? (
          <Assessment questions={enneagramQuestions} answers={enneagramAnswers} setAnswers={setEnneagramAnswers} resultLabel={(key) => typeNames[key]} />
        ) : (
          <div className="onboardingField">
            <label>{current.field}</label>
            {step === 0 ? (
              <label className="checkRow"><input type="checkbox" checked={ageConfirmed} onChange={(e) => setAgeConfirmed(e.target.checked)} /> Yes, I am 18+</label>
            ) : (
              <input
                key={step}
                value={stepAnswers[step] ?? ""}
                onChange={(e) => setStepAnswers((answers) => ({ ...answers, [step]: e.target.value }))}
                placeholder={current.field}
                autoComplete="off"
              />
            )}
          </div>
        )}

        <div className="onboardingActions">
          <button className="secondaryButton" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>Back</button>
          {step < steps.length - 1 ? (
            <button className="primaryButton" disabled={!canContinue} onClick={() => canContinue && setStep((s) => s + 1)}>
              {step === 6 || step === 7 ? (canContinue ? "Save result & continue" : "Answer all questions") : "Continue"}
            </button>
          ) : (
            <Link className="primaryButton" href="/discover">Start matching</Link>
          )}
        </div>
      </section>
    </main>
  );
}

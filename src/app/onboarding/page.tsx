"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  { title: "Age confirmation", body: "Love in Recovery is for adults 18 and older.", field: "I confirm I am 18 or older" },
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
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [form, setForm] = useState({ firstName:"", birthDate:"", city:"", region:"", relationshipGoal:"Long-term relationship", recoveryPreference:"Sober partner preferred", mentalHealthVisibility:"private", recoveryVisibility:"matches" });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [attachmentAnswers, setAttachmentAnswers] = useState<Answers>({});
  const [enneagramAnswers, setEnneagramAnswers] = useState<Answers>({});
  const current = steps[step];
  const attachmentComplete = Object.keys(attachmentAnswers).length === attachmentQuestions.length;
  const enneagramComplete = Object.keys(enneagramAnswers).length === enneagramQuestions.length;
  const age = form.birthDate ? (() => { const b=new Date(form.birthDate+"T00:00:00"),t=new Date(); let a=t.getFullYear()-b.getFullYear(); if(t.getMonth()<b.getMonth()||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate()))a--; return a; })() : 0;
  const basicComplete = !!form.firstName.trim() && !!form.birthDate && age >= 18;
  const canContinue = step === 0 ? ageConfirmed : step === 1 ? basicComplete : step === 6 ? attachmentComplete : step === 7 ? enneagramComplete : true;

  const updateForm = (key: keyof typeof form, value: string) => setForm(v => ({...v,[key]:value}));

  async function finishOnboarding() {
    setSaving(true); setNotice("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); setNotice("Please sign in again before finishing your profile."); return; }
    const { error: profileError } = await supabase.from("profiles").upsert({ id:user.id, first_name:form.firstName.trim(), birth_date:form.birthDate, city:form.city.trim()||null, region:form.region.trim()||null, relationship_goal:form.relationshipGoal, updated_at:new Date().toISOString() });
    if (profileError) { setSaving(false); setNotice(profileError.message); return; }
    const { error: recoveryError } = await supabase.from("recovery_profiles").upsert({ user_id:user.id, wants_sober_partner:form.recoveryPreference==="Sober partner preferred", wants_partner_in_recovery:form.recoveryPreference==="Someone in recovery", visibility:form.recoveryVisibility, updated_at:new Date().toISOString() });
    if (recoveryError) { setSaving(false); setNotice(recoveryError.message); return; }
    await supabase.from("mental_health_profiles").upsert({ user_id:user.id, visibility:form.mentalHealthVisibility, updated_at:new Date().toISOString() });
    const ar=score(attachmentQuestions,attachmentAnswers), er=score(enneagramQuestions,enneagramAnswers);
    await supabase.from("assessment_results").upsert({ user_id:user.id, assessment_type:"attachment", provider:"Love in Recovery original self-reflection", provider_version:"1", result_label:ar[0]?attachmentNames[ar[0][0]]:null, result_json:{ranking:ar.map(([dimension,score])=>({dimension,score}))}, completed_at:new Date().toISOString() },{onConflict:"user_id,assessment_type,provider"});
    await supabase.from("assessment_results").upsert({ user_id:user.id, assessment_type:"enneagram-style", provider:"Love in Recovery original self-reflection", provider_version:"1", result_label:er[0]?typeNames[er[0][0]]:null, result_json:{ranking:er.map(([dimension,score])=>({dimension,score}))}, completed_at:new Date().toISOString() },{onConflict:"user_id,assessment_type,provider"});
    setSaving(false); router.push("/discover");
  }

  return (
    <main className="onboardingShell">
      <section className={step === 6 || step === 7 ? "onboardingPanel assessmentPanel" : "onboardingPanel"}>
        <Link href="/" className="brand">Love in Recovery</Link>
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
            {step === 0 && <label className="checkRow"><input type="checkbox" checked={ageConfirmed} onChange={(e) => setAgeConfirmed(e.target.checked)} /> Yes, I am 18+</label>}
            {step === 1 && <div className="editGrid"><label>First name<input value={form.firstName} onChange={e=>updateForm("firstName",e.target.value)} /></label><label>Date of birth<input type="date" value={form.birthDate} onChange={e=>updateForm("birthDate",e.target.value)} /></label><label>City<input value={form.city} onChange={e=>updateForm("city",e.target.value)} /></label><label>State / region<input value={form.region} onChange={e=>updateForm("region",e.target.value)} /></label>{form.birthDate && age < 18 && <p className="fullField saveNotice">You must be 18 or older.</p>}</div>}
            {step === 2 && <label>Relationship goal<select value={form.relationshipGoal} onChange={e=>updateForm("relationshipGoal",e.target.value)}><option>Long-term relationship</option><option>Dating with intention</option><option>Open to exploring</option><option>Friendship first</option></select></label>}
            {step === 3 && <label>Partner recovery preference<select value={form.recoveryPreference} onChange={e=>updateForm("recoveryPreference",e.target.value)}><option>Sober partner preferred</option><option>Someone in recovery</option><option>Someone who understands recovery</option><option>Open / depends on the person</option></select></label>}
            {step === 4 && <p className="saveNotice">Relationship goal selected: {form.relationshipGoal}. You can change it later from Edit Profile.</p>}
            {step === 5 && <label>Mental-health information visibility<select value={form.mentalHealthVisibility} onChange={e=>updateForm("mentalHealthVisibility",e.target.value)}><option value="private">Private</option><option value="matches">Matches only</option></select></label>}
            {step === 8 && <p className="saveNotice">Your assessment results will support future compatibility explanations without being treated as a clinical prediction.</p>}
            {step === 9 && <label>Recovery information visibility<select value={form.recoveryVisibility} onChange={e=>updateForm("recoveryVisibility",e.target.value)}><option value="private">Private</option><option value="matches">Matches only</option><option value="everyone">Everyone</option></select></label>}
            {step === 10 && <p className="saveNotice">Photo verification is not required in this build yet. You can continue.</p>}
            {step === 11 && <div className="settingsCard"><div className="settingRow"><span>Name</span><strong>{form.firstName}</strong></div><div className="settingRow"><span>Location</span><strong>{[form.city,form.region].filter(Boolean).join(", ")||"Not shared"}</strong></div><div className="settingRow"><span>Relationship goal</span><strong>{form.relationshipGoal}</strong></div><div className="settingRow"><span>Recovery preference</span><strong>{form.recoveryPreference}</strong></div></div>}
          </div>
        )}
        {notice && <div className="saveNotice">{notice}</div>}

        <div className="onboardingActions">
          <button className="secondaryButton" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>Back</button>
          {step < steps.length - 1 ? (
            <button className="primaryButton" disabled={!canContinue} onClick={() => canContinue && setStep((s) => s + 1)}>
              {step === 6 || step === 7 ? (canContinue ? "Save result & continue" : "Answer all questions") : "Continue"}
            </button>
          ) : (
            <button className="primaryButton" disabled={saving || !basicComplete || !attachmentComplete || !enneagramComplete} onClick={finishOnboarding}>{saving ? "Saving..." : "Save profile & start matching"}</button>
          )}
        </div>
      </section>
    </main>
  );
}

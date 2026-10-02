"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AppNav from "@/components/AppNav";

type Likert = 1 | 2 | 3 | 4 | 5;
type Question = { text: string; dimension: string };
type Answers = Record<number, Likert>;

const attachmentQuestions: Question[] = [
  { text:"I feel comfortable depending on someone I trust.", dimension:"secure" },
  { text:"I can talk openly about my needs without fearing the relationship will end.", dimension:"secure" },
  { text:"When someone I care about seems distant, I quickly worry I may lose them.", dimension:"anxious" },
  { text:"I often need reassurance that a partner still cares about me.", dimension:"anxious" },
  { text:"I prefer to handle difficult feelings on my own rather than rely on a partner.", dimension:"avoidant" },
  { text:"Too much emotional closeness can make me want more distance.", dimension:"avoidant" },
  { text:"I want closeness, but I sometimes pull away when it begins to feel vulnerable.", dimension:"fearful" },
  { text:"Past hurt can make it difficult for me to fully trust even when I want connection.", dimension:"fearful" },
  { text:"During conflict, I can stay connected while also giving myself and my partner space.", dimension:"secure" },
  { text:"Unanswered messages can make me assume something is wrong between us.", dimension:"anxious" },
  { text:"I sometimes minimize my needs so I do not have to depend on someone else.", dimension:"avoidant" },
  { text:"I may alternate between seeking closeness and protecting myself by withdrawing.", dimension:"fearful" },
];

const enneagramQuestions: Question[] = [
  { text:"I notice what could be improved and feel responsible for doing things the right way.", dimension:"1" },
  { text:"Being helpful and needed by people I care about feels important to me.", dimension:"2" },
  { text:"I am motivated by goals, progress, and being effective.", dimension:"3" },
  { text:"I value authenticity and want my relationships to feel emotionally meaningful.", dimension:"4" },
  { text:"I like to understand things deeply and need enough privacy and personal space.", dimension:"5" },
  { text:"I think ahead about risks and value loyalty, preparation, and trust.", dimension:"6" },
  { text:"I am drawn to possibilities, variety, and experiences that keep life engaging.", dimension:"7" },
  { text:"I protect my independence and am comfortable being direct when something matters.", dimension:"8" },
  { text:"I prefer harmony and often look for common ground during disagreement.", dimension:"9" },
  { text:"I can be hard on myself when I fall short of my standards.", dimension:"1" },
  { text:"I often notice what others need before they ask.", dimension:"2" },
  { text:"I naturally adapt my approach to accomplish what I set out to do.", dimension:"3" },
  { text:"I spend time understanding my feelings and what makes my experience unique.", dimension:"4" },
  { text:"I conserve my time and energy so I can think before I engage.", dimension:"5" },
  { text:"Consistency and knowing where I stand help me feel secure in relationships.", dimension:"6" },
  { text:"When things feel limiting, I quickly look for another option or a positive direction.", dimension:"7" },
  { text:"I would rather address a problem directly than leave an important issue unspoken.", dimension:"8" },
  { text:"I sometimes put my own priorities aside to keep the peace.", dimension:"9" },
];

const attachmentNames: Record<string,string> = { secure:"Secure-leaning", anxious:"Anxious-leaning", avoidant:"Avoidant-leaning", fearful:"Fearful-avoidant-leaning" };
const typeNames: Record<string,string> = {
 "1":"Type 1 · Principled","2":"Type 2 · Supportive","3":"Type 3 · Driven","4":"Type 4 · Individual","5":"Type 5 · Observant",
 "6":"Type 6 · Loyal","7":"Type 7 · Exploratory","8":"Type 8 · Assertive","9":"Type 9 · Harmonizing"
};

function score(qs:Question[], answers:Answers) {
 const totals:Record<string,number>={};
 qs.forEach((q,i)=>totals[q.dimension]=(totals[q.dimension]||0)+(answers[i]||0));
 return Object.entries(totals).sort((a,b)=>b[1]-a[1]);
}

function Quiz({questions,names,assessmentType,onSaved}:{questions:Question[];names:Record<string,string>;assessmentType:string;onSaved:()=>void}) {
 const [answers,setAnswers]=useState<Answers>({});
 const ranking=useMemo(()=>score(questions,answers),[questions,answers]);
 const complete=Object.keys(answers).length===questions.length;
 const [saving,setSaving]=useState(false); const [saved,setSaved]=useState(false); const [notice,setNotice]=useState("");
 async function saveResult(){ if(!complete||!ranking[0]||saved)return; setSaving(true); setNotice(""); const supabase=createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user){setSaving(false);return setNotice("Please sign in to save your result.");} const {error}=await supabase.from("assessment_results").insert({user_id:user.id,assessment_type:assessmentType,provider:"Love in Recovery",provider_version:"1.0",result_label:names[ranking[0][0]],result_json:{ranking:ranking.map(([dimension,score])=>({dimension,score}))},completed_at:new Date().toISOString()}); setSaving(false); if(error)return setNotice(error.message); setSaved(true); setNotice("Saved to your profile."); onSaved(); }
 return <div className="assessmentWrap">
   <div className="assessmentScale"><span>Strongly disagree</span><span>Strongly agree</span></div>
   {questions.map((q,i)=><div className="assessmentQuestion" key={q.text}>
     <p><strong>{i+1}.</strong> {q.text}</p>
     <div className="likertRow">{([1,2,3,4,5] as Likert[]).map(v=><button type="button" key={v} className={answers[i]===v?"likert active":"likert"} onClick={()=>setAnswers({...answers,[i]:v})}>{v}</button>)}</div>
   </div>)}
   {complete && ranking[0] && <div className="assessmentResult"><div className="eyebrow">Your reflection</div><h2>{names[ranking[0][0]]}</h2>
     {ranking[1] && <p><strong>Secondary theme:</strong> {names[ranking[1][0]]}</p>}
     <p>This is a self-reflection result, not a diagnosis. People may show more than one pattern and results can change over time.</p><button className="primaryButton" type="button" disabled={saving||saved} onClick={saveResult}>{saved?"Saved to profile":saving?"Saving...":"Save result to profile"}</button>{notice&&<p className="assessmentSaveNotice">{notice}</p>}
   </div>}
 </div>;
}

export default function AssessmentsPage(){
 const [active,setActive]=useState<"attachment"|"enneagram"|null>(null);
 const [quizKey,setQuizKey]=useState(0);
 return <main><AppNav/><section className="appPage">
   <div className="eyebrow">Know yourself better</div><h1>Assessments</h1>
   <p className="sectionIntro">Take either self-reflection questionnaire directly. You can come back and retake them later.</p>
   {!active && <div className="assessmentChoiceGrid">
     <button className="assessmentChoice" onClick={()=>{setQuizKey(k=>k+1);setActive("attachment")}}><strong>Attachment Style</strong><span>12 questions about closeness, trust, reassurance, and independence.</span><b>Take assessment →</b></button>
     <button className="assessmentChoice" onClick={()=>{setQuizKey(k=>k+1);setActive("enneagram")}}><strong>Enneagram-style</strong><span>18 original questions exploring nine personality themes.</span><b>Take assessment →</b></button>
   </div>}
   {active && <><button className="secondaryButton assessmentBack" onClick={()=>setActive(null)}>← Back to assessments</button>
     <div className="assessmentPanel standaloneAssessment"><h2>{active==="attachment"?"Attachment Style Self-Reflection":"Enneagram-Style Self-Reflection"}</h2>
       <p>{active==="attachment"?"This self-reflection explores relationship patterns; it is not a clinical diagnosis.":"This is an original personality self-reflection and is not an official or clinical Enneagram instrument."}</p>
       <Quiz key={quizKey} questions={active==="attachment"?attachmentQuestions:enneagramQuestions} names={active==="attachment"?attachmentNames:typeNames} assessmentType={active==="attachment"?"attachment":"enneagram"} onSaved={()=>{}}/>
     </div></>}
 </section></main>;
}

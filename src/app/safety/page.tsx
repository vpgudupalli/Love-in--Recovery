"use client";
import AppNav from "@/components/AppNav";
import {useEffect,useMemo,useState} from "react";
import {createClient} from "@/lib/supabase/client";
const categories=["Fake profile","Impersonation","Harassment","Threats","Sexual harassment","Scam/fraud","Financial solicitation","Misrepresentation","Relationship-status concern","Substance-related safety concern","Hate/abusive behavior","Underage user","Other"];
type Person={id:string;first_name:string};
export default function SafetyPage(){
 const supabase=useMemo(()=>createClient(),[]);const [people,setPeople]=useState<Person[]>([]);const [target,setTarget]=useState("");const [category,setCategory]=useState(categories[0]);const [description,setDescription]=useState("");const [notice,setNotice]=useState("");const [busy,setBusy]=useState(false);
 useEffect(()=>{(async()=>{const {data:{user}}=await supabase.auth.getUser();if(!user){setNotice("Please sign in to use the Safety Center.");return;}const {data}=await supabase.from("profiles").select("id,first_name").neq("id",user.id).order("first_name");setPeople((data||[]) as Person[])})()},[supabase]);
 async function submit(){const {data:{user}}=await supabase.auth.getUser();if(!user)return setNotice("Please sign in.");if(!description.trim())return setNotice("Please describe the concern.");setBusy(true);const {error}=await supabase.from("reports").insert({reporter_id:user.id,reported_user_id:target||null,category,description:description.trim(),status:"open"});setBusy(false);if(error)return setNotice(error.message);setDescription("");setTarget("");setNotice("Your report was submitted privately for review.");}
 async function block(){const {data:{user}}=await supabase.auth.getUser();if(!user||!target)return setNotice("Choose a member first.");setBusy(true);const {error}=await supabase.from("blocks").upsert({blocker_id:user.id,blocked_id:target},{onConflict:"blocker_id,blocked_id"});setBusy(false);setNotice(error?error.message:"Member blocked. Their profile will be unavailable to you after the feed refreshes.");}
 return <main><AppNav/><section className="appPage narrow"><div className="eyebrow">Safety Center</div><h1>Private reporting and blocking.</h1><p className="sectionIntro">Reports are stored privately for authorized review. They are not posted publicly.</p>{notice&&<p className="saveNotice">{notice}</p>}<div className="settingsCard formCard">
 <label>Member involved (optional)<select value={target} onChange={e=>setTarget(e.target.value)}><option value="">No specific member</option>{people.map(p=><option value={p.id} key={p.id}>{p.first_name}</option>)}</select></label>
 <label>What are you reporting?<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(x=><option key={x}>{x}</option>)}</select></label>
 <label>Tell us what happened<textarea rows={6} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe the concern. Avoid unnecessary private information."/></label>
 <button className="primaryButton formButton" disabled={busy} onClick={submit}>{busy?"Submitting...":"Submit private report"}</button>
 {target&&<button className="secondaryButton formButton" disabled={busy} onClick={block}>Block this member</button>}
 </div><div className="notice safetyNotice"><h2>Immediate danger?</h2><p>Recovery in Love reporting is not an emergency service. If there is immediate danger, contact local emergency services.</p></div></section></main>;
}
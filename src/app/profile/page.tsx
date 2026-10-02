"use client";

import { useEffect, useMemo, useState } from "react";
import AppNav from "@/components/AppNav";
import { createClient } from "@/lib/supabase/client";

type Form = { name:string; birthDate:string; city:string; region:string; bio:string; relationshipGoal:string };
const blank:Form={name:"",birthDate:"",city:"",region:"",bio:"",relationshipGoal:"Long-term relationship"};

function age(d:string){ if(!d)return ""; const b=new Date(d+"T00:00:00"),t=new Date(); let a=t.getFullYear()-b.getFullYear(); if(t.getMonth()<b.getMonth()||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate()))a--; return String(a); }

export default function ProfilePage(){
 const supabase=useMemo(()=>createClient(),[]);
 const [profile,setProfile]=useState<Form>(blank),[draft,setDraft]=useState<Form>(blank);
 const [editing,setEditing]=useState(false),[loading,setLoading]=useState(true),[notice,setNotice]=useState("");

 useEffect(()=>{(async()=>{
  const {data:{user}}=await supabase.auth.getUser();
  if(!user){setNotice("Please sign in to view your profile.");setLoading(false);return;}
  const {data,error}=await supabase.from("profiles").select("first_name,birth_date,city,region,bio,relationship_goal").eq("id",user.id).maybeSingle();
  if(error){setNotice(error.message);setLoading(false);return;}
  if(data){const v={name:data.first_name||"",birthDate:data.birth_date||"",city:data.city||"",region:data.region||"",bio:data.bio||"",relationshipGoal:data.relationship_goal||"Long-term relationship"};setProfile(v);setDraft(v);}
  else setNotice("Complete onboarding to create your profile.");
  setLoading(false);
 })()},[supabase]);

 const change=(k:keyof Form,v:string)=>setDraft(x=>({...x,[k]:v}));
 async function save(){
  const {data:{user}}=await supabase.auth.getUser(); if(!user)return setNotice("Please sign in.");
  if(!draft.name.trim()||!draft.birthDate)return setNotice("First name and date of birth are required.");
  if(Number(age(draft.birthDate))<18)return setNotice("Recovery in Love is for adults 18 and older.");
  const {error}=await supabase.from("profiles").upsert({id:user.id,first_name:draft.name.trim(),birth_date:draft.birthDate,city:draft.city.trim()||null,region:draft.region.trim()||null,bio:draft.bio.trim()||null,relationship_goal:draft.relationshipGoal,updated_at:new Date().toISOString()});
  if(error)return setNotice(error.message);
  setProfile(draft);setEditing(false);setNotice("Profile changes saved to your account.");
 }
 if(loading)return <main><AppNav/><section className="appPage narrow"><p>Loading profile...</p></section></main>;
 return <main><AppNav/><section className="appPage narrow">
  <div className="profileTitleRow"><div><div className="eyebrow">Profile</div><h1>{editing?"Edit profile":"Profile preview"}</h1></div>{!editing&&<button className="primaryButton" onClick={()=>{setDraft(profile);setEditing(true)}}>Edit profile</button>}</div>
  {notice&&<div className="saveNotice">{notice}</div>}
  {editing?<div className="editProfileCard"><div className="editGrid">
   <label>First name<input value={draft.name} onChange={e=>change("name",e.target.value)}/></label>
   <label>Date of birth<input type="date" value={draft.birthDate} onChange={e=>change("birthDate",e.target.value)}/></label>
   <label>City<input value={draft.city} onChange={e=>change("city",e.target.value)}/></label>
   <label>State / region<input value={draft.region} onChange={e=>change("region",e.target.value)}/></label>
   <label className="fullField">About me<textarea rows={4} value={draft.bio} onChange={e=>change("bio",e.target.value)}/></label>
   <label>Relationship goal<select value={draft.relationshipGoal} onChange={e=>change("relationshipGoal",e.target.value)}><option>Long-term relationship</option><option>Dating with intention</option><option>Open to exploring</option><option>Friendship first</option></select></label>
  </div><div className="editActions"><button className="secondaryButton" onClick={()=>{setDraft(profile);setEditing(false)}}>Cancel</button><button className="primaryButton" onClick={save}>Save changes</button></div></div>
  :<div className="profilePreview"><div className="profilePreviewPhoto"/><div><h2>{profile.name||"Your profile"}{profile.birthDate?`, ${age(profile.birthDate)}`:""}</h2><p>{[profile.city,profile.region].filter(Boolean).join(", ")||"Location not added"} · {profile.relationshipGoal}</p><p>{profile.bio||"Add an About Me so people can get to know you."}</p></div></div>}
 </section></main>;
}
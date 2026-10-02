"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import { Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Form = { name:string; birthDate:string; city:string; region:string; bio:string; relationshipGoal:string };
const blank:Form={name:"",birthDate:"",city:"",region:"",bio:"",relationshipGoal:"Long-term relationship"};

function age(d:string){ if(!d)return ""; const b=new Date(d+"T00:00:00"),t=new Date(); let a=t.getFullYear()-b.getFullYear(); if(t.getMonth()<b.getMonth()||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate()))a--; return String(a); }

export default function ProfilePage(){
 const supabase=useMemo(()=>createClient(),[]);
 const [profile,setProfile]=useState<Form>(blank),[draft,setDraft]=useState<Form>(blank);
 const [editing,setEditing]=useState(false),[loading,setLoading]=useState(true),[notice,setNotice]=useState("");
 const [photos,setPhotos]=useState<string[]>([]),[uploading,setUploading]=useState(false);
 const [assessmentLatest,setAssessmentLatest]=useState<Record<string,{label:string;date:string}>>({});
 const [useAssessments,setUseAssessments]=useState(false),[assessmentVisibility,setAssessmentVisibility]=useState("private");

 useEffect(()=>{(async()=>{
  const {data:{user}}=await supabase.auth.getUser();
  if(!user){setNotice("Please sign in to view your profile.");setLoading(false);return;}
  const {data,error}=await supabase.from("profiles").select("first_name,birth_date,city,region,bio,relationship_goal,use_assessments_for_matching,assessment_visibility").eq("id",user.id).maybeSingle();
  if(error){setNotice(error.message);setLoading(false);return;}
  if(data){const v={name:data.first_name||"",birthDate:data.birth_date||"",city:data.city||"",region:data.region||"",bio:data.bio||"",relationshipGoal:data.relationship_goal||"Long-term relationship"};setProfile(v);setDraft(v);setUseAssessments(Boolean(data.use_assessments_for_matching));setAssessmentVisibility(data.assessment_visibility||"private");}
  else setNotice("Complete onboarding to create your profile.");
  const {data:photoRows}=await supabase.from("profile_photos").select("id,storage_path,position").eq("user_id",user.id).order("position");
  if(photoRows){const urls=photoRows.map((p:any)=>supabase.storage.from("profile-photos").getPublicUrl(p.storage_path).data.publicUrl);setPhotos(urls);}
  const {data:results}=await supabase.from("assessment_results").select("assessment_type,result_label,completed_at").eq("user_id",user.id).order("completed_at",{ascending:false});
  if(results){const latest:Record<string,{label:string;date:string}>={}; for(const r of results as any[]){if(!latest[r.assessment_type])latest[r.assessment_type]={label:r.result_label||"Completed",date:r.completed_at};} setAssessmentLatest(latest);}
  setLoading(false);
 })()},[supabase]);

 const change=(k:keyof Form,v:string)=>setDraft(x=>({...x,[k]:v}));
 async function uploadPhoto(file:File){
  if(photos.length>=6)return setNotice("You can add up to 6 photos.");
  if(!file.type.startsWith("image/"))return setNotice("Please choose an image file.");
  if(file.size>8*1024*1024)return setNotice("Each photo must be 8 MB or smaller.");
  setUploading(true); setNotice("");
  const {data:{user}}=await supabase.auth.getUser(); if(!user){setUploading(false);return setNotice("Please sign in.");}
  const ext=(file.name.split(".").pop()||"jpg").replace(/[^a-zA-Z0-9]/g,""); const path=`${user.id}/${crypto.randomUUID()}.${ext}`;
  const {error:upErr}=await supabase.storage.from("profile-photos").upload(path,file,{contentType:file.type});
  if(upErr){setUploading(false);return setNotice(upErr.message);}
  const {error:dbErr}=await supabase.from("profile_photos").insert({user_id:user.id,storage_path:path,position:photos.length});
  if(dbErr){await supabase.storage.from("profile-photos").remove([path]);setUploading(false);return setNotice(dbErr.message);}
  const url=supabase.storage.from("profile-photos").getPublicUrl(path).data.publicUrl; setPhotos(v=>[...v,url]);setUploading(false);setNotice("Photo added.");
 }
 async function removePhoto(index:number){
  const {data:{user}}=await supabase.auth.getUser(); if(!user)return;
  const {data:rows}=await supabase.from("profile_photos").select("id,storage_path,position").eq("user_id",user.id).order("position"); const row=rows?.[index]; if(!row)return;
  await supabase.storage.from("profile-photos").remove([row.storage_path]); await supabase.from("profile_photos").delete().eq("id",row.id);
  const remaining=(rows||[]).filter((_:any,i:number)=>i!==index); for(let i=0;i<remaining.length;i++)await supabase.from("profile_photos").update({position:i}).eq("id",remaining[i].id);
  setPhotos(v=>v.filter((_,i)=>i!==index));setNotice("Photo removed.");
 }
 async function save(){
  const {data:{user}}=await supabase.auth.getUser(); if(!user)return setNotice("Please sign in.");
  if(!draft.name.trim()||!draft.birthDate)return setNotice("First name and date of birth are required.");
  if(Number(age(draft.birthDate))<18)return setNotice("Recovery in Love is for adults 18 and older.");
  const {error}=await supabase.from("profiles").upsert({id:user.id,first_name:draft.name.trim(),birth_date:draft.birthDate,city:draft.city.trim()||null,region:draft.region.trim()||null,bio:draft.bio.trim()||null,relationship_goal:draft.relationshipGoal,use_assessments_for_matching:useAssessments,assessment_visibility:assessmentVisibility,updated_at:new Date().toISOString()});
  if(error)return setNotice(error.message);
  setProfile(draft);setEditing(false);setNotice("Profile changes saved to your account.");
 }
 if(loading)return <main><AppNav/><section className="appPage narrow"><p>Loading profile...</p><div className="profileAssessments"><div className="profileAssessmentHeader"><div><div className="eyebrow">Relationship style</div><h2>Your assessments</h2><p>Your newest result is shown here. Previous results remain saved in your assessment history.</p></div><Link className="secondaryButton" href="/assessments">Take or retake assessments</Link></div><div className="profileAssessmentGrid"><div className="profileAssessmentCard"><strong>Attachment Style</strong>{assessmentLatest.attachment?<><span className="completedBadge">Completed</span><h3>{assessmentLatest.attachment.label}</h3><small>Latest: {new Date(assessmentLatest.attachment.date).toLocaleDateString()}</small></>:<><span className="notCompletedBadge">Not completed</span><p>Take the assessment to add your latest relationship-style result.</p></>}</div><div className="profileAssessmentCard"><strong>Enneagram-style</strong>{assessmentLatest.enneagram?<><span className="completedBadge">Completed</span><h3>{assessmentLatest.enneagram.label}</h3><small>Latest: {new Date(assessmentLatest.enneagram.date).toLocaleDateString()}</small></>:<><span className="notCompletedBadge">Not completed</span><p>Take the assessment to add your latest personality theme.</p></>}</div></div></div>
 </section></main>;
 return <main><AppNav/><section className="appPage narrow">
  <div className="profileTitleRow"><div><div className="eyebrow">Profile</div><h1>{editing?"Edit profile":"Profile preview"}</h1></div>{!editing&&<button className="primaryButton" onClick={()=>{setDraft(profile);setEditing(true)}}>Edit profile</button>}</div>
  {notice&&<div className="saveNotice">{notice}</div>}
  {editing?<div className="editProfileCard"><div className="profilePhotoEditor"><div><h2>Your photos</h2><p>Add up to 6 photos. Your first photo is your main Discover photo.</p></div><div className="hingePhotoGrid">{Array.from({length:6}).map((_,i)=><div className="hingePhotoSlot" key={i}>{photos[i]?<><img src={photos[i]} alt={`Profile photo ${i+1}`}/><button type="button" className="photoRemove" onClick={()=>removePhoto(i)} aria-label="Remove photo"><X size={16}/></button>{i===0&&<span className="mainPhotoBadge">Main</span>}</>:<label className="photoAdd" aria-label={`Add photo ${i+1}`}><Plus size={28}/><span>{i===0?"Main photo":"Add photo"}</span><input type="file" accept="image/*" disabled={uploading||i>photos.length} onChange={e=>{const file=e.target.files?.[0];if(file)uploadPhoto(file);e.currentTarget.value=""}}/></label>}</div>)}</div></div><div className="editGrid">
   <label>First name<input value={draft.name} onChange={e=>change("name",e.target.value)}/></label>
   <label>Date of birth<input type="date" value={draft.birthDate} onChange={e=>change("birthDate",e.target.value)}/></label>
   <label>City<input value={draft.city} onChange={e=>change("city",e.target.value)}/></label>
   <label>State / region<input value={draft.region} onChange={e=>change("region",e.target.value)}/></label>
   <label className="fullField">About me<textarea rows={4} value={draft.bio} onChange={e=>change("bio",e.target.value)}/></label>
   <label>Relationship goal<select value={draft.relationshipGoal} onChange={e=>change("relationshipGoal",e.target.value)}><option>Long-term relationship</option><option>Dating with intention</option><option>Open to exploring</option><option>Friendship first</option></select></label>
   <label>Assessment visibility<select value={assessmentVisibility} onChange={e=>setAssessmentVisibility(e.target.value)}><option value="private">Private</option><option value="matches">Matches only</option><option value="everyone">Other members</option></select></label>
   <label className="claimConsent fullField"><input type="checkbox" checked={useAssessments} onChange={e=>setUseAssessments(e.target.checked)}/><span>Use my assessment themes as optional matching context. Raw answers stay private.</span></label>
  </div><div className="editActions"><button className="secondaryButton" onClick={()=>{setDraft(profile);setEditing(false)}}>Cancel</button><button className="primaryButton" onClick={save}>Save changes</button></div></div>
  :<div className="profilePreview"><div className="profilePreviewPhoto">{photos[0]&&<img src={photos[0]} alt="Main profile photo"/>}</div><div><h2>{profile.name||"Your profile"}{profile.birthDate?`, ${age(profile.birthDate)}`:""}</h2><p>{[profile.city,profile.region].filter(Boolean).join(", ")||"Location not added"} · {profile.relationshipGoal}</p><p>{profile.bio||"Add an About Me so people can get to know you."}</p></div></div>}
 </section></main>;
}
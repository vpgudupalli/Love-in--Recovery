"use client";
import {useEffect,useMemo,useState} from "react";
import AppNav from "@/components/AppNav";
import {createClient} from "@/lib/supabase/client";
type Recovery={recovery_status:string;recovery_start_date:string;display_sobriety_duration:boolean;continuous_sobriety:boolean;recovery_approach:string;own_substance_boundary:string;partner_substance_boundary:string;wants_partner_in_recovery:boolean;wants_sober_partner:boolean;visibility:string};
const blank:Recovery={recovery_status:"",recovery_start_date:"",display_sobriety_duration:true,continuous_sobriety:false,recovery_approach:"",own_substance_boundary:"",partner_substance_boundary:"",wants_partner_in_recovery:false,wants_sober_partner:false,visibility:"matches"};
export default function RecoveryPage(){
 const supabase=useMemo(()=>createClient(),[]);const [form,setForm]=useState(blank);const [notice,setNotice]=useState("");const [loading,setLoading]=useState(true);
 useEffect(()=>{(async()=>{const {data:{user}}=await supabase.auth.getUser();if(!user){setNotice("Please sign in.");setLoading(false);return;}const {data,error}=await supabase.from("recovery_profiles").select("*").eq("user_id",user.id).maybeSingle();if(error)setNotice(error.message);if(data)setForm({...blank,...data});setLoading(false)})()},[supabase]);
 const set=(k:keyof Recovery,v:any)=>setForm(x=>({...x,[k]:v}));
 async function save(){const {data:{user}}=await supabase.auth.getUser();if(!user)return;const {error}=await supabase.from("recovery_profiles").upsert({user_id:user.id,...form,updated_at:new Date().toISOString()});setNotice(error?error.message:"Recovery preferences saved privately.");}
 return <main><AppNav/><section className="appPage narrow"><div className="eyebrow">Recovery profile</div><h1>Your recovery preferences are yours to control.</h1><p className="sectionIntro">Recovery information is stored separately from your basic profile. You choose its visibility.</p>{notice&&<p className="saveNotice">{notice}</p>}{loading?<p>Loading...</p>:<div className="editProfileCard"><div className="editGrid">
 <label>Recovery status<select value={form.recovery_status} onChange={e=>set("recovery_status",e.target.value)}><option value="">Prefer not to say</option><option>In recovery</option><option>Sober / abstinent</option><option>Medication-supported recovery</option><option>Recovery ally</option></select></label>
 <label>Recovery start date<input type="date" value={form.recovery_start_date||""} onChange={e=>set("recovery_start_date",e.target.value)}/></label>
 <label>My substance boundary<input value={form.own_substance_boundary||""} onChange={e=>set("own_substance_boundary",e.target.value)} placeholder="Example: Completely abstinent"/></label>
 <label>Partner substance boundary<input value={form.partner_substance_boundary||""} onChange={e=>set("partner_substance_boundary",e.target.value)} placeholder="What feels safe for you?"/></label>
 <label>Recovery approach<input value={form.recovery_approach||""} onChange={e=>set("recovery_approach",e.target.value)} placeholder="Example: Open to multiple approaches"/></label>
 <label>Visibility<select value={form.visibility} onChange={e=>set("visibility",e.target.value)}><option value="private">Private</option><option value="matches">Matches only</option><option value="everyone">Other members</option></select></label>
 <label className="claimConsent"><input type="checkbox" checked={form.wants_partner_in_recovery} onChange={e=>set("wants_partner_in_recovery",e.target.checked)}/><span>I prefer a partner who understands recovery personally.</span></label>
 <label className="claimConsent"><input type="checkbox" checked={form.wants_sober_partner} onChange={e=>set("wants_sober_partner",e.target.checked)}/><span>I prefer a sober partner.</span></label>
 <label className="claimConsent"><input type="checkbox" checked={form.display_sobriety_duration} onChange={e=>set("display_sobriety_duration",e.target.checked)}/><span>Allow sobriety duration to be displayed when my visibility permits it.</span></label>
 </div><button className="primaryButton" onClick={save}>Save recovery preferences</button></div>}</section></main>;
}
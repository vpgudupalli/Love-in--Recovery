"use client";
import { useEffect,useMemo,useState } from "react";
import AppNav from "@/components/AppNav";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
type MatchItem={id:string;conversationId:string;name:string;goal:string|null};
export default function MatchesPage(){
 const supabase=useMemo(()=>createClient(),[]);
 const [items,setItems]=useState<MatchItem[]>([]);
 const [loading,setLoading]=useState(true);
 const [notice,setNotice]=useState("");
 const [busy,setBusy]=useState<string|null>(null);
 useEffect(()=>{(async()=>{
  const {data:{user}}=await supabase.auth.getUser();
  if(!user){setNotice("Please sign in to view matches.");setLoading(false);return;}
  const {data:matches,error}=await supabase.from("matches").select("id,user_a,user_b,matched_at").is("unmatched_at",null).or("user_a.eq."+user.id+",user_b.eq."+user.id).order("matched_at",{ascending:false});
  if(error){setNotice(error.message);setLoading(false);return;}
  const built:MatchItem[]=[];
  for(const match of matches||[]){
   const other=match.user_a===user.id?match.user_b:match.user_a;
   const {data:p}=await supabase.from("profiles").select("first_name,relationship_goal").eq("id",other).maybeSingle();
   const {data:conv}=await supabase.from("conversations").select("id").eq("match_id",match.id).maybeSingle();
   if(p&&conv)built.push({id:match.id,conversationId:conv.id,name:p.first_name,goal:p.relationship_goal});
  }
  setItems(built);setLoading(false);
 })()},[supabase]);
 async function unmatch(id:string,name:string){if(!window.confirm("Unmatch "+name+"? This will close the active connection."))return;setBusy(id);setNotice("");const {error}=await supabase.rpc("unmatch_user",{target_match_id:id});setBusy(null);if(error)return setNotice(error.message);setItems(v=>v.filter(x=>x.id!==id));setNotice("You unmatched "+name+".");}
 return <main><AppNav/><section className="appPage"><div className="eyebrow">Matches</div><h1>Your connections</h1>{loading&&<p>Loading matches...</p>}{notice&&<div className="saveNotice">{notice}</div>}{!loading&&!notice&&items.length===0&&<div className="emptyDiscover"><h2>No matches yet</h2><p>When you and another member like each other, the match will appear here.</p></div>}<div className="listCards">{items.map(x=><div className="listCard" key={x.id}><div className="avatar">{x.name[0]?.toUpperCase()}</div><div><strong>{x.name}</strong><p>{x.goal||"Active match"}</p></div><div className="matchActions"><Link className="secondaryButton" href={"/messages?conversation="+x.conversationId}>Message</Link><button className="secondaryButton" disabled={busy===x.id} onClick={()=>unmatch(x.id,x.name)}>{busy===x.id?"Unmatching...":"Unmatch"}</button></div></div>)}</div></section></main>;
}
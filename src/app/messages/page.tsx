"use client";
import AppNav from "@/components/AppNav";
import { useEffect,useMemo,useState } from "react";
import { Send,ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
type Msg={id:string;sender_id:string;body:string;created_at:string};
export default function MessagesPage(){
 const supabase=useMemo(()=>createClient(),[]); const [conversationId,setConversationId]=useState<string | null>(null);
 const [messages,setMessages]=useState<Msg[]>([]); const [draft,setDraft]=useState(""); const [userId,setUserId]=useState(""); const [name,setName]=useState("Match"); const [notice,setNotice]=useState("");
 async function load(){
  const {data:{user}}=await supabase.auth.getUser(); if(!user){setNotice("Please sign in.");return;} setUserId(user.id);
  if(!conversationId){setNotice("Choose a match from the Matches page to start messaging.");return;}
  const {data:conv}=await supabase.from("conversations").select("match_id").eq("id",conversationId).maybeSingle(); if(!conv){setNotice("Conversation unavailable.");return;}
  const {data:match}=await supabase.from("matches").select("user_a,user_b,unmatched_at").eq("id",conv.match_id).maybeSingle(); if(!match||match.unmatched_at){setNotice("This match is no longer active.");return;}
  const other=match.user_a===user.id?match.user_b:match.user_a; const {data:p}=await supabase.from("profiles").select("first_name").eq("id",other).maybeSingle(); if(p)setName(p.first_name);
  const {data,error}=await supabase.from("messages").select("id,sender_id,body,created_at").eq("conversation_id",conversationId).is("deleted_at",null).order("created_at"); if(error)setNotice(error.message); else setMessages((data||[]) as Msg[]);
 }
 useEffect(()=>{setConversationId(new URLSearchParams(window.location.search).get("conversation"));},[]);
 useEffect(()=>{if(conversationId)load()},[conversationId]);
 async function send(){const body=draft.trim();if(!body||!conversationId||!userId)return;setDraft("");const {error}=await supabase.from("messages").insert({conversation_id:conversationId,sender_id:userId,body});if(error){setNotice(error.message);setDraft(body);return;}await load();}
 return <main><AppNav/><section className="chatShell"><aside className="chatList"><div className="eyebrow">Messages</div><div className="chatPerson activeChat"><div className="avatar">{name[0]}</div><div><strong>{name}</strong><p>{conversationId?"Active match":"Select a match"}</p></div></div></aside><section className="chatPanel"><header className="chatHeader"><div><strong>{name}</strong><p>Private conversation between matched members</p></div><a className="iconLink" href="/safety"><ShieldAlert size={20}/> Safety</a></header>{notice&&<div className="saveNotice">{notice}</div>}<div className="messages">{messages.map(x=><div className={x.sender_id===userId?"message mine":"message"} key={x.id}><div>{x.body}</div><small>{new Date(x.created_at).toLocaleString()}</small></div>)}</div><div className="composer"><input value={draft} disabled={!conversationId} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")send()}} placeholder="Write a message..."/><button onClick={send} disabled={!conversationId}><Send size={19}/></button></div></section></section></main>;
}
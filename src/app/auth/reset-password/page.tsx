"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const [password,setPassword] = useState("");
  const [confirm,setConfirm] = useState("");
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const [done,setDone] = useState(false);

  async function submit(e:FormEvent) {
    e.preventDefault();
    if(password.length<8) return setMessage("Use at least 8 characters.");
    if(password!==confirm) return setMessage("Passwords do not match.");
    setBusy(true);setMessage("");
    const {data:{session}}=await supabase.auth.getSession();
    if(!session){setMessage("Your reset link has expired or has not been verified. Request a new link from Sign in.");setBusy(false);return;}
    const {error}=await supabase.auth.updateUser({password});
    setBusy(false);
    if(error) return setMessage(error.message);
    setDone(true);setMessage("Password updated. You can return to your account.");
  }
  return <main className="onboardingShell"><section className="onboardingPanel"><Link className="brand" href="/">Love in Recovery</Link><h1>Reset your password</h1><p className="sectionIntro">Choose a new password for your existing account. Your profile and matches will be kept.</p>{!done&&<form className="formCard authCard" onSubmit={submit}><label>New password</label><input type="password" autoComplete="new-password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)}/><label>Confirm password</label><input type="password" autoComplete="new-password" required minLength={8} value={confirm} onChange={e=>setConfirm(e.target.value)}/><button className="primaryButton formButton" disabled={busy}>{busy?"Saving...":"Save new password"}</button></form>}{message&&<p className="saveNotice">{message}</p>}<Link className="secondaryButton authSwitch" href="/auth">Back to sign in</Link></section></main>;
}

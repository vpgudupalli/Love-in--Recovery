"use client";

import { useEffect, useMemo, useState } from "react";
import AppNav from "@/components/AppNav";
import { createClient } from "@/lib/supabase/client";

type Profile = { id: string; first_name: string; city: string | null; region: string | null };
type Claim = {
  id: string; initiator_id: string; partner_id: string;
  status: "pending" | "approved" | "declined" | "withdrawn" | "expired";
  initiator_consented: boolean; partner_consented: boolean;
  photo_path: string | null; created_at: string; approved_at: string | null; expires_at: string | null;
};

export default function ClaimMyPersonPage() {
  const supabase = useMemo(() => createClient(), []);
  const [me, setMe] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [partnerId, setPartnerId] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) { setNotice("Please sign in to use Claim My Person."); return; }
    setMe(user.id);
    const [{ data: people }, { data: claimRows }] = await Promise.all([
      supabase.from("profiles").select("id,first_name,city,region").neq("id", user.id).order("first_name"),
      supabase.from("person_claims").select("*").or(`initiator_id.eq.${user.id},partner_id.eq.${user.id}`).order("created_at", { ascending: false }),
    ]);
    setProfiles((people || []) as Profile[]);
    const rows = (claimRows || []) as Claim[];
    setClaims(rows);
    const signedEntries = await Promise.all(rows.filter(c => c.photo_path).map(async c => {
      const { data } = await supabase.storage.from("claim-my-person").createSignedUrl(c.photo_path!, 900);
      return [c.id, data?.signedUrl || ""] as const;
    }));
    setPhotoUrls(Object.fromEntries(signedEntries));
  }

  useEffect(() => { load(); }, []);

  const nameOf = (id: string) => profiles.find(p => p.id === id)?.first_name || "another member";

  async function sendClaim() {
    if (!me || !partnerId || !agreed) return;
    setBusy(true); setNotice("");
    let photoPath: string | null = null;
    if (photo) {
      if (!photo.type.startsWith("image/")) { setBusy(false); return setNotice("Please choose an image file."); }
      if (photo.size > 5 * 1024 * 1024) { setBusy(false); return setNotice("Please choose an image smaller than 5 MB."); }
      const safeName = photo.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      photoPath = `${me}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("claim-my-person").upload(photoPath, photo, { upsert: false, contentType: photo.type });
      if (uploadError) { setBusy(false); return setNotice(uploadError.message); }
    }
    const { error } = await supabase.from("person_claims").insert({
      initiator_id: me, partner_id: partnerId, initiator_consented: true, partner_consented: false, status: "pending", photo_path: photoPath
    });
    if (error && photoPath) await supabase.storage.from("claim-my-person").remove([photoPath]);
    setBusy(false);
    if (error) return setNotice(error.message);
    setPartnerId(""); setAgreed(false); setPhoto(null); setNotice("Consent request sent privately.");
    await load();
  }

  async function approve(claim: Claim) {
    if (!me || claim.partner_id !== me) return;
    setBusy(true); setNotice("");
    const now = new Date();
    const expires = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const { error } = await supabase.from("person_claims").update({
      partner_consented: true, status: "approved", approved_at: now.toISOString(), expires_at: expires.toISOString()
    }).eq("id", claim.id).eq("partner_id", me).eq("status", "pending");
    setBusy(false);
    if (error) return setNotice(error.message);
    setNotice("You both consented. The 14-day claim is now confirmed.");
    await load();
  }

  async function setStatus(claim: Claim, status: "declined" | "withdrawn") {
    if (!me) return;
    setBusy(true); setNotice("");
    const { error } = await supabase.from("person_claims").update({
      status, ...(status === "withdrawn" ? { initiator_consented: false, partner_consented: false } : { partner_consented: false })
    }).eq("id", claim.id);
    setBusy(false);
    if (error) return setNotice(error.message);
    setNotice(status === "declined" ? "Request declined." : "Your consent was withdrawn.");
    await load();
  }

  const activeClaims = claims.filter(c => !["declined","withdrawn","expired"].includes(c.status));

  return (
    <main>
      <AppNav />
      <section className="appPage narrow">
        <div className="eyebrow">Mutual relationship verification</div>
        <h1>Claim My Person</h1>
        <p className="sectionIntro">Share that you are together only when both people choose to. Nothing is confirmed until both people consent.</p>

        <div className="claimSafety"><strong>Both people must consent.</strong><p>Either person can decline or withdraw. An approved claim lasts 14 days.</p></div>
        {notice && <p className="saveNotice">{notice}</p>}

        <div className="editProfileCard">
          <h2>Start a private request</h2>
          <label className="fullField">Choose your person
            <select value={partnerId} onChange={e => setPartnerId(e.target.value)}>
              <option value="">Select a Recovery in Love member</option>
              {profiles.map(p => <option key={p.id} value={p.id}>{p.first_name}{p.city ? ` · ${p.city}` : ""}</option>)}
            </select>
          </label>
          <label className="fullField">Private claim photo (optional)
            <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} />
          </label>
          {photo && <p className="claimFile">Selected privately: {photo.name}</p>}
          <label className="claimConsent"><input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} /><span>I consent to this relationship claim and understand it is not confirmed until the other person independently approves.</span></label>
          <button className="primaryButton" disabled={!partnerId || !agreed || busy} onClick={sendClaim}>{busy ? "Please wait..." : "Send consent request"}</button>
        </div>

        <div className="claimStatusCard">
          <h2>Your claims</h2>
          {activeClaims.length === 0 && <p>No active Claim My Person requests yet.</p>}
          {activeClaims.map(claim => {
            const incoming = claim.partner_id === me;
            const other = incoming ? claim.initiator_id : claim.partner_id;
            return <div key={claim.id} className="claimItem">
              <div className="claimBadge">{claim.status === "approved" ? "Mutually confirmed" : incoming ? "Needs your consent" : "Waiting for consent"}</div>
              <h3>You + {nameOf(other)}</h3>
              {claim.photo_path && photoUrls[claim.id] && <img className="claimPhoto" src={photoUrls[claim.id]} alt="Private Claim My Person photo" />}
              {claim.photo_path && <p className="claimFinePrint">Private photo · visible only to the two people involved in this claim.</p>}
              {claim.status === "pending" && incoming && <p>This person asked to create a mutual relationship claim with you. Nothing becomes confirmed unless you choose Approve.</p>}
              {claim.status === "pending" && !incoming && <p>Your request is private while you wait for the other person to decide.</p>}
              {claim.status === "approved" && <p>Both people consented. This claim is active until {claim.expires_at ? new Date(claim.expires_at).toLocaleDateString() : "14 days after approval"}.</p>}
              <div className="claimActions">
                {claim.status === "pending" && incoming && <><button className="primaryButton" disabled={busy} onClick={() => approve(claim)}>Approve</button><button className="secondaryButton" disabled={busy} onClick={() => setStatus(claim,"declined")}>Decline</button></>}
                {(claim.status === "approved" || (claim.status === "pending" && !incoming)) && <button className="secondaryButton" disabled={busy} onClick={() => setStatus(claim,"withdrawn")}>Withdraw my consent</button>}
              </div>
            </div>;
          })}
        </div>

        <div className="claimInfoGrid"><div><strong>1. Request</strong><span>One member starts privately.</span></div><div><strong>2. Consent</strong><span>The other member independently approves or declines.</span></div><div><strong>3. Confirm</strong><span>Mutual approval starts the 14-day claim.</span></div></div>
      </section>
    </main>
  );
}

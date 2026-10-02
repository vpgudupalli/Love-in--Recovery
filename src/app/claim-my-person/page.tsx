"use client";

import { useState } from "react";
import AppNav from "@/components/AppNav";

type ClaimStatus = "draft" | "pending" | "mutual";

export default function ClaimMyPersonPage() {
  const [status, setStatus] = useState<ClaimStatus>("draft");
  const [person, setPerson] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [agreed, setAgreed] = useState(false);

  const startClaim = () => {
    if (!person.trim() || !agreed) return;
    setStatus("pending");
  };

  const withdraw = () => {
    setStatus("draft");
    setPerson("");
    setPhotoName("");
    setAgreed(false);
  };

  return (
    <main>
      <AppNav />
      <section className="appPage narrow">
        <div className="eyebrow">Mutual relationship verification</div>
        <h1>Claim My Person</h1>
        <p className="sectionIntro">
          Share that you are together only when both people choose to. A claim stays private while waiting for the other person to approve it.
        </p>

        <div className="claimSafety">
          <strong>Both people must consent.</strong>
          <p>No photo or relationship claim is published from this flow until both people approve. Either person can withdraw their consent.</p>
        </div>

        {status === "draft" && (
          <div className="editProfileCard">
            <div className="editGrid">
              <label className="fullField">
                Who is your person?
                <input value={person} onChange={(e) => setPerson(e.target.value)} placeholder="Their name or Recovery in Love username" />
              </label>
              <label className="fullField">
                Photo you would like to share together
                <input type="file" accept="image/*" onChange={(e) => setPhotoName(e.target.files?.[0]?.name || "")} />
              </label>
            </div>
            {photoName && <p className="claimFile">Selected: {photoName}</p>}
            <label className="claimConsent">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>I consent to this relationship claim and understand it will only become visible after the other person also approves.</span>
            </label>
            <button className="primaryButton" disabled={!person.trim() || !agreed} onClick={startClaim}>Send consent request</button>
          </div>
        )}

        {status === "pending" && (
          <div className="claimStatusCard">
            <div className="claimBadge">Waiting for mutual consent</div>
            <h2>Request sent to {person}</h2>
            <p>The claim and selected photo are not public. The other person must independently approve before the 14-day shared claim can begin.</p>
            <div className="claimActions">
              <button className="secondaryButton" onClick={withdraw}>Withdraw request</button>
              <button className="primaryButton" onClick={() => setStatus("mutual")}>Demo: approve from both sides</button>
            </div>
          </div>
        )}

        {status === "mutual" && (
          <div className="claimStatusCard mutualClaim">
            <div className="claimBadge">Mutually confirmed</div>
            <h2>You + {person}</h2>
            <p>Both people agreed to share this relationship claim. The shared claim period is 14 days.</p>
            {photoName && <p><strong>Approved photo:</strong> {photoName}</p>}
            <p className="claimFinePrint">Either person can withdraw consent at any time. Withdrawal removes the shared claim from this experience.</p>
            <button className="secondaryButton" onClick={withdraw}>Withdraw my consent</button>
          </div>
        )}

        <div className="claimInfoGrid">
          <div><strong>1. Request</strong><span>One person starts the claim.</span></div>
          <div><strong>2. Consent</strong><span>The other person independently approves.</span></div>
          <div><strong>3. Share</strong><span>Only then can the mutual claim appear for 14 days.</span></div>
        </div>
      </section>
    </main>
  );
}

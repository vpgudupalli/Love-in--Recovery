"use client";

import { useState } from "react";
import AppNav from "@/components/AppNav";

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: "You",
    age: "31",
    location: "Norfolk, VA",
    bio: "Building a grounded life and looking for a meaningful connection.",
    relationshipGoal: "Long-term relationship",
    recoveryPreference: "Sober partner preferred",
    recoveryVisibility: "Matches only",
    assessmentVisibility: "Selected results only",
    mentalHealthVisibility: "Private",
  });
  const [draft, setDraft] = useState(profile);

  const change = (key: keyof typeof draft, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const save = () => {
    setProfile(draft);
    setEditing(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const cancel = () => {
    setDraft(profile);
    setEditing(false);
  };

  return (
    <main>
      <AppNav />
      <section className="appPage narrow">
        <div className="profileTitleRow">
          <div>
            <div className="eyebrow">Profile</div>
            <h1>{editing ? "Edit profile" : "Profile preview"}</h1>
          </div>
          {!editing && <button className="primaryButton" onClick={() => setEditing(true)}>Edit profile</button>}
        </div>

        {saved && <div className="saveNotice">Profile changes saved.</div>}

        {editing ? (
          <div className="editProfileCard">
            <div className="editGrid">
              <label>First name<input value={draft.name} onChange={(e) => change("name", e.target.value)} /></label>
              <label>Age<input type="number" min="18" value={draft.age} onChange={(e) => change("age", e.target.value)} /></label>
              <label className="fullField">Location<input value={draft.location} onChange={(e) => change("location", e.target.value)} /></label>
              <label className="fullField">About me<textarea rows={4} value={draft.bio} onChange={(e) => change("bio", e.target.value)} /></label>
              <label>Relationship goal
                <select value={draft.relationshipGoal} onChange={(e) => change("relationshipGoal", e.target.value)}>
                  <option>Long-term relationship</option><option>Dating with intention</option><option>Open to exploring</option><option>Friendship first</option>
                </select>
              </label>
              <label>Recovery preference
                <select value={draft.recoveryPreference} onChange={(e) => change("recoveryPreference", e.target.value)}>
                  <option>Sober partner preferred</option><option>Someone in recovery</option><option>Someone who understands recovery</option><option>Open / depends on the person</option>
                </select>
              </label>
              <label>Recovery profile visibility
                <select value={draft.recoveryVisibility} onChange={(e) => change("recoveryVisibility", e.target.value)}>
                  <option>Everyone</option><option>Matches only</option><option>Private</option>
                </select>
              </label>
              <label>Assessment visibility
                <select value={draft.assessmentVisibility} onChange={(e) => change("assessmentVisibility", e.target.value)}>
                  <option>Visible</option><option>Selected results only</option><option>Matches only</option><option>Private</option>
                </select>
              </label>
              <label>Mental-health disclosure
                <select value={draft.mentalHealthVisibility} onChange={(e) => change("mentalHealthVisibility", e.target.value)}>
                  <option>Matches only</option><option>Mutual disclosure only</option><option>Private</option>
                </select>
              </label>
            </div>
            <div className="editActions">
              <button className="secondaryButton" onClick={cancel}>Cancel</button>
              <button className="primaryButton" onClick={save}>Save changes</button>
            </div>
          </div>
        ) : (
          <>
            <div className="profilePreview">
              <div className="profilePreviewPhoto" />
              <div>
                <h2>{profile.name}, {profile.age}</h2>
                <p>{profile.location} · {profile.relationshipGoal}</p>
                <p>{profile.bio}</p>
                <div className="pills">
                  <span className="pill">Recovery: {profile.recoveryVisibility}</span>
                  <span className="pill">Assessments: {profile.assessmentVisibility}</span>
                  <span className="pill">Mental health: {profile.mentalHealthVisibility}</span>
                </div>
              </div>
            </div>
            <div className="settingsCard">
              <div className="settingRow"><span>Relationship goal</span><strong>{profile.relationshipGoal}</strong></div>
              <div className="settingRow"><span>Recovery preference</span><strong>{profile.recoveryPreference}</strong></div>
              <div className="settingRow"><span>Recovery profile</span><strong>{profile.recoveryVisibility}</strong></div>
              <div className="settingRow"><span>Mental-health disclosure</span><strong>{profile.mentalHealthVisibility}</strong></div>
              <div className="settingRow"><span>Assessment visibility</span><strong>{profile.assessmentVisibility}</strong></div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

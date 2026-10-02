"use client";

import { useEffect, useMemo, useState } from "react";
import AppNav from "@/components/AppNav";
import { createClient } from "@/lib/supabase/client";
import type { ProfileRecord } from "@/lib/types";
import { Heart, X } from "lucide-react";

function ageFromBirthDate(birthDate: string) {
  const birth = new Date(birthDate + "T00:00:00");
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (beforeBirthday) age--;
  return age;
}

export default function DiscoverPage() {
  const supabase = useMemo(() => createClient(), []);
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [photos, setPhotos] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfiles() {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) {
        setNotice("Please sign in to discover other members.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc("discover_profiles");

      if (error) setNotice(error.message);
      else {
        const members = (data || []) as ProfileRecord[];
        setProfiles(members);
        if (members.length) {
          const ids = members.map(p => p.id);
          const { data: photoRows } = await supabase.from("profile_photos").select("user_id,storage_path,position").in("user_id", ids).order("position");
          const grouped: Record<string,string[]> = {};
          (photoRows || []).forEach((row:any) => {
            const url = supabase.storage.from("profile-photos").getPublicUrl(row.storage_path).data.publicUrl;
            grouped[row.user_id] = [...(grouped[row.user_id] || []), url];
          });
          setPhotos(grouped);
        }
      }
      setLoading(false);
    }
    loadProfiles();
  }, [supabase]);

  async function passProfile(id:string){ setProfiles(v=>v.filter(p=>p.id!==id)); }
  async function likeProfile(id:string){ setActing(id); setNotice(""); const {data,error}=await supabase.rpc("like_profile",{target_user_id:id}); setActing(null); if(error){setNotice(error.message);return;} setProfiles(v=>v.filter(p=>p.id!==id)); if(data?.matched) setNotice("It’s a match! Open Matches to start a conversation."); else setNotice("Like sent."); }

  return (
    <main>
      <AppNav />
      <section className="appPage">
        <div className="pageHeader">
          <div>
            <div className="eyebrow">Discover</div>
            <h1>Meet other Recovery in Love members.</h1>
            <p>Only other member profiles are shown here. Your own profile is excluded from your Discover feed.</p>
          </div>
        </div>

        {loading && <div className="emptyDiscover">Loading members...</div>}
        {!loading && notice && <div className="emptyDiscover">{notice}</div>}
        {!loading && !notice && profiles.length === 0 && (
          <div className="emptyDiscover">
            <h2>No other profiles yet</h2>
            <p>Your account is working. As other people create profiles, they will appear here.</p>
          </div>
        )}

        <div className="discoverStack">
          {profiles.map(profile => (
            <article className="discoverCard" key={profile.id}>
              <div className="discoverPhoto">
                {photos[profile.id]?.[0] && <img className="discoverMainImage" src={photos[profile.id][0]} alt={profile.first_name + "'s profile"} />}
                <div className="photoGradient">
                  <div>
                    <h2>{profile.first_name}, {ageFromBirthDate(profile.birth_date)}</h2>
                    <p>{[profile.city, profile.region].filter(Boolean).join(", ") || "Location not shared"}</p>
                  </div>
                </div>
              </div>
              <div className="discoverBody">
                <div className="pills">
                  {profile.relationship_goal && <span className="pill">{profile.relationship_goal}</span>}
                  {profile.occupation && <span className="pill">{profile.occupation}</span>}
                  {profile.pronouns && <span className="pill">{profile.pronouns}</span>}
                  {(profile as ProfileRecord & { assessment_signal?: string | null }).assessment_signal && <span className="pill">Attachment: {(profile as ProfileRecord & { assessment_signal?: string | null }).assessment_signal}</span>}
                </div>
                <p className="profileAbout">{profile.bio || "This member has not added an About Me yet."}</p>
                {photos[profile.id]?.length > 1 && <div className="discoverPhotoGallery">{photos[profile.id].slice(1).map((url,i)=><img key={url} src={url} alt={profile.first_name + " profile photo " + (i+2)} />)}</div>}
                <div className="discoverActions"><button type="button" className="passButton" onClick={()=>passProfile(profile.id)}><X size={24}/> Pass</button><button type="button" className="likeButton" disabled={acting===profile.id} onClick={()=>likeProfile(profile.id)}><Heart size={24}/> {acting===profile.id?"Sending...":"Like"}</button></div>
                <div className="whyBox">
                  <strong>Profile information</strong>
                  <p>This is a real member profile from Recovery in Love. Recovery, assessment, and mental-health details are not exposed here unless their privacy settings allow it.</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

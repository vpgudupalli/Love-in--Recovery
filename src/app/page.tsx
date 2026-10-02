import { Brain, Heart, HeartHandshake, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

export default function HomePage() {
  return <main className="shell">
    <nav className="nav"><div className="brand">Love in Recovery</div><div className="navLinks"><a href="#different">Why it's different</a><a href="#compatibility">Compatibility</a><a href="#safety">Safety</a><a className="primaryButton" href="/auth">Join</a></div></nav>

    <section className="hero">
      <div>
        <div className="eyebrow">Dating designed with recovery and mental wellness in mind</div>
        <h1>Dating gets deeper when the app understands more than your photos.</h1>
        <p>Love in Recovery brings dating, recovery-aware preferences, mental-health privacy, relationship self-reflection, and intentional compatibility into one experience built for adults seeking meaningful connection.</p>
        <div className="actions"><a className="primaryButton" href="/auth">Create your profile</a><a className="secondaryButton" href="#different">See what makes it different</a></div>
        <div className="heroProof"><span>18+ community</span><span>SUD-aware</span><span>Mental-health conscious</span><span>Privacy controls</span></div>
      </div>
      <div className="phoneCard"><div className="profileCard"><div className="profilePhoto"><div><h2>Connection with context</h2><div>Recovery · Personality · Boundaries · Goals</div></div></div><div className="profileDetails"><div className="pills"><span className="pill">Secure-leaning</span><span className="pill">Type 6 · Loyal</span><span className="pill">Long-term</span><span className="pill">Recovery aligned</span></div><div className="matchReason"><strong>Not just “you both like hiking.”</strong><br/>See the relationship, recovery, lifestyle, and communication signals behind a recommendation.</div></div></div></div>
    </section>

    <section id="different" className="section">
      <div className="eyebrow">What makes Love in Recovery different</div><h2>A dating app built around the conversations that actually matter.</h2>
      <p className="sectionIntro">Instead of treating recovery or mental health as an afterthought, the experience gives people tools to express boundaries, understand relationship patterns, and decide what they want to share.</p>
      <div className="grid">
        <article className="feature"><Heart size={24}/><h3>Recovery-aware matching</h3><p>Set preferences around sobriety, recovery, substance-use boundaries, partner lifestyle, and relationship goals so compatibility goes beyond surface-level interests.</p></article>
        <article className="feature"><HeartHandshake size={24}/><h3>Attachment Style</h3><p>Explore patterns around closeness, reassurance, independence, trust, and vulnerability through an original Attachment Style self-reflection experience.</p></article>
        <article className="feature"><Sparkles size={24}/><h3>Enneagram-style insights</h3><p>Explore nine personality themes and bring those insights into the way the app explains communication and relationship compatibility.</p></article>
        <article className="feature"><Brain size={24}/><h3>Mental-health privacy by design</h3><p>Mental-health information is not treated like ordinary profile trivia. Users decide whether sensitive information stays private or is shared under selected conditions.</p></article>
        <article className="feature"><HeartHandshake size={24}/><h3>Claim My Person</h3><p>A mutual relationship feature built around consent: one person initiates, the other approves, and an approved claim lasts 14 days. Optional photos are stored privately for the people involved.</p></article>
        <article className="feature"><LockKeyhole size={24}/><h3>You control your story</h3><p>Separate privacy choices for recovery, mental-health, and assessment information help people share intentionally instead of exposing everything by default.</p></article>
      </div>
    </section>

    <section id="compatibility" className="section"><div className="notice"><div className="eyebrow">Compatibility with context</div><h2>Your relationship style becomes part of the conversation.</h2><p>Assessment results can contribute to relationship-style and compatibility signals alongside recovery boundaries, relationship goals, lifestyle, and communication preferences. The goal is to explain why two people may align—not to declare that a personality type guarantees relationship success.</p><div className="pills"><span className="pill">Attachment patterns</span><span className="pill">Enneagram-style themes</span><span className="pill">Recovery boundaries</span><span className="pill">Relationship goals</span><span className="pill">Communication</span></div></div></section>

    <section id="safety" className="section"><div className="eyebrow">Connection without sacrificing safety</div><h2>Private, consent-centered, and recovery-conscious.</h2><p className="sectionIntro">Reporting and blocking tools, controlled disclosure of sensitive information, mutual relationship confirmation, and private evidence workflows are designed to support safer interactions without turning personal recovery or mental-health information into public labels.</p><div className="grid"><article className="feature"><ShieldCheck size={24}/><h3>Safety tools</h3><p>Reporting, blocking, and private moderation workflows are built into the experience.</p></article><article className="feature"><LockKeyhole size={24}/><h3>Sensitive by default</h3><p>Recovery and mental-health details can have tighter visibility than ordinary dating-profile information.</p></article></div></section>

    <section className="section landingCta"><div><div className="eyebrow">Love in Recovery</div><h2>Meet the person. Understand the context. Choose the connection.</h2><p>For adults who want dating to make room for recovery, mental wellness, self-awareness, boundaries, and real relationship intentions.</p><a className="primaryButton" href="/auth">Build my profile</a></div></section>
    <footer className="footer">Love in Recovery · Adults 18+ · Assessment experiences are self-reflection tools, not medical or psychiatric diagnoses or predictors of relationship success.</footer>
  </main>;
}
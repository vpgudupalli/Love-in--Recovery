import Link from "next/link";

const items = [
  ["/discover", "Discover"],
  ["/preferences", "Preferences"],
  ["/matches", "Matches"],
  ["/messages", "Messages"],
  ["/recovery", "Recovery"],
  ["/assessments", "Assessments"],
  ["/claim-my-person", "Claim My Person"],
  ["/profile", "Profile"],
  ["/safety", "Safety"],
];

export default function AppNav() {
  return (
    <nav className="appNav">
      <Link className="brand" href="/">Love in Recovery</Link>
      <div className="appNavLinks">
        {items.map(([href, label]) => (
          <Link key={href} href={href}>{label}</Link>
        ))}
      </div>
    </nav>
  );
}

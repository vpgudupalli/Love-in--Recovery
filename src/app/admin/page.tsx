import AppNav from "@/components/AppNav";

export default function AdminPage() {
  return (
    <main>
      <AppNav />
      <section className="appPage narrow">
        <div className="eyebrow">Trust & Safety</div>
        <h1>Admin access is not enabled.</h1>
        <div className="emptyDiscover">
          <h2>Protected moderation area</h2>
          <p>The previous sample cases and statistics have been removed. Real reports will not be displayed here until a server-side administrator role and access check are implemented.</p>
        </div>
      </section>
    </main>
  );
}

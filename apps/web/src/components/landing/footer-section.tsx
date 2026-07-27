export function FooterSection() {
  return (
    <footer className="border-t border-border px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-foreground">
            <span className="text-[10px] font-bold text-background">P</span>
          </div>
          <span>ProjectHub</span>
        </div>
        <p>Built with Next.js · Deployed on Vercel &amp; Render</p>
      </div>
    </footer>
  );
}

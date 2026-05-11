import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
        <span className="mb-4 rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
          Welcome
        </span>
        <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
          Build something delightful
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          A clean starting point for your next idea. Fast, focused, and ready to grow with you.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="#get-started"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get started
          </a>
          <a
            href="#learn-more"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Learn more
          </a>
        </div>
      </section>
    </main>
  );
}

import { Link } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, ArrowRight, GraduationCap, Briefcase,
  Rocket, Lock, CheckCircle2, MessageSquare,
  FileText, Network, BarChart3, Search, Award, Heart, Target,
  Plus, Minus, Mail, Phone, Twitter, Linkedin, Instagram, Users,
} from "lucide-react";

const colleges = ["IIT Bombay", "BITS Pilani", "IIT Delhi", "VIT Vellore", "NIT Trichy", "IIIT Hyderabad", "IIT Madras", "IIT Kanpur"];

const faqs = [
  { q: "Is UniShark free for students?", a: "Yes — submitting your pitch is free. We only take a 3% success fee when you successfully close a round through the platform." },
  { q: "How are investors verified?", a: "Every investor goes through manual KYC, LinkedIn verification, and reference checks before they can browse pitches." },
  { q: "Who owns my pitch deck?", a: "You do. We watermark every download with the investor's identity and timestamp so your idea stays protected." },
  { q: "How long does pitch review take?", a: "Our team reviews every submission within 48 hours and gives you concrete feedback before going live." },
  { q: "Do I need to be from an IIT or BITS?", a: "No. We work with founders from any recognized Indian college — quality of idea matters more than the badge." },
];

const Section = ({ id, eyebrow, title, sub, children }: any) => (
  <section id={id} className="container mx-auto px-6 py-24 md:py-32 max-w-6xl">
    {(eyebrow || title) && (
      <div className="mb-16 max-w-2xl">
        {eyebrow && <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">{eyebrow}</p>}
        {title && <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight text-foreground leading-[1.1]">{title}</h2>}
        {sub && <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl">{sub}</p>}
      </div>
    )}
    {children}
  </section>
);

const Index = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* HERO */}
      <section id="home" className="container mx-auto px-6 pt-24 pb-32 md:pt-36 md:pb-40 max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">India's student-founder marketplace</p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-[5.5rem] font-medium tracking-tight leading-[1.02] text-foreground">
            Connecting India's best student founders with investors.
          </h1>
          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            50,000 ideas a year. Less than 2% get funded. We change that.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="h-12 rounded-full px-7">
              <Link to="/signup?role=student"><GraduationCap className="mr-2 h-4 w-4" /> Sign up as Student</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-7">
              <Link to="/signup?role=investor"><Briefcase className="mr-2 h-4 w-4" /> Sign up as Investor</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-foreground underline underline-offset-4">Sign in</Link>
          </p>
        </div>
      </section>

      {/* COLLEGES */}
      <section className="border-y border-border py-10">
        <p className="text-center text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">Founders & angels from</p>
        <div className="container mx-auto max-w-6xl px-6 flex flex-wrap justify-center gap-x-10 gap-y-3">
          {colleges.map((c) => (
            <span key={c} className="text-sm font-medium text-muted-foreground">{c}</span>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <Section id="problem" eyebrow="The problem" title="A broken funnel." sub="India is bursting with student talent — but the path from idea to capital is broken. Cold emails. No network. No trust layer.">
        <div className="grid md:grid-cols-4 gap-6 md:gap-8">
          {[
            { n: "50K", label: "Students with ideas" },
            { n: "7.5K", label: "Reach an investor" },
            { n: "<2%", label: "Get funded" },
            { n: "₹0", label: "Raised by 98%" },
          ].map((s) => (
            <div key={s.label} className="border-t border-border pt-6">
              <div className="font-display text-4xl md:text-5xl font-medium tracking-tight">{s.n}</div>
              <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* SOLUTION */}
      <Section id="solution" eyebrow="The solution" title="One bridge. Two sides." sub="A curated marketplace built for both — vetted, secure, India-first.">
        <div className="grid md:grid-cols-2 gap-px bg-border border border-border rounded-lg overflow-hidden">
          {[
            { title: "For Students", tag: "Free to apply", role: "student", items: ["Reach 150+ verified angels", "Pitch wizard & deck templates", "Legal docs (SAFE, NDA, TS)", "Idea protection with watermarks"] },
            { title: "For Investors", tag: "Curated deal flow", role: "investor", items: ["Pre-vetted deal flow", "Easy browsing & filters", "Portfolio tracking dashboard", "Syndicate with other angels"] },
          ].map((s) => (
            <div key={s.title} className="bg-card p-8 md:p-10">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl font-medium">{s.title}</h3>
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{s.tag}</span>
              </div>
              <ul className="mt-8 space-y-4">
                {s.items.map((it) => (
                  <li key={it} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
              <Link to={`/signup?role=${s.role}`} className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:gap-3 transition-all">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section id="how" eyebrow="How it works" title="Three steps. Zero friction." sub="From idea to funded — without the cold-email grind.">
        <div className="grid md:grid-cols-3 gap-12 md:gap-8">
          {[
            { n: "01", title: "Pitch", body: "Submit your startup idea in our 5-minute form. We vet it for quality. Go live.", time: "5 min" },
            { n: "02", title: "Match", body: "Verified investors discover your pitch. Bookmark, message, request the deck.", time: "48 hrs" },
            { n: "03", title: "Close", body: "Chat in-app, share legal docs, get introduced. We support you to term sheet.", time: "2-4 wks" },
          ].map((it) => (
            <div key={it.n} className="border-t border-border pt-8">
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{it.n}</span>
                <span className="text-xs text-muted-foreground">{it.time}</span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-medium">{it.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{it.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* FEATURES */}
      <Section id="features" eyebrow="Key features" title="Everything you need to ship a round." sub="From draft to deck to term sheet — built into one platform.">
        <div className="grid md:grid-cols-3 gap-px bg-border border border-border rounded-lg overflow-hidden">
          {[
            { icon: Rocket, title: "5-step pitch wizard", body: "Auto-save, deck upload, draft anytime." },
            { icon: MessageSquare, title: "In-app messaging", body: "Talk to investors on the platform." },
            { icon: FileText, title: "Legal templates", body: "SAFE, Term Sheet, NDA — ready to use." },
            { icon: Lock, title: "Idea protection", body: "Watermarked decks. Traceable downloads." },
            { icon: BarChart3, title: "Investor analytics", body: "Track views, bookmarks, intros." },
            { icon: ShieldCheck, title: "Vetted only", body: "100% manual review." },
          ].map((f) => (
            <div key={f.title} className="bg-card p-8">
              <f.icon className="h-5 w-5 text-foreground" />
              <h3 className="mt-6 font-display text-lg font-medium">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* SUCCESS STORIES */}
      <Section id="stories" eyebrow="Success stories" title="Real founders. Real cheques.">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Aarav Mehta", role: "Founder, IIT Bombay", quote: "Closed our pre-seed in 19 days. The vetting meant every conversation was real.", tag: "Raised ₹85L" },
            { name: "Raj Patel", role: "Angel investor, IIT '05", quote: "Got access to 50+ high-quality student founders. Already invested in 2 — both growing fast.", tag: "3 exits" },
            { name: "Vedant Kumar", role: "Founder, AIFlow • BITS Pilani", quote: "UniShark handled everything — legal, intros, watermarking. Professional and transparent.", tag: "Pre-seed closed" },
          ].map((t) => (
            <div key={t.name} className="border border-border rounded-lg p-8 bg-card">
              <p className="text-base leading-relaxed text-foreground">"{t.quote}"</p>
              <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
                <span className="text-xs text-muted-foreground">{t.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* INVESTORS */}
      <section id="investors" className="bg-foreground text-background py-24 md:py-32">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="max-w-2xl mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-background/60 mb-4">For investors</p>
            <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight leading-[1.1]">
              Where angels find their next bet.
            </h2>
            <p className="mt-5 text-lg text-background/70 max-w-xl">Curated, vetted, India-first deal flow — without the inbox noise.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-background/10 border border-background/10 rounded-lg overflow-hidden">
            {[
              { icon: ShieldCheck, t: "Pre-vetted founders", b: "100% manual review before listing." },
              { icon: Search, t: "Quality deal flow", b: "5 strong pitches a week — not 50 cold emails." },
              { icon: BarChart3, t: "Portfolio tracking", b: "Monitor every investment in one place." },
              { icon: Network, t: "Investor network", b: "Syndicate with other vetted angels." },
              { icon: FileText, t: "Legal-ready docs", b: "SAFE, Term Sheet, NDA — generated instantly." },
              { icon: Award, t: "Founder support", b: "We help portfolio cos with intros & growth." },
            ].map((b) => (
              <div key={b.t} className="bg-foreground p-8">
                <b.icon className="h-5 w-5 text-background" />
                <h3 className="mt-6 font-display text-lg font-medium">{b.t}</h3>
                <p className="mt-2 text-sm text-background/60">{b.b}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-6">
            <p className="text-sm text-background/70">Free to browse · ₹5K/month for premium filters</p>
            <Button asChild size="lg" variant="outline" className="rounded-full border-background/30 bg-transparent text-background hover:bg-background hover:text-foreground">
              <Link to="/signup?role=investor"><Briefcase className="mr-2 h-4 w-4" /> Apply as investor</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* STUDENTS */}
      <Section id="students" eyebrow="For students" title="Why founders pick UniShark." sub="Built by founders, for founders. We obsess over your time and your idea.">
        <div className="grid md:grid-cols-3 gap-px bg-border border border-border rounded-lg overflow-hidden">
          {[
            { icon: Target, t: "Direct investor access", b: "150+ verified angels actively browsing." },
            { icon: Lock, t: "Idea protection", b: "Watermarked pitches. Legal IP shield." },
            { icon: FileText, t: "Free legal templates", b: "SAFE, Term Sheet, NDA — vetted by lawyers." },
            { icon: Heart, t: "Mentorship", b: "Pitch feedback from real operators." },
            { icon: Users, t: "Founder community", b: "Network with other student founders." },
            { icon: Award, t: "Track record building", b: "Verified milestones for future rounds." },
          ].map((b) => (
            <div key={b.t} className="bg-card p-8">
              <b.icon className="h-5 w-5 text-foreground" />
              <h3 className="mt-6 font-display text-lg font-medium">{b.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.b}</p>
            </div>
          ))}
        </div>
        <p className="mt-12 text-sm text-muted-foreground">Free to use · 3% success fee only when you close</p>
      </Section>

      {/* STATS */}
      <section className="border-y border-border py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-12">By the numbers</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
            {[
              { k: "₹12Cr+", v: "Capital intent" },
              { k: "150+", v: "Verified angels" },
              { k: "500+", v: "Founders onboarded" },
              { k: "48 hrs", v: "Avg review time" },
              { k: "50+", v: "Indian colleges" },
              { k: "19", v: "Days to close (avg)" },
              { k: "100%", v: "Manually vetted" },
              { k: "3%", v: "Success fee only" },
            ].map((s) => (
              <div key={s.v}>
                <div className="font-display text-3xl md:text-4xl font-medium tracking-tight">{s.k}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.15em] text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <Section id="faq" eyebrow="FAQ" title="Questions, answered." sub="Everything you need to know before signing up.">
        <div className="border-t border-border">
          {faqs.map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={f.q} className="border-b border-border">
                <button onClick={() => setOpenFaq(open ? null : i)} className="flex w-full items-center justify-between gap-4 py-6 text-left">
                  <span className="font-display text-lg md:text-xl font-medium">{f.q}</span>
                  {open ? <Minus className="h-4 w-4 shrink-0" /> : <Plus className="h-4 w-4 shrink-0" />}
                </button>
                {open && <div className="pb-6 pr-12 text-sm leading-relaxed text-muted-foreground">{f.a}</div>}
              </div>
            );
          })}
        </div>
        <a href="mailto:hello@unishark.in" className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:gap-3 transition-all">
          <Mail className="h-4 w-4" /> Email the team
        </a>
      </Section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-24 md:py-32 max-w-6xl">
        <div className="border border-border rounded-lg p-12 md:p-20 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight">Ready to get funded?</h2>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl mx-auto">Join 500+ founders and investors on UniShark.</p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-full px-7">
              <Link to="/signup?role=student"><GraduationCap className="mr-2 h-4 w-4" /> I'm a Student</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-7">
              <Link to="/signup?role=investor"><Briefcase className="mr-2 h-4 w-4" /> I'm an Investor</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Already on UniShark? <Link to="/login" className="text-foreground underline underline-offset-4">Sign in</Link>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className="container mx-auto grid gap-10 px-6 py-16 md:grid-cols-5 max-w-6xl">
          <div className="md:col-span-2">
            <div className="font-display text-xl font-semibold tracking-[0.18em]">UNISHARK</div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">India's first curated marketplace for student founders & angel investors.</p>
            <div className="mt-6 flex gap-3">
              {[Twitter, Linkedin, Instagram].map((I, i) => (
                <a key={i} href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:border-foreground transition-colors">
                  <I className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium">Company</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">About</a></li>
              <li><a href="#" className="hover:text-foreground">Team</a></li>
              <li><a href="#" className="hover:text-foreground">Blog</a></li>
              <li><a href="#" className="hover:text-foreground">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Terms</a></li>
              <li><a href="#" className="hover:text-foreground">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground">DPDP</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium">Contact</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@unishark.in</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 98765 43210</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} UniShark — Built for Indian student founders.
        </div>
      </footer>
    </div>
  );
};

export default Index;

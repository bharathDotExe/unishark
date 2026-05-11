import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ShieldCheck, Sparkles, Users, ArrowRight, GraduationCap, Briefcase,
  Rocket, TrendingUp, Lock, Star, CheckCircle2, Zap, MessageSquare,
  FileText, Eye, Network, BarChart3, Search, Award, Heart, Target,
  Plus, Minus, Mail, Phone, Twitter, Linkedin, Instagram, Quote, IndianRupee,
} from "lucide-react";
import heroBg from "@/assets/hero-bg.webp";
import orb from "@/assets/orb.webp";
import funnelArt from "@/assets/funnel-illustration.webp";
import investorArt from "@/assets/investor-illustration.webp";
import wizardArt from "@/assets/wizard-illustration.webp";

const fadeUp: any = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

const colleges = ["IIT Bombay", "BITS Pilani", "IIT Delhi", "VIT Vellore", "NIT Trichy", "IIIT Hyderabad", "IIT Madras", "IIT Kanpur", "BITS Goa", "NIT Surathkal"];

const faqs = [
  { q: "Is UniShark free for students?", a: "Yes — submitting your pitch is free. We only take a 3% success fee when you successfully close a round through the platform." },
  { q: "How are investors verified?", a: "Every investor goes through manual KYC, LinkedIn verification, and reference checks before they can browse pitches." },
  { q: "Who owns my pitch deck?", a: "You do. We watermark every download with the investor's identity and timestamp so your idea stays protected." },
  { q: "How long does pitch review take?", a: "Our team reviews every submission within 48 hours and gives you concrete feedback before going live." },
  { q: "Do I need to be from an IIT or BITS?", a: "No. We work with founders from any recognized Indian college — quality of idea matters more than the badge." },
];

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "40%"]);
  const yMid = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "20%"]);
  const yFront = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-10%"]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const { scrollYProgress: page } = useScroll();
  const blobY = useTransform(page, [0, 1], ["0%", "-30%"]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* HERO */}
      <section ref={heroRef} id="home" className="relative h-[100svh] min-h-[680px] w-full overflow-hidden">
        <motion.div style={{ y: yBg }} className="absolute inset-0 -top-20 will-change-transform">
          <img src={heroBg} alt="" className="h-[120%] w-full object-cover" fetchPriority="high"  decoding="async" />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(252_60%_10%/0.65)] via-[hsl(262_60%_15%/0.75)] to-[hsl(252_60%_8%/0.96)]" />
        </motion.div>
        <div className="absolute inset-0 grid-bg opacity-30" />
        <motion.div style={{ y: yMid }} className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-20 top-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl float-slow" />
          <div className="absolute right-[-6rem] top-1/2 h-[28rem] w-[28rem] rounded-full bg-accent/25 blur-3xl float-slow" style={{ animationDelay: "-3s" }} />
        </motion.div>

        <motion.div style={{ y: yFront, opacity: opacityHero }} className="relative z-10 container mx-auto flex h-full flex-col items-center justify-center px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            India's first student-founder marketplace
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1 }}
            className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight text-white md:text-7xl lg:text-[5.5rem]">
            UNISHARK
          </motion.h1>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 max-w-3xl font-display text-2xl md:text-4xl font-semibold text-white/95">
            Connecting India's best <span className="text-gradient italic">student founders</span> with investors
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-6 max-w-2xl text-base md:text-lg text-white/70">
            "50,000 ideas a year. Less than 2% get funded. We change that."
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full bg-white px-7 text-base font-semibold text-primary-dark hover:bg-white/90">
              <Link to="/signup?role=student"><GraduationCap className="mr-2 h-5 w-5" /> Sign Up as Student</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-white/30 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur hover:bg-white/15 hover:text-white">
              <Link to="/signup?role=investor"><Briefcase className="mr-2 h-5 w-5" /> Sign Up as Investor</Link>
            </Button>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-5 text-sm text-white/60">
            Already have an account? <Link to="/login" className="underline underline-offset-4 hover:text-white">Sign in</Link>
          </motion.p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/60">
          <div className="flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em]">
            Scroll
            <div className="h-10 w-px bg-gradient-to-b from-white/60 to-transparent" />
          </div>
        </motion.div>
      </section>

      {/* COLLEGES marquee */}
      <section className="relative border-y border-border bg-surface py-8 overflow-hidden">
        <p className="mb-4 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">Founders & angels from</p>
        <div className="relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
          <div className="marquee flex shrink-0 items-center gap-12 pr-12">
            {[...colleges, ...colleges].map((c, i) => (
              <span key={i} className="font-display text-xl font-semibold text-muted-foreground/80 whitespace-nowrap">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section id="problem" className="relative container mx-auto px-4 py-24 md:py-32">
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/20 shadow-elevated"
          style={{ background: "linear-gradient(135deg, hsl(252 60% 55%) 0%, hsl(262 80% 68%) 55%, hsl(280 90% 80%) 100%)" }}
        >
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary-glow/40 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-accent/30 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-[0.18]" />
          <div className="pointer-events-none absolute inset-0 noise" />

          <div className="relative grid gap-10 lg:grid-cols-12 lg:items-center px-6 py-14 md:px-14 md:py-20">
            <div className="lg:col-span-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                The problem
              </span>
              <h2 className="mt-6 font-display text-4xl md:text-6xl font-bold tracking-tight text-white leading-[1.15]">
                A{" "}
                <span className="relative inline-block italic text-accent-glow pr-2">
                  broken
                  <span className="absolute left-0 right-2 -bottom-1 h-[3px] bg-gradient-to-r from-accent to-accent-glow rounded-full" />
                </span>{" "}
                funnel.
              </h2>
              <p className="mt-6 max-w-lg text-lg text-white/75 leading-relaxed">
                India is bursting with student talent — but the path from <span className="font-semibold text-white">idea</span> to <span className="font-semibold text-white">capital</span> is broken. Cold emails. No network. No trust layer.
              </p>

              <div className="mt-10 flex max-w-md flex-col items-center gap-3">
                {[
                  { n: "50K", label: "Students with ideas", width: "100%", tone: "from-white/25 to-white/10", drop: null },
                  { n: "7.5K", label: "Reach an investor", width: "82%", tone: "from-accent/40 to-accent/15", drop: "−85%" },
                  { n: "<2%", label: "Get funded", width: "60%", tone: "from-destructive/50 to-destructive/20", drop: "−73%" },
                  { n: "₹0", label: "Raised by 98%", width: "40%", tone: "from-destructive/70 to-destructive/30", drop: "−98%" },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    style={{ width: s.width }}
                  >
                    <div className={`flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-gradient-to-r ${s.tone} px-4 py-3 backdrop-blur`}>
                      <span className="truncate text-sm font-medium text-white/90">{s.label}</span>
                      <div className="flex shrink-0 items-center gap-2">
                        {s.drop && (
                          <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white/80">{s.drop}</span>
                        )}
                        <span className="font-display text-lg font-bold text-white">{s.n}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-accent/40 bg-accent/15 px-4 py-2 text-sm font-medium text-white">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                98% of ideas die before raising a single rupee
              </div>
            </div>

            <div className="lg:col-span-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="relative mx-auto max-w-md"
              >
                <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-primary-glow/40 to-accent/30 blur-3xl" />
                {/* Hand-built broken bridge diagram */}
                <div className="relative rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-md shadow-elevated">
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-white/70">
                    <span>Students</span>
                    <span className="text-accent-glow">/// gap ///</span>
                    <span>Investors</span>
                  </div>

                  <svg viewBox="0 0 360 200" className="mt-4 w-full" role="img" aria-label="Broken bridge between students and investors">
                    <defs>
                      <linearGradient id="bridgeL" x1="0" x2="1">
                        <stop offset="0" stopColor="hsl(var(--accent-glow))" />
                        <stop offset="1" stopColor="hsl(var(--accent))" />
                      </linearGradient>
                      <linearGradient id="bridgeR" x1="0" x2="1">
                        <stop offset="0" stopColor="hsl(var(--primary-glow))" />
                        <stop offset="1" stopColor="#ffffff" stopOpacity="0.85" />
                      </linearGradient>
                    </defs>
                    {/* Cliffs */}
                    <path d="M0 150 L120 150 L120 200 L0 200 Z" fill="rgba(0,0,0,0.25)" />
                    <path d="M240 150 L360 150 L360 200 L240 200 Z" fill="rgba(0,0,0,0.25)" />
                    {/* Bridge halves – broken in middle */}
                    <motion.path
                      d="M20 150 L120 150 L150 165"
                      stroke="url(#bridgeL)" strokeWidth="6" fill="none" strokeLinecap="round"
                      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                    <motion.path
                      d="M210 165 L240 150 L340 150"
                      stroke="url(#bridgeR)" strokeWidth="6" fill="none" strokeLinecap="round"
                      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    />
                    {/* Falling chunks */}
                    <motion.rect x="155" y="170" width="14" height="6" rx="1" fill="hsl(var(--accent))"
                      animate={{ y: [170, 195, 170], rotate: [0, 25, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.rect x="190" y="172" width="12" height="6" rx="1" fill="hsl(var(--accent-glow))"
                      animate={{ y: [172, 196, 172], rotate: [0, -20, 0] }}
                      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                    />
                    {/* Pillars dashed */}
                    <line x1="60" y1="150" x2="60" y2="200" stroke="rgba(255,255,255,0.18)" strokeDasharray="3 4" />
                    <line x1="300" y1="150" x2="300" y2="200" stroke="rgba(255,255,255,0.18)" strokeDasharray="3 4" />
                    {/* People dots */}
                    <circle cx="40" cy="135" r="6" fill="#fff" />
                    <circle cx="62" cy="130" r="6" fill="#fff" opacity="0.85" />
                    <circle cx="84" cy="135" r="6" fill="#fff" opacity="0.7" />
                    <circle cx="320" cy="135" r="6" fill="hsl(var(--accent-glow))" />
                    <circle cx="298" cy="130" r="6" fill="hsl(var(--accent))" />
                  </svg>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-center">
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <div className="font-display text-2xl font-bold text-white">50,000+</div>
                      <div className="text-[11px] uppercase tracking-wider text-white/60">Idea-stage founders</div>
                    </div>
                    <div className="rounded-xl border border-accent/30 bg-accent/10 px-3 py-2">
                      <div className="font-display text-2xl font-bold text-accent-glow">~1,200</div>
                      <div className="text-[11px] uppercase tracking-wider text-white/60">Active early-stage VCs</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-[11px] text-white/70">
                    <span className="inline-flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 text-primary-glow" /> Idea</span>
                    <span className="font-mono text-white/40">— — ✕ — —</span>
                    <span className="inline-flex items-center gap-1.5"><IndianRupee className="h-3.5 w-3.5 text-accent" /> Capital</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SOLUTION */}
      <section id="solution" className="relative bg-surface py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-[0.4]" />
        <div className="container mx-auto px-4">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">The solution</span>
            <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold tracking-tight text-primary-dark">One bridge. Two sides.</h2>
            <p className="mt-5 text-lg text-muted-foreground">A curated marketplace built for both — vetted, secure, India-first.</p>
          </motion.div>

          {/* Bridge diagram */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="relative mx-auto mt-14 hidden max-w-4xl items-center justify-between md:flex">
            <div className="flex flex-col items-center gap-3">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-[22px] bg-primary-dark text-white shadow-elevated">
                <span className="font-display text-3xl font-black tracking-tight">S</span>
                <span className="absolute -bottom-1.5 -right-1.5 rounded-md bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-dark">Idea</span>
              </div>
              <span className="text-sm font-semibold text-primary-dark">Students</span>
            </div>
            <div className="relative flex-1 mx-6">
              <div className="h-px w-full bg-[repeating-linear-gradient(90deg,hsl(var(--primary)/0.5)_0_8px,transparent_8px_16px)]" />
              <motion.div animate={{ x: ["-10%", "110%"] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-1.5 h-3 w-3 rounded-full bg-accent shadow-[0_0_20px_hsl(var(--accent))]" />
              <div className="absolute left-1/2 -translate-x-1/2 -top-8 rounded-full bg-gradient-hero px-4 py-1 text-xs font-semibold text-white shadow-elevated">UNISHARK</div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-[22px] border-2 border-primary-dark bg-card text-primary-dark shadow-elevated">
                <span className="font-display text-3xl font-black tracking-tight">₹</span>
                <span className="absolute -bottom-1.5 -right-1.5 rounded-md bg-primary-dark px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">Capital</span>
              </div>
              <span className="text-sm font-semibold text-primary-dark">Investors</span>
            </div>
          </motion.div>

          <div className="relative mt-14 grid gap-6 md:grid-cols-2">
            {[
              { mark: "S/", title: "For Students", tag: "Free to apply", grad: "from-primary/20 via-primary/5 to-transparent", markBg: "bg-primary-dark text-white", accentDot: "bg-accent", items: ["Reach 150+ verified angels", "Pitch wizard & deck templates", "Legal docs (SAFE, NDA, TS)", "Idea protection with watermarks"] },
              { mark: "I/", title: "For Investors", tag: "Curated deal flow", grad: "from-accent/20 via-accent/5 to-transparent", markBg: "bg-card text-primary-dark border-2 border-primary-dark", accentDot: "bg-primary-dark", items: ["Pre-vetted deal flow", "Easy browsing & filters", "Portfolio tracking dashboard", "Syndicate with other angels"] },
            ].map((s, i) => (
              <motion.div key={s.title} variants={fadeUp} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <Card className={`group relative h-full overflow-hidden rounded-[28px] border-border/60 bg-card p-8 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated`}>
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${s.grad} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                  <div className="relative flex items-center justify-between">
                    <div className={`relative inline-flex h-14 w-14 items-center justify-center rounded-2xl ${s.markBg} shadow-card`}>
                      <span className="font-display text-2xl font-black leading-none tracking-tight">{s.mark}</span>
                      <span className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full ${s.accentDot} ring-4 ring-card`} />
                    </div>
                    <span className="rounded-full border border-border bg-background/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground backdrop-blur">{s.tag}</span>
                  </div>
                  <h3 className="relative mt-6 font-display text-3xl font-semibold text-primary-dark">{s.title}</h3>
                  <ul className="relative mt-6 space-y-3">
                    {s.items.map((it) => (
                      <li key={it} className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                        <span className="text-foreground/80">{it}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={`/signup?role=${s.title.includes("Student") ? "student" : "investor"}`}
                    className="relative mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all">
                    Get started <ArrowRight className="h-4 w-4" />
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative container mx-auto px-4 py-28 md:py-36">
        <motion.div style={{ y: blobY }} className="pointer-events-none absolute right-0 top-20 -z-10 hidden lg:block">
          <img src={orb} alt="" className="h-[520px] w-[520px] opacity-70" loading="lazy"  decoding="async" />
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">How it works</span>
          <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold tracking-tight text-primary-dark">Three steps. <span className="text-gradient">Zero friction.</span></h2>
          <p className="mt-5 text-lg text-muted-foreground">From idea to funded — without the cold-email grind.</p>
        </motion.div>

        <div className="relative mt-20">
          {/* Connector line */}
          <div className="pointer-events-none absolute left-[12%] right-[12%] top-1/2 hidden h-px -translate-y-1/2 bg-[repeating-linear-gradient(90deg,hsl(var(--primary)/0.35)_0_6px,transparent_6px_14px)] md:block" />
          <div className="grid gap-10 md:grid-cols-3 md:gap-6">
            {[
              { title: "Pitch", body: "Submit your startup idea in our 5-minute form. We vet it for quality. Go live.", n: "01", time: "5 min", glyph: "✎" },
              { title: "Match", body: "Verified investors discover your pitch. Bookmark, message, request the deck.", n: "02", time: "48 hrs", glyph: "◎" },
              { title: "Close", body: "Chat in-app, share legal docs, get introduced. We support you to term sheet.", n: "03", time: "2-4 wks", glyph: "✦" },
            ].map((it, i) => (
              <motion.div key={it.title} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="group relative">
                <Card className="relative h-full rounded-[28px] border border-border/60 bg-card/90 p-8 shadow-card backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated">
                  {/* Oversized outline number */}
                  <div className="pointer-events-none absolute right-5 top-2 select-none font-display text-[110px] font-black leading-none tracking-tighter text-transparent [-webkit-text-stroke:1.5px_hsl(var(--primary)/0.18)] group-hover:[-webkit-text-stroke-color:hsl(var(--accent)/0.45)] transition-colors">
                    {it.n}
                  </div>
                  {/* Custom glyph mark */}
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-dark text-3xl text-accent shadow-card">
                    <span className="font-display leading-none">{it.glyph}</span>
                    <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-accent ring-4 ring-card" />
                  </div>
                  <h3 className="relative mt-8 font-display text-2xl font-semibold text-primary-dark">{it.title}</h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
                  <div className="relative mt-6 flex items-center justify-between border-t border-dashed border-border/70 pt-4">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Step {it.n}</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                      <Zap className="h-3 w-3" /> {it.time}
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative bg-surface py-28 overflow-hidden">
        <div className="pointer-events-none absolute inset-0" style={{ background: "var(--gradient-mesh)" }} />
        <div className="container mx-auto px-4">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">Key features</span>
            <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold tracking-tight text-primary-dark">Everything you need to <span className="text-gradient">ship a round.</span></h2>
            <p className="mt-5 text-muted-foreground">From draft to deck to term sheet — built into one platform.</p>
          </motion.div>

          <div className="relative mt-14 grid gap-4 md:grid-cols-6 md:auto-rows-[200px]">
            {[
              { icon: Rocket, title: "5-step pitch wizard", body: "Auto-save, deck upload, draft anytime.", span: "md:col-span-3 md:row-span-2", featured: true },
              { icon: MessageSquare, title: "In-app messaging", body: "Talk to investors on the platform.", span: "md:col-span-3" },
              { icon: FileText, title: "Legal templates", body: "SAFE, Term Sheet, NDA — ready to use.", span: "md:col-span-3" },
              { icon: Lock, title: "Idea protection", body: "Watermarked decks. Traceable downloads.", span: "md:col-span-2" },
              { icon: BarChart3, title: "Investor analytics", body: "Track views, bookmarks, intros.", span: "md:col-span-2" },
              { icon: ShieldCheck, title: "Vetted only", body: "100% manual review.", span: "md:col-span-2" },
            ].map((f, i) => (
              <motion.div key={f.title} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className={f.span}>
                <Card className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border-border/60 p-6 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated ${f.featured ? "bg-gradient-hero text-primary-foreground border-0" : "bg-background/80 backdrop-blur"}`}>
                  {f.featured && (
                    <>
                      <img
                        src={wizardArt}
                        alt="5-step pitch wizard preview"
                        loading="lazy"
                        width={1024}
                        height={1024}
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                        decoding="async"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                    </>
                  )}
                  <div className={`relative inline-flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 ${f.featured ? "bg-white/15 text-white" : "bg-gradient-to-br from-primary/15 to-accent/15 text-primary"}`}>
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div className="relative">
                    <h3 className={`font-display font-semibold ${f.featured ? "text-3xl text-white" : "text-lg text-primary-dark"}`}>{f.title}</h3>
                    <p className={`mt-2 text-sm ${f.featured ? "text-white/80" : "text-muted-foreground"}`}>{f.body}</p>
                    {f.featured && (
                      <div className="mt-6 flex flex-wrap gap-2">
                        {["Idea", "Market", "Team", "Traction", "Ask"].map((s, k) => (
                          <span key={k} className={`rounded-full px-3 py-1 text-xs font-medium ${k===2 ? "bg-accent text-white" : "bg-white/10 text-white/80"}`}>{k+1}. {s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {f.featured && <div className="pointer-events-none absolute -bottom-12 -right-12 h-56 w-56 rounded-full bg-accent/40 blur-3xl" />}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section id="stories" className="container mx-auto px-4 py-28">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">Success stories</span>
          <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold tracking-tight text-primary-dark">Real founders. <span className="text-gradient">Real cheques.</span></h2>
        </motion.div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { name: "Aarav Mehta", role: "Founder, IIT Bombay", quote: "Closed our pre-seed in 19 days. The vetting meant every conversation was real.", tag: "Raised ₹85L" },
            { name: "Raj Patel", role: "Angel investor, IIT '05", quote: "Got access to 50+ high-quality student founders. Already invested in 2 — both growing fast.", tag: "3 exits" },
            { name: "Vedant Kumar", role: "Founder, AIFlow • BITS Pilani", quote: "UniShark handled everything — legal, intros, watermarking. Professional and transparent.", tag: "Pre-seed closed" },
          ].map((t, i) => (
            <motion.div key={t.name} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <div className="group relative h-full">
                <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-primary/40 via-accent/30 to-transparent opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100" />
                <Card className="relative h-full rounded-3xl border-border/60 bg-card p-8 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated">
                  <Quote className="h-8 w-8 text-primary/20" />
                  <p className="mt-4 text-base leading-relaxed text-foreground/85">"{t.quote}"</p>
                  <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute -inset-0.5 rounded-full bg-gradient-hero blur-[2px]" />
                        <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-hero font-display font-bold text-primary-foreground">{t.name[0]}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-primary-dark text-sm">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                    <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">{t.tag}</span>
                  </div>
                  <div className="mt-4 flex gap-1 text-accent">{[...Array(5)].map((_, k) => <Star key={k} className="h-3.5 w-3.5 fill-current" />)}</div>
                </Card>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* INVESTOR BENEFITS */}
      <section id="investors" className="relative bg-primary-dark py-28 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ background: "var(--gradient-mesh)" }} />
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="lg:col-span-7">
              <span className="inline-block rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-accent-glow">For investors</span>
              <h2 className="mt-6 font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.02]">
                Where angels <span className="bg-gradient-to-r from-accent to-accent-glow bg-clip-text text-transparent">find their next bet.</span>
              </h2>
              <p className="mt-5 max-w-xl text-lg text-white/70">Curated, vetted, India-first deal flow — without the inbox noise.</p>

              <ul className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
                {[
                  "150+ verified investors onboarded",
                  "5 strong pitches a week",
                  "Filter by sector, stage, ticket",
                  "Watermarked decks for IP safety",
                ].map((it) => (
                  <li key={it} className="flex items-start gap-2 text-sm text-white/85">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-glow" />
                    {it}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full bg-accent px-7 text-white hover:bg-accent/90">
                  <Link to="/signup?role=investor"><Briefcase className="mr-2 h-5 w-5" /> Apply as investor</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-white/30 bg-white/5 px-7 text-white hover:bg-white/10 hover:text-white">
                  <a href="#how">How vetting works <ArrowRight className="ml-2 h-4 w-4" /></a>
                </Button>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={1} className="lg:col-span-5">
              <div className="relative mx-auto max-w-md">
                <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-accent/40 to-primary-glow/30 blur-3xl" />
                <motion.img
                  src={investorArt}
                  alt="Investor reviewing student pitches"
                  width={1024} height={1024} loading="lazy"
                  className="w-full select-none drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                 decoding="async" />
                <motion.div
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
                  className="absolute right-0 top-6 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white backdrop-blur-md"
                >
                  <ShieldCheck className="h-4 w-4 text-accent-glow" /> Verified investor
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.55 }}
                  className="absolute -left-2 bottom-12 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white backdrop-blur-md"
                >
                  <TrendingUp className="h-4 w-4 text-accent-glow" /> +18% IRR (avg cohort)
                </motion.div>
              </div>
            </motion.div>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              { icon: ShieldCheck, t: "Pre-vetted founders", b: "100% manual review before listing." },
              { icon: Search, t: "Quality deal flow", b: "5 strong pitches a week — not 50 cold emails." },
              { icon: BarChart3, t: "Portfolio tracking", b: "Monitor every investment in one place." },
              { icon: Network, t: "Investor network", b: "Syndicate with other vetted angels." },
              { icon: FileText, t: "Legal-ready docs", b: "SAFE, Term Sheet, NDA — generated instantly." },
              { icon: Award, t: "Founder support", b: "We help portfolio cos with intros & growth." },
            ].map((b, i) => (
              <motion.div key={b.t} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.08] hover:border-accent/40">
                <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-accent/0 blur-2xl transition-all duration-500 group-hover:bg-accent/30" />
                <div className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent/30 to-accent/10 text-accent-glow ring-1 ring-white/10">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="relative mt-5 font-display text-lg font-semibold">{b.t}</h3>
                <p className="relative mt-2 text-sm text-white/70">{b.b}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white/70 backdrop-blur">
              <IndianRupee className="h-4 w-4 text-accent-glow" />
              <span>Free to browse • <span className="text-white">₹5K/month</span> for premium filters</span>
            </div>
          </div>
        </div>
      </section>

      {/* STUDENT BENEFITS */}
      <section id="students" className="container mx-auto px-4 py-28">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">For students</span>
          <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold tracking-tight text-primary-dark">Why founders <span className="text-gradient">pick UniShark.</span></h2>
          <p className="mt-5 text-lg text-muted-foreground">Built by founders, for founders. We obsess over your time and your idea.</p>
        </motion.div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {[
            { icon: Target, t: "Direct investor access", b: "150+ verified angels actively browsing." },
            { icon: Lock, t: "Idea protection", b: "Watermarked pitches. Legal IP shield." },
            { icon: FileText, t: "Free legal templates", b: "SAFE, Term Sheet, NDA — vetted by lawyers." },
            { icon: Heart, t: "Mentorship", b: "Pitch feedback from real operators." },
            { icon: Users, t: "Founder community", b: "Network with other student founders." },
            { icon: Award, t: "Track record building", b: "Verified milestones for future rounds." },
          ].map((b, i) => (
            <motion.div key={b.t} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <div className="group relative h-full">
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-accent/40 to-primary/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <Card className="relative h-full rounded-2xl border-border/60 bg-card p-6 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-accent text-white shadow-card">
                    <b.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-primary-dark">{b.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{b.b}</p>
                </Card>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-surface px-5 py-2.5 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span>Free to use • <span className="text-primary font-semibold">3% success fee</span> only when you close</span>
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="relative overflow-hidden bg-gradient-hero py-24 text-white noise">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
        <div className="pointer-events-none absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-accent/30 blur-3xl float-slow" />
        <div className="pointer-events-none absolute -bottom-20 right-1/4 h-72 w-72 rounded-full bg-primary-glow/40 blur-3xl float-slow" style={{ animationDelay: "-4s" }} />
        <div className="relative container mx-auto px-4">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">By the numbers</span>
            <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold tracking-tight">Numbers that <span className="italic text-gradient">matter.</span></h2>
          </motion.div>
          <div className="mt-12 grid gap-6 grid-cols-2 md:grid-cols-4">
            {[
              { k: "₹12Cr+", v: "Capital intent" },
              { k: "150+", v: "Verified angels" },
              { k: "500+", v: "Founders onboarded" },
              { k: "48 hrs", v: "Avg review time" },
              { k: "50+", v: "Indian colleges" },
              { k: "19", v: "Days to close (avg)" },
              { k: "100%", v: "Manually vetted" },
              { k: "3%", v: "Success fee only" },
            ].map((s, i) => (
              <motion.div key={s.v} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-6 text-center backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.1]">
                <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent-glow to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="font-display text-3xl md:text-5xl font-bold tracking-tight">{s.k}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.2em] text-white/70">{s.v}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container mx-auto px-4 py-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="lg:col-span-4">
            <span className="inline-block rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">FAQ</span>
            <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold tracking-tight text-primary-dark leading-[1.05]">
              Questions, <span className="text-gradient">answered.</span>
            </h2>
            <p className="mt-5 text-muted-foreground">Everything you need to know before signing up. Still curious?</p>
            <a href="mailto:hello@unishark.in" className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary-dark px-5 py-2.5 text-sm font-medium text-white hover:bg-primary transition-colors">
              <Mail className="h-4 w-4" /> Email the team
            </a>
          </motion.div>
          <div className="lg:col-span-8 space-y-3">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <motion.div key={f.q} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                  <Card className={`overflow-hidden rounded-2xl border bg-card shadow-card transition-all duration-300 ${open ? "border-primary/40 shadow-elevated" : "border-border/60"}`}>
                    <button onClick={() => setOpenFaq(open ? null : i)} className="flex w-full items-center justify-between gap-4 p-6 text-left">
                      <span className="flex items-center gap-4">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-display text-sm font-bold transition-colors ${open ? "bg-gradient-hero text-white" : "bg-primary/10 text-primary"}`}>
                          {String(i+1).padStart(2,"0")}
                        </span>
                        <span className="font-display text-base md:text-lg font-semibold text-primary-dark">{f.q}</span>
                      </span>
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${open ? "rotate-180 bg-primary text-white" : "bg-muted text-primary"}`}>
                        {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </div>
                    </button>
                    <motion.div
                      initial={false}
                      animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden">
                      <div className="px-6 pb-6 pl-[4.5rem] text-sm leading-relaxed text-muted-foreground">{f.a}</div>
                    </motion.div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-28">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 md:p-20 text-center shadow-elevated noise">
          <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-accent/40 blur-3xl blob" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/20 blur-3xl blob" style={{ animationDelay: "-7s" }} />
          <div className="relative">
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white">Ready to get funded?</h2>
            <p className="mx-auto mt-5 max-w-xl text-white/80 text-lg">Join 500+ founders and investors on UniShark.</p>
            <ul className="mx-auto mt-8 flex max-w-xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/80">
              {["Free to apply", "48-hour review", "No equity taken"].map((x) => (
                <li key={x} className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-glow" /> {x}</li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-full bg-white px-7 text-base font-semibold text-primary-dark hover:bg-white/90">
                <Link to="/signup?role=student"><GraduationCap className="mr-2 h-5 w-5" /> I'm a Student</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-white/30 bg-transparent px-7 text-base font-semibold text-white hover:bg-white/10 hover:text-white">
                <Link to="/signup?role=investor"><Briefcase className="mr-2 h-5 w-5" /> I'm an Investor</Link>
              </Button>
            </div>
            <p className="mt-5 text-sm text-white/70">Already on UniShark? <Link to="/login" className="underline underline-offset-4">Sign in</Link></p>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-primary-dark text-white/80">
        <div className="container mx-auto grid gap-10 px-4 py-16 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="font-display text-2xl font-bold text-white">UNISHARK</div>
            <p className="mt-3 max-w-sm text-sm text-white/60">India's first curated marketplace for student founders & angel investors.</p>
            <div className="mt-6 flex gap-3">
              {[Twitter, Linkedin, Instagram].map((I, i) => (
                <a key={i} href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 hover:border-accent hover:text-accent-glow transition-colors">
                  <I className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold text-white">Company</h4>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li><a href="#" className="hover:text-white">About</a></li>
              <li><a href="#" className="hover:text-white">Team</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold text-white">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">DPDP Compliance</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold text-white">Contact</h4>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@unishark.in</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 98765 43210</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} UniShark — Built for Indian student founders.
        </div>
      </footer>
    </div>
  );
};

export default Index;

import { Link } from "react-router-dom";
import { useState, useEffect, useRef, ReactNode } from "react";
import { motion, useScroll, useSpring, useInView, useMotionValue, useTransform, animate, useReducedMotion, type Variants } from "framer-motion";
import Navbar from "@/components/Navbar";
import MagneticButton from "@/components/MagneticButton";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, ArrowRight, GraduationCap, Briefcase,
  Rocket, Lock, CheckCircle2, MessageSquare, Sparkles,
  FileText, Network, BarChart3, Search, Award, Heart, Target,
  Plus, Minus, Mail, Phone, Twitter, Linkedin, Instagram, Users, Star,
  AlertTriangle, Wrench, Settings2, HelpCircle, Zap, PencilLine, Handshake,
  TrendingUp, Banknote,
} from "lucide-react";
import brutalHero from "@/assets/brutal-hero.webp";
import brutalInvestor from "@/assets/brutal-investor.webp";

const colleges = ["IIT Bombay", "BITS Pilani", "IIT Delhi", "VIT Vellore", "NIT Trichy", "IIIT Hyderabad", "IIT Madras", "IIT Kanpur"];

const faqs = [
  { q: "Is UniShark free for students?", a: "Yes — submitting your pitch is free. We only take a 3% success fee when you successfully close a round through the platform." },
  { q: "How are investors verified?", a: "Every investor goes through manual KYC, LinkedIn verification, and reference checks before they can browse pitches." },
  { q: "Who owns my pitch deck?", a: "You do. We watermark every download with the investor's identity and timestamp so your idea stays protected." },
  { q: "How long does pitch review take?", a: "Our team reviews every submission within 48 hours and gives you concrete feedback before going live." },
  { q: "Do I need to be from an IIT or BITS?", a: "No. We work with founders from any recognized Indian college — quality of idea matters more than the badge." },
];

// Neo-brutalist primitives
const brutalBorder = "border-2 border-foreground";
const brutalShadow = "shadow-[6px_6px_0_0_hsl(var(--foreground))]";
const brutalShadowSm = "shadow-[3px_3px_0_0_hsl(var(--foreground))]";
const brutalShadowLg = "shadow-[10px_10px_0_0_hsl(var(--foreground))]";

// ——— Motion helpers ———
const EASE = [0.22, 1, 0.36, 1] as const;
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE as any } },
};
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const Reveal = ({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: "-80px" }}
    variants={{ hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: EASE as any } } }}
    className={className}
  >
    {children}
  </motion.div>
);

const StaggerGroup = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <motion.div
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: "-60px" }}
    variants={stagger}
    className={className}
  >
    {children}
  </motion.div>
);

const StaggerItem = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <motion.div variants={fadeUp} className={className}>
    {children}
  </motion.div>
);

// Count-up number for stats
function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  // Parse leading number (handles ₹85L, 50K, <2%, ₹0, 19, 100%, etc.)
  const match = value.match(/([^\d.]*)([\d.]+)(.*)/);
  useEffect(() => {
    if (!inView || !ref.current || !match || reduce) return;
    const target = parseFloat(match[2]);
    const prefix = match[1] ?? "";
    const suffix = match[3] ?? "";
    const controls = animate(0, target, {
      duration: 1.4,
      ease: EASE as any,
      onUpdate: (v) => {
        if (!ref.current) return;
        const display = target % 1 === 0 ? Math.round(v).toString() : v.toFixed(1);
        ref.current.textContent = `${prefix}${display}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, match, reduce]);
  return <span ref={ref}>{value}</span>;
}

const Card = ({ className = "", children, bg = "bg-card" }: any) => (
  <div className={`${bg} ${brutalBorder} ${brutalShadow} rounded-[28px] transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_0_hsl(var(--foreground))] ${className}`}>
    {children}
  </div>
);

const Pill = ({ children, bg = "bg-card" }: any) => (
  <span className={`inline-flex items-center gap-2 ${bg} ${brutalBorder} ${brutalShadowSm} rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider`}>
    {children}
  </span>
);

const Index = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 20, mass: 0.3 });

  // Hero parallax tilt on mouse
  const heroX = useMotionValue(0);
  const heroY = useMotionValue(0);
  const tiltX = useTransform(heroY, [-50, 50], [6, -6]);
  const tiltY = useTransform(heroX, [-50, 50], [-6, 6]);
  const handleHeroMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    heroX.set(e.clientX - rect.left - rect.width / 2);
    heroY.set(e.clientY - rect.top - rect.height / 2);
  };
  const resetHero = () => { heroX.set(0); heroY.set(0); };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX, transformOrigin: "0% 50%" }}
        className="fixed top-0 left-0 right-0 h-1.5 bg-foreground z-50"
      />
      <Navbar />

      {/* HERO */}
      <section id="home" className="relative container mx-auto px-4 sm:px-6 pt-12 pb-20 md:pt-24 md:pb-32 max-w-6xl">
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_30%,black_40%,transparent_100%)]">
          <motion.div animate={{ y: [0, -20, 0], x: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }} className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-[hsl(var(--pastel-pink))] rounded-full filter blur-[100px] opacity-30 dark:opacity-10" />
          <motion.div animate={{ y: [0, 30, 0], x: [0, -30, 0] }} transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }} className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-[hsl(var(--pastel-mint))] rounded-full filter blur-[100px] opacity-30 dark:opacity-10" />
          <motion.div animate={{ y: [0, -40, 0], x: [0, 40, 0] }} transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }} className="absolute -bottom-[10%] left-[20%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-[hsl(var(--pastel-blue))] rounded-full filter blur-[100px] opacity-30 dark:opacity-10" />
        </div>
        <div className="absolute inset-0 dotted-bg opacity-60 -z-0 pointer-events-none [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black_40%,transparent_80%)]" />
        <Sparkles className="absolute top-10 right-1/3 h-5 w-5 text-foreground sparkle hidden md:block" />
        <Sparkles className="absolute bottom-24 left-10 h-6 w-6 text-foreground sparkle hidden md:block" style={{ animationDelay: "1s" }} />
        <div className="relative">
        <motion.div initial="hidden" animate="show" variants={stagger} className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-7">
            <motion.div variants={fadeUp}>
            <Pill bg="bg-[hsl(var(--pastel-yellow))]">
              <span className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
              India's student-founder marketplace
            </Pill>
            </motion.div>
            <motion.h1 variants={fadeUp} className="mt-6 font-display text-4xl sm:text-5xl md:text-7xl lg:text-[5.25rem] font-bold tracking-tight leading-[1.05] md:leading-[0.98]">
              Where student <span className="inline-block bg-[hsl(var(--pastel-pink))] px-3 -rotate-2 border-2 border-foreground rounded-2xl">founders</span> meet real <span className="inline-block bg-[hsl(var(--pastel-mint))] px-3 rotate-1 border-2 border-foreground rounded-2xl">capital.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-8 text-lg text-muted-foreground max-w-xl leading-relaxed">
              50,000 ideas a year. Less than 2% get funded. UniShark is the curated bridge — vetted founders, verified investors, zero cold emails.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4">
              <MagneticButton>
                <Button asChild size="lg" className={`h-14 rounded-full px-8 text-base font-bold ${brutalBorder} ${brutalShadow} bg-foreground text-background hover:bg-foreground hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_0_hsl(var(--foreground))] transition-all`}>
                  <Link to="/signup?role=student"><GraduationCap className="mr-2 h-5 w-5" /> I'm a Student</Link>
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button asChild size="lg" className={`h-14 rounded-full px-8 text-base font-bold ${brutalBorder} ${brutalShadow} bg-[hsl(var(--accent))] text-foreground hover:bg-[hsl(var(--accent))] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_0_hsl(var(--foreground))] transition-all`}>
                  <Link to="/signup?role=investor"><Briefcase className="mr-2 h-5 w-5" /> I'm an Investor</Link>
                </Button>
              </MagneticButton>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4 text-sm">
              <div className="flex -space-x-2">
                {["bg-[hsl(var(--pastel-pink))]", "bg-[hsl(var(--pastel-mint))]", "bg-[hsl(var(--pastel-blue))]", "bg-[hsl(var(--pastel-yellow))]"].map((c, i) => (
                  <span key={i} className={`h-8 w-8 rounded-full ${c} border-2 border-foreground`} />
                ))}
              </div>
              <span className="text-muted-foreground"><span className="font-bold text-foreground">500+ founders</span> & <span className="font-bold text-foreground">150+ angels</span> already in</span>
            </motion.div>
          </div>

          <motion.div variants={fadeUp} className="lg:col-span-5 relative" onMouseMove={handleHeroMouse} onMouseLeave={resetHero}>
            <motion.div style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1000 }} className={`relative bg-[hsl(var(--pastel-lilac))] ${brutalBorder} ${brutalShadowLg} rounded-[32px] p-4 rotate-2 will-change-transform`}>
              <img src={brutalHero} alt="Student founder pitching" width={1024} height={1024} className="w-full rounded-[20px] border-2 border-foreground" decoding="async" />
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.6, rotate: -20 }} animate={{ opacity: 1, scale: 1, rotate: -6 }} transition={{ delay: 0.5, type: "spring", stiffness: 180, damping: 14 }} className={`absolute -top-6 -left-6 bg-[hsl(var(--pastel-yellow))] ${brutalBorder} ${brutalShadow} rounded-2xl px-4 py-3 hidden md:block wiggle`}>
              <div className="text-xs font-bold uppercase tracking-wider">Funded</div>
              <div className="font-display text-2xl font-bold flex items-center gap-1.5">₹85L <Rocket className="h-5 w-5" strokeWidth={2.5} /></div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.6, rotate: 20 }} animate={{ opacity: 1, scale: 1, rotate: 3 }} transition={{ delay: 0.7, type: "spring", stiffness: 180, damping: 14 }} className={`absolute -bottom-4 -right-2 bg-[hsl(var(--pastel-mint))] ${brutalBorder} ${brutalShadow} rounded-2xl px-4 py-3 hidden md:block`}>
              <div className="text-xs font-bold uppercase tracking-wider">48 hr review</div>
              <div className="font-display text-base font-bold flex items-center gap-1.5"><Zap className="h-4 w-4" strokeWidth={2.5} /> Lightning fast</div>
            </motion.div>
          </motion.div>
        </motion.div>
        </div>
      </section>

      {/* COLLEGES */}
      <section className={`bg-[hsl(var(--pastel-blue))] border-y-2 border-foreground py-8 overflow-hidden`}>
        <p className="text-center text-xs uppercase tracking-[0.25em] font-bold mb-5 flex items-center justify-center gap-2"><Star className="h-3.5 w-3.5 fill-foreground" strokeWidth={2.5} /> Founders & angels from <Star className="h-3.5 w-3.5 fill-foreground" strokeWidth={2.5} /></p>
        <div className="relative [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <div className="flex gap-3 marquee w-max">
            {[...colleges, ...colleges, ...colleges].map((c, i) => (
              <span key={i} className={`bg-card ${brutalBorder} ${brutalShadowSm} rounded-full px-4 py-1.5 text-sm font-bold whitespace-nowrap ${i % 2 ? "rotate-1" : "-rotate-1"}`}>{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section id="problem" className="container mx-auto px-4 sm:px-6 py-16 md:py-32 max-w-6xl">
        <div className="max-w-2xl mb-10 md:mb-16">
          <Pill bg="bg-[hsl(var(--pastel-pink))]"><AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.5} /> The problem</Pill>
          <h2 className="mt-6 font-display text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            The funnel is <span className="inline-block bg-[hsl(var(--destructive))] text-destructive-foreground px-3 -rotate-2 border-2 border-foreground rounded-2xl">broken.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">India is bursting with student talent — but the path from idea to capital is broken. Cold emails. No network. No trust layer.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { n: "50K", label: "Students with ideas", bg: "bg-[hsl(var(--pastel-yellow))]" },
            { n: "7.5K", label: "Reach an investor", bg: "bg-[hsl(var(--pastel-peach))]" },
            { n: "<2%", label: "Get funded", bg: "bg-[hsl(var(--pastel-pink))]" },
            { n: "₹0", label: "Raised by 98%", bg: "bg-[hsl(var(--pastel-lilac))]" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: EASE as any }}
              whileHover={{ y: -6, rotate: i % 2 ? 2 : -2 }}
            >
              <Card bg={s.bg} className={`p-6 ${i % 2 ? "rotate-1" : "-rotate-1"}`}>
                <div className="font-display text-5xl font-bold tracking-tight"><CountUp value={s.n} /></div>
                <div className="mt-3 text-sm font-medium">{s.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SOLUTION */}
      <section id="solution" className="bg-[hsl(var(--surface))] border-y-2 border-foreground py-16 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <Reveal className="max-w-2xl mb-10 md:mb-16 text-center mx-auto">
            <Pill bg="bg-[hsl(var(--pastel-mint))]"><Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} /> The solution</Pill>
            <h2 className="mt-6 font-display text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">One bridge. Two sides.</h2>
            <p className="mt-5 text-lg text-muted-foreground">A curated marketplace built for both — vetted, secure, India-first.</p>
          </Reveal>
          <StaggerGroup className="grid md:grid-cols-2 gap-8">
            {[
              { title: "For Students", Icon: GraduationCap, tag: "Free to apply", role: "student", bg: "bg-[hsl(var(--pastel-pink))]", items: ["Reach 150+ verified angels", "Pitch wizard & deck templates", "Legal docs (SAFE, NDA, TS)", "Idea protection with watermarks"] },
              { title: "For Investors", Icon: Briefcase, tag: "Curated deal flow", role: "investor", bg: "bg-[hsl(var(--pastel-mint))]", items: ["Pre-vetted deal flow", "Easy browsing & filters", "Portfolio tracking dashboard", "Syndicate with other angels"] },
            ].map((s, i) => (
              <StaggerItem key={s.title}>
              <Card bg={s.bg} className={`p-8 md:p-10 ${i ? "md:rotate-1" : "md:-rotate-1"}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex h-12 w-12 items-center justify-center bg-card ${brutalBorder} rounded-2xl`}>
                      <s.Icon className="h-6 w-6" strokeWidth={2.5} />
                    </span>
                    <h3 className="font-display text-2xl md:text-3xl font-bold">{s.title}</h3>
                  </div>
                  <span className={`bg-card ${brutalBorder} rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider`}>{s.tag}</span>
                </div>
                <ul className="mt-8 space-y-4">
                  {s.items.map((it) => (
                    <li key={it} className="flex items-start gap-3 text-sm font-medium">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={2.5} />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className={`mt-8 ${brutalBorder} ${brutalShadowSm} bg-foreground text-background rounded-full font-bold hover:bg-foreground`}>
                  <Link to={`/signup?role=${s.role}`}>Get started <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </Card>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="container mx-auto px-4 sm:px-6 py-16 md:py-32 max-w-6xl">
        <Reveal className="max-w-2xl mb-10 md:mb-16">
          <Pill bg="bg-[hsl(var(--pastel-blue))]"><Wrench className="h-3.5 w-3.5" strokeWidth={2.5} /> How it works</Pill>
          <h2 className="mt-6 font-display text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">Three steps. Zero friction.</h2>
          <p className="mt-5 text-lg text-muted-foreground">From idea to funded — without the cold-email grind.</p>
        </Reveal>
        <StaggerGroup className="grid md:grid-cols-3 gap-8">
          {[
            { n: "01", title: "Pitch", body: "Submit your startup idea in our 5-minute form. We vet it for quality. Go live.", time: "5 min", Icon: PencilLine, bg: "bg-[hsl(var(--pastel-yellow))]" },
            { n: "02", title: "Match", body: "Verified investors discover your pitch. Bookmark, message, request the deck.", time: "48 hrs", Icon: Handshake, bg: "bg-[hsl(var(--pastel-peach))]" },
            { n: "03", title: "Close", body: "Chat in-app, share legal docs, get introduced. We support you to term sheet.", time: "2-4 wks", Icon: Rocket, bg: "bg-[hsl(var(--pastel-mint))]" },
          ].map((it, i) => (
            <StaggerItem key={it.n}>
            <Card bg={it.bg} className={`p-8 ${i === 1 ? "md:translate-y-6" : ""}`}>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-5xl font-bold tracking-tight">{it.n}</span>
                <span className={`bg-card ${brutalBorder} rounded-full px-3 py-1 text-xs font-bold inline-flex items-center gap-1`}><Zap className="h-3 w-3" strokeWidth={3} /> {it.time}</span>
              </div>
              <div className={`mt-6 inline-flex h-14 w-14 items-center justify-center bg-foreground text-background ${brutalBorder} rounded-2xl`}>
                <it.Icon className="h-7 w-7" strokeWidth={2.5} />
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold">{it.title}</h3>
              <p className="mt-3 text-sm font-medium leading-relaxed">{it.body}</p>
            </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-[hsl(var(--pastel-lilac))] border-y-2 border-foreground py-16 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="max-w-2xl mb-10 md:mb-16">
            <Pill bg="bg-card"><Settings2 className="h-3.5 w-3.5" strokeWidth={2.5} /> Key features</Pill>
            <h2 className="mt-6 font-display text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">Everything you need to ship a round.</h2>
            <p className="mt-5 text-lg text-muted-foreground">From draft to deck to term sheet — built into one platform.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Rocket, title: "5-step pitch wizard", body: "Auto-save, deck upload, draft anytime.", bg: "bg-[hsl(var(--pastel-pink))]" },
              { icon: MessageSquare, title: "In-app messaging", body: "Talk to investors on the platform.", bg: "bg-[hsl(var(--pastel-yellow))]" },
              { icon: FileText, title: "Legal templates", body: "SAFE, Term Sheet, NDA — ready to use.", bg: "bg-[hsl(var(--pastel-mint))]" },
              { icon: Lock, title: "Idea protection", body: "Watermarked decks. Traceable downloads.", bg: "bg-[hsl(var(--pastel-blue))]" },
              { icon: BarChart3, title: "Investor analytics", body: "Track views, bookmarks, intros.", bg: "bg-[hsl(var(--pastel-peach))]" },
              { icon: ShieldCheck, title: "Vetted only", body: "100% manual review.", bg: "bg-card" },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: EASE as any }}
                whileHover={{ y: -4 }}
              >
                <Card bg={f.bg} className="p-6 group">
                  <motion.div
                    whileHover={{ rotate: -8, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 12 }}
                    className={`inline-flex h-12 w-12 items-center justify-center bg-foreground text-background ${brutalBorder} rounded-2xl`}
                  >
                    <f.icon className="h-5 w-5" strokeWidth={2.5} />
                  </motion.div>
                  <h3 className="mt-5 font-display text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm font-medium text-muted-foreground">{f.body}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section id="stories" className="container mx-auto px-4 sm:px-6 py-16 md:py-32 max-w-6xl">
        <div className="max-w-2xl mb-10 md:mb-16">
          <Pill bg="bg-[hsl(var(--pastel-yellow))]"><Star className="h-3.5 w-3.5 fill-foreground" strokeWidth={2.5} /> Success stories</Pill>
          <h2 className="mt-6 font-display text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">Real founders. Real cheques.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Aarav Mehta", role: "Founder, IIT Bombay", quote: "Closed our pre-seed in 19 days. The vetting meant every conversation was real.", tag: "Raised ₹85L", bg: "bg-[hsl(var(--pastel-pink))]" },
            { name: "Raj Patel", role: "Angel investor, IIT '05", quote: "Got access to 50+ high-quality student founders. Already invested in 2 — both growing fast.", tag: "3 exits", bg: "bg-[hsl(var(--pastel-mint))]" },
            { name: "Vedant Kumar", role: "Founder • BITS Pilani", quote: "UniShark handled everything — legal, intros, watermarking. Professional and transparent.", tag: "Pre-seed closed", bg: "bg-[hsl(var(--pastel-blue))]" },
          ].map((t, i) => (
            <Card key={t.name} bg={t.bg} className={`p-8 ${i === 1 ? "md:-translate-y-4" : ""}`}>
              <div className="flex gap-1">{[...Array(5)].map((_, k) => <Star key={k} className="h-4 w-4 fill-foreground" strokeWidth={2} />)}</div>
              <p className="mt-4 text-base font-medium leading-relaxed">"{t.quote}"</p>
              <div className="mt-6 pt-6 border-t-2 border-foreground flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full bg-card ${brutalBorder} flex items-center justify-center font-display font-bold`}>{t.name[0]}</div>
                  <div>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
              <div className={`mt-4 inline-block bg-card ${brutalBorder} rounded-full px-3 py-1 text-xs font-bold`}>{t.tag}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* INVESTORS */}
      <section id="investors" className="bg-foreground text-background border-y-2 border-foreground py-16 md:py-32 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7">
              <span className={`inline-flex items-center gap-2 bg-[hsl(var(--accent))] text-foreground border-2 border-background shadow-[3px_3px_0_0_hsl(var(--background))] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider`}>
                <Briefcase className="h-3.5 w-3.5" strokeWidth={2.5} /> For investors
              </span>
              <h2 className="mt-6 font-display text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
                Where angels find their <span className="inline-block bg-[hsl(var(--accent))] text-foreground px-3 rotate-1 border-2 border-background rounded-2xl">next bet.</span>
              </h2>
              <p className="mt-5 text-lg text-background/70 max-w-xl">Curated, vetted, India-first deal flow — without the inbox noise.</p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { icon: ShieldCheck, t: "Pre-vetted founders" },
                  { icon: Search, t: "Quality deal flow" },
                  { icon: BarChart3, t: "Portfolio tracking" },
                  { icon: Network, t: "Investor network" },
                  { icon: FileText, t: "Legal-ready docs" },
                  { icon: Award, t: "Founder support" },
                ].map((b) => (
                  <div key={b.t} className="flex items-center gap-3 text-sm font-medium">
                    <span className="inline-flex h-9 w-9 items-center justify-center bg-background text-foreground border-2 border-background rounded-xl">
                      <b.icon className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                    {b.t}
                  </div>
                ))}
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className={`h-14 rounded-full px-8 text-base font-bold border-2 border-background shadow-[6px_6px_0_0_hsl(var(--background))] bg-[hsl(var(--accent))] text-foreground hover:bg-[hsl(var(--accent))] hover:translate-x-[-2px] hover:translate-y-[-2px]`}>
                  <Link to="/signup?role=investor"><Briefcase className="mr-2 h-5 w-5" /> Apply as investor</Link>
                </Button>
                <span className="text-sm text-background/60">Free to browse · ₹5K/mo for premium</span>
              </div>
            </div>
            <div className="lg:col-span-5 relative">
              <div className={`relative bg-[hsl(var(--pastel-mint))] border-2 border-background shadow-[10px_10px_0_0_hsl(var(--background))] rounded-[32px] p-4 -rotate-2`}>
                <img src={brutalInvestor} alt="Investor reviewing pitches" width={1024} height={1024} loading="lazy" decoding="async" className="w-full rounded-[20px] border-2 border-foreground" />
              </div>
              <div className={`absolute -top-5 -right-3 bg-[hsl(var(--accent))] text-foreground border-2 border-background shadow-[4px_4px_0_0_hsl(var(--background))] rounded-2xl px-4 py-2 rotate-3 hidden md:block`}>
                <div className="font-display text-base font-bold">+18% IRR</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STUDENTS */}
      <section id="students" className="container mx-auto px-4 sm:px-6 py-16 md:py-32 max-w-6xl">
        <div className="max-w-2xl mb-10 md:mb-16">
          <Pill bg="bg-[hsl(var(--pastel-mint))]"><GraduationCap className="h-3.5 w-3.5" strokeWidth={2.5} /> For students</Pill>
          <h2 className="mt-6 font-display text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">Why founders pick UniShark.</h2>
          <p className="mt-5 text-lg text-muted-foreground">Built by founders, for founders. We obsess over your time and your idea.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {[
            { icon: Target, t: "Direct investor access", b: "150+ verified angels actively browsing.", bg: "bg-[hsl(var(--pastel-pink))]" },
            { icon: Lock, t: "Idea protection", b: "Watermarked pitches. Legal IP shield.", bg: "bg-[hsl(var(--pastel-yellow))]" },
            { icon: FileText, t: "Free legal templates", b: "SAFE, Term Sheet, NDA — vetted by lawyers.", bg: "bg-[hsl(var(--pastel-blue))]" },
            { icon: Heart, t: "Mentorship", b: "Pitch feedback from real operators.", bg: "bg-[hsl(var(--pastel-peach))]" },
            { icon: Users, t: "Founder community", b: "Network with other student founders.", bg: "bg-[hsl(var(--pastel-lilac))]" },
            { icon: Award, t: "Track record", b: "Verified milestones for future rounds.", bg: "bg-[hsl(var(--pastel-mint))]" },
          ].map((b) => (
            <Card key={b.t} bg={b.bg} className="p-6">
              <div className={`inline-flex h-12 w-12 items-center justify-center bg-foreground text-background ${brutalBorder} rounded-2xl`}>
                <b.icon className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold">{b.t}</h3>
              <p className="mt-2 text-sm font-medium text-muted-foreground">{b.b}</p>
            </Card>
          ))}
        </div>
        <div className="mt-12">
          <Pill bg="bg-card">✓ Free to use · 3% success fee only when you close</Pill>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-[hsl(var(--accent))] border-y-2 border-foreground py-14 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {[
              { k: "₹12Cr+", v: "Capital intent" },
              { k: "150+", v: "Verified angels" },
              { k: "500+", v: "Founders onboarded" },
              { k: "48 hrs", v: "Avg review" },
              { k: "50+", v: "Indian colleges" },
              { k: "19", v: "Days to close" },
              { k: "100%", v: "Manually vetted" },
              { k: "3%", v: "Success fee only" },
            ].map((s, i) => (
              <motion.div
                key={s.v}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: EASE as any }}
                whileHover={{ y: -4, x: -2 }}
                className={`bg-card ${brutalBorder} ${brutalShadow} rounded-2xl p-5 text-center hover:shadow-[10px_10px_0_0_hsl(var(--foreground))] transition-shadow`}
              >
                <div className="font-display text-3xl md:text-4xl font-bold tracking-tight"><CountUp value={s.k} /></div>
                <div className="mt-1 text-xs uppercase tracking-wider font-bold text-muted-foreground">{s.v}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container mx-auto px-4 sm:px-6 py-16 md:py-32 max-w-4xl">
        <div className="text-center mb-10 md:mb-16">
          <Pill bg="bg-[hsl(var(--pastel-yellow))]"><HelpCircle className="h-3.5 w-3.5" strokeWidth={2.5} /> FAQ</Pill>
          <h2 className="mt-6 font-display text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">Questions, answered.</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((f, i) => {
            const open = openFaq === i;
            const bgs = ["bg-[hsl(var(--pastel-pink))]", "bg-[hsl(var(--pastel-mint))]", "bg-[hsl(var(--pastel-blue))]", "bg-[hsl(var(--pastel-yellow))]", "bg-[hsl(var(--pastel-lilac))]"];
            return (
              <div key={f.q} className={`${bgs[i]} ${brutalBorder} ${brutalShadow} rounded-2xl overflow-hidden`}>
                <button onClick={() => setOpenFaq(open ? null : i)} className="flex w-full items-center justify-between gap-4 p-6 text-left">
                  <span className="font-display text-base md:text-xl font-bold">{f.q}</span>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center bg-foreground text-background ${brutalBorder} rounded-full transition-transform ${open ? "rotate-180" : ""}`}>
                    {open ? <Minus className="h-4 w-4" strokeWidth={3} /> : <Plus className="h-4 w-4" strokeWidth={3} />}
                  </span>
                </button>
                {open && (
                  <div className="px-6 pb-6 text-sm font-medium leading-relaxed border-t-2 border-foreground pt-4 animate-fade-in">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-12 text-center">
          <a href="mailto:hello@unishark.in" className={`inline-flex items-center gap-2 bg-foreground text-background ${brutalBorder} ${brutalShadow} rounded-full px-6 py-3 text-sm font-bold hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_0_hsl(var(--foreground))] transition-all`}>
            <Mail className="h-4 w-4" /> Email the team
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 sm:px-6 pb-16 md:pb-24 max-w-6xl">
        <div className={`bg-[hsl(var(--pastel-mint))] ${brutalBorder} ${brutalShadowLg} rounded-[24px] sm:rounded-[32px] p-8 sm:p-12 md:p-20 text-center relative overflow-hidden`}>
          <Rocket className="absolute top-6 left-6 h-9 w-9 -rotate-[15deg]" strokeWidth={2.5} />
          <Sparkles className="absolute top-10 right-8 h-9 w-9 rotate-12 sparkle" strokeWidth={2.5} />
          <Banknote className="absolute bottom-8 left-10 h-9 w-9 rotate-12" strokeWidth={2.5} />
          <Target className="absolute bottom-10 right-6 h-9 w-9 -rotate-12" strokeWidth={2.5} />
          <Sparkles className="mx-auto h-8 w-8" strokeWidth={2.5} />
          <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">Ready to get funded?</h2>
          <p className="mt-5 text-lg font-medium max-w-xl mx-auto">Join 500+ founders and 150+ investors building the future on UniShark.</p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className={`h-14 rounded-full px-8 text-base font-bold ${brutalBorder} ${brutalShadow} bg-foreground text-background hover:bg-foreground hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_0_hsl(var(--foreground))]`}>
              <Link to="/signup?role=student"><GraduationCap className="mr-2 h-5 w-5" /> I'm a Student</Link>
            </Button>
            <Button asChild size="lg" className={`h-14 rounded-full px-8 text-base font-bold ${brutalBorder} ${brutalShadow} bg-card text-foreground hover:bg-card hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_0_hsl(var(--foreground))]`}>
              <Link to="/signup?role=investor"><Briefcase className="mr-2 h-5 w-5" /> I'm an Investor</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm font-medium">
            Already on UniShark? <Link to="/login" className="underline underline-offset-4 font-bold">Sign in</Link>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-foreground text-background border-t-2 border-foreground">
        <div className="container mx-auto grid gap-8 px-4 sm:px-6 py-12 md:py-16 grid-cols-1 sm:grid-cols-2 md:grid-cols-5 max-w-6xl">
          <div className="md:col-span-2">
            <div className="font-display text-2xl font-bold tracking-[0.18em]">UNISHARK</div>
            <p className="mt-4 max-w-sm text-sm text-background/70">India's first curated marketplace for student founders & angel investors.</p>
            <div className="mt-6 flex gap-3">
              {[Twitter, Linkedin, Instagram].map((I, i) => (
                <a key={i} href="#" className={`inline-flex h-10 w-10 items-center justify-center bg-background text-foreground border-2 border-background rounded-full hover:bg-[hsl(var(--accent))] transition-colors`}>
                  <I className="h-4 w-4" strokeWidth={2.5} />
                </a>
              ))}
            </div>
          </div>
          {[
            { h: "Company", links: ["About", "Team", "Blog", "Careers"] },
            { h: "Legal", links: ["Terms", "Privacy", "DPDP"] },
          ].map((col) => (
            <div key={col.h}>
              <h4 className="text-sm font-bold uppercase tracking-wider">{col.h}</h4>
              <ul className="mt-4 space-y-2 text-sm text-background/70">
                {col.links.map((l) => <li key={l}><a href="#" className="hover:text-[hsl(var(--accent))]">{l}</a></li>)}
              </ul>
            </div>
          ))}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider">Contact</h4>
            <ul className="mt-4 space-y-2 text-sm text-background/70">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@unishark.in</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 98765 43210</li>
            </ul>
          </div>
        </div>
        <div className="border-t-2 border-background/20 py-6 text-center text-xs text-background/60">
          © {new Date().getFullYear()} UniShark — Built for Indian student founders.
        </div>
      </footer>
    </div>
  );
};

export default Index;

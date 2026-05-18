import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Rocket, Handshake, Zap, TrendingUp, Bell, PencilLine, Wrench, Sparkles, ArrowUpRight, Check, Heart, MessageCircle, Eye } from "lucide-react";
import logo from "@/assets/logo.png";

// Neo-brutalist primitives
const brutalBorder = "border-2 border-foreground";
const brutalShadow = "shadow-[6px_6px_0_0_hsl(var(--foreground))]";
const brutalShadowSm = "shadow-[3px_3px_0_0_hsl(var(--foreground))]";

// Fixed cream background for inside the phone — never affected by dark mode
const PHONE_BG = "bg-[hsl(44_60%_96%)]";
const PHONE_INK = "text-[hsl(0_0%_6%)]";

const SCENES = [
  {
    id: "pitch",
    n: "01",
    title: "Pitch",
    body: "Submit your startup idea in our 5-minute form. We vet it for quality. Go live.",
    time: "5 min",
    icon: PencilLine,
    bg: "bg-[hsl(var(--pastel-yellow))]",
    content: (
      <div className={`absolute inset-0 ${PHONE_BG} ${PHONE_INK} overflow-hidden`}>
        {/* dotted background pattern */}
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, hsl(0 0% 6%) 1px, transparent 0)", backgroundSize: "14px 14px" }} />

        <div className="relative z-10 px-5 pt-12 pb-5 flex flex-col h-full">
          {/* top bar */}
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-1.5">
              <img src={logo} alt="" className="w-5 h-5 object-contain" />
              <span className="font-display font-bold text-sm tracking-tight">UNISHARK</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-[hsl(var(--pastel-pink))] border-2 border-foreground" />
          </div>

          {/* heading */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="font-display font-bold text-[26px] leading-[1.05] tracking-tight mb-1"
          >
            New pitch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.2 }}
            className="text-[11px] font-medium mb-5"
          >
            Step 2 of 5 — Tell us your story
          </motion.p>

          {/* progress */}
          <div className="relative h-2 w-full bg-foreground/10 border-2 border-foreground rounded-full overflow-hidden mb-5">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "40%" }}
              transition={{ delay: 0.3, duration: 1.1, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 bg-[hsl(var(--pastel-yellow))]"
            />
          </div>

          {/* startup name field */}
          <div className="space-y-1.5 mb-3">
            <label className="text-[9px] font-bold uppercase tracking-wider opacity-60 ml-1">Startup name</label>
            <div className={`h-11 bg-white ${brutalBorder} rounded-xl px-3 flex items-center ${brutalShadowSm}`}>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xs font-bold flex items-center"
              >
                ZestAI
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                  className="inline-block w-0.5 h-3.5 bg-foreground ml-0.5"
                />
              </motion.span>
            </div>
          </div>

          {/* tagline */}
          <div className="space-y-1.5 mb-3">
            <label className="text-[9px] font-bold uppercase tracking-wider opacity-60 ml-1">One-liner</label>
            <div className={`min-h-[44px] bg-white ${brutalBorder} rounded-xl px-3 py-2 ${brutalShadowSm}`}>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="text-[11px] leading-snug font-medium"
              >
                AI nutrition coach for Gen-Z, in your pocket.
              </motion.p>
            </div>
          </div>

          {/* tags */}
          <div className="flex flex-wrap gap-1.5 mb-auto">
            {[
              { l: "AI", c: "bg-[hsl(var(--pastel-mint))]", d: 1.3 },
              { l: "HealthTech", c: "bg-[hsl(var(--pastel-pink))]", d: 1.45 },
              { l: "B2C", c: "bg-[hsl(var(--pastel-blue))]", d: 1.6 },
            ].map(t => (
              <motion.span
                key={t.l}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: t.d, type: "spring", stiffness: 250 }}
                className={`${t.c} border-2 border-foreground rounded-full px-2.5 py-0.5 text-[10px] font-bold`}
              >
                {t.l}
              </motion.span>
            ))}
          </div>

          {/* submit button */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.9, type: "spring", stiffness: 180 }}
            className="mt-5 w-full h-12 bg-foreground text-[hsl(44_60%_96%)] rounded-full border-2 border-foreground flex items-center justify-center font-bold text-sm shadow-[4px_4px_0_0_hsl(var(--pastel-yellow))]"
          >
            Continue <ArrowUpRight className="ml-1 w-4 h-4" strokeWidth={3} />
          </motion.div>
        </div>
      </div>
    ),
  },
  {
    id: "match",
    n: "02",
    title: "Match",
    body: "Verified investors discover your pitch. Bookmark, message, request the deck.",
    time: "48 hrs",
    icon: Handshake,
    bg: "bg-[hsl(var(--pastel-peach))]",
    content: (
      <div className={`absolute inset-0 ${PHONE_BG} ${PHONE_INK} overflow-hidden`}>
        <div className="relative z-10 px-4 pt-12 pb-5 flex flex-col h-full">
          {/* header */}
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display font-bold text-2xl tracking-tight">Investors</h2>
            <span className="text-[10px] font-bold opacity-60">12 new</span>
          </div>

          {/* live activity ticker */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`bg-[hsl(var(--pastel-mint))] ${brutalBorder} rounded-2xl px-3 py-2 mb-3 flex items-center gap-2 ${brutalShadowSm}`}
          >
            <div className="relative w-2 h-2">
              <motion.div animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 bg-[hsl(142_70%_35%)] rounded-full" />
              <div className="absolute inset-0 bg-[hsl(142_70%_30%)] rounded-full" />
            </div>
            <span className="text-[10px] font-bold">3 investors viewing now</span>
          </motion.div>

          {/* investor cards stack */}
          <div className="space-y-2.5">
            {[
              { name: "Priya Mehta", role: "Angel · Sequoia Scout", tag: "Interested", color: "bg-[hsl(var(--pastel-yellow))]", avatar: "bg-[hsl(var(--pastel-pink))]", delay: 0.3 },
              { name: "Arjun Kapoor", role: "Partner · BlumeVC", tag: "Messaged", color: "bg-[hsl(var(--pastel-blue))]", avatar: "bg-[hsl(var(--pastel-mint))]", delay: 0.55 },
              { name: "Neha Singh", role: "Angel · ex-Razorpay", tag: "Bookmarked", color: "bg-[hsl(var(--pastel-lilac))]", avatar: "bg-[hsl(var(--pastel-peach))]", delay: 0.8 },
            ].map((inv) => (
              <motion.div
                key={inv.name}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: inv.delay, type: "spring", stiffness: 200, damping: 18 }}
                className={`bg-white ${brutalBorder} rounded-2xl p-3 ${brutalShadowSm} flex items-center gap-3`}
              >
                <div className={`w-10 h-10 ${inv.avatar} ${brutalBorder} rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs`}>
                  {inv.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[12px] truncate">{inv.name}</div>
                  <div className="text-[9.5px] opacity-60 truncate">{inv.role}</div>
                </div>
                <span className={`${inv.color} border-2 border-foreground rounded-full px-2 py-0.5 text-[9px] font-bold flex-shrink-0`}>
                  {inv.tag}
                </span>
              </motion.div>
            ))}
          </div>

          {/* incoming match ping */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1.4, type: "spring", stiffness: 220 }}
            className={`mt-auto bg-[hsl(var(--pastel-pink))] ${brutalBorder} rounded-2xl p-3 ${brutalShadow} flex items-center gap-3`}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ delay: 1.6, duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
              className="w-9 h-9 bg-foreground text-[hsl(44_60%_96%)] rounded-full flex items-center justify-center flex-shrink-0"
            >
              <Bell className="w-4 h-4" strokeWidth={2.5} />
            </motion.div>
            <div className="flex-1">
              <div className="font-bold text-[11px]">New match!</div>
              <div className="text-[9.5px] opacity-70">Tap to view deck request</div>
            </div>
          </motion.div>
        </div>
      </div>
    ),
  },
  {
    id: "close",
    n: "03",
    title: "Close",
    body: "Chat in-app, share legal docs, get introduced. We support you to term sheet.",
    time: "2-4 wks",
    icon: Rocket,
    bg: "bg-[hsl(var(--pastel-mint))]",
    content: (
      <div className={`absolute inset-0 ${PHONE_BG} ${PHONE_INK} overflow-hidden`}>
        {/* subtle gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--pastel-mint))]/40 via-transparent to-[hsl(var(--pastel-pink))]/30" />

        <div className="relative z-10 px-5 pt-12 pb-5 flex flex-col h-full">
          {/* tiny status */}
          <div className="flex items-center gap-1.5 mb-4">
            <Sparkles className="w-3 h-3" strokeWidth={2.5} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Deal closed</span>
          </div>

          {/* big amount */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <div className="text-[10px] font-bold opacity-60 mb-1">Raised from Sequoia Scout</div>
            <div className="font-display font-bold text-5xl tracking-tight leading-none flex items-baseline">
              ₹
              <CountUp to={25} duration={1.4} delay={0.2} />
              <span className="text-2xl ml-1 opacity-70">L</span>
            </div>
          </motion.div>

          {/* divider check list */}
          <div className="mt-5 space-y-2">
            {[
              { l: "Term sheet signed", d: 0.6 },
              { l: "Legal docs verified", d: 0.9 },
              { l: "Funds in escrow", d: 1.2 },
            ].map(item => (
              <motion.div
                key={item.l}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: item.d }}
                className="flex items-center gap-2"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: item.d + 0.1, type: "spring", stiffness: 300 }}
                  className="w-5 h-5 bg-[hsl(142_70%_45%)] border-2 border-foreground rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <Check className="w-3 h-3 text-white" strokeWidth={3.5} />
                </motion.div>
                <span className="text-[12px] font-bold">{item.l}</span>
              </motion.div>
            ))}
          </div>

          {/* stat row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="mt-auto grid grid-cols-3 gap-2"
          >
            {[
              { icon: Eye, v: "2.4k", l: "Views", c: "bg-[hsl(var(--pastel-blue))]" },
              { icon: Heart, v: "187", l: "Saves", c: "bg-[hsl(var(--pastel-pink))]" },
              { icon: MessageCircle, v: "42", l: "DMs", c: "bg-[hsl(var(--pastel-yellow))]" },
            ].map(s => (
              <div key={s.l} className={`${s.c} ${brutalBorder} rounded-2xl p-2.5 ${brutalShadowSm}`}>
                <s.icon className="w-3.5 h-3.5 mb-1" strokeWidth={2.5} />
                <div className="font-display font-bold text-base leading-none">{s.v}</div>
                <div className="text-[8.5px] opacity-70 font-bold uppercase tracking-wide">{s.l}</div>
              </div>
            ))}
          </motion.div>

          {/* confetti */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], y: -240 - Math.random() * 60, x: (Math.random() - 0.5) * 80, scale: [0, 1.1, 0.6], rotate: Math.random() * 540 }}
              transition={{ duration: 2.4, delay: 0.6 + Math.random() * 0.6, ease: "easeOut", repeat: Infinity, repeatDelay: 2 }}
              className={`absolute bottom-10 w-2.5 h-2.5 ${["bg-[hsl(var(--pastel-pink))]", "bg-[hsl(var(--pastel-yellow))]", "bg-[hsl(var(--pastel-mint))]", "bg-[hsl(var(--pastel-blue))]"][i % 4]} border-2 border-foreground rounded-sm pointer-events-none`}
              style={{ left: `${10 + i * 8}%` }}
            />
          ))}
        </div>
      </div>
    ),
  },
];

function CountUp({ to, duration = 1.2, delay = 0 }: { to: number; duration?: number; delay?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now() + delay * 1000;
    const tick = (t: number) => {
      const elapsed = Math.max(0, t - start);
      const p = Math.min(1, elapsed / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration, delay]);
  return <span>{n}</span>;
}

export default function PhoneShowcase() {
  const [activeScene, setActiveScene] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { margin: "-20%" });

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActiveScene((prev) => (prev + 1) % SCENES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <section id="how" ref={sectionRef} className="container mx-auto px-4 sm:px-6 py-16 md:py-32 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl mb-10 md:mb-16"
      >
        <span className={`inline-flex items-center gap-2 bg-[hsl(var(--pastel-blue))] ${brutalBorder} ${brutalShadowSm} rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider`}>
          <Wrench className="h-3.5 w-3.5" strokeWidth={2.5} /> How it works
        </span>
        <h2 className="mt-6 font-display text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">Three steps. Zero friction.</h2>
        <p className="mt-5 text-lg text-muted-foreground">From idea to funded — without the cold-email grind.</p>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Steps */}
        <div className="lg:col-span-7 grid gap-6">
          {SCENES.map((it, i) => {
            const isActive = activeScene === i;
            return (
              <motion.button
                key={it.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onClick={() => setActiveScene(i)}
                className="text-left transition-all duration-300 w-full group focus:outline-none"
              >
                <div className={`${it.bg} ${brutalBorder} ${isActive ? "shadow-[10px_10px_0_0_hsl(var(--foreground))] -translate-x-0.5 -translate-y-0.5" : brutalShadow} rounded-[28px] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center`}>
                  <div className="flex-shrink-0">
                    <div className="flex items-baseline justify-between sm:justify-start gap-4 w-full sm:w-auto mb-4 sm:mb-0">
                      <span className="font-display text-4xl sm:text-5xl font-bold tracking-tight">{it.n}</span>
                      <span className={`bg-card ${brutalBorder} rounded-full px-3 py-1 text-xs font-bold inline-flex items-center gap-1 sm:hidden`}>
                        <Zap className="h-3 w-3" strokeWidth={3} /> {it.time}
                      </span>
                    </div>
                    <div className={`mt-4 sm:mt-6 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center ${isActive ? "bg-background text-foreground" : "bg-foreground text-background"} ${brutalBorder} rounded-2xl transition-colors`}>
                      <it.icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="hidden sm:flex items-center justify-between mb-2">
                      <h3 className="font-display text-2xl font-bold">{it.title}</h3>
                      <span className={`bg-card ${brutalBorder} rounded-full px-3 py-1 text-xs font-bold inline-flex items-center gap-1`}>
                        <Zap className="h-3 w-3" strokeWidth={3} /> {it.time}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl font-bold sm:hidden mb-2">{it.title}</h3>
                    <p className="text-sm font-medium leading-relaxed opacity-90">{it.body}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Phone */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 2 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="relative w-[300px] h-[600px] sm:w-[320px] sm:h-[640px] shrink-0"
          >
            {/* glow */}
            <div className="absolute -inset-8 bg-[hsl(var(--pastel-yellow))]/40 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -inset-4 bg-[hsl(var(--pastel-pink))]/30 blur-2xl rounded-full pointer-events-none" />

            <div className="relative bg-foreground rounded-[3rem] shadow-[20px_20px_0px_0px_rgba(0,0,0,0.15)] border-[10px] border-foreground overflow-hidden h-full transition-transform duration-500 hover:-translate-y-2 hover:shadow-[20px_30px_0px_0px_rgba(0,0,0,0.15)]">
              <div className="relative w-full h-full overflow-hidden flex flex-col">
                {/* Notch */}
                <div className="absolute top-0 inset-x-0 h-6 bg-foreground rounded-b-[1.5rem] w-32 mx-auto z-50 flex items-center justify-center">
                  <div className="w-12 h-1.5 bg-background/20 rounded-full" />
                </div>

                {/* Status bar */}
                <div className="h-10 w-full flex items-center justify-between px-6 pt-1 text-[10px] font-bold z-40 relative">
                  <span className="text-foreground/70">9:41</span>
                  <div className="flex items-center gap-1.5 text-foreground/70">
                    <TrendingUp className="w-3 h-3" />
                    <Bell className="w-3 h-3" />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeScene}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.03 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="absolute inset-0 z-10"
                  >
                    {SCENES[activeScene].content}
                  </motion.div>
                </AnimatePresence>

                {/* Home indicator */}
                <div className="absolute bottom-2 inset-x-0 h-1 bg-foreground/30 rounded-full w-1/3 mx-auto z-50" />

                {/* Scene dots */}
                <div className="absolute bottom-6 inset-x-0 flex justify-center gap-1.5 z-50">
                  {SCENES.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full border border-foreground/60 transition-all duration-300 ${i === activeScene ? "w-6 bg-foreground" : "w-1.5 bg-foreground/20"}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Physical buttons */}
            <div className="absolute top-32 -left-3 w-3 h-12 bg-foreground/90 rounded-l-md border-y-2 border-l-2 border-foreground/50" />
            <div className="absolute top-48 -left-3 w-3 h-12 bg-foreground/90 rounded-l-md border-y-2 border-l-2 border-foreground/50" />
            <div className="absolute top-40 -right-3 w-3 h-16 bg-foreground/90 rounded-r-md border-y-2 border-r-2 border-foreground/50" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

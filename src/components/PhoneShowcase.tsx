import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Rocket, Handshake, Zap, Wrench, PencilLine, Mail, Sparkles, Check, TrendingUp, Bell, User } from "lucide-react";
import logo from "@/assets/logo.png";
import handshakeCartoon from "@/assets/handshake-cartoon.png";

const brutalBorder = "border-2 border-foreground";
const brutalShadow = "shadow-[6px_6px_0_0_hsl(var(--foreground))]";
const brutalShadowSm = "shadow-[3px_3px_0_0_hsl(var(--foreground))]";
const PHONE_BG = "bg-[hsl(44_60%_96%)]";
const INK = "text-[hsl(0_0%_6%)]";

const STEPS = [
  { n: "01", title: "Pitch", body: "Submit your startup idea in our 5-minute form. We vet it for quality. Go live.", time: "5 min", icon: PencilLine, bg: "bg-[hsl(var(--pastel-yellow))]" },
  { n: "02", title: "Match", body: "Verified investors discover your pitch. Bookmark, message, request the deck.", time: "48 hrs", icon: Handshake, bg: "bg-[hsl(var(--pastel-peach))]" },
  { n: "03", title: "Close", body: "Chat in-app, share legal docs, get introduced. We support you to term sheet.", time: "2-4 wks", icon: Rocket, bg: "bg-[hsl(var(--pastel-mint))]" },
];

// Phase timing (ms)
const PHASES = [
  { id: "logo-in",   d: 2300 },  // 0 — logo sits in card (read the brand)
  { id: "morph",     d: 2000 },  // 1 — logo morphs into phone
  { id: "clutter",   d: 4600 },  // 2 — messy cold-email inbox + spam bubbles (read pain)
  { id: "shatter",   d: 2600 },  // 3 — overlay sweeps + shatters
  { id: "clean",     d: 5400 },  // 4 — clean Unishark pitch feed + handshake
  { id: "collapse",  d: 1800 },  // 5 — phone shrinks back to logo
];

export default function PhoneShowcase() {
  const [phase, setPhase] = useState(0);
  const [loop, setLoop] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { margin: "-20%" });

  useEffect(() => {
    if (!isInView) return;
    const t = setTimeout(() => {
      if (phase < PHASES.length - 1) setPhase(phase + 1);
      else { setPhase(0); setLoop((l) => l + 1); }
    }, PHASES[phase].d);
    return () => clearTimeout(t);
  }, [phase, isInView]);

  // Which "step" is highlighted (Pitch / Match / Close) — tied to which beat we're on
  const activeStep = phase <= 1 ? 0 : phase <= 3 ? 1 : 2;

  // Phone visibility / scale
  const phoneVisible = phase >= 1;
  const phoneFull    = phase >= 2 && phase <= 4;
  const logoVisible  = phase === 0 || phase === 5;

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
          {STEPS.map((it, i) => {
            const isActive = activeStep === i;
            return (
              <motion.div
                key={it.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className={`${it.bg} ${brutalBorder} ${isActive ? "shadow-[10px_10px_0_0_hsl(var(--foreground))] -translate-x-0.5 -translate-y-0.5" : brutalShadow} rounded-[28px] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center transition-all duration-300`}>
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
              </motion.div>
            );
          })}
        </div>

        {/* Cinematic card */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className={`relative w-[320px] sm:w-[360px] aspect-[3/4.2] ${brutalBorder} ${brutalShadow} rounded-[28px] bg-[hsl(var(--pastel-mint))] overflow-hidden`}
          >
            {/* faint grid */}
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, hsl(0 0% 6%) 1px, transparent 0)", backgroundSize: "18px 18px" }} />

            {/* LOGO (centered, small) */}
            <AnimatePresence>
              {logoVisible && (
                <motion.div
                  key={`logo-${loop}-${phase}`}
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={{ type: "spring", stiffness: 220, damping: 18 }}
                  className="absolute inset-0 flex items-center justify-center z-20"
                >
                  <div className={`w-16 h-16 bg-white ${brutalBorder} rounded-2xl flex items-center justify-center ${brutalShadowSm}`}>
                    <img src={logo} alt="" className="w-10 h-10 object-contain" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PHONE — scales up from logo position */}
            <AnimatePresence>
              {phoneVisible && phase !== 5 && (
                <motion.div
                  key={`phone-${loop}`}
                  initial={{ scale: 0.18, opacity: 0 }}
                  animate={{ scale: phoneFull ? 1 : 0.95, opacity: 1 }}
                  exit={{ scale: 0.2, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 140, damping: 18 }}
                  className="absolute inset-0 flex items-center justify-center z-10"
                >
                  <div className="relative w-[56%] aspect-[9/19] bg-white border-[6px] border-foreground rounded-[2rem] overflow-hidden shadow-[6px_6px_0_0_hsl(var(--foreground))]">
                    {/* notch */}
                    <div className="absolute top-0 inset-x-0 h-4 bg-foreground rounded-b-2xl w-20 mx-auto z-50 flex items-center justify-center">
                      <div className="w-8 h-1 bg-background/30 rounded-full" />
                    </div>
                    {/* status */}
                    <div className="h-6 w-full flex items-center justify-between px-3 pt-1 text-[8px] font-bold relative z-40">
                      <span>9:41</span>
                      <div className="flex gap-1"><TrendingUp className="w-2 h-2" /><Bell className="w-2 h-2" /></div>
                    </div>

                    {/* CLUTTER scene — messy cold-email inbox */}
                    <AnimatePresence>
                      {phase === 2 && (
                        <motion.div
                          key="clutter"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`absolute inset-0 pt-6 px-2 ${PHONE_BG} ${INK}`}
                        >
                          <div className="text-[9px] font-bold uppercase tracking-wider opacity-60 mb-1 px-1">The old way</div>
                          <div className="text-[10px] font-bold leading-tight mb-1.5 px-1">Cold-emailing 100s of investors</div>
                          {[
                            { from: "Sequoia VC",   t: "Not a fit right now", c: "bg-[hsl(0_80%_92%)]" },
                            { from: "Accel Fund",   t: "We'll pass, thanks", c: "bg-[hsl(0_80%_92%)]" },
                            { from: "Blume Angel",  t: "No reply · 14 days", c: "bg-[hsl(0_80%_92%)]" },
                            { from: "Y Combinator", t: "Rejected",           c: "bg-[hsl(0_80%_92%)]" },
                            { from: "Tiger Global", t: "Ignored",            c: "bg-[hsl(0_80%_92%)]" },
                          ].map((m, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.15 + i * 0.18 }}
                              className={`${m.c} border border-foreground/40 rounded-md px-1.5 py-1 mb-1 flex items-center gap-1.5`}
                            >
                              <Mail className="w-2.5 h-2.5 flex-shrink-0" strokeWidth={2.5} />
                              <div className="min-w-0 flex-1">
                                <div className="text-[8px] font-bold truncate">{m.from}</div>
                                <div className="text-[8px] opacity-70 truncate">{m.t}</div>
                              </div>
                              <span className="text-[7px] font-bold bg-foreground text-background rounded-full px-1">!</span>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* SHATTER overlay */}
                    <AnimatePresence>
                      {phase === 3 && (
                        <motion.div key="shatter" className="absolute inset-0 z-30">
                          {/* sweeping pink overlay */}
                          <motion.div
                            initial={{ y: "-100%" }}
                            animate={{ y: ["-100%", "0%", "0%", "100%"] }}
                            transition={{ duration: 1.2, times: [0, 0.3, 0.55, 1], ease: "easeInOut" }}
                            className="absolute inset-0 bg-[hsl(var(--accent))]"
                          />
                          {/* shattered pieces flying out */}
                          {[...Array(14)].map((_, i) => {
                            const angle = (i / 14) * Math.PI * 2;
                            const dist = 70 + Math.random() * 50;
                            return (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 0, y: 0, scale: 0, rotate: 0 }}
                                animate={{
                                  opacity: [0, 1, 1, 0],
                                  x: Math.cos(angle) * dist,
                                  y: Math.sin(angle) * dist,
                                  scale: [0, 1, 1, 0.4],
                                  rotate: (Math.random() - 0.5) * 540,
                                }}
                                transition={{ duration: 1.1, delay: 0.35, ease: "easeOut" }}
                                className={`absolute top-1/2 left-1/2 w-3 h-3 ${["bg-[hsl(var(--pastel-yellow))]","bg-[hsl(var(--pastel-pink))]","bg-[hsl(var(--accent))]","bg-[hsl(var(--pastel-blue))]"][i % 4]} border-2 border-foreground`}
                                style={{ borderRadius: i % 2 ? "50%" : "4px" }}
                              />
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* CLEAN scene — Unishark match feed */}
                    <AnimatePresence>
                      {phase === 4 && (
                        <motion.div
                          key="clean"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`absolute inset-0 pt-6 px-2 ${PHONE_BG} ${INK}`}
                        >
                          <div className="flex items-center justify-between px-1 mb-1">
                            <div className="flex items-center gap-1">
                              <img src={logo} alt="" className="w-3 h-3 object-contain" />
                              <span className="font-display font-bold text-[9px] tracking-tight">UNISHARK</span>
                            </div>
                            <span className="text-[7px] font-bold opacity-60">Investors viewing</span>
                          </div>
                          <div className="text-[8px] font-bold leading-tight px-1 mb-1.5 opacity-80">Pitch once. Get matched with verified investors.</div>

                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className={`bg-[hsl(var(--pastel-yellow))] ${brutalBorder} rounded-lg p-1.5 mb-1 ${brutalShadowSm}`}
                          >
                            <div className="flex items-center gap-1 mb-0.5">
                              <Sparkles className="w-2 h-2" strokeWidth={3} />
                              <span className="text-[8px] font-bold uppercase tracking-wider">Investor interested</span>
                            </div>
                            <div className="text-[9px] font-bold leading-tight">Priya Mehta · Sequoia Scout</div>
                            <div className="text-[7.5px] opacity-70">"Love your pitch — let's talk funding."</div>
                          </motion.div>

                          {[
                            { n: "Arjun · Blume Angel", tag: "Bookmarked", c: "bg-[hsl(var(--pastel-blue))]", d: 0.3 },
                            { n: "Neha · ex-Razorpay",  tag: "Wants deck",  c: "bg-[hsl(var(--pastel-mint))]", d: 0.45 },
                          ].map((it) => (
                            <motion.div
                              key={it.n}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: it.d }}
                              className={`bg-white ${brutalBorder} rounded-md p-1 mb-1 flex items-center justify-between ${brutalShadowSm}`}
                            >
                              <span className="text-[8px] font-bold truncate">{it.n}</span>
                              <span className={`${it.c} border border-foreground rounded-full px-1.5 text-[7px] font-bold`}>{it.tag}</span>
                            </motion.div>
                          ))}

                          <motion.div
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7, type: "spring", stiffness: 240 }}
                            className={`mt-1 bg-foreground text-background rounded-full flex items-center justify-center gap-1 py-1 text-[8px] font-bold ${brutalShadowSm}`}
                          >
                            <Check className="w-2.5 h-2.5" strokeWidth={3} /> Term sheet signed
                          </motion.div>

                          {/* Handshake — deal closed */}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.1, duration: 0.5 }}
                            className={`mt-1.5 bg-[hsl(var(--pastel-pink))] ${brutalBorder} rounded-lg p-1.5 ${brutalShadowSm} relative overflow-hidden`}
                          >
                            <div className="text-[8px] font-bold uppercase tracking-wider text-center mb-0.5">Funded ✦ ₹25L raised</div>
                            <div className="relative h-24 flex items-end justify-center">
                              <motion.img
                                src={handshakeCartoon}
                                alt="Founder and investor shaking hands"
                                loading="lazy"
                                initial={{ scale: 0.6, opacity: 0, y: 8 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                transition={{ delay: 1.3, type: "spring", stiffness: 200, damping: 16 }}
                                className="h-full w-auto object-contain drop-shadow-[2px_2px_0_hsl(var(--foreground))]"
                              />
                              {[0, 1, 2, 3, 4].map((i) => (
                                <motion.span
                                  key={i}
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1.2, 0],
                                    x: Math.cos((i / 5) * Math.PI * 2) * 30,
                                    y: Math.sin((i / 5) * Math.PI * 2) * 22 - 6,
                                  }}
                                  transition={{ delay: 1.7 + i * 0.05, duration: 0.9, repeat: Infinity, repeatDelay: 0.5 }}
                                  className="absolute top-1/2 left-1/2 w-1 h-1 bg-foreground rounded-full"
                                />
                              ))}
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* home indicator */}
                    <div className="absolute bottom-1 inset-x-0 h-0.5 bg-foreground/30 rounded-full w-1/4 mx-auto" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SPAM bubbles floating around phone during clutter */}
            <AnimatePresence>
              {phase === 2 && (
                <>
                  {[
                    { l: "-5%", t: "12%", d: 0.1 },
                    { l: "78%", t: "18%", d: 0.25 },
                    { l: "-2%", t: "55%", d: 0.4 },
                    { l: "82%", t: "60%", d: 0.55 },
                    { l: "8%",  t: "82%", d: 0.7 },
                    { l: "70%", t: "85%", d: 0.85 },
                  ].map((b, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ delay: b.d, y: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
                      className={`absolute w-10 h-10 bg-white ${brutalBorder} rounded-full flex items-center justify-center ${brutalShadowSm} z-30`}
                      style={{ left: b.l, top: b.t }}
                    >
                      <Mail className="w-4 h-4 text-[hsl(var(--destructive))]" strokeWidth={2.5} />
                    </motion.div>
                  ))}
                </>
              )}
            </AnimatePresence>

            {/* phase label */}
            <div className="absolute bottom-3 inset-x-0 flex justify-center z-40 pointer-events-none">
              <div className={`bg-foreground text-background rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider`}>
                {phase <= 1
                  ? "Step 1 · Submit pitch"
                  : phase === 2
                  ? "The problem · cold pitching fails"
                  : phase === 3
                  ? "Unishark cuts the noise"
                  : phase === 4
                  ? "Step 2 · Match with investors"
                  : "Step 3 · Close the deal"}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

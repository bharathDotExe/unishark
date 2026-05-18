import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Rocket, MessageSquare, Handshake, ShieldCheck, Zap, TrendingUp, Search, Bell, PencilLine, Wrench, Star, UserPlus } from "lucide-react";
import logo from "@/assets/logo.png";
import dealClosedImage from "@/assets/deal_closed_handshake.png";

// Neo-brutalist primitives
const brutalBorder = "border-2 border-foreground";
const brutalShadow = "shadow-[6px_6px_0_0_hsl(var(--foreground))]";
const brutalShadowSm = "shadow-[3px_3px_0_0_hsl(var(--foreground))]";

const SCENES = [
  {
    id: "pitch",
    n: "01",
    title: "Pitch",
    body: "Submit your startup idea in our 5-minute form. We vet it for quality. Go live.",
    time: "5 min",
    icon: PencilLine,
    bg: "bg-[hsl(var(--pastel-yellow))]",
    color: "var(--background)",
    content: (
      <div className="absolute inset-0 overflow-hidden bg-background">
        {/* Logo Expansion */}
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: [0, 1, 1, 40], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.5, times: [0, 0.2, 0.7, 1] }}
          className="absolute inset-0 m-auto w-24 h-24 flex items-center justify-center z-20"
        >
          <img src={logo} alt="UniShark Logo" className="w-full h-full object-contain drop-shadow-xl" />
        </motion.div>
        
        {/* Website Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="absolute inset-0 p-5 pt-12 flex flex-col z-10 bg-background"
        >
          <div className="w-full flex justify-between items-center mb-6">
            <div className="flex items-center gap-1.5">
              <img src={logo} alt="Logo" className="w-5 h-5 object-contain" />
              <span className="font-display font-bold text-sm tracking-tight">UNISHARK</span>
            </div>
            <span className="text-[10px] font-bold hover:underline cursor-pointer">Login</span>
          </div>
          <div className="mb-4 space-y-3">
            <h1 className="font-display font-bold text-3xl leading-[1.1] tracking-tight">Fund your student startup.</h1>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-[90%]">Join the #1 platform connecting student founders with top-tier angel investors.</p>
          </div>
          
          <div className="mt-2 w-full bg-[hsl(var(--pastel-pink))] border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-[16px] p-6 flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
             <Rocket className="w-10 h-10 text-foreground relative z-10" />
             <span className="font-display font-bold text-xl relative z-10">₹10L+ Raised</span>
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, hsl(var(--foreground)) 1px, transparent 0)", backgroundSize: "12px 12px" }} />
          </div>
          
          <div className="mt-auto w-full h-12 bg-foreground shadow-[4px_4px_0_0_hsl(var(--pastel-mint))] rounded-full flex items-center justify-center border-2 border-foreground">
            <span className="text-background font-bold text-sm">Start Pitching &rarr;</span>
          </div>
        </motion.div>
      </div>
    )
  },
  {
    id: "match",
    n: "02",
    title: "Match",
    body: "Verified investors discover your pitch. Bookmark, message, request the deck.",
    time: "48 hrs",
    icon: Handshake,
    bg: "bg-[hsl(var(--pastel-peach))]",
    color: "var(--background)",
    content: (
      <div className="absolute inset-0 bg-background p-5 flex flex-col pt-12">
        <motion.div 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.2 }}
           className="font-display font-bold text-2xl mb-6 text-foreground"
        >
          Create Account
        </motion.div>
        
        <div className="space-y-5">
           <div className="space-y-1.5">
             <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
             <motion.div 
                initial={{ borderColor: "hsl(var(--foreground))" }}
                animate={{ borderColor: "hsl(var(--foreground))", boxShadow: "4px 4px 0 0 hsl(var(--foreground))" }}
                transition={{ delay: 0.5, duration: 0.2 }}
                className="h-11 bg-surface border-2 border-foreground rounded-xl px-3 flex items-center relative overflow-hidden transition-shadow"
             >
               <motion.span 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.7 }}
                 className="text-xs font-bold text-foreground whitespace-nowrap"
               >
                 Rahul Sharma
               </motion.span>
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: [0, 1, 0] }}
                 transition={{ delay: 1.1, duration: 0.8, repeat: Infinity }}
                 className="w-0.5 h-4 bg-foreground ml-0.5"
               />
             </motion.div>
           </div>
           
           <div className="space-y-1.5">
             <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">College</label>
             <div className="h-11 bg-surface border-2 border-foreground rounded-xl px-3 flex items-center">
               <motion.span 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 1.6 }}
                 className="text-xs font-bold text-foreground flex items-center gap-2"
               >
                 IIT Bombay
               </motion.span>
             </div>
           </div>
           
           <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 2.4, type: "spring" }}
              className="w-full h-12 mt-6 bg-[hsl(var(--pastel-yellow))] border-2 border-foreground rounded-full flex items-center justify-center shadow-[4px_4px_0_0_hsl(var(--foreground))]"
           >
             <span className="text-sm font-bold text-foreground">Register Account</span>
           </motion.div>
        </div>
        
        {/* Animated Mouse Cursor */}
        <motion.div
          initial={{ x: 100, y: 300, opacity: 0 }}
          animate={{ x: [100, 30, 120, 160], y: [300, 120, 220, 300], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 3.5, times: [0, 0.3, 0.7, 1], ease: "easeInOut" }}
          className="absolute z-50 pointer-events-none"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground fill-foreground drop-shadow-md"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>
        </motion.div>
      </div>
    )
  },
  {
    id: "close",
    n: "03",
    title: "Close",
    body: "Chat in-app, share legal docs, get introduced. We support you to term sheet.",
    time: "2-4 wks",
    icon: Rocket,
    bg: "bg-[hsl(var(--pastel-mint))]",
    color: "var(--pastel-mint)",
    content: (
      <div className="absolute inset-0 bg-[hsl(var(--pastel-blue))] flex flex-col items-center justify-center p-4 overflow-hidden">
        
        <div className="relative w-full h-40 flex items-center justify-center mb-4 mt-8">
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 90, delay: 0.2 }}
            className="w-32 h-32 bg-card border-4 border-foreground rounded-2xl overflow-hidden shadow-[6px_6px_0_0_hsl(var(--foreground))] flex items-center justify-center z-10"
          >
            <img src={dealClosedImage} alt="Deal Closed Handshake" className="w-full h-full object-cover" />
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="text-center space-y-2 z-10 relative"
        >
          <h3 className="font-display text-4xl font-bold text-foreground">Deal Closed!</h3>
          <p className="text-sm font-bold opacity-80 text-foreground">Works completely done.</p>
        </motion.div>

        {/* Confetti pieces shooting up */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0.5, 1.2, 0.5],
              y: -300 - Math.random() * 100,
              rotate: Math.random() * 360
            }}
            transition={{ duration: 2.5, delay: 1.4 + (Math.random() * 0.4), ease: "easeOut" }}
            className={`absolute bottom-[-20px] w-4 h-4 rounded-sm ${["bg-[hsl(var(--pastel-pink))]", "bg-[hsl(var(--pastel-yellow))]", "bg-[hsl(var(--pastel-mint))]"][i % 3]} border-2 border-foreground z-0`}
            style={{ left: `${10 + (i * 7)}%` }}
          />
        ))}
      </div>
    )
  }
];

export default function PhoneShowcase() {
  const [activeScene, setActiveScene] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { margin: "-20%" });

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActiveScene((prev) => (prev + 1) % SCENES.length);
    }, 5500); // slightly longer to let animations play out
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
        
        {/* Left: The Steps Cards */}
        <div className="lg:col-span-7 grid gap-6 sm:grid-cols-1">
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
                className={`text-left transition-all duration-300 w-full group focus:outline-none`}
              >
                <div className={`${it.bg} ${brutalBorder} ${isActive ? 'shadow-[10px_10px_0_0_hsl(var(--foreground))] translate-x-[-2px] translate-y-[-2px]' : brutalShadow} rounded-[28px] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center`}>
                  
                  {/* Icon & Number */}
                  <div className="flex-shrink-0">
                    <div className="flex items-baseline justify-between sm:justify-start gap-4 w-full sm:w-auto mb-4 sm:mb-0">
                      <span className="font-display text-4xl sm:text-5xl font-bold tracking-tight">{it.n}</span>
                      <span className={`bg-card ${brutalBorder} rounded-full px-3 py-1 text-xs font-bold inline-flex items-center gap-1 sm:hidden`}><Zap className="h-3 w-3" strokeWidth={3} /> {it.time}</span>
                    </div>
                    <div className={`mt-4 sm:mt-6 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center ${isActive ? 'bg-background text-foreground' : 'bg-foreground text-background'} ${brutalBorder} rounded-2xl transition-colors`}>
                      <it.icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="hidden sm:flex items-center justify-between mb-2">
                      <h3 className="font-display text-2xl font-bold">{it.title}</h3>
                      <span className={`bg-card ${brutalBorder} rounded-full px-3 py-1 text-xs font-bold inline-flex items-center gap-1`}><Zap className="h-3 w-3" strokeWidth={3} /> {it.time}</span>
                    </div>
                    <h3 className="font-display text-2xl font-bold sm:hidden mb-2">{it.title}</h3>
                    <p className="text-sm font-medium leading-relaxed opacity-90">{it.body}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Right: Phone Animation */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 2 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="relative w-[300px] h-[600px] sm:w-[320px] sm:h-[640px] shrink-0"
          >
            {/* Phone Body */}
            <div className="absolute inset-0 bg-foreground rounded-[3rem] shadow-[20px_20px_0px_0px_rgba(0,0,0,0.15)] border-[10px] border-foreground overflow-hidden transition-transform duration-500 hover:-translate-y-2 hover:shadow-[20px_30px_0px_0px_rgba(0,0,0,0.15)]">
              
              {/* Screen Area */}
              <div className="relative w-full h-full bg-background overflow-hidden flex flex-col">
                {/* Notch */}
                <div className="absolute top-0 inset-x-0 h-6 bg-foreground rounded-b-[1.5rem] w-32 mx-auto z-50 flex items-center justify-center">
                  <div className="w-12 h-1.5 bg-background/20 rounded-full" />
                </div>
                
                {/* Status Bar Fake */}
                <div className="h-10 w-full flex items-center justify-between px-6 pt-1 text-[10px] font-bold text-foreground/50 z-40 relative mix-blend-difference">
                  <span className="text-white">9:41</span>
                  <div className="flex items-center gap-1.5 text-white">
                    <TrendingUp className="w-3 h-3" />
                    <Bell className="w-3 h-3" />
                  </div>
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeScene}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="absolute inset-0 z-10"
                  >
                    {SCENES[activeScene].content}
                  </motion.div>
                </AnimatePresence>
                
                {/* Home Indicator */}
                <div className="absolute bottom-2 inset-x-0 h-1 bg-foreground/20 rounded-full w-1/3 mx-auto z-50 mix-blend-difference" />
              </div>
            </div>
            
            {/* Physical Buttons */}
            <div className="absolute top-32 -left-3 w-3 h-12 bg-foreground/90 rounded-l-md border-y-2 border-l-2 border-foreground/50 shadow-[-2px_0_0_0_rgba(0,0,0,0.1)]" />
            <div className="absolute top-48 -left-3 w-3 h-12 bg-foreground/90 rounded-l-md border-y-2 border-l-2 border-foreground/50 shadow-[-2px_0_0_0_rgba(0,0,0,0.1)]" />
            <div className="absolute top-40 -right-3 w-3 h-16 bg-foreground/90 rounded-r-md border-y-2 border-r-2 border-foreground/50 shadow-[2px_0_0_0_rgba(0,0,0,0.1)]" />
          </motion.div>
        </div>

      </div>
    </section>
  );
}

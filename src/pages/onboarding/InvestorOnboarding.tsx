import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  investorProfileSchema,
  investorInvestmentSchema,
  investorVerificationSchema,
} from "@/lib/validations/auth";
import {
  Briefcase, MapPin, Linkedin, Phone, ChevronRight, ChevronLeft,
  CheckCircle2, TrendingUp, ShieldCheck, IndianRupee
} from "lucide-react";

const EXPERIENCE_OPTIONS = ["First-time", "1-5", "5-20", "20+"] as const;
const STAGE_OPTIONS = ["Pre-Seed", "Seed", "Pre-Series A", "Series A", "Series B+", "Any Stage"];
const SECTOR_OPTIONS = [
  "SaaS / B2B", "Consumer / B2C", "FinTech", "EdTech", "HealthTech",
  "Climate / GreenTech", "AgriTech", "E-commerce", "Blockchain / Web3",
  "DeepTech / AI", "Media & Creator", "Logistics", "Other"
];

const STEP_TITLES = ["Basic Info", "Investment Details", "Verification"];
const ease = [0.22, 1, 0.36, 1] as const;

export default function InvestorOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(1);

  // Step 1
  const [fullName, setFullName] = useState("");
  const [companyFundName, setCompanyFundName] = useState("");
  const [bio, setBio] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [city, setCity] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // Step 2
  const [investmentExperience, setInvestmentExperience] = useState<typeof EXPERIENCE_OPTIONS[number] | "">("");
  const [ticketSizeMin, setTicketSizeMin] = useState("");
  const [ticketSizeMax, setTicketSizeMax] = useState("");
  const [preferredStages, setPreferredStages] = useState<string[]>([]);
  const [investmentSectors, setInvestmentSectors] = useState<string[]>([]);
  const [preferredSectors, setPreferredSectors] = useState("");

  // Step 3
  const [totalInvestmentsCount, setTotalInvestmentsCount] = useState("");
  const [ref1Name, setRef1Name] = useState("");
  const [ref1Email, setRef1Email] = useState("");
  const [ref2Name, setRef2Name] = useState("");
  const [ref2Email, setRef2Email] = useState("");
  const [pastInvestments, setPastInvestments] = useState("");

  const progress = ((step + 1) / STEP_TITLES.length) * 100;

  const toggleItem = (item: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(item) ? list.filter(x => x !== item) : [...list, item]);
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = investorProfileSchema.safeParse({
      fullName, companyFundName, bio, contactNumber, city, linkedinUrl
    });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setDirection(1); setStep(1);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = investorInvestmentSchema.safeParse({
      investmentExperience,
      ticketSizeMin: Number(ticketSizeMin),
      ticketSizeMax: Number(ticketSizeMax),
      preferredStages,
      investmentSectors,
      preferredSectors,
    });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setDirection(1); setStep(2);
  };

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = investorVerificationSchema.safeParse({
      totalInvestmentsCount: Number(totalInvestmentsCount),
      referenceFounder1Name: ref1Name,
      referenceFounder1Email: ref1Email,
      referenceFounder2Name: ref2Name,
      referenceFounder2Email: ref2Email,
      pastInvestments,
    });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    if (!user) { toast.error("Not authenticated"); return; }

    setLoading(true);
    try {
      const { error } = await supabase.from("investor_profiles").upsert({
        user_id: user.id,
        full_name: fullName,
        company_fund_name: companyFundName || null,
        bio: bio || null,
        contact_number: contactNumber,
        city,
        linkedin_url: linkedinUrl,
        investment_experience: investmentExperience,
        ticket_size_min: Number(ticketSizeMin),
        ticket_size_max: Number(ticketSizeMax),
        preferred_stages: preferredStages,
        investment_sectors: investmentSectors,
        preferred_sectors: preferredSectors || null,
        total_investments_count: Number(totalInvestmentsCount),
        reference_founder_1_name: ref1Name,
        reference_founder_1_email: ref1Email,
        reference_founder_2_name: ref2Name,
        reference_founder_2_email: ref2Email,
        past_investments: pastInvestments ? { notes: pastInvestments } : null,
        verification_status: "PENDING",
        profile_complete: true,
      }, { onConflict: "user_id" });

      if (error) throw error;

      toast.success("Profile submitted! We'll verify your account within 48 hours 🎉");
      navigate("/pitches");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const StepDot = ({ i }: { i: number }) => (
    <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-foreground font-bold text-sm transition-colors ${
      i < step ? "bg-foreground text-background" : i === step ? "bg-[hsl(var(--pastel-blue))]" : "bg-card text-muted-foreground"
    }`}>
      {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-2xl px-4 py-10 md:py-16">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {STEP_TITLES.map((title, i) => (
              <div key={i} className="flex items-center gap-2">
                <StepDot i={i} />
                <span className={`text-sm font-medium hidden sm:block ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{title}</span>
                {i < STEP_TITLES.length - 1 && <div className={`h-0.5 w-6 sm:w-12 ${i < step ? "bg-foreground" : "bg-border"}`} />}
              </div>
            ))}
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-foreground/20">
            <motion.div
              className="h-full bg-foreground rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: ease as any }}
            />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Step {step + 1} of {STEP_TITLES.length}</p>
        </div>

        <div className="bg-card border-2 border-foreground shadow-[8px_8px_0_0_hsl(var(--foreground))] rounded-3xl p-6 md:p-10 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>

            {/* ── STEP 1: BASIC INFO ── */}
            {step === 0 && (
              <motion.div key="s1" custom={direction}
                initial={{ opacity: 0, x: direction * 40 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 40 }} transition={{ duration: 0.35, ease: ease as any }}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-flex h-12 w-12 items-center justify-center bg-[hsl(var(--pastel-blue))] border-2 border-foreground rounded-2xl">
                    <Briefcase className="h-6 w-6" />
                  </span>
                  <div>
                    <h1 className="font-display text-2xl font-bold">Your profile</h1>
                    <p className="text-sm text-muted-foreground">Tell founders who you are</p>
                  </div>
                </div>

                <form onSubmit={handleStep1} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="fullName" className="font-semibold">Full name *</Label>
                      <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Raj Patel" required className="mt-1 border-2" />
                    </div>

                    <div>
                      <Label htmlFor="company" className="font-semibold">Fund / Company name</Label>
                      <Input id="company" value={companyFundName} onChange={e => setCompanyFundName(e.target.value)} placeholder="e.g. Sequoia Capital" className="mt-1 border-2" />
                    </div>

                    <div>
                      <Label htmlFor="city" className="font-semibold">
                        <MapPin className="inline h-3.5 w-3.5 mr-1" />City *
                      </Label>
                      <Input id="city" value={city} onChange={e => setCity(e.target.value)} placeholder="Mumbai" required className="mt-1 border-2" />
                    </div>

                    <div>
                      <Label htmlFor="contact" className="font-semibold">
                        <Phone className="inline h-3.5 w-3.5 mr-1" />Contact number *
                      </Label>
                      <Input id="contact" value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="+91 98765 43210" required className="mt-1 border-2" />
                    </div>

                    <div>
                      <Label htmlFor="linkedin" className="font-semibold">
                        <Linkedin className="inline h-3.5 w-3.5 mr-1" />LinkedIn URL *
                      </Label>
                      <Input id="linkedin" type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/yourname" required className="mt-1 border-2" />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="bio" className="font-semibold">
                        Short bio <span className="font-normal text-muted-foreground text-xs">({bio.length}/200)</span>
                      </Label>
                      <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} maxLength={200}
                        placeholder="IIT '05 alum. Angel investor. Focused on FinTech & B2B SaaS." rows={3} className="mt-1 border-2 resize-none" />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 rounded-full border-2 border-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] bg-foreground text-background font-bold hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_0_hsl(var(--foreground))] transition-all">
                    Continue <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 2: INVESTMENT DETAILS ── */}
            {step === 1 && (
              <motion.div key="s2" custom={direction}
                initial={{ opacity: 0, x: direction * 40 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 40 }} transition={{ duration: 0.35, ease: ease as any }}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-flex h-12 w-12 items-center justify-center bg-[hsl(var(--pastel-mint))] border-2 border-foreground rounded-2xl">
                    <TrendingUp className="h-6 w-6" />
                  </span>
                  <div>
                    <h1 className="font-display text-2xl font-bold">Investment details</h1>
                    <p className="text-sm text-muted-foreground">Help founders find the right fit</p>
                  </div>
                </div>

                <form onSubmit={handleStep2} className="space-y-6">
                  {/* Experience */}
                  <div>
                    <Label className="font-semibold">Investment experience *</Label>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {EXPERIENCE_OPTIONS.map(opt => (
                        <button key={opt} type="button"
                          onClick={() => setInvestmentExperience(opt)}
                          className={`py-2 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                            investmentExperience === opt
                              ? "border-foreground bg-[hsl(var(--pastel-blue))] shadow-[2px_2px_0_0_hsl(var(--foreground))]"
                              : "border-border hover:border-foreground/60"
                          }`}>
                          {opt === "First-time" ? "First-time" : `${opt} deals`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ticket Size */}
                  <div>
                    <Label className="font-semibold">
                      <IndianRupee className="inline h-3.5 w-3.5 mr-1" />Ticket size range *
                    </Label>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <div>
                        <Input value={ticketSizeMin} onChange={e => setTicketSizeMin(e.target.value)} placeholder="Min (e.g. 500000)" type="number" required className="border-2" />
                        <p className="text-xs text-muted-foreground mt-1">Min ₹</p>
                      </div>
                      <div>
                        <Input value={ticketSizeMax} onChange={e => setTicketSizeMax(e.target.value)} placeholder="Max (e.g. 5000000)" type="number" required className="border-2" />
                        <p className="text-xs text-muted-foreground mt-1">Max ₹</p>
                      </div>
                    </div>
                  </div>

                  {/* Preferred Stages */}
                  <div>
                    <Label className="font-semibold">Preferred stages *</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {STAGE_OPTIONS.map(s => (
                        <button key={s} type="button"
                          onClick={() => toggleItem(s, preferredStages, setPreferredStages)}
                          className={`px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all ${
                            preferredStages.includes(s)
                              ? "border-foreground bg-[hsl(var(--pastel-mint))] shadow-[2px_2px_0_0_hsl(var(--foreground))]"
                              : "border-border hover:border-foreground/60"
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sectors */}
                  <div>
                    <Label className="font-semibold">Investment sectors *</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {SECTOR_OPTIONS.map(s => (
                        <button key={s} type="button"
                          onClick={() => toggleItem(s, investmentSectors, setInvestmentSectors)}
                          className={`px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all ${
                            investmentSectors.includes(s)
                              ? "border-foreground bg-[hsl(var(--pastel-pink))] shadow-[2px_2px_0_0_hsl(var(--foreground))]"
                              : "border-border hover:border-foreground/60"
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="prefSectors" className="font-semibold">Anything else? <span className="font-normal text-xs text-muted-foreground">(optional)</span></Label>
                    <Textarea id="prefSectors" value={preferredSectors} onChange={e => setPreferredSectors(e.target.value)}
                      placeholder="E.g. Deep impact investing in tier-2 cities..." rows={2} className="mt-1 border-2 resize-none" />
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => { setDirection(-1); setStep(0); }}
                      className="flex-1 h-12 rounded-full border-2 border-foreground font-bold">
                      <ChevronLeft className="mr-1 h-4 w-4" /> Back
                    </Button>
                    <Button type="submit"
                      disabled={!investmentExperience || !ticketSizeMin || !ticketSizeMax || preferredStages.length === 0 || investmentSectors.length === 0}
                      className="flex-[2] h-12 rounded-full border-2 border-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] bg-foreground text-background font-bold hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all disabled:opacity-50">
                      Continue <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ── STEP 3: VERIFICATION ── */}
            {step === 2 && (
              <motion.div key="s3" custom={direction}
                initial={{ opacity: 0, x: direction * 40 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 40 }} transition={{ duration: 0.35, ease: ease as any }}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-flex h-12 w-12 items-center justify-center bg-[hsl(var(--pastel-yellow))] border-2 border-foreground rounded-2xl">
                    <ShieldCheck className="h-6 w-6" />
                  </span>
                  <div>
                    <h1 className="font-display text-2xl font-bold">Verification</h1>
                    <p className="text-sm text-muted-foreground">Build trust with student founders</p>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-[hsl(var(--pastel-blue))] border-2 border-foreground rounded-2xl text-sm font-medium">
                  🔒 Two founder references are required. We'll reach out for verification within 48 hours.
                </div>

                <form onSubmit={handleStep3} className="space-y-5">
                  <div>
                    <Label htmlFor="invCount" className="font-semibold">Total investments made *</Label>
                    <Input id="invCount" type="number" min="0" value={totalInvestmentsCount}
                      onChange={e => setTotalInvestmentsCount(e.target.value)} placeholder="e.g. 5" required className="mt-1 border-2" />
                  </div>

                  {/* Reference 1 */}
                  <div className="p-4 border-2 border-foreground rounded-2xl space-y-3 bg-[hsl(var(--pastel-peach))]/30">
                    <p className="font-semibold text-sm">Reference Founder 1 *</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="r1name" className="text-xs font-medium text-muted-foreground">Full name</Label>
                        <Input id="r1name" value={ref1Name} onChange={e => setRef1Name(e.target.value)} placeholder="Aarav Mehta" required className="mt-1 border-2" />
                      </div>
                      <div>
                        <Label htmlFor="r1email" className="text-xs font-medium text-muted-foreground">Email</Label>
                        <Input id="r1email" type="email" value={ref1Email} onChange={e => setRef1Email(e.target.value)} placeholder="aarav@startup.co" required className="mt-1 border-2" />
                      </div>
                    </div>
                  </div>

                  {/* Reference 2 */}
                  <div className="p-4 border-2 border-foreground rounded-2xl space-y-3 bg-[hsl(var(--pastel-lilac))]/30">
                    <p className="font-semibold text-sm">Reference Founder 2 *</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="r2name" className="text-xs font-medium text-muted-foreground">Full name</Label>
                        <Input id="r2name" value={ref2Name} onChange={e => setRef2Name(e.target.value)} placeholder="Priya Sharma" required className="mt-1 border-2" />
                      </div>
                      <div>
                        <Label htmlFor="r2email" className="text-xs font-medium text-muted-foreground">Email</Label>
                        <Input id="r2email" type="email" value={ref2Email} onChange={e => setRef2Email(e.target.value)} placeholder="priya@startup.io" required className="mt-1 border-2" />
                      </div>
                    </div>
                  </div>

                  {/* Past investments */}
                  <div>
                    <Label htmlFor="past" className="font-semibold">Past investments <span className="font-normal text-xs text-muted-foreground">(optional)</span></Label>
                    <Textarea id="past" value={pastInvestments} onChange={e => setPastInvestments(e.target.value)}
                      placeholder="e.g. Razorpay (2019, ₹25L), Cred (2021, ₹50L)..." rows={3} className="mt-1 border-2 resize-none" />
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => { setDirection(-1); setStep(1); }}
                      className="flex-1 h-12 rounded-full border-2 border-foreground font-bold">
                      <ChevronLeft className="mr-1 h-4 w-4" /> Back
                    </Button>
                    <Button type="submit" disabled={loading}
                      className="flex-[2] h-12 rounded-full border-2 border-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] bg-foreground text-background font-bold hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all disabled:opacity-50">
                      {loading ? "Submitting…" : "Submit for verification 🛡️"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

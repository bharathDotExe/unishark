import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { studentProfileSchema, studentSkillsSchema } from "@/lib/validations/auth";
import { GraduationCap, MapPin, Linkedin, Phone, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";

const COLLEGES = [
  "IIT Delhi", "IIT Bombay", "IIT Madras", "IIT Kharagpur", "IIT Kanpur",
  "BITS Pilani", "VIT Vellore", "NIT Trichy", "NIT Surathkal",
  "IIIT Hyderabad", "IIT Roorkee", "IIT Guwahati", "Other"
];

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Alumni"] as const;
const YEAR_TO_DB = {
  "1st Year": "FIRST_YEAR",
  "2nd Year": "SECOND_YEAR",
  "3rd Year": "THIRD_YEAR",
  "4th Year": "FOURTH_YEAR",
  Alumni: "ALUMNI",
} as const;

const SKILL_OPTIONS = [
  "Web Development", "Mobile Development", "AI/ML", "Blockchain",
  "Cloud & DevOps", "Data Science", "UI/UX Design", "Product Management",
  "Business Development", "FinTech", "EdTech", "Cybersecurity",
  "IoT / Hardware", "Other"
];

const STARTUP_INTERESTS = [
  "SaaS", "B2B", "B2C", "Consumer Apps", "HealthTech", "EdTech",
  "FinTech", "Climate / GreenTech", "AgriTech", "E-commerce",
  "Blockchain / Web3", "DeepTech", "Media & Creator Economy", "Other"
];

const STEP_TITLES = ["Basic Info", "Skills & Interests"];

const ease = [0.22, 1, 0.36, 1] as const;

export default function StudentOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(1);

  // Step 1 state
  const [fullName, setFullName] = useState("");
  const [college, setCollege] = useState("");
  const [year, setYear] = useState<typeof YEARS[number] | "">("");
  const [city, setCity] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  // Step 2 state
  const [skills, setSkills] = useState<string[]>([]);
  const [startupInterests, setStartupInterests] = useState<string[]>([]);
  const [industriesInterest, setIndustriesInterest] = useState("");

  const progress = ((step + 1) / STEP_TITLES.length) * 100;

  const toggleItem = (item: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(item) ? list.filter(x => x !== item) : [...list, item]);
  };

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = studentProfileSchema.safeParse({
      fullName, college, year, linkedinUrl, contactNumber, city
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setDirection(1);
    setStep(1);
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = studentSkillsSchema.safeParse({ skills, startupInterests, industriesInterest });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    if (!user) { toast.error("Not authenticated"); return; }

    setLoading(true);
    try {
      // Upsert student profile into Supabase
      const { error: profileError } = await supabase.from("profiles").update({
        full_name: fullName,
      }).eq("id", user.id);
      if (profileError) throw profileError;

      const { error } = await supabase.from("student_profiles").upsert({
        user_id: user.id,
        college,
        year: YEAR_TO_DB[year as keyof typeof YEAR_TO_DB],
        linkedin_url: linkedinUrl || null,
        skills: { skills, startupInterests, industriesInterest, city, contactNumber },
      }, { onConflict: "user_id" });

      if (error) throw error;

      toast.success("Profile created! Welcome to UniShark 🎉");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-2xl px-4 py-10 md:py-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {STEP_TITLES.map((title, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-foreground font-bold text-sm transition-colors ${
                  i < step ? "bg-foreground text-background" : i === step ? "bg-[hsl(var(--pastel-mint))]" : "bg-card text-muted-foreground"
                }`}>
                  {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{title}</span>
                {i < STEP_TITLES.length - 1 && <div className={`h-0.5 w-8 sm:w-16 ${i < step ? "bg-foreground" : "bg-border"}`} />}
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

        {/* Step Card */}
        <div className="bg-card border-2 border-foreground shadow-[8px_8px_0_0_hsl(var(--foreground))] rounded-3xl p-6 md:p-10 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 0 && (
              <motion.div
                key="step1"
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 40 }}
                transition={{ duration: 0.35, ease: ease as any }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-flex h-12 w-12 items-center justify-center bg-[hsl(var(--pastel-mint))] border-2 border-foreground rounded-2xl">
                    <GraduationCap className="h-6 w-6" />
                  </span>
                  <div>
                    <h1 className="font-display text-2xl font-bold">Your basic info</h1>
                    <p className="text-sm text-muted-foreground">Tell investors who you are</p>
                  </div>
                </div>

                <form onSubmit={handleStep1} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="fullName" className="font-semibold">Full name *</Label>
                      <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Aarav Mehta" required className="mt-1 border-2" />
                    </div>

                    <div>
                      <Label htmlFor="college" className="font-semibold">College / University *</Label>
                      <select
                        id="college"
                        value={college}
                        onChange={e => setCollege(e.target.value)}
                        required
                        className="mt-1 w-full px-3 py-2 border-2 border-input rounded-xl bg-background text-sm focus:border-foreground outline-none"
                      >
                        <option value="">Select your college</option>
                        {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="year" className="font-semibold">Year *</Label>
                      <select
                        id="year"
                        value={year}
                        onChange={e => setYear(e.target.value as any)}
                        required
                        className="mt-1 w-full px-3 py-2 border-2 border-input rounded-xl bg-background text-sm focus:border-foreground outline-none"
                      >
                        <option value="">Select year</option>
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="city" className="font-semibold">
                        <MapPin className="inline h-3.5 w-3.5 mr-1" />City *
                      </Label>
                      <Input id="city" value={city} onChange={e => setCity(e.target.value)} placeholder="Bengaluru" required className="mt-1 border-2" />
                    </div>

                    <div>
                      <Label htmlFor="contact" className="font-semibold">
                        <Phone className="inline h-3.5 w-3.5 mr-1" />Contact number
                      </Label>
                      <Input id="contact" value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="+91 98765 43210" className="mt-1 border-2" />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="linkedin" className="font-semibold">
                        <Linkedin className="inline h-3.5 w-3.5 mr-1" />LinkedIn URL
                      </Label>
                      <Input id="linkedin" type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/yourname" className="mt-1 border-2" />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 rounded-full border-2 border-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] bg-foreground text-background font-bold hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_0_hsl(var(--foreground))] transition-all">
                    Continue <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </form>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step2"
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 40 }}
                transition={{ duration: 0.35, ease: ease as any }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-flex h-12 w-12 items-center justify-center bg-[hsl(var(--pastel-yellow))] border-2 border-foreground rounded-2xl">
                    <CheckCircle2 className="h-6 w-6" />
                  </span>
                  <div>
                    <h1 className="font-display text-2xl font-bold">Skills & interests</h1>
                    <p className="text-sm text-muted-foreground">Help investors understand your strengths</p>
                  </div>
                </div>

                <form onSubmit={handleStep2} className="space-y-7">
                  {/* Skills */}
                  <div>
                    <Label className="font-semibold text-base">Your skills <span className="text-muted-foreground font-normal text-xs">(select all that apply)</span></Label>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {SKILL_OPTIONS.map(skill => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleItem(skill, skills, setSkills)}
                          className={`px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all ${
                            skills.includes(skill)
                              ? "border-foreground bg-[hsl(var(--pastel-mint))] shadow-[2px_2px_0_0_hsl(var(--foreground))]"
                              : "border-border hover:border-foreground/60"
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                    {skills.length === 0 && <p className="text-xs text-muted-foreground mt-2">Select at least 1 skill</p>}
                  </div>

                  {/* Startup Interests */}
                  <div>
                    <Label className="font-semibold text-base">Startup interests <span className="text-muted-foreground font-normal text-xs">(sectors you want to build in)</span></Label>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {STARTUP_INTERESTS.map(interest => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleItem(interest, startupInterests, setStartupInterests)}
                          className={`px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all ${
                            startupInterests.includes(interest)
                              ? "border-foreground bg-[hsl(var(--pastel-pink))] shadow-[2px_2px_0_0_hsl(var(--foreground))]"
                              : "border-border hover:border-foreground/60"
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                    {startupInterests.length === 0 && <p className="text-xs text-muted-foreground mt-2">Select at least 1 interest</p>}
                  </div>

                  {/* Free text */}
                  <div>
                    <Label htmlFor="industries" className="font-semibold">Anything else? <span className="font-normal text-muted-foreground text-xs">(optional)</span></Label>
                    <textarea
                      id="industries"
                      value={industriesInterest}
                      onChange={e => setIndustriesInterest(e.target.value)}
                      placeholder="e.g. I want to build in rural healthcare and impact spaces..."
                      rows={3}
                      className="mt-1 w-full px-3 py-2 border-2 border-input rounded-xl bg-background text-sm focus:border-foreground outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setDirection(-1); setStep(0); }}
                      className="flex-1 h-12 rounded-full border-2 border-foreground font-bold"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" /> Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || skills.length === 0 || startupInterests.length === 0}
                      className="flex-[2] h-12 rounded-full border-2 border-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] bg-foreground text-background font-bold hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_0_hsl(var(--foreground))] transition-all disabled:opacity-50"
                    >
                      {loading ? "Saving…" : "Complete profile 🎉"}
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

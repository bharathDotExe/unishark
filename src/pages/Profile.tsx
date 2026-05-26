import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  User, GraduationCap, Briefcase, Settings2, Edit3, Download, Share2, 
  Linkedin, Twitter, Globe, Phone, MapPin, Plus, Trash2, CheckCircle2, 
  AlertTriangle, Lock, ShieldCheck, Mail, RefreshCw, Sparkles, X, Check, Save 
} from "lucide-react";
import { cn } from "@/lib/utils";

type ExperienceItem = {
  id: string;
  title: string;
  company: string;
  duration: string;
  description?: string;
};

export default function Profile() {
  const { user } = useAuth();
  
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<"basic" | "skills" | "experience" | "settings">("basic");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  
  // Profile Meta
  const [coverPhoto, setCoverPhoto] = useState("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80");
  const [profilePhoto, setProfilePhoto] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80");

  // Tab 1: Basic Info State (with mock fallbacks)
  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Doe");
  const [email, setEmail] = useState("john@example.com");
  const [contactNumber, setContactNumber] = useState("+91 98765 43210");
  const [city, setCity] = useState("Delhi");
  const [college, setCollege] = useState("IIT Delhi");
  const [gradYear, setGradYear] = useState("Alumni (Graduated 2022)");
  const [linkedin, setLinkedin] = useState("linkedin.com/in/johndoe");
  const [twitter, setTwitter] = useState("twitter.com/johndoe");
  const [website, setWebsite] = useState("www.johndoe.com");
  const [bio, setBio] = useState("Building AI-powered tools to help students. Previously at Google working on ML infrastructure.");

  // Temporary Edit Form States
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    city: "",
    college: "",
    gradYear: "",
    linkedin: "",
    twitter: "",
    website: "",
    bio: ""
  });

  // Tab 2: Skills & Interests
  const [skills, setSkills] = useState<string[]>(["Web Development", "AI/ML", "Product Management"]);
  const [interests, setInterests] = useState<string[]>(["SaaS", "EdTech", "B2C"]);
  const [industries, setIndustries] = useState<string>("Education, Technology, Career Development");
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");

  // Tab 3: Experience
  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    {
      id: "exp-1",
      title: "Software Engineer",
      company: "Google",
      duration: "2022 - 2024 (2 years)",
      description: "Worked on ML infrastructure, trained 100+ ML models, reduced inference latency by 40%."
    },
    {
      id: "exp-2",
      title: "Data Scientist Intern",
      company: "Microsoft",
      duration: "Summer 2021 (3 months)",
      description: "Implemented recommendation algorithms for Azure dashboards."
    }
  ]);
  const [newExp, setNewExp] = useState({
    title: "",
    company: "",
    duration: "",
    description: ""
  });
  const [showAddExp, setShowAddExp] = useState(false);

  // Tab 4: Settings
  const [notifications, setNotifications] = useState({
    investors: true,
    weeklyReport: true,
    recommendations: true,
    marketing: false
  });
  const [privacy, setPrivacy] = useState<"public" | "investors" | "private">("investors");

  // Load profile from Supabase
  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const { data: p } = await supabase.from("profiles").select("full_name, email").eq("id", user.id).maybeSingle();
        const { data: sp } = await supabase.from("student_profiles").select("*").eq("user_id", user.id).maybeSingle();

        if (p) {
          const names = (p.full_name || "").split(" ");
          setFirstName(names[0] || "John");
          setLastName(names.slice(1).join(" ") || "Doe");
          setEmail(p.email || "john@example.com");
        }
        if (sp) {
          setCollege(sp.college || "IIT Delhi");
          setGradYear(sp.year || "Alumni (Graduated 2022)");
          if (Array.isArray(sp.skills) && sp.skills.length > 0) {
            setSkills(sp.skills as string[]);
          }
          setLinkedin(sp.linkedin_url || "linkedin.com/in/johndoe");
        }
      } catch (err) {
        console.error("Failed to load real profile", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Handle entering basic edit mode
  const handleStartEditBasic = () => {
    setEditForm({
      firstName,
      lastName,
      contactNumber,
      city,
      college,
      gradYear,
      linkedin,
      twitter,
      website,
      bio
    });
    setIsEditingBasic(true);
  };

  // Handle saving basic details
  const handleSaveBasic = async () => {
    setSaving(true);
    try {
      if (user) {
        // Save to Supabase
        const full_name = `${editForm.firstName} ${editForm.lastName}`.trim();
        await supabase.from("profiles").update({ full_name }).eq("id", user.id);
        await supabase.from("student_profiles").upsert({
          user_id: user.id,
          college: editForm.college,
          year: editForm.gradYear as any,
          skills,
          linkedin_url: editForm.linkedin
        }, { onConflict: "user_id" });
      }

      setFirstName(editForm.firstName);
      setLastName(editForm.lastName);
      setContactNumber(editForm.contactNumber);
      setCity(editForm.city);
      setCollege(editForm.college);
      setGradYear(editForm.gradYear);
      setLinkedin(editForm.linkedin);
      setTwitter(editForm.twitter);
      setWebsite(editForm.website);
      setBio(editForm.bio);

      setIsEditingBasic(false);
      toast.success("Basic profile details saved!");
    } catch (e: any) {
      toast.error("Could not save basic details: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  // Toggle skills / interests
  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  // Add custom skill/interest
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
      toast.success("Skill added!");
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
      toast.success("Interest added!");
    }
  };

  // Handle experiences
  const handleAddExperience = () => {
    if (!newExp.title.trim() || !newExp.company.trim()) {
      toast.error("Title and Company are required!");
      return;
    }
    const exp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      title: newExp.title,
      company: newExp.company,
      duration: newExp.duration || "Present",
      description: newExp.description
    };
    setExperiences([...experiences, exp]);
    setNewExp({ title: "", company: "", duration: "", description: "" });
    setShowAddExp(false);
    toast.success("Experience added successfully!");
  };

  const handleDeleteExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
    toast.success("Experience deleted!");
  };

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully!");
  };

  const handleActionToast = (action: string) => {
    toast.success(`${action} processed!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center" style={{ backgroundImage: "var(--gradient-mesh)" }}>
        <div className="text-center p-6 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl bg-card">
          <RefreshCw className="h-10 w-10 text-foreground animate-spin mx-auto mb-3" />
          <p className="text-foreground font-extrabold font-display">Loading Student Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl pb-24">
      
      {/* PAGE TITLE */}
      <div className="text-center p-6 border-[3px] border-foreground shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] bg-card mb-8">
        <span className="text-xs uppercase tracking-widest font-black text-foreground bg-[hsl(var(--pastel-pink))] border-2 border-foreground px-3 py-1 rounded-full mb-3 inline-block shadow-[2px_2px_0_0_hsl(var(--foreground))]">
          👤 FOUNDER IDENTITY
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-foreground uppercase tracking-widest mt-1">
          MY PROFILE
        </h1>
      </div>

      {/* HEADER WITH COVER PHOTO */}
      <Card className="border-[3px] border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden mb-8 relative">
        {/* Cover Photo */}
        <div className="h-48 w-full bg-muted relative overflow-hidden group border-b-2 border-foreground">
          <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
          <button 
            onClick={() => handleActionToast("Edit Cover Photo")}
            className="absolute top-4 right-4 bg-background border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] text-foreground text-xs font-black px-3 py-1.5 rounded-xl hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
          >
            📸 Change Cover
          </button>
        </div>

        {/* Profile Card details */}
        <div className="p-6 pt-16 sm:pt-6 relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
          
          {/* Profile Photo */}
          <div className="absolute top-[-60px] sm:top-[-80px] left-1/2 sm:left-8 translate-x-[-50%] sm:translate-x-0 w-28 h-28 sm:w-32 sm:h-32 rounded-full border-[3px] border-foreground bg-background shadow-[4px_4px_0_0_hsl(var(--foreground))] overflow-hidden">
            <img src={profilePhoto} alt="John Doe" className="w-full h-full object-cover" />
          </div>

          {/* User Meta (Shifted left for desktop profile photo alignment) */}
          <div className="mt-8 sm:mt-0 sm:pl-36 text-center sm:text-left space-y-1 flex-1">
            <h2 className="text-2xl font-display font-black text-foreground uppercase tracking-tight flex items-center justify-center sm:justify-start gap-1.5">
              {firstName} {lastName}
              <span className="text-[10px] bg-foreground text-background px-2 py-0.5 rounded border border-background/20 font-black shadow-[1px_1px_0_0_hsl(var(--foreground))]">
                Student Founder
              </span>
            </h2>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-wide">
              Founder & CEO | {college}
            </p>
            <p className="text-xs text-muted-foreground font-semibold">
              {email}
            </p>
          </div>

          {/* Actions Block */}
          <div className="flex flex-wrap gap-2.5 justify-center sm:justify-end">
            <Button 
              onClick={handleStartEditBasic}
              className="border-2 border-foreground bg-[hsl(var(--pastel-yellow))] hover:bg-[hsl(var(--pastel-yellow))]/90 text-foreground font-black text-xs rounded-xl shadow-[3px_3px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all px-4"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit Profile
            </Button>
            <Button 
              onClick={() => handleActionToast("Downloading CV")}
              variant="outline"
              className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-black text-xs rounded-xl shadow-[3px_3px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all px-4"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Download CV
            </Button>
            <Button 
              onClick={() => handleActionToast("Copied profile share link")}
              variant="outline"
              className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-black text-xs rounded-xl shadow-[3px_3px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all px-4"
            >
              <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share Profile
            </Button>
          </div>
        </div>
      </Card>

      {/* NEOBRUTALISTIC TABS STRIP */}
      <div className="flex flex-wrap gap-2.5 mb-8 border-b-4 border-foreground pb-4">
        {[
          { id: "basic", label: "Basic Info", icon: User, color: "bg-[hsl(var(--pastel-blue))]" },
          { id: "skills", label: "Skills & Interests", icon: Sparkles, color: "bg-[hsl(var(--pastel-pink))]" },
          { id: "experience", label: "Experience", icon: Briefcase, color: "bg-[hsl(var(--pastel-yellow))]" },
          { id: "settings", label: "Settings", icon: Settings2, color: "bg-[hsl(var(--pastel-green))]" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 border-2 border-foreground font-black text-xs sm:text-sm rounded-xl transition-all duration-200 hover:translate-x-[-1px] hover:translate-y-[-1px]",
                isActive 
                  ? `${tab.color} text-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))]` 
                  : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT GRID */}
      <div className="space-y-8">
        
        {/* TAB 1: BASIC INFO */}
        {activeTab === "basic" && (
          <Card className="border-[3px] border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden p-6 sm:p-8">
            <h3 className="font-display font-black text-lg text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
              <span>📋</span> TAB 1: BASIC INFO
            </h3>

            {isEditingBasic ? (
              // EDIT MODE
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-first" className="font-black text-xs">First Name</Label>
                    <Input 
                      id="edit-first"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-last" className="font-black text-xs">Last Name</Label>
                    <Input 
                      id="edit-last"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-phone" className="font-black text-xs">Contact Number</Label>
                    <Input 
                      id="edit-phone"
                      value={editForm.contactNumber}
                      onChange={(e) => setEditForm({ ...editForm, contactNumber: e.target.value })}
                      className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-city" className="font-black text-xs">City</Label>
                    <Input 
                      id="edit-city"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-college" className="font-black text-xs">College</Label>
                    <Input 
                      id="edit-college"
                      value={editForm.college}
                      onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                      className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-year" className="font-black text-xs">Year</Label>
                    <Input 
                      id="edit-year"
                      value={editForm.gradYear}
                      onChange={(e) => setEditForm({ ...editForm, gradYear: e.target.value })}
                      className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-li" className="font-black text-xs">LinkedIn</Label>
                    <Input 
                      id="edit-li"
                      value={editForm.linkedin}
                      onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                      className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-tw" className="font-black text-xs">Twitter</Label>
                    <Input 
                      id="edit-tw"
                      value={editForm.twitter}
                      onChange={(e) => setEditForm({ ...editForm, twitter: e.target.value })}
                      className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="edit-web" className="font-black text-xs">Website</Label>
                    <Input 
                      id="edit-web"
                      value={editForm.website}
                      onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                      className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="edit-bio" className="font-black text-xs">Bio</Label>
                    <Textarea 
                      id="edit-bio"
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl font-bold min-h-[80px]"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t-2 border-foreground/10">
                  <Button 
                    onClick={() => setIsEditingBasic(false)}
                    variant="outline"
                    className="border-2 border-foreground bg-background hover:bg-muted text-muted-foreground font-black text-xs rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveBasic}
                    disabled={saving}
                    className="border-2 border-foreground bg-[hsl(var(--pastel-green))] hover:bg-[hsl(var(--pastel-green))]/90 text-foreground font-black text-xs rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            ) : (
              // READ-ONLY DISPLAY
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Metadata Column */}
                  <div className="md:col-span-2 space-y-4 font-bold text-xs text-muted-foreground border-r-0 md:border-r-2 md:border-foreground/15 pr-0 md:pr-6">
                    <p className="flex items-center gap-2"><span className="font-black text-foreground min-w-[120px]">First Name:</span> {firstName}</p>
                    <p className="flex items-center gap-2"><span className="font-black text-foreground min-w-[120px]">Last Name:</span> {lastName}</p>
                    <p className="flex items-center gap-2"><span className="font-black text-foreground min-w-[120px]">Email:</span> {email}</p>
                    <p className="flex items-center gap-2"><span className="font-black text-foreground min-w-[120px]">Contact Number:</span> {contactNumber}</p>
                    <p className="flex items-center gap-2"><span className="font-black text-foreground min-w-[120px]">City:</span> {city}</p>
                    
                    <div className="h-px bg-foreground/10 my-4"></div>

                    <p className="flex items-center gap-2"><span className="font-black text-foreground min-w-[120px]">College:</span> {college}</p>
                    <p className="flex items-center gap-2"><span className="font-black text-foreground min-w-[120px]">Year:</span> {gradYear}</p>
                  </div>

                  {/* Right Socials Column */}
                  <div className="space-y-4 font-bold text-xs text-muted-foreground">
                    <p className="font-black text-foreground uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                      <span>🔗</span> Profile Contacts
                    </p>
                    <p className="flex items-center gap-2 hover:text-foreground">
                      <Linkedin className="h-4 w-4 text-foreground flex-shrink-0" />
                      <a href={`https://${linkedin}`} target="_blank" rel="noreferrer" className="underline truncate">{linkedin}</a>
                    </p>
                    <p className="flex items-center gap-2 hover:text-foreground">
                      <Twitter className="h-4 w-4 text-foreground flex-shrink-0" />
                      <a href={`https://${twitter}`} target="_blank" rel="noreferrer" className="underline truncate">{twitter}</a>
                    </p>
                    <p className="flex items-center gap-2 hover:text-foreground">
                      <Globe className="h-4 w-4 text-foreground flex-shrink-0" />
                      <a href={`https://${website}`} target="_blank" rel="noreferrer" className="underline truncate">{website}</a>
                    </p>
                  </div>
                </div>

                <div className="h-px bg-foreground/10 my-6"></div>

                {/* Bio card */}
                <div className="space-y-2">
                  <p className="font-black text-xs text-foreground uppercase tracking-wider text-[10px]">Bio:</p>
                  <p className="text-xs text-muted-foreground font-black italic bg-muted/30 p-4 border-2 border-foreground/10 rounded-xl leading-relaxed max-w-3xl">
                    "{bio}"
                  </p>
                </div>

                <div className="flex justify-start pt-6 border-t border-foreground/10">
                  <Button 
                    onClick={handleStartEditBasic}
                    className="border-2 border-foreground bg-foreground text-background hover:bg-foreground hover:text-background shadow-[3px_3px_0_0_hsl(var(--foreground))] font-black text-xs rounded-xl px-5 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                  >
                    <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit Basic Details
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* TAB 2: SKILLS & INTERESTS */}
        {activeTab === "skills" && (
          <Card className="border-[3px] border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden p-6 sm:p-8">
            <h3 className="font-display font-black text-lg text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
              <span>🎯</span> TAB 2: SKILLS & INTERESTS
            </h3>

            <div className="space-y-6">
              {/* Skills section */}
              <div className="space-y-3">
                <Label className="font-black text-sm text-foreground uppercase tracking-wider">Skills:</Label>
                <div className="flex flex-wrap gap-2">
                  {["Web Development", "AI/ML", "Product Management", "Data Science", "Mobile Apps", "UI/UX Design"].map((skill) => {
                    const isSelected = skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={cn(
                          "px-3 py-1.5 border-2 border-foreground rounded-xl font-black text-xs shadow-[2px_2px_0_0_hsl(var(--foreground))] transition-all flex items-center gap-1 hover:translate-x-[-0.5px] hover:translate-y-[-0.5px]",
                          isSelected ? "bg-[hsl(var(--pastel-blue))]" : "bg-background text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {isSelected ? "✓" : "+"} {skill}
                      </button>
                    );
                  })}
                </div>
                
                {/* Custom Skill Input */}
                <div className="flex items-center gap-2 max-w-sm mt-3 pt-2">
                  <Input 
                    placeholder="Add custom skill..." 
                    value={newSkill} 
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl text-xs font-bold"
                  />
                  <Button 
                    onClick={handleAddSkill}
                    size="sm"
                    className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-black text-xs rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex-shrink-0"
                  >
                    Add More
                  </Button>
                </div>
              </div>

              <div className="h-px bg-foreground/10 my-6"></div>

              {/* Startup Interests */}
              <div className="space-y-3">
                <Label className="font-black text-sm text-foreground uppercase tracking-wider">Startup Interests:</Label>
                <div className="flex flex-wrap gap-2">
                  {["SaaS", "EdTech", "B2C", "Fintech", "Healthtech", "Web3"].map((interest) => {
                    const isSelected = interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={cn(
                          "px-3 py-1.5 border-2 border-foreground rounded-xl font-black text-xs shadow-[2px_2px_0_0_hsl(var(--foreground))] transition-all flex items-center gap-1 hover:translate-x-[-0.5px] hover:translate-y-[-0.5px]",
                          isSelected ? "bg-[hsl(var(--pastel-pink))]" : "bg-background text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {isSelected ? "✓" : "+"} {interest}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Interest Input */}
                <div className="flex items-center gap-2 max-w-sm mt-3 pt-2">
                  <Input 
                    placeholder="Add custom interest..." 
                    value={newInterest} 
                    onChange={(e) => setNewInterest(e.target.value)}
                    className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl text-xs font-bold"
                  />
                  <Button 
                    onClick={handleAddInterest}
                    size="sm"
                    className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-black text-xs rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex-shrink-0"
                  >
                    Add More
                  </Button>
                </div>
              </div>

              <div className="h-px bg-foreground/10 my-6"></div>

              {/* Industries */}
              <div className="space-y-3">
                <Label htmlFor="profile-ind" className="font-black text-sm text-foreground uppercase tracking-wider">Industries:</Label>
                <Input 
                  id="profile-ind"
                  value={industries} 
                  onChange={(e) => setIndustries(e.target.value)}
                  className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl text-xs font-bold max-w-md"
                />
                <p className="text-[10px] text-muted-foreground font-bold italic">
                  *Comma-separated industries representing market sectors.
                </p>
              </div>

              <div className="flex justify-start pt-6 border-t border-foreground/10">
                <Button 
                  onClick={() => toast.success("Skills & interests saved successfully!")}
                  className="border-2 border-foreground bg-foreground text-background hover:bg-foreground hover:text-background shadow-[3px_3px_0_0_hsl(var(--foreground))] font-black text-xs rounded-xl px-5 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" /> Save Skills
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* TAB 3: EXPERIENCE */}
        {activeTab === "experience" && (
          <Card className="border-[3px] border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden p-6 sm:p-8">
            <h3 className="font-display font-black text-lg text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
              <span>💼</span> TAB 3: EXPERIENCE
            </h3>

            <div className="space-y-6">
              {experiences.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground font-bold italic">
                  No experience blocks found. Click add more underneath to record your past roles!
                </div>
              ) : (
                experiences.map((exp, index) => (
                  <div key={exp.id} className={cn("space-y-3", index > 0 && "pt-6 border-t-2 border-foreground/10")}>
                    <div>
                      <h4 className="font-black text-base text-foreground flex items-center gap-1.5 flex-wrap">
                        Experience {index + 1}:
                      </h4>
                    </div>

                    <div className="pl-4 border-l-[3px] border-foreground/30 text-xs text-muted-foreground font-bold space-y-1.5 leading-relaxed">
                      <p>├─ <span className="font-black text-foreground">Title:</span> {exp.title}</p>
                      <p>├─ <span className="font-black text-foreground">Company:</span> {exp.company}</p>
                      <p>├─ <span className="font-black text-foreground">Duration:</span> {exp.duration}</p>
                      {exp.description && (
                        <p>├─ <span className="font-black text-foreground">Description:</span> {exp.description}</p>
                      )}
                      <p className="flex gap-2 mt-1">
                        └─ 
                        <button 
                          onClick={() => handleActionToast(`Editing ${exp.title} role`)} 
                          className="underline text-foreground font-black hover:text-muted-foreground text-[10px] ml-1"
                        >
                          [Edit]
                        </button> 
                        <button 
                          onClick={() => handleDeleteExperience(exp.id)} 
                          className="underline text-destructive font-black hover:text-destructive/80 text-[10px]"
                        >
                          [Delete]
                        </button>
                      </p>
                    </div>
                  </div>
                ))
              )}

              {/* Add Experience Modal block */}
              {showAddExp ? (
                <div className="bg-muted/30 border-2 border-foreground p-4 rounded-xl space-y-4 max-w-md shadow-[3px_3px_0_0_hsl(var(--foreground))]">
                  <h4 className="font-black text-xs text-foreground uppercase tracking-wider">New Experience Block</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="exp-title" className="text-[10px] font-black">Title</Label>
                      <Input 
                        id="exp-title"
                        placeholder="e.g. Lead Developer" 
                        value={newExp.title} 
                        onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                        className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <Label htmlFor="exp-company" className="text-[10px] font-black">Company</Label>
                      <Input 
                        id="exp-company"
                        placeholder="e.g. Razorpay" 
                        value={newExp.company} 
                        onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                        className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <Label htmlFor="exp-dur" className="text-[10px] font-black">Duration</Label>
                      <Input 
                        id="exp-dur"
                        placeholder="e.g. 2023 - Present" 
                        value={newExp.duration} 
                        onChange={(e) => setNewExp({ ...newExp, duration: e.target.value })}
                        className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <Label htmlFor="exp-desc" className="text-[10px] font-black">Description</Label>
                      <Textarea 
                        id="exp-desc"
                        placeholder="Detail metrics, inference boosts..." 
                        value={newExp.description} 
                        onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                        className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl text-xs font-bold min-h-[60px]"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2 border-t border-foreground/10">
                    <Button 
                      onClick={() => setShowAddExp(false)} 
                      size="sm"
                      variant="outline" 
                      className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-black text-xs rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))]"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddExperience} 
                      size="sm"
                      className="border-2 border-foreground bg-[hsl(var(--pastel-green))] hover:bg-[hsl(var(--pastel-green))]/90 text-foreground font-black text-xs rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))]"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-6">
                  <Button 
                    onClick={() => setShowAddExp(true)}
                    className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-black text-xs rounded-xl shadow-[3px_3px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                  >
                    <Plus className="h-4 w-4 mr-1.5" /> Add More Experience
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === "settings" && (
          <Card className="border-[3px] border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden">
            <div className="bg-muted/40 border-b-2 border-foreground p-4">
              <h3 className="font-display font-black text-md text-foreground uppercase tracking-wider flex items-center gap-2">
                <span>⚙️</span> Account Settings
              </h3>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Notification preferences */}
              <div className="space-y-4">
                <Label className="font-black text-sm text-foreground uppercase tracking-wider">Email Notifications:</Label>
                <div className="space-y-2 pl-3">
                  <label className="flex items-center gap-2.5 font-bold text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={notifications.investors}
                      onChange={(e) => setNotifications({ ...notifications, investors: e.target.checked })}
                      className="w-4 h-4 border-2 border-foreground rounded cursor-pointer accent-foreground"
                    />
                    <span>☑ Messages from investors</span>
                  </label>
                  <label className="flex items-center gap-2.5 font-bold text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={notifications.weeklyReport}
                      onChange={(e) => setNotifications({ ...notifications, weeklyReport: e.target.checked })}
                      className="w-4 h-4 border-2 border-foreground rounded cursor-pointer accent-foreground"
                    />
                    <span>☑ Weekly pitch performance report</span>
                  </label>
                  <label className="flex items-center gap-2.5 font-bold text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={notifications.recommendations}
                      onChange={(e) => setNotifications({ ...notifications, recommendations: e.target.checked })}
                      className="w-4 h-4 border-2 border-foreground rounded cursor-pointer accent-foreground"
                    />
                    <span>☑ Investor recommendations</span>
                  </label>
                  <label className="flex items-center gap-2.5 font-bold text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={notifications.marketing}
                      onChange={(e) => setNotifications({ ...notifications, marketing: e.target.checked })}
                      className="w-4 h-4 border-2 border-foreground rounded cursor-pointer accent-foreground"
                    />
                    <span>☐ Marketing emails</span>
                  </label>
                </div>
              </div>

              <div className="h-px bg-foreground/10 my-6"></div>

              {/* Privacy settings */}
              <div className="space-y-4">
                <Label className="font-black text-sm text-foreground uppercase tracking-wider">Privacy Settings:</Label>
                <div className="space-y-2.5 pl-3 font-bold text-xs text-muted-foreground">
                  <label className="flex items-center gap-2.5 hover:text-foreground cursor-pointer select-none">
                    <input 
                      type="radio" 
                      name="privacy" 
                      value="public"
                      checked={privacy === "public"}
                      onChange={() => setPrivacy("public")}
                      className="w-4 h-4 accent-foreground cursor-pointer"
                    />
                    <span>○ Public profile (anyone can see)</span>
                  </label>
                  <label className="flex items-center gap-2.5 hover:text-foreground cursor-pointer select-none">
                    <input 
                      type="radio" 
                      name="privacy" 
                      value="investors"
                      checked={privacy === "investors"}
                      onChange={() => setPrivacy("investors")}
                      className="w-4 h-4 accent-foreground cursor-pointer"
                    />
                    <span>●○ Investors only (verified investors can see)</span>
                  </label>
                  <label className="flex items-center gap-2.5 hover:text-foreground cursor-pointer select-none">
                    <input 
                      type="radio" 
                      name="privacy" 
                      value="private"
                      checked={privacy === "private"}
                      onChange={() => setPrivacy("private")}
                      className="w-4 h-4 accent-foreground cursor-pointer"
                    />
                    <span>○ Private (no one can see except you)</span>
                  </label>
                </div>
              </div>

              <div className="h-px bg-foreground/10 my-6"></div>

              {/* Security block */}
              <div className="space-y-3">
                <Label className="font-black text-sm text-foreground uppercase tracking-wider">Security:</Label>
                <div className="flex flex-wrap gap-2 pl-3">
                  <Button 
                    onClick={() => handleActionToast("Opening Password Change modal")}
                    size="sm"
                    className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-black text-xs rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))]"
                  >
                    Change Password
                  </Button>
                  <Button 
                    onClick={() => handleActionToast("Enabling Two-Factor Authentication")}
                    size="sm"
                    className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-black text-xs rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))]"
                  >
                    Two-Factor Authentication (Disabled)
                  </Button>
                  <Button 
                    onClick={() => handleActionToast("Viewing Active Sessions details")}
                    size="sm"
                    className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-black text-xs rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))]"
                  >
                    Active Sessions (2 devices)
                  </Button>
                </div>
              </div>

              <div className="h-px bg-foreground/10 my-6"></div>

              {/* Danger Zone */}
              <div className="space-y-3 bg-destructive/5 border-2 border-destructive p-4 rounded-xl">
                <p className="font-black text-xs text-destructive uppercase tracking-widest flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 animate-bounce" /> Danger Zone:
                </p>
                <div className="pl-3 space-y-2">
                  <Button 
                    onClick={() => handleActionToast("Triggering account deletion flow")}
                    className="border-2 border-foreground bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black text-xs rounded-xl shadow-[2.5px_2.5px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                  >
                    Delete Account
                  </Button>
                  <p className="text-[10px] text-destructive font-bold italic leading-relaxed pl-1">
                    └─ Warning: This action is permanent and cannot be undone. All pitches, documents, and logs will be expunged.
                  </p>
                </div>
              </div>

              <div className="flex justify-start pt-6 border-t border-foreground/10">
                <Button 
                  onClick={handleSaveSettings}
                  className="border-2 border-foreground bg-foreground text-background hover:bg-foreground hover:text-background shadow-[3px_3px_0_0_hsl(var(--foreground))] font-black text-xs rounded-xl px-5 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" /> Save Settings
                </Button>
              </div>

            </div>
          </Card>
        )}

      </div>
    </div>
  );
}
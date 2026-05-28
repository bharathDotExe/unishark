import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  User, Briefcase, PieChart, Star, Settings2, ExternalLink, Edit, RefreshCw, Save, X
} from "lucide-react";
import { Link } from "react-router-dom";
import { SharkIdenticon } from "@/components/ui/SharkIdenticon";

type Profile = {
  full_name: string;
  email: string;
  avatar_url?: string | null;
};

type InvestorProfileData = {
  linkedin_url: string | null;
  sectors: string[] | null;
  ticket_size_min: number | null;
  ticket_size_max: number | null;
  past_investments: string | null;
  verified: boolean;
};

export default function InvestorProfile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"about" | "preferences" | "portfolio" | "reviews" | "settings">("about");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Profile data from DB
  const [profile, setProfile] = useState<Profile>({ full_name: "", email: "", avatar_url: null });
  const [investorData, setInvestorData] = useState<InvestorProfileData>({
    linkedin_url: null,
    sectors: [],
    ticket_size_min: null,
    ticket_size_max: null,
    past_investments: null,
    verified: false,
  });

  // Edit buffers
  const [editName, setEditName] = useState("");
  const [editLinkedIn, setEditLinkedIn] = useState("");
  const [editPastInvestments, setEditPastInvestments] = useState("");
  const [editTicketMin, setEditTicketMin] = useState("");
  const [editTicketMax, setEditTicketMax] = useState("");
  const [editSectors, setEditSectors] = useState<string[]>([]);

  const SECTOR_OPTIONS = ["EdTech", "SaaS", "FinTech", "HealthTech", "CleanTech", "AgriTech", "E-commerce", "D2C", "BioTech", "DeepTech"];

  useEffect(() => {
    if (!user) return;
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [{ data: profileData }, { data: invData }] = await Promise.all([
        supabase.from("profiles").select("full_name, email, avatar_url").eq("id", user.id).maybeSingle(),
        supabase.from("investor_profiles").select("linkedin_url, sectors, ticket_size_min, ticket_size_max, past_investments, verified").eq("user_id", user.id).maybeSingle(),
      ]);

      if (profileData) {
        setProfile({ 
          full_name: profileData.full_name ?? "", 
          email: profileData.email ?? user.email ?? "",
          avatar_url: profileData.avatar_url 
        });
        setEditName(profileData.full_name ?? "");
      }
      if (invData) {
        setInvestorData({
          linkedin_url: invData.linkedin_url,
          sectors: (invData.sectors as string[] | null) ?? [],
          ticket_size_min: invData.ticket_size_min as unknown as number | null,
          ticket_size_max: invData.ticket_size_max as unknown as number | null,
          past_investments: (invData.past_investments as string | null) ?? null,
          verified: invData.verified ?? false,
        });
        setEditLinkedIn(invData.linkedin_url ?? "");
        setEditPastInvestments((invData.past_investments as string | null) ?? "");
        setEditTicketMin(invData.ticket_size_min?.toString() ?? "");
        setEditTicketMax(invData.ticket_size_max?.toString() ?? "");
        setEditSectors((invData.sectors as string[] | null) ?? []);
      }
    } catch (e: unknown) {
      toast.error("Failed to load profile: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAbout = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error: p1 } = await supabase
        .from("profiles")
        .update({ full_name: editName })
        .eq("id", user.id);
      if (p1) throw p1;

      const { error: p2 } = await supabase
        .from("investor_profiles")
        .upsert({ user_id: user.id, linkedin_url: editLinkedIn || null }, { onConflict: "user_id" });
      if (p2) throw p2;

      setProfile((prev) => ({ ...prev, full_name: editName }));
      setInvestorData((prev) => ({ ...prev, linkedin_url: editLinkedIn || null }));
      setEditing(false);
      toast.success("Profile updated!");
    } catch (e: unknown) {
      toast.error("Save failed: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("investor_profiles")
        .upsert({
          user_id: user.id,
          sectors: editSectors,
          ticket_size_min: editTicketMin ? (Number(editTicketMin) as unknown as string) : null,
          ticket_size_max: editTicketMax ? (Number(editTicketMax) as unknown as string) : null,
          past_investments: editPastInvestments || null,
        }, { onConflict: "user_id" });
      if (error) throw error;

      setInvestorData((prev) => ({
        ...prev,
        sectors: editSectors,
        ticket_size_min: editTicketMin ? Number(editTicketMin) : null,
        ticket_size_max: editTicketMax ? Number(editTicketMax) : null,
        past_investments: editPastInvestments || null,
      }));
      setEditing(false);
      toast.success("Investment preferences saved!");
    } catch (e: unknown) {
      toast.error("Save failed: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  };

  const toggleSector = (s: string) => {
    setEditSectors((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const tabs = [
    { id: "about", label: "About", icon: User },
    { id: "preferences", label: "Investment Preferences", icon: Briefcase },
    { id: "portfolio", label: "Portfolio", icon: PieChart },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "settings", label: "Settings", icon: Settings2 },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl pb-24">

      <div className="mb-8 border-b-2 border-foreground/10 pb-6">
        <h1 className="text-4xl font-display font-extrabold text-foreground tracking-tight">
          My Investor Profile
        </h1>
      </div>

      {/* HEADER CARD */}
      <Card className="border-2 border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-xl overflow-hidden mb-8 relative">
        {/* Cover */}
        <div className="h-40 w-full bg-[hsl(var(--pastel-blue))]/30 relative overflow-hidden border-b-2 border-foreground">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        </div>

        <div className="p-6 pt-16 relative flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          {/* Avatar */}
          <div className="absolute -top-14 left-1/2 md:left-8 -translate-x-1/2 md:translate-x-0 w-28 h-28 rounded-full border-[3px] border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] overflow-hidden bg-background">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <SharkIdenticon seed={user?.id || "default"} role="investor" size={112} className="w-full h-full rounded-none" />
            )}
          </div>

          <div className="w-full md:pl-36 text-center md:text-left space-y-2">
            {loading ? (
              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span className="font-semibold">Loading profile...</span>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-display font-extrabold text-foreground">
                  {profile.full_name || "Your Name"}
                </h2>
                <p className="text-sm font-extrabold text-muted-foreground uppercase tracking-wider">
                  {user?.email}
                </p>

                <div className="flex items-center justify-center md:justify-start gap-3 mt-2 text-xs font-extrabold flex-wrap">
                  {investorData.verified && (
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 px-3 py-1 rounded-full border-2 border-emerald-800/20">
                      Verified Investor
                    </span>
                  )}
                  {investorData.sectors && investorData.sectors.length > 0 && (
                    <span className="text-muted-foreground">{investorData.sectors.slice(0, 3).join(" · ")}</span>
                  )}
                </div>

                {investorData.linkedin_url && (
                  <a
                    href={investorData.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A66C2] hover:underline mt-2"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> LinkedIn Profile
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </Card>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 mb-8 border-b-2 border-foreground/10 pb-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id as any;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setEditing(false); }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 border-2 border-foreground font-extrabold text-xs rounded-xl transition-all",
                isActive
                  ? "bg-foreground text-background shadow-[3px_3px_0_0_hsl(var(--foreground))] translate-x-[-1px] translate-y-[-1px]"
                  : "bg-card text-muted-foreground hover:bg-muted"
              )}
            >
              <tab.icon className="h-3.5 w-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB: ABOUT */}
      {activeTab === "about" && (
        <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-xl p-6 md:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="font-semibold">Loading...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-1">Full Name</p>
                    {editing ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border-2 border-foreground font-bold rounded-xl"
                        placeholder="Your full name"
                      />
                    ) : (
                      <p className="text-sm font-bold text-foreground">{profile.full_name || <span className="text-muted-foreground italic">Not set</span>}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                    <p className="text-sm font-bold text-foreground">{profile.email || user?.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-1">LinkedIn URL</p>
                    {editing ? (
                      <Input
                        value={editLinkedIn}
                        onChange={(e) => setEditLinkedIn(e.target.value)}
                        className="border-2 border-foreground font-bold rounded-xl"
                        placeholder="https://linkedin.com/in/your-profile"
                      />
                    ) : investorData.linkedin_url ? (
                      <a
                        href={investorData.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-[#0A66C2] hover:underline flex items-center gap-1"
                      >
                        {investorData.linkedin_url} <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <p className="text-sm font-bold text-muted-foreground italic">Not set</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-6 border-t-2 border-foreground/10">
                {editing ? (
                  <>
                    <Button variant="outline" size="sm" className="border-2 border-foreground font-bold rounded-xl"
                      onClick={() => { setEditing(false); setEditName(profile.full_name); setEditLinkedIn(investorData.linkedin_url ?? ""); }}>
                      <X className="h-3.5 w-3.5 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" disabled={saving} onClick={handleSaveAbout}
                      className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl">
                      {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" className="border-2 border-foreground font-bold rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))]"
                    onClick={() => setEditing(true)}>
                    <Edit className="h-3.5 w-3.5 mr-1" /> Edit Profile
                  </Button>
                )}
              </div>
            </>
          )}
        </Card>
      )}

      {/* TAB: INVESTMENT PREFERENCES */}
      {activeTab === "preferences" && (
        <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-xl p-6 md:p-8 space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="font-semibold">Loading...</span>
            </div>
          ) : (
            <>
              {/* Ticket Size */}
              <div>
                <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider mb-3">Ticket Size (₹ Lakhs)</h4>
                {editing ? (
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label className="text-xs font-bold text-muted-foreground mb-1">Min (₹L)</Label>
                      <Input
                        type="number"
                        value={editTicketMin}
                        onChange={(e) => setEditTicketMin(e.target.value)}
                        className="border-2 border-foreground font-bold rounded-xl"
                        placeholder="e.g. 25"
                      />
                    </div>
                    <span className="font-bold text-muted-foreground mt-5">—</span>
                    <div className="flex-1">
                      <Label className="text-xs font-bold text-muted-foreground mb-1">Max (₹L)</Label>
                      <Input
                        type="number"
                        value={editTicketMax}
                        onChange={(e) => setEditTicketMax(e.target.value)}
                        className="border-2 border-foreground font-bold rounded-xl"
                        placeholder="e.g. 200"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-foreground">
                    {investorData.ticket_size_min !== null && investorData.ticket_size_max !== null
                      ? `₹${investorData.ticket_size_min}L — ₹${investorData.ticket_size_max}L`
                      : <span className="text-muted-foreground italic">Not specified</span>
                    }
                  </p>
                )}
              </div>

              {/* Sectors */}
              <div>
                <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider mb-3">Preferred Sectors</h4>
                {editing ? (
                  <div className="flex flex-wrap gap-2">
                    {SECTOR_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleSector(s)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border-2 border-foreground font-bold text-xs transition-all",
                          editSectors.includes(s)
                            ? "bg-foreground text-background shadow-[2px_2px_0_0_hsl(var(--foreground))] translate-x-[-1px] translate-y-[-1px]"
                            : "bg-card text-foreground hover:bg-muted"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(investorData.sectors ?? []).length > 0
                      ? (investorData.sectors ?? []).map((s) => (
                          <Badge key={s} className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] bg-[hsl(var(--pastel-blue))] text-foreground">
                            {s}
                          </Badge>
                        ))
                      : <p className="text-sm text-muted-foreground italic">No sectors selected yet</p>
                    }
                  </div>
                )}
              </div>

              {/* Past Investments */}
              <div>
                <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider mb-3">Past Investments / Notes</h4>
                {editing ? (
                  <Textarea
                    value={editPastInvestments}
                    onChange={(e) => setEditPastInvestments(e.target.value)}
                    className="border-2 border-foreground font-semibold rounded-xl min-h-[100px]"
                    placeholder="List your past investments or add notes about your investment philosophy..."
                  />
                ) : (
                  <div className="p-4 bg-muted/20 border-2 border-foreground/10 rounded-xl text-sm font-semibold italic text-muted-foreground leading-relaxed">
                    {investorData.past_investments || "No investment notes added yet."}
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-6 border-t-2 border-foreground/10">
                {editing ? (
                  <>
                    <Button variant="outline" size="sm" className="border-2 border-foreground font-bold rounded-xl"
                      onClick={() => { setEditing(false); loadProfile(); }}>
                      <X className="h-3.5 w-3.5 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" disabled={saving} onClick={handleSavePreferences}
                      className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl">
                      {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                      Save Preferences
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" className="border-2 border-foreground font-bold rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))]"
                    onClick={() => setEditing(true)}>
                    <Edit className="h-3.5 w-3.5 mr-1" /> Edit Preferences
                  </Button>
                )}
              </div>
            </>
          )}
        </Card>
      )}

      {/* TAB: PORTFOLIO — links to Portfolio page */}
      {activeTab === "portfolio" && (
        <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-xl p-8 text-center py-16">
          <PieChart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-xl font-extrabold text-foreground mb-2">Portfolio Summary</h3>
          <p className="text-sm font-bold text-muted-foreground mb-6 max-w-md mx-auto">
            View your complete investment tracking and performance metrics in the dedicated Portfolio dashboard.
          </p>
          <Button asChild className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl">
            <Link to="/portfolio">Go to Portfolio Dashboard</Link>
          </Button>
        </Card>
      )}

      {/* TAB: REVIEWS — static for now (no reviews table) */}
      {activeTab === "reviews" && (
        <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-xl p-8 text-center py-16">
          <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-xl font-extrabold text-foreground mb-2">Founder Reviews</h3>
          <p className="text-sm font-bold text-muted-foreground max-w-md mx-auto">
            Founders will leave reviews here after successful engagements. No reviews yet.
          </p>
        </Card>
      )}

      {/* TAB: SETTINGS */}
      {activeTab === "settings" && (
        <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-xl p-6 md:p-8 space-y-8">
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-foreground uppercase border-b-2 border-foreground/10 pb-2 mb-4">
              Profile Visibility
            </h4>
            <RadioGroup defaultValue="verified" className="space-y-3 text-sm font-bold text-muted-foreground">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="p1" />
                <Label htmlFor="p1" className="text-muted-foreground cursor-pointer">Public (everyone can see your profile)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="verified" id="p2" />
                <Label htmlFor="p2" className="text-foreground cursor-pointer">Verified Investors Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="p3" />
                <Label htmlFor="p3" className="text-muted-foreground cursor-pointer">Private</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end pt-6 border-t-2 border-foreground/10">
            <Button
              className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl"
              onClick={() => toast.success("Settings saved!")}
            >
              <Save className="h-4 w-4 mr-2" /> Save Settings
            </Button>
          </div>
        </Card>
      )}

    </div>
  );
}

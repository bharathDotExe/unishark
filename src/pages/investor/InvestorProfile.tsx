import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  User, Briefcase, PieChart, Star, Settings2, Download, Share2, MapPin, ExternalLink, Mail, Edit
} from "lucide-react";

export default function InvestorProfile() {
  const [activeTab, setActiveTab] = useState<"about" | "preferences" | "portfolio" | "reviews" | "settings">("about");

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl pb-24">
      
      {/* PAGE TITLE */}
      <div className="mb-8 border-b-2 border-foreground/10 pb-6">
        <h1 className="text-4xl font-display font-extrabold text-foreground tracking-tight">
          MY INVESTOR PROFILE
        </h1>
      </div>

      {/* HEADER WITH COVER */}
      <Card className="border-2 border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-xl overflow-hidden mb-8 relative">
        {/* Cover Photo */}
        <div className="h-48 w-full bg-[hsl(var(--pastel-blue))]/30 relative overflow-hidden border-b-2 border-foreground">
          {/* Abstract pattern for cover */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <Button 
            className="absolute top-4 right-4 border-2 border-foreground bg-background hover:bg-muted text-foreground font-black text-xs rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))] h-8 px-4"
          >
            <Edit className="w-3.5 h-3.5 mr-2" /> [Edit Profile]
          </Button>
        </div>

        {/* Profile Details */}
        <div className="p-6 pt-16 relative flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          
          {/* Avatar */}
          <div className="absolute -top-16 left-1/2 md:left-8 -translate-x-1/2 md:translate-x-0 w-32 h-32 rounded-full border-[3px] border-foreground bg-[hsl(var(--pastel-yellow))] shadow-[4px_4px_0_0_hsl(var(--foreground))] overflow-hidden flex items-center justify-center text-4xl">
            ‍
          </div>

          <div className="w-full md:pl-40 text-center md:text-left space-y-2">
            <h2 className="text-3xl font-display font-extrabold text-foreground flex items-center justify-center md:justify-start gap-2">
              Raj Patel
            </h2>
            <p className="text-sm font-extrabold text-muted-foreground uppercase tracking-wider">
              Founder & Investment Partner, TechVentures
            </p>
            <p className="text-sm font-bold text-foreground italic">
              "Investing in the next generation of founders"
            </p>
            
            <div className="flex items-center justify-center md:justify-start gap-3 mt-4 text-xs font-extrabold">
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 px-3 py-1 rounded-full border-2 border-emerald-800/20">
                Verified Investor 
              </span>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">Member since May 2023</span>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center md:justify-start mt-6 pt-4 border-t-2 border-foreground/10">
              <Button variant="outline" size="sm" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] h-9">
                <Share2 className="w-4 h-4 mr-2" /> [Share Profile]
              </Button>
              <Button variant="outline" size="sm" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] h-9">
                <Download className="w-4 h-4 mr-2" /> [Download Portfolio Summary]
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 mb-8 border-b-2 border-foreground/10 pb-4">
        {[
          { id: "about", label: "[About]", icon: User },
          { id: "preferences", label: "[Investment Preferences]", icon: Briefcase },
          { id: "portfolio", label: "[Portfolio]", icon: PieChart },
          { id: "reviews", label: "[Reviews]", icon: Star },
          { id: "settings", label: "[Settings]", icon: Settings2 },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 border-2 border-foreground font-extrabold text-xs rounded-xl transition-all",
                isActive 
                  ? "bg-foreground text-background shadow-[3px_3px_0_0_hsl(var(--foreground))] translate-x-[-1px] translate-y-[-1px]" 
                  : "bg-card text-muted-foreground hover:bg-muted"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ABOUT */}
      {activeTab === "about" && (
        <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-xl p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4 text-sm font-bold text-muted-foreground">
              <p className="flex items-center gap-3"><span className="text-foreground min-w-[120px]">Full Name:</span> Raj Patel</p>
              <p className="flex items-center gap-3"><span className="text-foreground min-w-[120px]">Company/Fund:</span> TechVentures</p>
              <p className="flex items-center gap-3"><span className="text-foreground min-w-[120px]">Location:</span> Mumbai, Maharashtra</p>
              <p className="flex items-center gap-3"><span className="text-foreground min-w-[120px]">Email:</span> raj@techventures.com</p>
            </div>
            <div className="space-y-4 text-sm font-bold text-muted-foreground">
              <p className="flex items-center gap-3"><span className="text-foreground min-w-[120px]">LinkedIn:</span> <a href="#" className="underline flex items-center hover:text-foreground">linkedin.com/in/rajpatel <ExternalLink className="w-3 h-3 ml-1" /></a></p>
              <p className="flex items-center gap-3"><span className="text-foreground min-w-[120px]">Website:</span> <a href="#" className="underline flex items-center hover:text-foreground">techventures.com <ExternalLink className="w-3 h-3 ml-1" /></a></p>
            </div>
          </div>

          <div className="h-px bg-foreground/10 my-6"></div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider mb-2">Bio:</h3>
              <div className="p-4 bg-muted/20 border-2 border-foreground/10 rounded-xl text-sm font-semibold italic text-muted-foreground leading-relaxed">
                "Angel investor and founder. I invest in EdTech and SaaS startups solving real problems. Previously co-founded a B2B SaaS company (acquired by HubSpot in 2019)."
              </div>
            </div>
            
            <div>
              <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider mb-2">Investment Philosophy:</h3>
              <div className="p-4 bg-muted/20 border-2 border-foreground/10 rounded-xl text-sm font-semibold italic text-muted-foreground leading-relaxed">
                "I bet on great founders with strong conviction. Early stage investments, hands-on mentoring, and long-term support."
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-8 pt-6 border-t-2 border-foreground/10">
            <Button variant="outline" size="sm" className="border-2 border-foreground font-bold">[Edit]</Button>
            <Button variant="outline" size="sm" className="border-2 border-foreground font-bold">[Cancel]</Button>
            <Button size="sm" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))]">[Save Changes]</Button>
          </div>
        </Card>
      )}

      {/* TAB 2: INVESTMENT PREFERENCES */}
      {activeTab === "preferences" && (
        <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-xl p-6 md:p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 text-sm font-bold">
              <p className="flex justify-between border-b-2 border-foreground/10 pb-2">
                <span className="text-muted-foreground">Investment Experience:</span> 
                <span className="text-foreground">5-20 investments</span>
              </p>
              <p className="flex justify-between border-b-2 border-foreground/10 pb-2">
                <span className="text-muted-foreground">Ticket Size:</span> 
                <span className="text-foreground">₹50L - ₹2Cr</span>
              </p>
              <p className="flex justify-between border-b-2 border-foreground/10 pb-2">
                <span className="text-muted-foreground">Geographic Preference:</span> 
                <span className="text-foreground">India (Pan-India)</span>
              </p>
              <p className="flex justify-between border-b-2 border-foreground/10 pb-2">
                <span className="text-muted-foreground">Do you take board seat?</span> 
                <span className="text-foreground">Yes</span>
              </p>
              <p className="flex justify-between border-b-2 border-foreground/10 pb-2">
                <span className="text-muted-foreground">Do you mentor founders?</span> 
                <span className="text-foreground">Yes</span>
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-extrabold text-foreground uppercase mb-3">Preferred Stages:</h4>
                <div className="space-y-2 text-sm font-bold text-muted-foreground">
                  <div className="flex items-center space-x-2"><Checkbox id="s1" checked /> <label htmlFor="s1" className="text-foreground">Idea Stage</label></div>
                  <div className="flex items-center space-x-2"><Checkbox id="s2" checked /> <label htmlFor="s2" className="text-foreground">MVP Stage</label></div>
                  <div className="flex items-center space-x-2"><Checkbox id="s3" checked /> <label htmlFor="s3" className="text-foreground">Revenue Stage</label></div>
                  <div className="flex items-center space-x-2"><Checkbox id="s4" /> <label htmlFor="s4">Growth Stage</label></div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-extrabold text-foreground uppercase mb-3">Investment Sectors:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm font-bold text-muted-foreground">
                  <div className="flex items-center space-x-2"><Checkbox id="sec1" checked /> <label htmlFor="sec1" className="text-foreground">EdTech</label></div>
                  <div className="flex items-center space-x-2"><Checkbox id="sec2" checked /> <label htmlFor="sec2" className="text-foreground">SaaS</label></div>
                  <div className="flex items-center space-x-2"><Checkbox id="sec3" /> <label htmlFor="sec3">FinTech</label></div>
                  <div className="flex items-center space-x-2"><Checkbox id="sec4" /> <label htmlFor="sec4">HealthTech</label></div>
                  <div className="flex items-center space-x-2"><Checkbox id="sec5" /> <label htmlFor="sec5">Climate</label></div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-extrabold text-foreground uppercase mb-2">Preferred Sectors Description:</h4>
            <div className="p-4 bg-muted/20 border-2 border-foreground/10 rounded-xl text-sm font-semibold italic text-muted-foreground">
              "Career development, Learning platforms, B2B automation"
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-6 border-t-2 border-foreground/10">
            <Button variant="outline" size="sm" className="border-2 border-foreground font-bold">[Edit]</Button>
            <Button size="sm" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))]">[Save]</Button>
          </div>
        </Card>
      )}

      {/* TAB 3: REVIEWS */}
      {activeTab === "reviews" && (
        <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-xl p-6 md:p-8">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-foreground/10">
            <div className="text-4xl"></div>
            <div>
              <p className="text-xl font-extrabold text-foreground">4.9 / 5 Average</p>
              <p className="text-sm font-bold text-muted-foreground">Based on 8 founder reviews</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-5 border-2 border-foreground/10 rounded-xl bg-muted/10">
              <div className="flex justify-between items-start mb-2">
                <span className="text-lg"></span>
                <span className="text-xs font-bold text-muted-foreground">May 2024</span>
              </div>
              <p className="text-sm font-semibold text-foreground italic mb-3">
                "Raj was instrumental in our growth. Not just capital, but great mentorship and network access."
              </p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">— John Doe (AI Resume Builder)</p>
            </div>

            <div className="p-5 border-2 border-foreground/10 rounded-xl bg-muted/10">
              <div className="flex justify-between items-start mb-2">
                <span className="text-lg"></span>
                <span className="text-xs font-bold text-muted-foreground">April 2024</span>
              </div>
              <p className="text-sm font-semibold text-foreground italic mb-3">
                "Professional, responsive, and genuinely interested in our success."
              </p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">— Priya Sharma (EdTech)</p>
            </div>

            <div className="p-5 border-2 border-foreground/10 rounded-xl bg-muted/10">
              <div className="flex justify-between items-start mb-2">
                <span className="text-lg"></span>
                <span className="text-xs font-bold text-muted-foreground">Jan 2024</span>
              </div>
              <p className="text-sm font-semibold text-foreground italic mb-3">
                "Great support but slow decision-making process. Took 2 months from pitch to check."
              </p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">— Vedant Kumar (FinTech)</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t-2 border-foreground/10 text-center">
            <Button variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))]">
              [View More Reviews]
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 4: PORTFOLIO PLACEHOLDER */}
      {activeTab === "portfolio" && (
        <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-xl p-8 text-center py-16">
          <PieChart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-xl font-extrabold text-foreground mb-2">My Portfolio Summary</h3>
          <p className="text-sm font-bold text-muted-foreground mb-6 max-w-md mx-auto">
            View your complete investment tracking, performance metrics, and detailed portfolio breakdown in the dedicated Portfolio dashboard.
          </p>
          <Button onClick={() => window.location.href = '/portfolio'} className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))]">
            [Go to Portfolio Dashboard]
          </Button>
        </Card>
      )}

      {/* TAB 5: SETTINGS */}
      {activeTab === "settings" && (
        <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-xl p-6 md:p-8 space-y-8">
          
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-foreground uppercase border-b-2 border-foreground/10 pb-2 mb-4">Notification Settings:</h4>
            <div className="space-y-3 text-sm font-bold text-muted-foreground">
              <div className="flex items-center space-x-2"><Checkbox id="n1" checked /> <label htmlFor="n1" className="text-foreground">New pitch notifications</label></div>
              <div className="flex items-center space-x-2"><Checkbox id="n2" checked /> <label htmlFor="n2" className="text-foreground">Message notifications</label></div>
              <div className="flex items-center space-x-2"><Checkbox id="n3" /> <label htmlFor="n3">Weekly digest</label></div>
              <div className="flex items-center space-x-2"><Checkbox id="n4" /> <label htmlFor="n4">Portfolio updates</label></div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-foreground uppercase border-b-2 border-foreground/10 pb-2 mb-4">Privacy:</h4>
            <RadioGroup defaultValue="verified" className="space-y-3 text-sm font-bold text-muted-foreground">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="p1" />
                <Label htmlFor="p1" className="text-muted-foreground">Public (everyone can see your profile)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="verified" id="p2" />
                <Label htmlFor="p2" className="text-foreground">Verified Investors Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="p3" />
                <Label htmlFor="p3" className="text-muted-foreground">Private</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-foreground uppercase border-b-2 border-foreground/10 pb-2 mb-4">Contact Preferences:</h4>
            <div className="space-y-3 text-sm font-bold text-muted-foreground">
              <div className="flex items-center space-x-2"><Checkbox id="c1" checked /> <label htmlFor="c1" className="text-foreground">Open to being contacted by new founders</label></div>
              <div className="flex items-center space-x-2"><Checkbox id="c2" checked /> <label htmlFor="c2" className="text-foreground">Allow direct calls</label></div>
              <div className="flex items-center space-x-2"><Checkbox id="c3" checked /> <label htmlFor="c3" className="text-foreground">Allow email</label></div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t-2 border-foreground/10">
            <Button className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))]">
              [Save Settings]
            </Button>
          </div>
        </Card>
      )}

    </div>
  );
}

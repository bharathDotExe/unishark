import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  Bookmark,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  FilePlus2,
  Home,
  LayoutGrid,
  Lock,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Role = "student" | "investor";
type Screen = "home" | "discover" | "detail" | "messages";

const roleScreens: Record<Role, Array<{ id: Screen; label: string }>> = {
  student: [
    { id: "home", label: "Home" },
    { id: "discover", label: "Investors" },
    { id: "detail", label: "Pitch" },
    { id: "messages", label: "Inbox" },
  ],
  investor: [
    { id: "home", label: "Home" },
    { id: "discover", label: "Pitches" },
    { id: "detail", label: "Deal" },
    { id: "messages", label: "Inbox" },
  ],
};

const statusTime = "9:41";

function StatusBar() {
  return (
    <div className="flex h-8 items-center justify-between px-5 text-[11px] font-extrabold text-slate-950">
      <span>{statusTime}</span>
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-4 rounded-sm border border-slate-950">
          <span className="block h-full w-3 rounded-[2px] bg-slate-950" />
        </span>
      </div>
    </div>
  );
}

function BottomNav({ role, screen }: { role: Role; screen: Screen }) {
  const items =
    role === "student"
      ? [
          { id: "home", label: "Home", icon: Home },
          { id: "discover", label: "Investors", icon: Users },
          { id: "detail", label: "Pitch", icon: FilePlus2 },
          { id: "messages", label: "Inbox", icon: MessageSquare },
        ]
      : [
          { id: "home", label: "Home", icon: Home },
          { id: "discover", label: "Pitches", icon: LayoutGrid },
          { id: "detail", label: "Portfolio", icon: Briefcase },
          { id: "messages", label: "Inbox", icon: MessageSquare },
        ];

  return (
    <div className="absolute inset-x-3 bottom-3 rounded-[28px] border border-slate-200 bg-white/90 px-2 py-2 shadow-[0_18px_45px_-22px_rgba(15,23,42,0.75)] backdrop-blur-xl">
      <div className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === screen;
          return (
            <div
              key={item.id}
              className={cn(
                "flex h-12 flex-col items-center justify-center rounded-2xl text-[10px] font-extrabold transition-colors",
                isActive ? "bg-slate-950 text-white" : "text-slate-500"
              )}
            >
              <Icon className="mb-0.5 h-4 w-4" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PhoneFrame({ children, role, screen }: { children: React.ReactNode; role: Role; screen: Screen }) {
  return (
    <div className="relative mx-auto h-[760px] w-[360px] shrink-0 overflow-hidden rounded-[42px] border-[10px] border-slate-950 bg-slate-50 shadow-[0_35px_90px_-45px_rgba(15,23,42,0.9)]">
      <div className="absolute left-1/2 top-2 z-20 h-5 w-28 -translate-x-1/2 rounded-full bg-slate-950" />
      <StatusBar />
      <div className="h-[calc(100%-32px)] overflow-hidden">
        {children}
      </div>
      <BottomNav role={role} screen={screen} />
    </div>
  );
}

function AppTopBar({ title, subtitle, back = false }: { title: string; subtitle?: string; back?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 pb-3 pt-2">
      <div className="flex min-w-0 items-center gap-3">
        {back ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <ArrowLeft className="h-5 w-5" />
          </div>
        ) : (
          <img src={logo} alt="UniShark" className="h-10 w-10 rounded-2xl border border-slate-200 bg-white object-contain p-1" />
        )}
        <div className="min-w-0">
          <p className="truncate text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-500">UniShark</p>
          <h2 className="truncate font-display text-lg font-extrabold leading-tight text-slate-950">{title}</h2>
          {subtitle && <p className="truncate text-xs font-bold text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Search className="h-4 w-4" />
        </div>
        <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-orange-500" />
        </div>
      </div>
    </div>
  );
}

function MetricTile({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Home }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-white">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="font-display text-2xl font-extrabold text-slate-950">{value}</p>
    </div>
  );
}

function StudentHome() {
  return (
    <ScreenScaffold>
      <AppTopBar title="Founder HQ" subtitle="Monday momentum" />
      <div className="px-4 pb-28">
        <section className="rounded-[30px] bg-slate-950 p-5 text-white shadow-[0_24px_55px_-30px_rgba(15,23,42,0.9)]">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-300">Pitch score</p>
              <h1 className="mt-1 font-display text-3xl font-extrabold leading-none">82</h1>
            </div>
            <Badge className="rounded-full bg-orange-400 px-3 py-1 text-slate-950 hover:bg-orange-400">Ready</Badge>
          </div>
          <p className="max-w-[230px] text-sm font-semibold leading-relaxed text-white/78">
            SmartKampus is getting investor attention. Add traction proof to lift your match rate.
          </p>
          <Button className="mt-5 h-11 rounded-2xl bg-white px-4 text-sm font-extrabold text-slate-950 hover:bg-white">
            <Plus className="mr-2 h-4 w-4" /> Submit update
          </Button>
        </section>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <MetricTile label="Views" value="1.2k" icon={BarChart3} />
          <MetricTile label="Investor chats" value="18" icon={MessageSquare} />
        </div>

        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-extrabold text-slate-950">Next moves</h3>
            <MoreHorizontal className="h-5 w-5 text-slate-500" />
          </div>
          {[
            { title: "Review pitch security", detail: "3 active deck links", icon: ShieldCheck },
            { title: "Reply to Blume Ventures", detail: "Message received 2h ago", icon: MessageSquare },
            { title: "Add founder intro video", detail: "Recommended for MVP stage", icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="mb-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-slate-950">{item.title}</p>
                  <p className="truncate text-xs font-bold text-slate-500">{item.detail}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            );
          })}
        </section>
      </div>
    </ScreenScaffold>
  );
}

function InvestorHome() {
  return (
    <ScreenScaffold>
      <AppTopBar title="Investor desk" subtitle="Fresh deal flow" />
      <div className="px-4 pb-28">
        <section className="rounded-[30px] bg-[#e9f7f1] p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">Signal today</p>
              <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight text-slate-950">7 new matches</h1>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-700 text-white">
              <TrendingUp className="h-7 w-7" />
            </div>
          </div>
          <p className="text-sm font-semibold leading-relaxed text-slate-700">
            Three are revenue stage and two match your edtech thesis.
          </p>
        </section>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            ["Saved", "24"],
            ["Diligence", "8"],
            ["Unread", "5"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
              <p className="font-display text-xl font-extrabold text-slate-950">{value}</p>
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-extrabold text-slate-950">Priority deals</h3>
            <span className="text-xs font-extrabold text-blue-700">View all</span>
          </div>
          {[
            { title: "SmartKampus", tag: "EdTech", ask: "Seeking 80k", score: "94" },
            { title: "FarmLedger", tag: "Agri SaaS", ask: "Seeking 120k", score: "88" },
            { title: "MediQueue", tag: "HealthOps", ask: "Seeking 60k", score: "83" },
          ].map((deal) => (
            <div key={deal.title} className="mb-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-display text-lg font-extrabold leading-tight text-slate-950">{deal.title}</h4>
                  <p className="mt-1 text-xs font-bold text-slate-500">{deal.tag} - {deal.ask}</p>
                </div>
                <div className="rounded-2xl bg-slate-950 px-3 py-2 text-center text-white">
                  <p className="text-[10px] font-bold uppercase text-white/60">Fit</p>
                  <p className="font-display text-lg font-extrabold">{deal.score}</p>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </ScreenScaffold>
  );
}

function DiscoverScreen({ role }: { role: Role }) {
  const isStudent = role === "student";
  const rows = isStudent
    ? [
        { title: "Aarav Mehta", meta: "Fintech angel - 42 deals", pill: "Warm" },
        { title: "Nisha Capital", meta: "Seed fund - India SaaS", pill: "Active" },
        { title: "Riya Shah", meta: "EdTech operator angel", pill: "Match" },
      ]
    : [
        { title: "CampusOS", meta: "MVP - SaaS - 75k ask", pill: "New" },
        { title: "SkillSprint", meta: "Revenue - EdTech - 150k ask", pill: "Hot" },
        { title: "LegalLite", meta: "Idea - AI Legal - 40k ask", pill: "Watch" },
      ];

  return (
    <ScreenScaffold>
      <AppTopBar title={isStudent ? "Find investors" : "Browse pitches"} subtitle={isStudent ? "Verified matches" : "Founder submissions"} />
      <div className="px-4 pb-28">
        <div className="mb-4 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-3 text-sm font-bold text-slate-500">
            <Search className="h-4 w-4" />
            {isStudent ? "Search investor thesis" : "Search sector, stage, traction"}
          </div>
          <div className="mt-3 flex gap-2 overflow-hidden">
            {["AI", "SaaS", "EdTech", "Revenue"].map((tag, index) => (
              <span
                key={tag}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-extrabold",
                  index === 0 ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {rows.map((row, index) => (
          <div key={row.title} className="mb-3 rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl text-white", index === 0 ? "bg-blue-700" : index === 1 ? "bg-orange-500" : "bg-emerald-700")}>
                {isStudent ? <User className="h-6 w-6" /> : <Briefcase className="h-6 w-6" />}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-lg font-extrabold text-slate-950">{row.title}</h3>
                <p className="truncate text-xs font-bold text-slate-500">{row.meta}</p>
              </div>
              <Badge className="rounded-full bg-orange-100 text-orange-700 hover:bg-orange-100">{row.pill}</Badge>
            </div>
            <div className="mt-4 flex gap-2">
              <Button className="h-10 flex-1 rounded-2xl bg-slate-950 text-xs font-extrabold text-white hover:bg-slate-950">
                {isStudent ? "Request intro" : "View pitch"}
              </Button>
              <Button variant="outline" className="h-10 w-12 rounded-2xl border-slate-200">
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScreenScaffold>
  );
}

function DetailScreen({ role }: { role: Role }) {
  const isStudent = role === "student";
  return (
    <ScreenScaffold>
      <AppTopBar title={isStudent ? "Pitch workspace" : "Deal memo"} subtitle={isStudent ? "SmartKampus" : "SmartKampus due diligence"} back />
      <div className="px-4 pb-28">
        <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <Badge className="mb-3 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-100">EdTech</Badge>
              <h1 className="font-display text-3xl font-extrabold leading-none text-slate-950">SmartKampus</h1>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
                AI operating layer for college placement teams.
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Lock className="h-5 w-5" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["Stage", "MVP"],
              ["Ask", "80k"],
              ["Fit", "94"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-100 p-3">
                <p className="text-[10px] font-extrabold uppercase text-slate-500">{label}</p>
                <p className="font-display text-lg font-extrabold text-slate-950">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-display text-lg font-extrabold text-slate-950">
            {isStudent ? "Founder checklist" : "Investment checklist"}
          </h3>
          {[
            "Deck access protected",
            "Traction metrics attached",
            isStudent ? "Investor follow up drafted" : "Founder background verified",
          ].map((item) => (
            <div key={item} className="mb-3 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-bold text-slate-700">{item}</span>
            </div>
          ))}
          <Button className="mt-2 h-12 w-full rounded-2xl bg-slate-950 font-extrabold text-white hover:bg-slate-950">
            {isStudent ? "Share secure deck" : "Start diligence"}
          </Button>
        </section>
      </div>
    </ScreenScaffold>
  );
}

function MessagesScreen({ role }: { role: Role }) {
  const rows = role === "student"
    ? [
        ["Riya Shah", "Loved the placement automation angle.", "2m"],
        ["Nisha Capital", "Can you share March cohort metrics?", "1h"],
        ["UniShark Support", "Your deck access report is ready.", "5h"],
      ]
    : [
        ["Anaya Rao", "Happy to walk through our pilots.", "7m"],
        ["CampusOS", "Deck updated with retention numbers.", "2h"],
        ["UniShark", "Three new pitches match your thesis.", "4h"],
      ];

  return (
    <ScreenScaffold>
      <AppTopBar title="Inbox" subtitle="Investor-founder conversations" />
      <div className="px-4 pb-28">
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-3xl bg-slate-100 p-1.5">
          <div className="rounded-2xl bg-white px-3 py-2 text-center text-xs font-extrabold shadow-sm">Priority</div>
          <div className="px-3 py-2 text-center text-xs font-extrabold text-slate-500">All messages</div>
        </div>
        {rows.map(([name, message, time], index) => (
          <div key={name} className="mb-3 flex items-center gap-3 rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl font-display text-lg font-extrabold text-white", index === 0 ? "bg-slate-950" : index === 1 ? "bg-blue-700" : "bg-orange-500")}>
              {name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate text-sm font-extrabold text-slate-950">{name}</h3>
                <span className="text-[10px] font-extrabold text-slate-400">{time}</span>
              </div>
              <p className="mt-1 truncate text-xs font-bold text-slate-500">{message}</p>
            </div>
          </div>
        ))}
      </div>
    </ScreenScaffold>
  );
}

function ScreenScaffold({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full overflow-y-auto bg-[linear-gradient(180deg,#f8fafc_0%,#eef4ff_48%,#f8fafc_100%)] pt-3">
      {children}
    </div>
  );
}

function SelectedScreen({ role, screen }: { role: Role; screen: Screen }) {
  if (screen === "home") return role === "student" ? <StudentHome /> : <InvestorHome />;
  if (screen === "discover") return <DiscoverScreen role={role} />;
  if (screen === "detail") return <DetailScreen role={role} />;
  return <MessagesScreen role={role} />;
}

export default function AndroidAppDesign() {
  const [role, setRole] = useState<Role>("student");
  const [screen, setScreen] = useState<Screen>("home");

  return (
    <div className="min-h-screen bg-[#f6f1e6] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-950/10 bg-[#f6f1e6]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="UniShark" className="h-9 w-9 rounded-xl object-contain" />
            <span className="font-display text-xl font-extrabold">UniShark Android</span>
          </Link>
          <Button asChild variant="outline" className="rounded-xl border-slate-950 bg-white font-extrabold">
            <Link to="/">Back to web app</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[360px_1fr] lg:py-12">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-orange-600">Mobile product direction</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-none sm:text-5xl">
            Android UI for founders and investors.
          </h1>
          <p className="mt-4 text-sm font-semibold leading-7 text-slate-700">
            A native-feeling version of the current UniShark product: bottom navigation, role-specific homes, searchable deal flow, secure pitch details, and fast messaging.
          </p>

          <div className="mt-6 rounded-[28px] border border-slate-950 bg-white p-4 shadow-[6px_6px_0_0_#020617]">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">Role</p>
            <div className="grid grid-cols-2 gap-2">
              {(["student", "investor"] as Role[]).map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setRole(item);
                    setScreen("home");
                  }}
                  className={cn(
                    "h-11 rounded-2xl border border-slate-950 text-sm font-extrabold capitalize transition-colors",
                    role === item ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-950"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>

            <p className="mb-3 mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">Screen</p>
            <div className="grid grid-cols-2 gap-2">
              {roleScreens[role].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setScreen(item.id)}
                  className={cn(
                    "h-11 rounded-2xl border border-slate-950 text-sm font-extrabold transition-colors",
                    screen === item.id ? "bg-orange-400 text-slate-950" : "bg-slate-50 text-slate-950"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              ["Nav", "Bottom tabs"],
              ["Tone", "SaaS calm"],
              ["Cards", "8-30 radius"],
              ["Primary", "Slate + orange"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-950/10 bg-white p-3">
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-1 text-sm font-extrabold">{value}</p>
              </div>
            ))}
          </div>
        </aside>

        <section className="overflow-hidden rounded-[34px] border border-slate-950/10 bg-white/55 p-5 sm:p-8">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">Live coded mockup</p>
              <h2 className="mt-1 font-display text-2xl font-extrabold">Pixel preview</h2>
            </div>
            <p className="max-w-md text-sm font-semibold leading-6 text-slate-600">
              Switch role and screen to inspect the proposed Android information architecture.
            </p>
          </div>

          <div className="flex justify-center overflow-x-auto py-2">
            <PhoneFrame role={role} screen={screen}>
              <SelectedScreen role={role} screen={screen} />
            </PhoneFrame>
          </div>
        </section>
      </main>
    </div>
  );
}

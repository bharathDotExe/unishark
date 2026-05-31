import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Users,
  Flag,
  Scale,
  MessageSquare,
  BarChart3,
  HeadphonesIcon,
  TrendingUp,
  Menu,
  LogOut,
  Settings,
  Shield,
  ChevronRight,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.png";

const navGroups: { label: string; items: { name: string; href: string; icon: any }[] }[] = [
  {
    label: "Operations",
    items: [
      { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Pitch queue", href: "/admin/pitches", icon: FileText },
      { name: "Investor verification", href: "/admin/investors", icon: ShieldCheck },
      { name: "Users", href: "/admin/users", icon: Users },
    ],
  },
  {
    label: "Moderation",
    items: [
      { name: "Flagged content", href: "/admin/flagged", icon: Flag },
      { name: "Disputes", href: "/admin/disputes", icon: Scale },
      { name: "Messages", href: "/admin/messages", icon: MessageSquare },
    ],
  },
  {
    label: "Insights",
    items: [
      { name: "Reports", href: "/admin/reports", icon: BarChart3 },
      { name: "Support", href: "/admin/support", icon: HeadphonesIcon },
      { name: "Analytics", href: "/admin/analytics", icon: TrendingUp },
    ],
  },
];

const flatLinks = navGroups.flatMap((g) => g.items);

export default function AdminLayout({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();

  const currentPage = flatLinks.find(
    (l) => location.pathname === l.href || location.pathname.startsWith(l.href + "/")
  );
  const initials = (user?.email || "A").slice(0, 1).toUpperCase();

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-background/30 backdrop-blur-md border-r border-foreground/10">
      {/* Logo */}
      <div className="p-6 border-b border-foreground/10 flex items-center gap-3">
        <Link
          to="/admin/dashboard"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3"
        >
          <img src={logo} alt="UniShark" className="h-8 w-8 rounded-lg object-contain" />
          <span className="text-xl font-display font-extrabold tracking-wider text-foreground flex flex-col justify-center">
            UniShark
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-red-600 block leading-none mt-1">Admin</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 pb-2 text-[10px] font-semibold tracking-[0.16em] uppercase text-muted-foreground/70">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((link) => {
                const isActive =
                  location.pathname === link.href || location.pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border-2 border-transparent",
                      isActive
                        ? "bg-foreground text-background shadow-[4px_4px_0_0_hsl(var(--foreground))] translate-x-[-2px] translate-y-[-2px] border-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-[-1px] hover:translate-y-[-1px]"
                    )}
                  >
                    <link.icon
                      className={cn("h-4 w-4 shrink-0", isActive ? "text-red-500" : "")}
                      strokeWidth={2}
                    />
                    <span className="flex-1 truncate">{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-foreground/10">
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl border-2 border-foreground/10 hover:border-destructive transition-all"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="app-shell min-h-screen bg-background flex w-full relative">
      {/* ── Mobile topbar ─────────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-foreground/10 bg-background/80 backdrop-blur-xl z-50 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 hover:bg-muted border border-foreground/10 rounded-xl h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r border-foreground/10 bg-background/95">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <Shield className="h-5 w-5 text-red-600" />
          <span className="text-lg font-display font-extrabold tracking-wider text-foreground">Admin</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => signOut()} className="h-9 w-9 rounded-xl border border-foreground/10">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      {/* ── Fixed sidebar (desktop) ── z-40 ──────────────────────── */}
      <aside className="hidden md:block fixed inset-y-0 left-0 w-64 z-40">
        <Sidebar />
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 pt-16 md:pt-0">
        {/* ── Fixed topbar (desktop) ── z-30 ── */}
        <header className="hidden md:flex sticky top-0 z-30 h-16 w-full items-center justify-between border-b border-foreground/10 bg-background/25 backdrop-blur-md px-8 gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
            <Shield className="h-4 w-4 text-red-600" />
            <span className="font-bold text-foreground">Admin</span>
            {currentPage && (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                <span className="font-semibold text-foreground truncate">{currentPage.name}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <form className="relative w-full max-w-md hidden lg:block">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users, pitches…"
                className="pl-10 pr-4 h-10 w-72 border-2 border-foreground/10 focus-visible:border-foreground focus-visible:ring-0 rounded-full bg-background/50 hover:border-foreground/20 transition-all font-medium text-sm"
              />
            </form>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 px-2 gap-2 rounded-xl border-2 border-foreground bg-card hover:bg-muted overflow-hidden shadow-sm flex items-center">
                  <div className="h-7 w-7 rounded-lg bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                    {initials}
                  </div>
                  <span className="text-sm font-bold max-w-[120px] truncate hidden sm:block">{user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 border-2 border-foreground rounded-2xl shadow-[6px_6px_0_0_hsl(var(--foreground))] bg-background">
                <DropdownMenuLabel className="font-normal border-b pb-2 mb-2">
                  <p className="text-sm font-bold leading-tight truncate">{user?.email}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Administrator</p>
                </DropdownMenuLabel>
                <DropdownMenuItem className="cursor-pointer font-medium hover:bg-muted rounded-lg m-1">
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer font-bold text-destructive hover:bg-destructive/5 rounded-lg m-1">
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* ── Page content ─────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

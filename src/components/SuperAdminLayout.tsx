import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserCog,
  Users,
  FileText,
  ShieldCheck,
  Handshake,
  DollarSign,
  Settings,
  ScrollText,
  BarChart3,
  Scale,
  Database,
  Menu,
  LogOut,
  Bell,
  ChevronRight,
  Crown,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";

const sidebarLinks = [
  { name: "Overview",      href: "/superadmin/dashboard",   icon: LayoutDashboard, tag: "Hub",        color: "text-indigo-400" },
  { name: "Manage Admins", href: "/superadmin/admins",      icon: UserCog,         tag: "Admins",     color: "text-purple-400" },
  { name: "All Users",     href: "/superadmin/users",       icon: Users,           tag: "Users",      color: "text-blue-400" },
  { name: "All Pitches",   href: "/superadmin/pitches",     icon: FileText,        tag: "Pitches",    color: "text-sky-400" },
  { name: "Investors",     href: "/superadmin/investors",   icon: ShieldCheck,     tag: "Verify",     color: "text-cyan-400" },
  { name: "Deals",         href: "/superadmin/deals",       icon: Handshake,       tag: "Manage",     color: "text-teal-400" },
  { name: "Revenue",       href: "/superadmin/revenue",     icon: DollarSign,      tag: "Payments",   color: "text-green-400" },
  { name: "Settings",      href: "/superadmin/settings",    icon: Settings,        tag: "Platform",   color: "text-amber-400" },
  { name: "Audit Logs",    href: "/superadmin/logs",        icon: ScrollText,      tag: "Audit",      color: "text-orange-400" },
  { name: "Analytics",     href: "/superadmin/analytics",   icon: BarChart3,       tag: "Insights",   color: "text-rose-400" },
  { name: "Compliance",    href: "/superadmin/compliance",  icon: Scale,           tag: "Legal",      color: "text-pink-400" },
  { name: "Backup",        href: "/superadmin/backup",      icon: Database,        tag: "Recovery",   color: "text-fuchsia-400" },
];

export default function SuperAdminLayout({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, signOut } = useAuth();
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data?.full_name) setFullName(data.full_name);
    });
  }, [user]);

  const currentPage = sidebarLinks.find(
    (l) => location.pathname === l.href || location.pathname.startsWith(l.href + "/")
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card/80 backdrop-blur-xl border-r border-border">
      {/* Logo */}
      <div className="p-5 border-b border-border flex items-center gap-3">
        <Link to="/superadmin/dashboard" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <div className="relative">
            <img src={logo} alt="UniShark" className="h-8 w-8 rounded-lg object-contain" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md shadow-amber-500/30">
              <Crown className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div>
            <span className="text-lg font-display font-extrabold tracking-wider text-foreground block leading-tight">
              UniShark
            </span>
            <span className="text-[10px] font-bold tracking-[0.25em] bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent uppercase leading-tight">
              Super Admin
            </span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {sidebarLinks.map((link) => {
          const isActive = location.pathname === link.href || location.pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-r-full" />
              )}
              <link.icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              <span className="flex-1 font-medium">{link.name}</span>
              <span className={cn(
                "text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-md transition-all",
                isActive ? "bg-primary/10 text-primary/70" : "text-muted-foreground/60 group-hover:text-muted-foreground"
              )}>
                {link.tag}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t border-border">
        <div className="mb-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-amber-600" />
          <span className="text-xs font-bold text-amber-700">Super Admin Access</span>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl border border-border transition-all text-sm"
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
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-full border-b border-border bg-background/80 backdrop-blur-xl z-50 flex items-center justify-between p-4 h-16">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 hover:bg-muted rounded-xl border border-border">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 flex flex-col border-r border-border bg-background">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <Crown className="h-4 w-4 text-amber-500" />
          <span className="text-base font-display font-extrabold tracking-wider text-foreground">Super Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-500/10 text-amber-700 border border-amber-500/30 text-xs font-bold">SUPER</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 rounded-xl border border-amber-500/30 bg-amber-500/10 p-0 hover:bg-amber-500/20">
                <Crown className="h-4 w-4 text-amber-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border border-border rounded-xl">
              <DropdownMenuLabel className="text-xs text-muted-foreground">{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="text-destructive hover:bg-destructive/5 cursor-pointer rounded-lg">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen fixed top-0 left-0 z-40 transition-all duration-300 overflow-hidden",
          sidebarOpen ? "w-60" : "w-0"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 md:pt-0 pt-16 transition-all duration-300 relative z-10",
          sidebarOpen ? "md:ml-60" : "md:ml-0"
        )}
      >
        {/* Desktop Header */}
        <header className="hidden md:flex sticky top-0 z-30 h-16 w-full items-center justify-between border-b border-border bg-background/60 backdrop-blur-xl px-6 gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen((v) => !v)}
              className="h-9 w-9 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <Menu className="h-5 w-5" />
            </Button>
            {!sidebarOpen && (
              <Link to="/superadmin/dashboard" className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                <span className="font-display font-extrabold text-lg tracking-wider text-foreground">Super Admin</span>
              </Link>
            )}
            {currentPage && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Crown className="h-3 w-3 text-amber-500" />
                <span className="text-amber-700 font-medium">Super Admin</span>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="font-bold text-foreground">{currentPage.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Badge className="bg-amber-500/10 text-amber-700 border border-amber-500/30 text-xs font-bold px-3">
              SUPER ADMIN
            </Badge>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="h-6 w-px bg-border" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 px-3 gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 flex items-center">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/30">
                    <Crown className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-foreground max-w-[120px] truncate">{fullName || "Super Admin"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 bg-popover border border-border rounded-2xl shadow-xl">
                <DropdownMenuLabel className="font-normal border-b border-border pb-2 mb-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">{fullName || "Super Admin"}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer font-bold text-destructive hover:bg-destructive/5 rounded-lg m-1">
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

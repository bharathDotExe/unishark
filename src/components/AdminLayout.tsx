import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
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
  Bell,
  Settings,
  Shield,
  ChevronRight,
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
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, label: "Hub" },
  { name: "Pitch Queue", href: "/admin/pitches", icon: FileText, label: "Approvals" },
  { name: "Investors", href: "/admin/investors", icon: ShieldCheck, label: "Verify" },
  { name: "Users", href: "/admin/users", icon: Users, label: "Manage" },
  { name: "Flagged", href: "/admin/flagged", icon: Flag, label: "Content" },
  { name: "Disputes", href: "/admin/disputes", icon: Scale, label: "Handle" },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare, label: "Monitor" },
  { name: "Reports", href: "/admin/reports", icon: BarChart3, label: "Generate" },
  { name: "Support", href: "/admin/support", icon: HeadphonesIcon, label: "Tickets" },
  { name: "Analytics", href: "/admin/analytics", icon: TrendingUp, label: "Insights" },
];

export default function AdminLayout({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
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
    <>
      {/* Logo */}
      <div className="p-5 border-b border-foreground/10 flex items-center gap-3">
        <Link to="/admin/dashboard" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <div className="relative">
            <img src={logo} alt="UniShark" className="h-8 w-8 rounded-lg object-contain" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <Shield className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div>
            <span className="text-lg font-display font-extrabold tracking-wider text-foreground block leading-tight">
              UniShark
            </span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase leading-tight">
              Admin Panel
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
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-2 border-transparent group",
                isActive
                  ? "bg-foreground text-background shadow-[3px_3px_0_0_hsl(var(--foreground))] translate-x-[-1px] translate-y-[-1px] border-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-[-1px] hover:translate-y-[-1px]"
              )}
            >
              <link.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{link.name}</span>
              <span className={cn(
                "text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-md",
                isActive ? "bg-background/20 text-background/80" : "text-muted-foreground/60 group-hover:text-muted-foreground"
              )}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t border-foreground/10">
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl border-2 border-foreground/10 hover:border-destructive transition-all"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </div>
    </>
  );

  return (
    <div className="app-shell min-h-screen bg-background flex w-full relative">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-full border-b border-foreground/10 bg-background/80 backdrop-blur-xl z-50 flex items-center justify-between p-4 h-16">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 hover:bg-muted border border-foreground/10 rounded-xl">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 flex flex-col bg-background/95 border-r border-foreground/10">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <img src={logo} alt="UniShark" className="h-7 w-7 rounded-md object-contain" />
          <span className="text-lg font-display font-extrabold tracking-wider text-foreground">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-xs font-bold">ADMIN</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-xl border-2 border-red-500/30 bg-red-500/10 p-0 overflow-hidden hover:bg-red-500/20">
                <Shield className="h-4 w-4 text-red-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 mt-2 border-2 border-foreground rounded-2xl shadow-[6px_6px_0_0_hsl(var(--foreground))]">
              <DropdownMenuLabel className="text-xs text-muted-foreground">{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer font-bold text-destructive">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "border-r border-foreground/10 bg-background/30 backdrop-blur-md hidden md:flex flex-col h-screen fixed top-0 left-0 z-40 transition-all duration-300 overflow-hidden",
          desktopSidebarOpen ? "w-60" : "w-0"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 md:pt-0 pt-16 transition-all duration-300",
          desktopSidebarOpen ? "md:ml-60" : "md:ml-0"
        )}
      >
        {/* Desktop Top Header */}
        <header className="hidden md:flex sticky top-0 z-30 h-16 w-full items-center justify-between border-b border-foreground/10 bg-background/25 backdrop-blur-md px-6 gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDesktopSidebarOpen((v) => !v)}
              className="h-9 w-9 rounded-xl border border-foreground/10 hover:bg-muted transition-all"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5 text-muted-foreground" />
            </Button>
            {!desktopSidebarOpen && (
              <Link to="/admin/dashboard" className="flex items-center gap-2">
                <img src={logo} alt="UniShark" className="h-7 w-7 rounded-md object-contain" />
                <span className="font-display font-extrabold text-lg tracking-wider text-foreground">UniShark</span>
              </Link>
            )}
            {/* Breadcrumb */}
            {currentPage && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <span className="font-medium">Admin</span>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="font-bold text-foreground">{currentPage.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="destructive" className="text-xs font-bold px-2.5">ADMIN PANEL</Badge>
            <Button variant="ghost" size="icon" className="h-10 w-10 border-2 border-transparent hover:border-foreground/10 rounded-xl transition-all">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Button>
            <div className="h-6 w-px bg-foreground/10" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 px-3 gap-2 rounded-xl border-2 border-red-500/40 bg-red-500/10 hover:bg-red-500/20 overflow-hidden shadow-sm flex items-center">
                  <div className="h-7 w-7 rounded-lg bg-red-500 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-bold max-w-[120px] truncate">{fullName || "Admin"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 border-2 border-foreground rounded-2xl shadow-[6px_6px_0_0_hsl(var(--foreground))] bg-background">
                <DropdownMenuLabel className="font-normal border-b pb-2 mb-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">{fullName || "Admin"}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuItem className="cursor-pointer font-medium hover:bg-muted rounded-lg m-1">
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-t border-foreground/10" />
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

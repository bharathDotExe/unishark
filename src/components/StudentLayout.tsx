import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FilePlus, Files, Users, User, MessageSquare, Briefcase, Menu, Search, LogOut, Settings, Bell, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Submit Pitch", href: "/pitches/create", icon: FilePlus },
  { name: "View Own Pitches", href: "/pitches/view", icon: Files },
  { name: "Browse Investors", href: "/investors", icon: Users },
  { name: "My Profile", href: "/profile", icon: User },
  { name: "Inbox", href: "/messages", icon: MessageSquare },
  { name: "Track Investments", href: "/deals", icon: Briefcase },
];

export default function StudentLayout({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [fullName, setFullName] = useState("");
  const [searchVal, setSearchVal] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data?.full_name) setFullName(data.full_name);
    });
  }, [user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/investors?q=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate(`/investors`);
    }
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-foreground/10 flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="text-2xl">🦈</span>
          <span className="text-xl font-display font-extrabold tracking-wider text-foreground flex items-center gap-1">
            UniShark
          </span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {sidebarLinks.map((link) => {
          const isActive = location.pathname === link.href;
          return (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border-2 border-transparent",
                isActive 
                  ? "bg-foreground text-background shadow-[4px_4px_0_0_hsl(var(--foreground))] translate-x-[-2px] translate-y-[-2px] border-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-[-1px] hover:translate-y-[-1px]"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.name}
            </Link>
          );
        })}
      </nav>
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
    </>
  );

  return (
    <div className="app-shell min-h-screen bg-background flex w-full relative">
      {/* Mobile Drawer Trigger (inside mobile header) */}
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
          <span className="text-xl">🦈</span>
          <span className="text-lg font-display font-extrabold tracking-wider text-foreground">UniShark</span>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-xl border-2 border-foreground bg-card p-0 overflow-hidden shadow-sm hover:bg-muted">
                <Avatar className="h-full w-full rounded-none">
                  <AvatarFallback className="bg-primary/5 text-primary text-sm font-semibold rounded-none">
                    {fullName.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || "US"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 border-2 border-foreground rounded-2xl shadow-[6px_6px_0_0_hsl(var(--foreground))]">
              <DropdownMenuLabel className="font-normal border-b pb-2 mb-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none">{fullName || 'Student Founder'}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer font-medium hover:bg-muted rounded-lg m-1">
                <User className="h-4 w-4 mr-2" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/profile?tab=settings")} className="cursor-pointer font-medium hover:bg-muted rounded-lg m-1">
                <Settings className="h-4 w-4 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="border-t border-foreground/10" />
              <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer font-bold text-destructive hover:bg-destructive/5 rounded-lg m-1">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-foreground/10 bg-background/30 backdrop-blur-md flex-shrink-0 hidden md:flex flex-col h-screen sticky top-0 z-40">
        <SidebarContent />
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 md:pt-0 pt-16">
        {/* Sticky Desktop Top Header */}
        <header className="hidden md:flex sticky top-0 z-30 h-16 w-full items-center justify-between border-b border-foreground/10 bg-background/25 backdrop-blur-md px-8 gap-4">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search angel investors..."
              className="pl-10 pr-4 h-10 border-2 border-foreground/10 focus-visible:border-foreground focus-visible:ring-0 rounded-full bg-background/50 hover:border-foreground/20 transition-all font-medium text-sm"
            />
          </form>

          {/* Top Actions & Avatar */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-10 w-10 border-2 border-transparent hover:border-foreground/10 rounded-xl transition-all" onClick={() => navigate("/messages")}>
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 border-2 border-transparent hover:border-foreground/10 rounded-xl transition-all">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Button>
            
            <div className="h-6 w-px bg-foreground/10" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 px-2 gap-2 rounded-xl border-2 border-foreground bg-card hover:bg-muted overflow-hidden shadow-sm flex items-center">
                  <Avatar className="h-7 w-7 rounded-lg">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold rounded-lg">
                      {fullName ? fullName.slice(0, 2).toUpperCase() : user?.email?.slice(0, 2).toUpperCase() || "US"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-bold max-w-[120px] truncate">{fullName || 'Student'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 border-2 border-foreground rounded-2xl shadow-[6px_6px_0_0_hsl(var(--foreground))] bg-background">
                <DropdownMenuLabel className="font-normal border-b pb-2 mb-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">{fullName || 'Student Founder'}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer font-medium hover:bg-muted rounded-lg m-1">
                  <User className="h-4 w-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile?tab=settings")} className="cursor-pointer font-medium hover:bg-muted rounded-lg m-1">
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

        {/* Content viewport wrapper */}
        <main className="flex-1 overflow-y-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

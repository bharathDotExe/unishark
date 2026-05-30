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
    <div className="flex flex-col h-full bg-card border-r border-border">
      <Link
        to="/admin/dashboard"
        onClick={() => setOpen(false)}
        className="px-5 h-16 border-b border-border flex items-center gap-2.5 shrink-0"
      >
        <img src={logo} alt="UniShark" className="h-7 w-7 rounded-md object-contain" />
        <div className="leading-tight">
          <div className="text-sm font-semibold text-foreground tracking-tight">UniShark</div>
          <div className="text-[10px] font-medium uppercase tracking-[0.15em] text-red-600">Admin</div>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 pb-1.5 text-[10px] font-semibold tracking-[0.16em] uppercase text-muted-foreground/70">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((link) => {
                const isActive =
                  location.pathname === link.href || location.pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors",
                      isActive
                        ? "bg-foreground/[0.06] text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <link.icon
                      className={cn("h-4 w-4 shrink-0", isActive ? "text-red-600" : "text-muted-foreground")}
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

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted transition-colors">
          <div className="h-8 w-8 rounded-full bg-red-600 text-white text-xs font-semibold flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-foreground truncate">{user?.email}</p>
            <p className="text-[10px] text-muted-foreground">Admin</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => signOut()} className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-shell min-h-screen bg-muted/30 flex w-full">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 w-full h-14 border-b border-border bg-card z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r border-border">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <img src={logo} alt="UniShark" className="h-6 w-6 rounded object-contain" />
          <span className="text-sm font-semibold text-foreground">Admin</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => signOut()} className="h-9 w-9">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 fixed inset-y-0 left-0 z-40">
        <Sidebar />
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col md:ml-60 pt-14 md:pt-0">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-14 hidden md:flex items-center justify-between gap-4 bg-card/80 backdrop-blur-md border-b border-border px-6">
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground min-w-0">
            <Shield className="h-3.5 w-3.5 text-red-600" />
            <span className="font-medium">Admin</span>
            {currentPage && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                <span className="font-semibold text-foreground truncate">{currentPage.name}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden lg:block w-72">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search users, pitches…"
                className="h-9 pl-8 text-[13px] bg-muted/50 border-border rounded-lg focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-card"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 px-2 gap-2 rounded-lg hover:bg-muted">
                  <div className="h-7 w-7 rounded-full bg-red-600 text-white text-xs font-semibold flex items-center justify-center">
                    {initials}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1 border border-border rounded-xl">
                <DropdownMenuLabel className="font-normal py-2">
                  <p className="text-[13px] font-semibold leading-tight">{user?.email}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Administrator</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-[13px] cursor-pointer">
                  <Settings className="h-3.5 w-3.5 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()} className="text-[13px] cursor-pointer text-red-600 focus:text-red-700">
                  <LogOut className="h-3.5 w-3.5 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children || <Outlet />}</main>
      </div>
    </div>
  );
}

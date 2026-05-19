import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, UserCircle2, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import logo from "@/assets/logo.png";

export default function Navbar() {
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setMobileOpen(false);
    navigate("/");
  };

  const closeMobile = () => setMobileOpen(false);

  const isAdmin = roles.includes("admin");
  const isInvestor = roles.includes("investor");
  const isStudent = roles.includes("student");

  return (
    <>
      <div className="fixed top-[-50px] left-1/2 -translate-x-1/2 w-[80%] max-w-[800px] h-[150px] bg-[hsl(var(--pastel-blue))] opacity-40 filter blur-[60px] pointer-events-none z-40 rounded-full dark:opacity-10" />
      <div className="fixed top-0 left-0 right-0 z-50 p-4 pointer-events-none">
        <header className="pointer-events-auto mx-auto max-w-6xl rounded-full border-2 border-foreground bg-background/40 backdrop-blur-xl shadow-[6px_6px_0_0_hsl(var(--foreground))] transition-all">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Link to="/" onClick={closeMobile} className="flex items-center gap-3 font-display text-lg font-bold tracking-[0.18em] text-foreground">
          <img src={logo} alt="Logo" className="h-12 w-12 rounded-xl" />
          UNISHARK
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {!user && (
            <div className="mr-2 flex items-center gap-1 text-sm font-medium">
              <a href="#how" className="px-3 py-2 hover:underline underline-offset-4">How</a>
              <a href="#investors" className="px-3 py-2 hover:underline underline-offset-4">Investors</a>
              <a href="#students" className="px-3 py-2 hover:underline underline-offset-4">Students</a>
              <a href="#faq" className="px-3 py-2 hover:underline underline-offset-4">FAQ</a>
            </div>
          )}
          {user ? (
            <>
              {isStudent && (
                <Button variant="ghost" asChild size="sm"><Link to="/dashboard">My Pitches</Link></Button>
              )}
              {isInvestor && (
                <Button variant="ghost" asChild size="sm"><Link to="/pitches">Browse</Link></Button>
              )}
              {isAdmin && (
                <Button variant="ghost" asChild size="sm"><Link to="/admin">Admin</Link></Button>
              )}
              <Button variant="ghost" asChild size="sm">
                <Link to="/profile"><UserCircle2 className="h-4 w-4 mr-2" /><span>Profile</span></Link>
              </Button>
              <Button size="sm" onClick={handleSignOut} className="border-2 border-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] bg-card text-foreground hover:bg-card rounded-full font-bold">
                <LogOut className="h-4 w-4 mr-2" />
                <span>Sign out</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild size="sm" className="font-bold"><Link to="/login">Sign in</Link></Button>
              <Button asChild size="sm" className="border-2 border-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] bg-foreground text-background hover:bg-foreground rounded-full font-bold hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"><Link to="/signup">Get started →</Link></Button>
            </>
          )}
          <div className="ml-2 pl-2 border-l-2 border-foreground/20">
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile hamburger */}
        <button
          id="mobile-menu-toggle"
          className="md:hidden flex items-center justify-center h-10 w-10 rounded-xl border-2 border-foreground bg-card"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      </header>
    </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="fixed top-24 left-4 right-4 z-50 md:hidden border-2 border-foreground bg-background/95 backdrop-blur rounded-[24px] shadow-[6px_6px_0_0_hsl(var(--foreground))] px-4 py-4 flex flex-col gap-2">
          {!user && (
            <>
              <a href="#how" onClick={closeMobile} className="px-3 py-3 font-medium hover:bg-muted rounded-xl">How it works</a>
              <a href="#investors" onClick={closeMobile} className="px-3 py-3 font-medium hover:bg-muted rounded-xl">For Investors</a>
              <a href="#students" onClick={closeMobile} className="px-3 py-3 font-medium hover:bg-muted rounded-xl">For Students</a>
              <a href="#faq" onClick={closeMobile} className="px-3 py-3 font-medium hover:bg-muted rounded-xl">FAQ</a>
              <div className="border-t-2 border-foreground/10 my-2" />
            </>
          )}
          {user ? (
            <>
              {isStudent && (
                <Link to="/dashboard" onClick={closeMobile} className="px-3 py-3 font-medium hover:bg-muted rounded-xl">My Pitches</Link>
              )}
              {isInvestor && (
                <Link to="/pitches" onClick={closeMobile} className="px-3 py-3 font-medium hover:bg-muted rounded-xl">Browse Pitches</Link>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={closeMobile} className="px-3 py-3 font-medium hover:bg-muted rounded-xl">Admin</Link>
              )}
              <Link to="/profile" onClick={closeMobile} className="flex items-center gap-2 px-3 py-3 font-medium hover:bg-muted rounded-xl">
                <UserCircle2 className="h-4 w-4" /> Profile
              </Link>
              <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-3 font-medium hover:bg-muted rounded-xl text-left">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMobile} className="px-3 py-3 font-bold hover:bg-muted rounded-xl">Sign in</Link>
              <Link to="/signup" onClick={closeMobile} className="flex items-center justify-center px-3 py-3 font-bold bg-foreground text-background border-2 border-foreground rounded-xl">Get started →</Link>
            </>
          )}
          <div className="border-t-2 border-foreground/10 my-2" />
          <div className="flex items-center justify-between px-3 py-2">
            <span className="font-bold">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, UserCircle2, GraduationCap } from "lucide-react";

export default function Navbar() {
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isAdmin = roles.includes("admin");
  const isInvestor = roles.includes("investor");
  const isStudent = roles.includes("student");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-110">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="font-display text-2xl font-extrabold tracking-[0.18em] text-primary">
            UNISHARK
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {!user && (
            <div className="mr-2 hidden md:flex items-center gap-1 text-sm text-muted-foreground">
              <a href="#how" className="px-3 py-2 hover:text-foreground transition-colors">How It Works</a>
              <a href="#investors" className="px-3 py-2 hover:text-foreground transition-colors">For Investors</a>
              <a href="#students" className="px-3 py-2 hover:text-foreground transition-colors">For Students</a>
              <a href="#faq" className="px-3 py-2 hover:text-foreground transition-colors">FAQ</a>
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
                <Link to="/profile"><UserCircle2 className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Profile</span></Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild size="sm"><Link to="/login">Sign in</Link></Button>
              <Button asChild size="sm"><Link to="/signup">Get started</Link></Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
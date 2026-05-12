import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, UserCircle2 } from "lucide-react";
import logo from "@/assets/logo.png";

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
    <header className="sticky top-0 z-40 w-full border-b-2 border-foreground bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-6 max-w-6xl">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-[0.18em] text-foreground">
  <img src={logo} alt="Logo" className="h-8 w-8" />
  UNISHARK
</Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {!user && (
            <div className="mr-2 hidden md:flex items-center gap-1 text-sm font-medium">
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
                <Link to="/profile"><UserCircle2 className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Profile</span></Link>
              </Button>
              <Button size="sm" onClick={handleSignOut} className="border-2 border-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] bg-card text-foreground hover:bg-card rounded-full font-bold">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild size="sm" className="font-bold"><Link to="/login">Sign in</Link></Button>
              <Button asChild size="sm" className="border-2 border-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] bg-foreground text-background hover:bg-foreground rounded-full font-bold hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"><Link to="/signup">Get started →</Link></Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

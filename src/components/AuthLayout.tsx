import { ReactNode } from "react";
import Navbar from "@/components/Navbar";

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto flex items-center justify-center px-6 pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="w-full max-w-md relative">
          <div className="absolute -top-4 -left-4 h-12 w-12 bg-[hsl(var(--pastel-yellow))] border-2 border-foreground rounded-full -z-0" />
          <div className="absolute -bottom-4 -right-4 h-16 w-16 bg-[hsl(var(--pastel-pink))] border-2 border-foreground rounded-2xl rotate-12 -z-0" />
          <div className="relative bg-card border-2 border-foreground shadow-[8px_8px_0_0_hsl(var(--foreground))] rounded-3xl p-8 md:p-10 animate-scale-in">
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            )}
            <div className="mt-8">{children}</div>
            {footer && (
              <p className="mt-8 text-sm text-muted-foreground text-center">
                {footer}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

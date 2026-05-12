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
      <div className="container mx-auto flex items-center justify-center px-6 py-16 md:py-24">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl md:text-4xl font-medium tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          )}
          <div className="mt-8">{children}</div>
          {footer && (
            <p className="mt-8 text-sm text-muted-foreground">
              {footer}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import authCharacter from "@/assets/auth-character.webp";

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
    <div
      className="min-h-screen bg-background relative overflow-hidden"
      style={{ backgroundImage: "var(--gradient-mesh)" }}
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-accent/20 blur-3xl" />

      <Navbar />

      <div className="container relative mx-auto grid gap-10 px-4 py-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-16">
        {/* Character side */}
        <div className="relative order-2 hidden lg:order-1 lg:flex lg:justify-center animate-fade-in">
          <div className="absolute inset-0 -z-10 mx-auto my-auto h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-3xl" />
          <img
            src={authCharacter}
            alt="UniShark mascot welcoming you"
            width={1024}
            height={1024}
            loading="eager"
            decoding="async"
            className="float-slow w-full max-w-md drop-shadow-[0_30px_50px_rgba(124,92,255,0.35)] select-none"
          />
        </div>

        {/* Form side */}
        <div className="order-1 mx-auto w-full max-w-md lg:order-2 animate-scale-in">
          <div className="rounded-3xl border border-border/60 bg-card/85 p-8 shadow-elevated backdrop-blur-xl">
            <h1 className="font-display text-3xl font-bold tracking-tight text-gradient">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
            <div className="mt-6">{children}</div>
            {footer && (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                {footer}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

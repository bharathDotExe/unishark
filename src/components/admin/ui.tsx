import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, RefreshCw } from "lucide-react";

/* ------------------------------------------------------------------ */
/* PageHeader                                                          */
/* ------------------------------------------------------------------ */
export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-6 border-b border-border">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground mb-2">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight text-foreground leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* StatCard                                                            */
/* ------------------------------------------------------------------ */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "neutral",
  loading,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  tone?: "neutral" | "positive" | "warning" | "danger" | "info";
  loading?: boolean;
}) {
  const tones: Record<string, string> = {
    neutral: "text-foreground",
    positive: "text-emerald-600",
    warning: "text-amber-600",
    danger: "text-red-600",
    info: "text-indigo-600",
  };
  const iconBg: Record<string, string> = {
    neutral: "bg-muted text-muted-foreground",
    positive: "bg-emerald-50 text-emerald-600",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-red-50 text-red-600",
    info: "bg-indigo-50 text-indigo-600",
  };
  return (
    <Card className="p-5 border border-border rounded-xl bg-card hover:border-foreground/20 transition-colors shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground tracking-wide">{label}</p>
          <p className={cn("text-2xl font-semibold tracking-tight mt-2 tabular-nums", tones[tone])}>
            {loading ? <span className="inline-block h-7 w-12 bg-muted rounded animate-pulse align-middle" /> : value}
          </p>
          {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
        </div>
        {Icon && (
          <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", iconBg[tone])}>
            <Icon className="h-4 w-4" strokeWidth={2} />
          </div>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* SectionCard                                                         */
/* ------------------------------------------------------------------ */
export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("border border-border rounded-xl bg-card shadow-none overflow-hidden", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border">
          <div>
            {title && <h2 className="text-sm font-semibold text-foreground">{title}</h2>}
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* DataTable (lightweight, header-strip + row callbacks)               */
/* ------------------------------------------------------------------ */
export type Column<T> = {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "right" | "center";
  cell: (row: T) => ReactNode;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  loading,
  empty,
}: {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  empty?: ReactNode;
}) {
  const gridTemplate = columns.map((c) => c.width ?? "1fr").join(" ");
  if (loading) {
    return (
      <div className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-5 py-4">
            <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }
  if (rows.length === 0) {
    return <div className="px-5 py-12 text-center text-sm text-muted-foreground">{empty ?? "No records found."}</div>;
  }
  return (
    <div className="w-full">
      <div
        className="hidden md:grid px-5 py-2.5 bg-muted/40 border-b border-border text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
        style={{ gridTemplateColumns: gridTemplate, gap: "1rem" }}
      >
        {columns.map((c) => (
          <div key={c.key} className={c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : ""}>
            {c.header}
          </div>
        ))}
      </div>
      <div className="divide-y divide-border">
        {rows.map((row) => (
          <div
            key={row.id}
            className="px-5 py-3.5 md:grid flex flex-col gap-2 md:gap-4 hover:bg-muted/30 transition-colors text-sm"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {columns.map((c) => (
              <div
                key={c.key}
                className={cn(
                  "min-w-0 flex items-center",
                  c.align === "right" && "md:justify-end",
                  c.align === "center" && "md:justify-center"
                )}
              >
                {c.cell(row)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* StatusPill                                                          */
/* ------------------------------------------------------------------ */
export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "positive" | "warning" | "danger" | "info";
}) {
  const map: Record<string, string> = {
    neutral: "bg-muted text-muted-foreground border-border",
    positive: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    info: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  const dot: Record<string, string> = {
    neutral: "bg-muted-foreground",
    positive: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    info: "bg-indigo-500",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium",
        map[tone]
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot[tone])} />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* EmptyState                                                          */
/* ------------------------------------------------------------------ */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="border border-dashed border-border bg-card/50 rounded-xl shadow-none p-12 flex flex-col items-center text-center">
      {Icon && (
        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1.5 max-w-md">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* RefreshButton                                                       */
/* ------------------------------------------------------------------ */
export function RefreshButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="h-9 rounded-lg border-border bg-card text-sm font-medium gap-2 shadow-none"
    >
      <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
      Refresh
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* PageShell — consistent page padding                                 */
/* ------------------------------------------------------------------ */
export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-6 md:px-8 py-8 space-y-7", className)}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* RoleBadge                                                           */
/* ------------------------------------------------------------------ */
export function RoleBadge({ role }: { role?: string }) {
  const r = (role || "").toLowerCase();
  if (r === "superadmin") return <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-medium rounded-md">Super Admin</Badge>;
  if (r === "admin") return <Badge className="bg-red-50 text-red-700 border border-red-200 font-medium rounded-md">Admin</Badge>;
  if (r === "investor") return <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium rounded-md">Investor</Badge>;
  if (r === "student") return <Badge className="bg-sky-50 text-sky-700 border border-sky-200 font-medium rounded-md">Student</Badge>;
  return <Badge variant="outline" className="rounded-md">—</Badge>;
}
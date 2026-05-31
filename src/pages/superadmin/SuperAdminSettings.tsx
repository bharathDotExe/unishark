import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader, SectionCard } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Globe, Shield, Bell, CreditCard, Save, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type Setting = { key: string; label: string; desc: string; type: "toggle"|"text"|"number"; value: any };

const SECTIONS: { title: string; icon: any; settings: Setting[] }[] = [
  { title: "Platform", icon: Globe, settings: [
    { key: "platform_name", label: "Platform name", desc: "Shown in emails and UI", type: "text", value: "UniShark" },
    { key: "maintenance_mode", label: "Maintenance mode", desc: "Block all user access except super admins", type: "toggle", value: false },
    { key: "allow_signups", label: "Allow new signups", desc: "Enable user registration", type: "toggle", value: true },
  ]},
  { title: "Pitch controls", icon: Shield, settings: [
    { key: "auto_approve_pitches", label: "Auto-approve pitches", desc: "Bypass admin review queue", type: "toggle", value: false },
    { key: "max_pitches_per_user", label: "Max pitches per user", desc: "0 means unlimited", type: "number", value: 5 },
  ]},
  { title: "Notifications", icon: Bell, settings: [
    { key: "email_notifications", label: "Email notifications", desc: "Send system emails to users", type: "toggle", value: true },
    { key: "admin_email", label: "Admin alert email", desc: "Where alerts are sent", type: "text", value: "admin@unishark.in" },
    { key: "support_email", label: "Support email", desc: "Shown in user-facing support", type: "text", value: "support@unishark.in" },
  ]},
  { title: "Security", icon: Shield, settings: [
    { key: "require_email_verify", label: "Require email verification", desc: "Users must verify before login", type: "toggle", value: true },
    { key: "session_timeout_hours", label: "Session timeout (hours)", desc: "Auto-logout after inactivity", type: "number", value: 24 },
    { key: "two_factor_admin", label: "2FA for admins", desc: "Force 2FA on admin accounts", type: "toggle", value: true },
  ]},
  { title: "Revenue", icon: CreditCard, settings: [
    { key: "commission_rate", label: "Commission rate (%)", desc: "Taken from signed deals", type: "number", value: 2.5 },
    { key: "subscription_price_monthly", label: "Investor subscription (₹/mo)", desc: "Monthly Pro plan price", type: "number", value: 2999 },
  ]},
];

export default function SuperAdminSettings() {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    SECTIONS.forEach((s) => s.settings.forEach((st) => { init[st.key] = st.value; }));
    return init;
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("platform_settings" as any).select("id, value");
    if (!error && data) {
      const merged = { ...values };
      (data as any[]).forEach((r) => { merged[r.id] = r.value; });
      setValues(merged);
    }
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const save = async () => {
    setSaving(true);
    const rows = Object.entries(values).map(([id, value]) => ({ id, value, updated_at: new Date().toISOString() }));
    const { error } = await supabase.from("platform_settings" as any).upsert(rows);
    if (error) toast.error(error.message); else toast.success("Settings saved");
    setSaving(false);
  };

  return (
    <PageShell>
      <PageHeader eyebrow="Super admin" title="Platform settings" subtitle="Global configuration that controls how UniShark behaves."
        actions={<>
          <Button variant="outline" size="sm" className="h-9 rounded-lg gap-2 shadow-none" onClick={load}><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />Reload</Button>
          <Button size="sm" className="h-9 rounded-lg gap-2" onClick={save} disabled={saving}><Save className="h-3.5 w-3.5" />{saving ? "Saving…" : "Save changes"}</Button>
        </>} />

      {values.maintenance_mode && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">Maintenance mode active</p>
            <p className="text-xs text-red-700/80">All non-super-admin users are currently blocked.</p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {SECTIONS.map((sec) => (
          <SectionCard key={sec.title} title={sec.title}>
            <div className="divide-y divide-border">
              {sec.settings.map((s) => (
                <div key={s.key} className="flex items-center justify-between gap-6 px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{s.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                  </div>
                  <div className="shrink-0">
                    {s.type === "toggle" ? (
                      <Switch checked={!!values[s.key]} onCheckedChange={(v) => setValues((p) => ({ ...p, [s.key]: v }))} />
                    ) : s.type === "number" ? (
                      <Input type="number" value={values[s.key] ?? ""} onChange={(e) => setValues((p) => ({ ...p, [s.key]: parseFloat(e.target.value) }))} className="h-9 w-28 text-right text-[13px] rounded-lg" />
                    ) : (
                      <Input value={values[s.key] ?? ""} onChange={(e) => setValues((p) => ({ ...p, [s.key]: e.target.value }))} className="h-9 w-64 text-[13px] rounded-lg" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        ))}
      </div>
    </PageShell>
  );
}

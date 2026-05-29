import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Globe, Bell, Shield, CreditCard, Mail, Save, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type Setting = { key: string; label: string; desc: string; type: "toggle" | "text" | "number" | "textarea" | "select"; value: any; options?: string[] };

const SECTIONS: { title: string; icon: any; color: string; settings: Setting[] }[] = [
  {
    title: "Platform", icon: Globe, color: "text-blue-400",
    settings: [
      { key: "platform_name", label: "Platform Name", desc: "Shown in emails and UI", type: "text", value: "UniShark" },
      { key: "platform_tagline", label: "Tagline", desc: "Homepage hero tagline", type: "text", value: "Where Student Founders Meet Smart Capital" },
      { key: "maintenance_mode", label: "Maintenance Mode", desc: "Block all user access except super admins", type: "toggle", value: false },
      { key: "allow_signups", label: "Allow New Signups", desc: "Enable user registration", type: "toggle", value: true },
    ]
  },
  {
    title: "Pitch Controls", icon: Shield, color: "text-sky-400",
    settings: [
      { key: "auto_approve_pitches", label: "Auto-Approve Pitches", desc: "Bypass admin review queue", type: "toggle", value: false },
      { key: "max_pitches_per_user", label: "Max Pitches per User", desc: "0 = unlimited", type: "number", value: 5 },
      { key: "pitch_expiry_days", label: "Pitch Expiry (days)", desc: "Days before pitch auto-archives", type: "number", value: 90 },
    ]
  },
  {
    title: "Notifications", icon: Bell, color: "text-amber-400",
    settings: [
      { key: "email_notifications", label: "Email Notifications", desc: "Send system emails to users", type: "toggle", value: true },
      { key: "admin_email", label: "Admin Alert Email", desc: "Where admin alerts are sent", type: "text", value: "admin@unishark.in" },
      { key: "support_email", label: "Support Email", desc: "Shown in user-facing support", type: "text", value: "support@unishark.in" },
    ]
  },
  {
    title: "Security", icon: Shield, color: "text-red-400",
    settings: [
      { key: "require_email_verify", label: "Require Email Verification", desc: "Users must verify before login", type: "toggle", value: true },
      { key: "session_timeout_hours", label: "Session Timeout (hours)", desc: "Auto-logout after inactivity", type: "number", value: 24 },
      { key: "max_login_attempts", label: "Max Login Attempts", desc: "Before temporary lockout", type: "number", value: 5 },
      { key: "two_factor_admin", label: "Require 2FA for Admins", desc: "Force 2FA on all admin accounts", type: "toggle", value: true },
    ]
  },
  {
    title: "Revenue", icon: CreditCard, color: "text-green-400",
    settings: [
      { key: "commission_rate", label: "Deal Commission Rate (%)", desc: "% taken from signed deals", type: "number", value: 2.5 },
      { key: "subscription_price_monthly", label: "Investor Subscription (₹/mo)", desc: "Monthly Pro plan price", type: "number", value: 2999 },
      { key: "free_pitch_limit", label: "Free Pitch Views / Investor", desc: "Before paywall", type: "number", value: 10 },
    ]
  },
];

export default function SuperAdminSettings() {
  const [settings, setSettings] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    SECTIONS.forEach(s => s.settings.forEach(st => { init[st.key] = st.value; }));
    return init;
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('platform_settings').select('id, value');
    if (error) {
      toast.error(error.message);
    } else if (data) {
      const merged = { ...settings };
      data.forEach((row: any) => {
        merged[row.id] = row.value;
      });
      setSettings(merged);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const update = (key: string, val: any) => {
    setSettings(prev => ({ ...prev, [key]: val }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    
    // Convert current settings object into an array of upsert objects
    const upserts = Object.keys(settings).map(key => ({
      id: key,
      value: settings[key],
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase.from('platform_settings').upsert(upserts);

    if (error) {
      toast.error(`Failed to save: ${error.message}`);
    } else {
      setSaved(true);
      toast.success("Settings saved ✓");
      
      // Also log this in audit_logs
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        await supabase.from('audit_logs').insert({
          actor_id: userData.user.id,
          action: "Updated platform settings",
          category: "SETTINGS",
          severity: "INFO",
          target_id: "Platform",
        });
      }
    }
    setSaving(false);
  };

  const renderControl = (s: Setting) => {
    const val = settings[s.key];
    if (s.type === "toggle") return (
      <Switch checked={val} onCheckedChange={v => update(s.key, v)} className="data-[state=checked]:bg-blue-500" />
    );
    if (s.type === "number") return (
      <Input type="number" value={val} onChange={e => update(s.key, parseFloat(e.target.value))}
        className="w-28 bg-muted/40 border-border text-foreground rounded-xl focus-visible:ring-0 text-sm h-8 text-right" />
    );
    if (s.type === "textarea") return (
      <Textarea value={val} onChange={e => update(s.key, e.target.value)} rows={3}
        className="bg-muted/40 border-border text-foreground placeholder:text-muted-foreground/70 rounded-xl focus-visible:ring-0 text-sm" />
    );
    return (
      <Input value={val} onChange={e => update(s.key, e.target.value)}
        className="w-56 bg-muted/40 border-border text-foreground rounded-xl focus-visible:ring-0 text-sm h-8" />
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground">Platform Settings</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Configure global platform behaviour and limits</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground hover:text-foreground border border-border" onClick={loadSettings} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}/>Reset
          </Button>
          <Button className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-foreground border-0 shadow-lg shadow-blue-500/20" onClick={save} disabled={saving || loading}>
            {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin"/> : saved ? <CheckCircle2 className="h-4 w-4 mr-2"/> : <Save className="h-4 w-4 mr-2"/>}
            {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Maintenance warning */}
      {settings.maintenance_mode && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0"/>
          <div>
            <p className="font-bold text-red-400 text-sm">Maintenance Mode Active</p>
            <p className="text-xs text-red-400/70">All users are currently blocked. Only super admins can access the platform.</p>
          </div>
        </div>
      )}

      {/* Settings sections */}
      <div className="space-y-5">
        {SECTIONS.map(section => (
          <Card key={section.title} className="border border-border bg-muted/40 overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2">
              <section.icon className={`h-4 w-4 ${section.color}`}/>
              <h2 className="font-bold text-foreground text-sm">{section.title}</h2>
            </div>
            <div className="divide-y divide-border">
              {section.settings.map(s => (
                <div key={s.key} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{s.label}</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">{s.desc}</p>
                  </div>
                  <div className="shrink-0">{renderControl(s)}</div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

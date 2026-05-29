import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, RefreshCw, Eye, Flag, Clock, User } from "lucide-react";
import { toast } from "sonner";

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_flagged?: boolean;
};

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filtered, setFiltered] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("id,sender_id,receiver_id,content,created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      toast.error("Could not load messages: " + error.message);
    }
    setMessages(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let result = messages;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((m) =>
        (m.content || "").toLowerCase().includes(q) ||
        m.sender_id.toLowerCase().includes(q) ||
        m.receiver_id.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [messages, search]);

  const flagMessage = (id: string) => {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, is_flagged: !m.is_flagged } : m));
    toast.success("Message flag toggled");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground">Monitor Communications</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Review platform messages for policy compliance</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl border-2 border-foreground/10" onClick={load}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Messages", value: messages.length, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Flagged", value: messages.filter((m) => m.is_flagged).length, color: "text-red-500", bg: "bg-red-500/10" },
          { label: "Shown (recent)", value: Math.min(messages.length, 100), color: "text-green-500", bg: "bg-green-500/10" },
        ].map((s) => (
          <Card key={s.label} className={`p-4 border-2 border-foreground/10 ${s.bg} flex items-center gap-3`}>
            <MessageSquare className={`h-5 w-5 ${s.color}`} />
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by content, sender ID, or receiver ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 rounded-xl border-2 border-foreground/10 focus-visible:border-foreground focus-visible:ring-0 text-sm"
        />
      </div>

      {/* Notice */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
        <Eye className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-500">
          <strong>Admin access:</strong> Messages are being monitored for platform safety. This access is logged and governed by privacy policy.
        </p>
      </div>

      {/* Message List */}
      {loading ? (
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <Card key={i} className="p-4 border-2 border-foreground/10 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 border-2 border-foreground/10 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-foreground">No messages found</p>
          {messages.length === 0 && <p className="text-sm text-muted-foreground mt-1">No messages have been sent on the platform yet</p>}
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((msg) => (
            <Card
              key={msg.id}
              className={`p-4 border-2 transition-all cursor-pointer hover:border-foreground/30 ${msg.is_flagged ? "border-red-500/30 bg-red-500/5" : "border-foreground/10"}`}
              onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                      <User className="h-3 w-3" /> {msg.sender_id.slice(0, 10)}…
                    </span>
                    <span className="text-xs text-muted-foreground">→</span>
                    <span className="text-xs text-muted-foreground font-mono">{msg.receiver_id.slice(0, 10)}…</span>
                    {msg.is_flagged && <Badge className="bg-red-500/10 text-red-600 border border-red-500/30 text-xs font-bold">Flagged</Badge>}
                  </div>
                  <p className={`text-sm text-foreground ${expanded === msg.id ? "" : "line-clamp-1"}`}>
                    {msg.content}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(msg.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                  <Button
                    size="sm"
                    variant={msg.is_flagged ? "destructive" : "ghost"}
                    className="h-7 px-2 rounded-lg text-xs"
                    onClick={(e) => { e.stopPropagation(); flagMessage(msg.id); }}
                  >
                    <Flag className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, FileText } from "lucide-react";
import { toast } from "sonner";

type Pitch = any;
type Message = { id: string; sender_id: string; recipient_id: string; content: string; created_at: string };

export default function PitchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [deckSignedUrl, setDeckSignedUrl] = useState<string | null>(null);
  const viewedRef = useRef(false);

  const isOwner = !!user && pitch && pitch.user_id === user.id;
  const isInvestor = roles.includes("investor");
  const isAdmin = roles.includes("admin");

  useEffect(() => {
    if (!id) return;
    supabase.from("pitches").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      setPitch(data);
      if (data?.deck_url) {
        supabase.storage.from("pitch-decks").createSignedUrl(data.deck_url, 60 * 30).then(({ data: s }) => {
          if (s?.signedUrl) setDeckSignedUrl(s.signedUrl);
        });
      }
    });
  }, [id]);

  // increment view once for non-owner investors
  useEffect(() => {
    if (!pitch || !user || viewedRef.current) return;
    if (pitch.user_id !== user.id && (isInvestor || isAdmin)) {
      viewedRef.current = true;
      supabase.from("pitches").update({ view_count: (pitch.view_count ?? 0) + 1 }).eq("id", pitch.id).then(() => {});
    }
  }, [pitch, user, isInvestor, isAdmin]);

  const loadMessages = async () => {
    if (!id) return;
    const { data } = await supabase.from("messages").select("*").eq("pitch_id", id).order("created_at");
    setMessages((data ?? []) as Message[]);
  };

  useEffect(() => {
    if (!user || !pitch) return;
    loadMessages();
    const t = setInterval(loadMessages, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [user, pitch]);

  const send = async () => {
    if (!draft.trim() || !user || !pitch) return;
    setSending(true);
    const recipient = isOwner
      ? messages.find((m) => m.sender_id !== user.id)?.sender_id
      : pitch.user_id;
    if (!recipient) { toast.error("Wait for the founder to reply first."); setSending(false); return; }
    const { error } = await supabase.from("messages").insert({
      pitch_id: pitch.id, sender_id: user.id, recipient_id: recipient, content: draft.trim(),
    });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    setDraft("");
    loadMessages();
  };

  if (!pitch) return (
    <div className="min-h-screen bg-background relative"
      style={{ backgroundImage: "var(--gradient-mesh)" }}><Navbar /><div className="container pt-28 pb-10 text-muted-foreground">Loading…</div></div>
  );

  const canMessage = !!user && (isInvestor || isOwner) && pitch.status === "APPROVED";

  return (
    <div className="min-h-screen bg-background relative"
      style={{ backgroundImage: "var(--gradient-mesh)" }}>
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-10 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>

        <Card className="p-8 shadow-card">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {pitch.stage && <Badge variant="outline">{pitch.stage}</Badge>}
            <Badge variant="outline">{pitch.status}</Badge>
            {pitch.funding_ask && <span className="text-accent font-medium ml-auto">{pitch.funding_ask}</span>}
          </div>
          <h1 className="text-3xl font-bold text-primary-dark">{pitch.title}</h1>
          {pitch.one_liner && <p className="text-lg text-muted-foreground mt-2">{pitch.one_liner}</p>}

          {pitch.thumbnail_url && (
            <div className="w-full aspect-[21/9] rounded-xl border-2 border-foreground overflow-hidden bg-background mt-6 shadow-[4px_4px_0_0_hsl(var(--foreground))]">
              <img src={pitch.thumbnail_url} alt={pitch.title} className="w-full h-full object-cover animate-fade-in" />
            </div>
          )}

          <div className="grid gap-6 mt-8">
            <Section label="Problem">{pitch.problem}</Section>
            <Section label="Solution">{pitch.solution}</Section>
            {pitch.market_size && <Section label="Market">{pitch.market_size}</Section>}
            {pitch.traction && <Section label="Traction">{pitch.traction}</Section>}
            {Array.isArray(pitch.team_members) && pitch.team_members.length > 0 && (
              <div>
                <h3 className="font-semibold text-primary-dark mb-2">Team</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {pitch.team_members.filter((m: any) => m.name).map((m: any, i: number) => (
                    <div key={i} className="rounded-lg border border-border p-3 bg-surface">
                      <p className="font-medium">{m.name}</p>
                      <p className="text-sm text-muted-foreground">{m.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {deckSignedUrl && (
              <div>
                <h3 className="font-semibold text-primary-dark mb-2 flex items-center gap-2"><FileText className="h-4 w-4" /> Pitch deck</h3>
                <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-background">
                  <iframe src={deckSignedUrl} title="Pitch deck" className="w-full h-full" />
                </div>
              </div>
            )}
          </div>
        </Card>

        {canMessage && (
          <Card className="p-6 shadow-card mt-6">
            <h3 className="font-semibold text-primary-dark mb-4">Conversation</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
              {messages.length === 0 && <p className="text-sm text-muted-foreground">No messages yet. Break the ice.</p>}
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender_id === user!.id ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    m.sender_id === user!.id ? "bg-primary text-primary-foreground" : "bg-surface border border-border"
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={isOwner ? "Reply to investor…" : "Love your idea, can we chat?"} rows={2} />
              <Button onClick={send} disabled={sending || !draft.trim()}><Send className="h-4 w-4" /></Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-primary-dark mb-1">{label}</h3>
      <p className="text-foreground whitespace-pre-wrap">{children}</p>
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, Send, CheckCircle2, User, Sparkles, Search, 
  ChevronRight, Calendar, Bookmark, Info, MoreHorizontal, Check, RefreshCw 
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ConversationMetadata = {
  pitchTitle: string;
  firstViewed: string;
  views: number;
  bookmarked: boolean;
  status: string;
  statusColor: string;
};

type MessageItem = {
  id: string;
  sender: "investor" | "user" | "system";
  senderName: string;
  time: string;
  content: string;
};

type Conversation = {
  id: string;
  name: string;
  company: string;
  pitchTitle: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  metadata: ConversationMetadata;
  messages: MessageItem[];
  suggestedReplies: string[];
};

export default function Messages() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeId, setActiveId] = useState("conv-1");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [infoOpen, setInfoOpen] = useState(true);

  // High-fidelity conversations representing the mockup & extended states
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "conv-1",
      name: "Raj Patel",
      company: "TechVentures",
      pitchTitle: "AI Resume Builder",
      lastMessage: "Love your AI idea! Can we schedule a call?",
      time: "May 15, 2:30 PM",
      unread: true,
      metadata: {
        pitchTitle: "AI Resume Builder",
        firstViewed: "May 13, 6:20 PM",
        views: 3,
        bookmarked: true,
        status: "Interested 🟢",
        statusColor: "text-emerald-600 dark:text-emerald-400"
      },
      messages: [
        {
          id: "m1-1",
          sender: "system",
          senderName: "System",
          time: "May 13, 6:20 PM",
          content: "Raj Patel viewed your pitch deck \"AI Resume Builder\"."
        },
        {
          id: "m1-2",
          sender: "investor",
          senderName: "Raj Patel",
          time: "May 13, 6:50 PM",
          content: "Great deck! Love the AI approach to resume building. This is a huge problem in the market."
        },
        {
          id: "m1-3",
          sender: "investor",
          senderName: "Raj Patel",
          time: "May 14, 3:45 PM",
          content: "Hey John, I'm super interested in your startup. Can we schedule a call for next week?"
        },
        {
          id: "m1-4",
          sender: "investor",
          senderName: "Raj Patel",
          time: "May 15, 2:30 PM",
          content: "Love your AI idea! Can we schedule a call?"
        }
      ],
      suggestedReplies: [
        "Yes, I'd love to chat! Are you free this week?",
        "Thanks Raj! How about Thursday at 2 PM?",
        "Definitely. Let me check my calendar."
      ]
    },
    {
      id: "conv-2",
      name: "Priya Sharma",
      company: "EdFunds",
      pitchTitle: "EdTech Learning Platform",
      lastMessage: "Interested in the EdTech platform. What's your go-to-market plan?",
      time: "May 14, 11:15 AM",
      unread: true,
      metadata: {
        pitchTitle: "EdTech Learning Platform",
        firstViewed: "May 12, 10:15 AM",
        views: 4,
        bookmarked: true,
        status: "Reviewing",
        statusColor: "text-amber-500"
      },
      messages: [
        {
          id: "m2-1",
          sender: "system",
          senderName: "System",
          time: "May 12, 10:15 AM",
          content: "Priya Sharma viewed your pitch deck \"EdTech Learning Platform\"."
        },
        {
          id: "m2-2",
          sender: "investor",
          senderName: "Priya Sharma",
          time: "May 12, 10:30 AM",
          content: "I really like the traction you've shown with university pilots. What's your acquisition cost per student?"
        },
        {
          id: "m2-3",
          sender: "user",
          senderName: "You",
          time: "May 12, 2:15 PM",
          content: "Hi Priya! Thanks for reaching out. Our student CAC is currently $2.40, driven mostly by peer-to-peer campus ambassador programs."
        },
        {
          id: "m2-4",
          sender: "investor",
          senderName: "Priya Sharma",
          time: "May 14, 11:15 AM",
          content: "Interested in the EdTech platform. What's your go-to-market plan for expanding outside your initial pilot campuses?"
        }
      ],
      suggestedReplies: [
        "We are expanding through student societies and tech clubs.",
        "I can share our expansion slide deck if you'd like!",
        "Let's jump on a quick Zoom to detail our scaling strategy."
      ]
    },
    {
      id: "conv-3",
      name: "Vedant Kumar",
      company: "AngelNetwork",
      pitchTitle: "AI Resume Builder",
      lastMessage: "Can you send more details about your market size?",
      time: "May 13, 4:45 PM",
      unread: false,
      metadata: {
        pitchTitle: "AI Resume Builder",
        firstViewed: "May 11, 2:00 PM",
        views: 5,
        bookmarked: false,
        status: "Evaluating",
        statusColor: "text-amber-500"
      },
      messages: [
        {
          id: "m3-1",
          sender: "system",
          senderName: "System",
          time: "May 11, 2:00 PM",
          content: "Vedant Kumar viewed your pitch deck \"AI Resume Builder\"."
        },
        {
          id: "m3-2",
          sender: "investor",
          senderName: "Vedant Kumar",
          time: "May 11, 2:45 PM",
          content: "Your team profile is impressive. Who is leading your AI development?"
        },
        {
          id: "m3-3",
          sender: "user",
          senderName: "You",
          time: "May 11, 4:20 PM",
          content: "Hey Vedant, our co-founder Rajit has 3 years of ML research experience at IIT and was previously a software engineer at Google AI."
        },
        {
          id: "m3-4",
          sender: "investor",
          senderName: "Vedant Kumar",
          time: "May 13, 4:45 PM",
          content: "Can you send more details about your market size? Specifically, how do you calculate your TAM and SAM?"
        }
      ],
      suggestedReplies: [
        "Yes! Our TAM is $12B based on global college grads.",
        "I'll upload our detailed financial and market research Excel.",
        "Let's schedule a call to break down the TAM analysis."
      ]
    },
    {
      id: "conv-4",
      name: "Ramesh Gupta",
      company: "GuruFunds",
      pitchTitle: "FinTech App",
      lastMessage: "Thanks for the update. Interested to meet next week.",
      time: "May 10, 3:20 PM",
      unread: false,
      metadata: {
        pitchTitle: "FinTech App",
        firstViewed: "May 8, 9:15 AM",
        views: 2,
        bookmarked: true,
        status: "High Match 🟢",
        statusColor: "text-emerald-600 dark:text-emerald-400"
      },
      messages: [
        {
          id: "m4-1",
          sender: "investor",
          senderName: "Ramesh Gupta",
          time: "May 8, 10:00 AM",
          content: "Excellent pitch. The neobrutalist styling of your micro-savings app is very refreshing. How is user retention?"
        },
        {
          id: "m4-2",
          sender: "user",
          senderName: "You",
          time: "May 9, 11:30 AM",
          content: "Thank you Ramesh! Our Day-30 retention is at 42%, which is about 15% higher than typical consumer finance apps in the same cohort."
        },
        {
          id: "m4-3",
          sender: "investor",
          senderName: "Ramesh Gupta",
          time: "May 10, 3:20 PM",
          content: "Thanks for the update. Interested to meet next week. Are you available on Monday or Wednesday afternoon?"
        }
      ],
      suggestedReplies: [
        "Monday afternoon works perfectly for me!",
        "Wednesday at 3 PM is great. Let's do it.",
        "Could you send over a Calendar invite link?"
      ]
    },
    {
      id: "conv-5",
      name: "Sakshi Joshi",
      company: "FemaleFounders",
      pitchTitle: "EdTech Learning Platform",
      lastMessage: "Great team composition. Loved the traction metrics.",
      time: "May 8, 9:45 AM",
      unread: false,
      metadata: {
        pitchTitle: "EdTech Learning Platform",
        firstViewed: "May 7, 3:00 PM",
        views: 3,
        bookmarked: true,
        status: "Interested 🟢",
        statusColor: "text-emerald-600 dark:text-emerald-400"
      },
      messages: [
        {
          id: "m5-1",
          sender: "system",
          senderName: "System",
          time: "May 7, 3:00 PM",
          content: "Sakshi Joshi bookmarked \"EdTech Learning Platform\"."
        },
        {
          id: "m5-2",
          sender: "investor",
          senderName: "Sakshi Joshi",
          time: "May 8, 9:45 AM",
          content: "Great team composition. Loved the traction metrics you listed in your pilot pilots. Let's connect soon."
        }
      ],
      suggestedReplies: [
        "Thanks Sakshi! I'd love to tell you more about our vision.",
        "Are you free for a 15-minute coffee chat next week?",
        "Excellent. Let me know what date works best."
      ]
    },
    {
      id: "conv-6",
      name: "Arjun Singh",
      company: "EarlyStage VC",
      pitchTitle: "AI Resume Builder",
      lastMessage: "Let's discuss Series A round next month.",
      time: "May 5, 2:15 PM",
      unread: false,
      metadata: {
        pitchTitle: "AI Resume Builder",
        firstViewed: "May 3, 11:30 AM",
        views: 6,
        bookmarked: true,
        status: "Hot Prospect",
        statusColor: "text-pink-600 font-extrabold"
      },
      messages: [
        {
          id: "m6-1",
          sender: "investor",
          senderName: "Arjun Singh",
          time: "May 3, 11:45 AM",
          content: "Your growth curve looks exponential. Are you already raising your Series A or is this pre-seed?"
        },
        {
          id: "m6-2",
          sender: "user",
          senderName: "You",
          time: "May 4, 9:15 AM",
          content: "Hi Arjun, we're currently raising a $500K pre-seed round to expand our campus footprint, but preparing terms for Series A within 12 months."
        },
        {
          id: "m6-3",
          sender: "investor",
          senderName: "Arjun Singh",
          time: "May 5, 2:15 PM",
          content: "Understood. Let's discuss Series A round next month once your pre-seed closes. Keep me updated on your progress!"
        }
      ],
      suggestedReplies: [
        "Will do, Arjun! Thanks for the feedback.",
        "I'll send you our monthly investor update.",
        "Perfect. Talk to you early next month."
      ]
    }
  ]);

  // Read message from local active conversation
  const activeConversation = conversations.find(c => c.id === activeId) || conversations[0];
  const unreadCount = conversations.filter(c => c.unread).length;

  // Mark all as read
  const handleMarkAllRead = () => {
    setConversations(prev => prev.map(c => ({ ...c, unread: false })));
    toast.success("All conversations marked as read!");
  };

  // Toggle active conversation & mark single as read
  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: false } : c));
  };

  // Handle send message
  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend !== undefined ? textToSend : inputText;
    if (!text.trim()) return;

    const timeString = new Date().toLocaleTimeString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });

    const newMessage: MessageItem = {
      id: `user-msg-${Date.now()}`,
      sender: "user",
      senderName: "You",
      time: timeString,
      content: text
    };

    setConversations(prev => prev.map(c => {
      if (c.id === activeId) {
        return {
          ...c,
          lastMessage: text,
          time: timeString,
          messages: [...c.messages, newMessage]
        };
      }
      return c;
    }));

    if (textToSend === undefined) {
      setInputText("");
    }
    toast.success("Message sent successfully!");
  };

  // Filter conversations by search query
  const filteredConversations = conversations.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.company.toLowerCase().includes(query) ||
      c.pitchTitle.toLowerCase().includes(query) ||
      c.lastMessage.toLowerCase().includes(query)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl pb-24">
      
      {/* MESSAGES HEADER */}
      <div className="text-center p-6 border-[3px] border-foreground shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] bg-card mb-8">
        <span className="text-xs uppercase tracking-widest font-black text-foreground bg-[hsl(var(--pastel-blue))] border-2 border-foreground px-3 py-1 rounded-full mb-3 inline-block shadow-[2px_2px_0_0_hsl(var(--foreground))]">
          📬 STUDENT INBOX
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-foreground uppercase tracking-widest mt-1">
          MESSAGES
        </h1>
        <p className="text-sm font-bold text-muted-foreground mt-1">
          Connect directly with interested angel investors & venture capital managers.
        </p>
      </div>

      {/* 2-COLUMN VIEWPORT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: CONVERSATION LIST (30%) -> col-span-4 */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-[3px] border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden">
            <div className="bg-muted/40 border-b-2 border-foreground p-4 flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-display font-black text-md text-foreground flex items-center gap-2">
                <span>📥</span> Inbox 
                <Badge className="bg-foreground text-background font-black text-xs px-2 py-0.5 rounded-md border-none">
                  {unreadCount} unread
                </Badge>
              </h2>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="text-xs font-black text-muted-foreground hover:text-foreground underline transition-all"
                >
                  Mark All as Read
                </button>
              )}
            </div>

            {/* Conversation list */}
            <div className="divide-y-2 divide-foreground/10 max-h-[580px] overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground font-bold">
                  No conversations found.
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive = conv.id === activeId;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={cn(
                        "w-full text-left p-4 transition-all flex flex-col gap-2 hover:bg-muted/20 outline-none",
                        isActive && "bg-[hsl(var(--pastel-pink))] border-b-2 border-foreground"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {conv.unread ? (
                            <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse flex-shrink-0" />
                          ) : (
                            <span className="text-muted-foreground text-sm flex-shrink-0">⭕</span>
                          )}
                          <span className="font-black text-sm text-foreground truncate">
                            {conv.name}
                          </span>
                          <span className="text-[10px] bg-background text-foreground px-1.5 py-0.5 border border-foreground/10 rounded font-bold font-sans flex-shrink-0">
                            {conv.company}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-black whitespace-nowrap">
                          {conv.time}
                        </span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground font-bold line-clamp-2 italic leading-relaxed">
                        "{conv.lastMessage}"
                      </p>

                      <div className="flex items-center justify-between text-[9px] font-black uppercase text-foreground/50 tracking-tight mt-1">
                        <span>{conv.unread ? "Unread" : "Read"}</span>
                        <span className="truncate max-w-[150px]">└─ {conv.pitchTitle}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Search conversations */}
            <div className="p-4 border-t-2 border-foreground bg-muted/20">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl text-xs font-bold"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: CONVERSATION (70%) -> col-span-8 */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-[3px] border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden flex flex-col">
            
            {/* Conversation Header */}
            <div className="bg-muted/40 border-b-2 border-foreground p-4 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-display font-black text-lg text-foreground flex items-center gap-1.5">
                  {activeConversation.name}
                  <span className="text-xs bg-foreground text-background px-2.5 py-0.5 rounded-md font-sans font-black shadow-[1.5px_1.5px_0_0_hsl(var(--foreground))] border border-background/25">
                    {activeConversation.company}
                  </span>
                </h3>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tight mt-0.5">
                  Re: {activeConversation.pitchTitle}
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => setInfoOpen(!infoOpen)}
                  size="xs" 
                  variant="outline"
                  className={cn(
                    "border-2 border-foreground bg-background hover:bg-muted text-foreground font-black text-xs rounded-xl px-3 py-1 shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all",
                    infoOpen && "bg-[hsl(var(--pastel-yellow))]"
                  )}
                >
                  <Info className="h-3 w-3 mr-1" /> Info
                </Button>
                <Button 
                  onClick={() => handleActionToast("More options")}
                  size="xs" 
                  variant="outline"
                  className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-black text-xs rounded-xl px-3 py-1 shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                >
                  More ▼
                </Button>
              </div>
            </div>

            {/* Conversation Info Panel (Collapsible metadata) */}
            {infoOpen && (
              <div className="bg-[hsl(var(--pastel-yellow))]/30 border-b-2 border-foreground p-4 text-xs font-bold text-muted-foreground space-y-1.5 leading-relaxed">
                <p className="text-foreground font-black uppercase tracking-wider text-[10px] mb-2">
                  About this conversation:
                </p>
                <p>├─ <span className="font-black text-foreground">Pitch:</span> {activeConversation.metadata.pitchTitle}</p>
                <p>├─ <span className="font-black text-foreground">First viewed:</span> {activeConversation.metadata.firstViewed}</p>
                <p>├─ <span className="font-black text-foreground">Views:</span> {activeConversation.metadata.views} times</p>
                <p>├─ <span className="font-black text-foreground">Bookmarked:</span> <span className={activeConversation.metadata.bookmarked ? "text-emerald-600 font-black" : "text-foreground"}>{activeConversation.metadata.bookmarked ? "Yes" : "No"}</span></p>
                <p>└─ <span className="font-black text-foreground">Status:</span> <span className={cn("font-black", activeConversation.metadata.statusColor)}>{activeConversation.metadata.status}</span></p>
              </div>
            )}

            {/* Message History Grid */}
            <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto min-h-[300px] bg-background/50">
              {activeConversation.messages.map((msg) => {
                if (msg.sender === "system") {
                  return (
                    <div key={msg.id} className="text-center my-3">
                      <span className="inline-block bg-muted border border-foreground/10 text-[10px] text-muted-foreground font-bold px-3 py-1 rounded-full shadow-[1px_1px_0_0_hsl(var(--foreground))]">
                        {msg.time} ({msg.content})
                      </span>
                    </div>
                  );
                }

                const isUser = msg.sender === "user";
                return (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex flex-col max-w-[80%] gap-1",
                      isUser ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground">
                      <span>{msg.senderName}</span>
                      <span>•</span>
                      <span>{msg.time}</span>
                    </div>
                    <div 
                      className={cn(
                        "p-3.5 border-2 border-foreground rounded-[16px] text-xs font-bold leading-relaxed shadow-[2px_2px_0_0_hsl(var(--foreground))]",
                        isUser 
                          ? "bg-[hsl(var(--pastel-blue))] text-foreground rounded-tr-none" 
                          : "bg-card text-foreground rounded-tl-none"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Textarea Input area */}
            <div className="p-4 border-t-2 border-foreground bg-muted/20 space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 border-2 border-foreground shadow-[2.5px_2.5px_0_0_hsl(var(--foreground))] rounded-xl font-bold text-xs min-h-[48px] max-h-[120px] resize-none"
                />
                <Button 
                  onClick={() => handleSendMessage()}
                  className="border-2 border-foreground bg-foreground text-background hover:bg-foreground hover:text-background shadow-[3px_3px_0_0_hsl(var(--foreground))] font-black text-xs rounded-xl px-4 flex-shrink-0 h-auto hover:translate-x-[-1.5px] hover:translate-y-[-1.5px] transition-all"
                >
                  <Send className="h-4 w-4 mr-1.5" /> Send
                </Button>
              </div>

              {/* Suggested replies */}
              <div className="space-y-2 pt-2 border-t border-foreground/10">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-foreground animate-pulse" /> Suggested replies:
                </p>
                <div className="flex flex-col gap-1.5 pl-3 border-l-2 border-foreground/15">
                  {activeConversation.suggestedReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(reply)}
                      className="text-left text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline transition-all flex items-center gap-1.5 group"
                    >
                      <span className="text-muted-foreground group-hover:text-foreground">
                        {index === 0 ? "├─" : index === 1 ? "├─" : "└─"}
                      </span>
                      <span>"{reply}"</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </Card>
        </div>

      </div>
    </div>
  );

  function handleActionToast(action: string) {
    toast.success(`${action} processed successfully!`);
  }
}

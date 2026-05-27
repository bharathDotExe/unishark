import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Send, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

type MessageItem = {
  id: string;
  sender: "investor" | "founder" | "system";
  senderName: string;
  time: string;
  content: string;
};

type Conversation = {
  id: string;
  name: string;
  company: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  contextType: "Pitch" | "Investment";
  contextTitle: string;
  metadata: {
    pitchStatus: string;
    yourStatus: string;
    firstContact: string;
    meetingsScheduled: string;
    investmentLikelihood: string;
  };
  messages: MessageItem[];
  suggestedReplies: string[];
};

const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    name: "John Doe",
    company: "AI Resume Builder",
    lastMessage: "Thanks for your interest! Can we schedule a call?",
    time: "May 15, 2:30 PM",
    unread: true,
    contextType: "Pitch",
    contextTitle: "AI Resume Builder",
    metadata: {
      pitchStatus: "Approved",
      yourStatus: "✅ Interested",
      firstContact: "May 13, 6:20 PM",
      meetingsScheduled: "1 (May 20, 2:00 PM)",
      investmentLikelihood: "High (94% match)"
    },
    messages: [
      {
        id: "m1-1",
        sender: "system",
        senderName: "System",
        time: "May 13, 6:20 PM",
        content: "You viewed the pitch"
      },
      {
        id: "m1-2",
        sender: "founder",
        senderName: "John Doe",
        time: "May 13, 6:50 PM",
        content: "Hi Raj! I saw you viewed our pitch. Would love to discuss the opportunity. Are you interested?"
      },
      {
        id: "m1-3",
        sender: "investor",
        senderName: "You",
        time: "May 13, 7:15 PM",
        content: "Hi John! Great pitch. Your traction metrics are impressive. Let's schedule a call next week."
      },
      {
        id: "m1-4",
        sender: "founder",
        senderName: "John Doe",
        time: "May 14, 10:30 AM",
        content: "Awesome! How about May 20 at 2 PM IST?"
      },
      {
        id: "m1-5",
        sender: "investor",
        senderName: "You",
        time: "May 14, 10:45 AM",
        content: "Perfect! Sent calendar invite. Looking forward to discussing your product and vision."
      },
      {
        id: "m1-6",
        sender: "founder",
        senderName: "John Doe",
        time: "May 15, 2:30 PM",
        content: "Thanks for your interest! Can we schedule a call? Few more details you might want to know."
      }
    ],
    suggestedReplies: [
      "Confirmed for May 20. Looking forward to it!",
      "Can you send over the financial projections?",
      "What's your Series A timeline?"
    ]
  },
  {
    id: "conv-2",
    name: "Priya Sharma",
    company: "EdTech Learning",
    lastMessage: "We're opening Series A round. You're interested?",
    time: "May 14, 3:15 PM",
    unread: true,
    contextType: "Investment",
    contextTitle: "EdTech (5% equity)",
    metadata: {
      pitchStatus: "Active",
      yourStatus: "👀 Reviewing",
      firstContact: "April 10, 1:00 PM",
      meetingsScheduled: "0",
      investmentLikelihood: "Medium (87% match)"
    },
    messages: [
      {
        id: "m2-1",
        sender: "founder",
        senderName: "Priya Sharma",
        time: "May 14, 3:15 PM",
        content: "We're opening Series A round. You're interested?"
      }
    ],
    suggestedReplies: ["Send me the new deck."]
  },
  {
    id: "conv-3",
    name: "Vedant Kumar",
    company: "FinTech App",
    lastMessage: "Monthly update: Hit $100k revenue milestone! 🎉",
    time: "May 12, 11:20 AM",
    unread: false,
    contextType: "Investment",
    contextTitle: "FinTech Trading App",
    metadata: {
      pitchStatus: "Funded",
      yourStatus: "🤝 Invested",
      firstContact: "Jan 5, 10:00 AM",
      meetingsScheduled: "0",
      investmentLikelihood: "N/A"
    },
    messages: [
      {
        id: "m3-1",
        sender: "founder",
        senderName: "Vedant Kumar",
        time: "May 12, 11:20 AM",
        content: "Monthly update: Hit $100k revenue milestone! 🎉"
      }
    ],
    suggestedReplies: ["Congrats!", "Great job team."]
  },
  {
    id: "conv-4",
    name: "Sakshi Joshi",
    company: "Climate Startup",
    lastMessage: "Got approved for Series A! Will send details soon.",
    time: "May 10, 4:30 PM",
    unread: false,
    contextType: "Pitch",
    contextTitle: "Climate Tech Platform",
    metadata: {
      pitchStatus: "Active",
      yourStatus: "✅ Interested",
      firstContact: "May 1, 9:00 AM",
      meetingsScheduled: "0",
      investmentLikelihood: "High"
    },
    messages: [
      {
        id: "m4-1",
        sender: "founder",
        senderName: "Sakshi Joshi",
        time: "May 10, 4:30 PM",
        content: "Got approved for Series A! Will send details soon."
      }
    ],
    suggestedReplies: ["Looking forward to it!"]
  }
];

export default function Messages() {
  const [activeId, setActiveId] = useState("conv-1");
  const [inputText, setInputText] = useState("");

  const activeConversation = mockConversations.find(c => c.id === activeId) || mockConversations[0];
  const unreadCount = mockConversations.filter(c => c.unread).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl pb-24">
      
      {/* HEADER */}
      <div className="mb-8 border-b-2 border-foreground/10 pb-6">
        <h1 className="text-4xl font-display font-extrabold text-foreground tracking-tight flex items-center gap-3">
          MESSAGES
        </h1>
        <p className="text-muted-foreground font-semibold text-lg mt-1">
          (Communicate with founders)
        </p>
      </div>

      {/* 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
        
        {/* LEFT COLUMN: CONVERSATION LIST (30%) -> col-span-3 or 4 */}
        <div className="lg:col-span-3 lg:w-full space-y-4">
          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-xl overflow-hidden flex flex-col h-[700px]">
            
            {/* Header */}
            <div className="p-4 border-b-2 border-foreground/10 flex justify-between items-center bg-muted/20">
              <span className="font-extrabold text-sm">Inbox ({unreadCount} unread)</span>
              <span className="text-xs font-bold text-muted-foreground cursor-pointer hover:underline">[Mark All as Read]</span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {mockConversations.map((conv) => {
                const isActive = conv.id === activeId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveId(conv.id)}
                    className={cn(
                      "p-4 border-b border-foreground/10 cursor-pointer hover:bg-muted/10 transition-colors",
                      isActive && "bg-[hsl(var(--pastel-blue))]/10 border-l-4 border-l-[hsl(var(--pastel-blue))]"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{conv.unread ? "🔵" : "⭕"}</span>
                        <span className={cn("text-sm font-bold", conv.unread && "text-foreground font-extrabold")}>
                          {conv.name} <span className="text-xs text-muted-foreground font-semibold">({conv.company})</span>
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap ml-2">
                        {conv.time}
                      </span>
                    </div>
                    
                    <p className={cn("text-xs mb-2 line-clamp-1", conv.unread ? "font-bold text-foreground" : "font-semibold text-muted-foreground")}>
                      "{conv.lastMessage}"
                    </p>
                    
                    <p className="text-[10px] font-bold text-muted-foreground">
                      └─ {conv.unread ? "Unread" : "Read"} | {conv.contextType}: {conv.contextTitle}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Search */}
            <div className="p-3 border-t-2 border-foreground/10 bg-muted/20">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  placeholder="[Search Conversations]" 
                  className="pl-8 h-8 text-xs font-bold border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-lg bg-background"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: CONVERSATION (70%) -> col-span-7 */}
        <div className="lg:col-span-7">
          <p className="text-xs font-bold text-muted-foreground mb-2">Selected: {activeConversation.name} ({activeConversation.company})</p>
          
          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-xl flex flex-col h-[700px] overflow-hidden">
            
            {/* Header */}
            <div className="p-4 border-b-2 border-foreground flex justify-between items-center bg-muted/20">
              <span className="font-extrabold text-sm flex items-center gap-2">
                {activeConversation.name} <span className="text-xs text-muted-foreground font-semibold">({activeConversation.company})</span>
              </span>
              <div className="flex gap-2 text-xs font-bold text-muted-foreground">
                <span className="cursor-pointer hover:text-foreground hover:underline">[Info]</span>
                <span className="cursor-pointer hover:text-foreground hover:underline">[Pitch]</span>
                <span className="cursor-pointer hover:text-foreground hover:underline">[Deal]</span>
              </div>
            </div>

            {/* Context */}
            <div className="p-5 border-b-2 border-foreground/10 bg-card">
              <p className="text-xs font-extrabold text-muted-foreground mb-2">Context:</p>
              <ul className="text-xs font-semibold space-y-1">
                <li className="flex gap-2"><span className="text-foreground/30">├─</span> <span>Pitch Status:</span> <span className="font-bold">{activeConversation.metadata.pitchStatus}</span></li>
                <li className="flex gap-2"><span className="text-foreground/30">├─</span> <span>Your Status:</span> <span className="font-bold">{activeConversation.metadata.yourStatus}</span></li>
                <li className="flex gap-2"><span className="text-foreground/30">├─</span> <span>First Contact:</span> <span className="font-bold">{activeConversation.metadata.firstContact}</span></li>
                <li className="flex gap-2"><span className="text-foreground/30">├─</span> <span>Meetings Scheduled:</span> <span className="font-bold">{activeConversation.metadata.meetingsScheduled}</span></li>
                <li className="flex gap-2"><span className="text-foreground/30">└─</span> <span>Investment Likelihood:</span> <span className="font-bold">{activeConversation.metadata.investmentLikelihood}</span></li>
              </ul>
            </div>

            {/* Separator */}
            <div className="flex items-center my-0">
              <div className="h-px bg-foreground/20 flex-1"></div>
              <div className="px-2 text-foreground/20 font-bold text-xs tracking-widest">─────────────────────────────────────────────────────────</div>
              <div className="h-px bg-foreground/20 flex-1"></div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-muted/5">
              {activeConversation.messages.map((msg) => {
                if (msg.sender === "system") {
                  return (
                    <div key={msg.id} className="text-xs font-semibold text-muted-foreground">
                      <p>{msg.time} (System message)</p>
                      <p>{msg.content}</p>
                    </div>
                  );
                }

                const isUser = msg.sender === "investor";
                
                return (
                  <div key={msg.id} className="text-xs">
                    <p className="font-semibold text-muted-foreground mb-1">{msg.time}</p>
                    <div className="flex items-start gap-2">
                      <span className="font-extrabold text-foreground">{msg.senderName}:</span>
                      <span className="font-semibold text-foreground bg-background px-3 py-1.5 rounded-lg border border-foreground/10">"{msg.content}"</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Separator */}
            <div className="flex items-center my-0">
              <div className="h-px bg-foreground/20 flex-1"></div>
              <div className="px-2 text-foreground/20 font-bold text-xs tracking-widest">─────────────────────────────────────────────────────────</div>
              <div className="h-px bg-foreground/20 flex-1"></div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-card">
              <p className="text-xs font-extrabold text-muted-foreground uppercase mb-2">MESSAGE INPUT:</p>
              
              <div className="flex items-start gap-2 mb-4">
                <Textarea 
                  placeholder="[Type message..."
                  className="flex-1 min-h-[60px] border-2 border-foreground rounded-lg font-bold text-xs shadow-[2px_2px_0_0_hsl(var(--foreground))] resize-none"
                />
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] h-8 px-3">
                    [Attach]
                  </Button>
                  <Button size="sm" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] h-8 px-3">
                    [Send]
                  </Button>
                </div>
              </div>

              <div className="text-xs font-semibold text-muted-foreground">
                <p className="mb-1">Suggested replies:</p>
                <div className="space-y-1">
                  {activeConversation.suggestedReplies.map((reply, i) => (
                    <div key={i} className="flex gap-2 hover:text-foreground cursor-pointer transition-colors">
                      <span className="text-foreground/30">{i === activeConversation.suggestedReplies.length - 1 ? '└─' : '├─'}</span>
                      <span>"{reply}"</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </Card>
        </div>

      </div>
    </div>
  );
}

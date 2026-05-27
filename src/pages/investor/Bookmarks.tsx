import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bookmark, LayoutGrid, List, Search, Star, MessageSquare, 
  BookmarkMinus, Edit3, ArrowRight, Activity, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

const mockBookmarks = [
  {
    id: "1",
    title: "AI Resume Builder",
    status: " Reviewing",
    statusColor: "bg-[hsl(var(--pastel-yellow))]",
    sector: "EdTech",
    stage: "MVP",
    fundingAsk: "₹1Cr",
    founder: "John Doe",
    teamSize: 3,
    traction: "500 users",
    matchScore: 94,
    rating: 5,
    savedTime: "May 15, 2:30 PM (2 days ago)",
    lastViewed: "Today at 10:45 AM",
    notes: "Strong team, good traction. Follow up call scheduled for May 20. Likely to invest.",
    unreadMessages: 0,
    interestText: " You're interested (Status: Reviewing)"
  },
  {
    id: "2",
    title: "EdTech Learning Platform",
    status: " Interested",
    statusColor: "bg-success text-success-foreground",
    sector: "EdTech",
    stage: "MVP",
    fundingAsk: "₹80L",
    founder: "Priya Sharma",
    teamSize: 4,
    traction: "1000+ users",
    matchScore: 87,
    rating: 5,
    savedTime: "May 14, 11:20 AM (3 days ago)",
    lastViewed: "May 14 at 2:30 PM",
    notes: "Great product-market fit. Lower ask than expected. Need to verify market claims.",
    unreadMessages: 1,
    messagePreview: "Can we chat this week?",
    interestText: " You're interested"
  },
  {
    id: "3",
    title: "FinTech Trading App",
    status: "⏳ Under Review",
    statusColor: "bg-[hsl(var(--pastel-blue))]",
    sector: "FinTech",
    stage: "Revenue",
    fundingAsk: "₹2Cr",
    founder: "Vedant Kumar",
    teamSize: 5,
    traction: "$10k MRR",
    matchScore: 85,
    rating: 5,
    savedTime: "May 13, 4:50 PM (4 days ago)",
    lastViewed: "May 14 at 11:30 AM",
    notes: "Interesting model but regulatory concerns. Waiting for legal review before deciding.",
    unreadMessages: 0,
    interestText: "⏳ You're considering"
  }
];

export default function Bookmarks() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl pb-24">
      
      {/* HEADER */}
      <div className="mb-8 border-b-2 border-foreground/10 pb-6">
        <h1 className="text-4xl font-display font-extrabold text-foreground tracking-tight flex items-center gap-3">
          <Bookmark className="h-8 w-8 text-foreground" /> Saved Pitches
        </h1>
        <p className="text-muted-foreground font-semibold text-lg mt-1 pl-11">
          (Bookmarked for later)
        </p>
      </div>

      {/* FILTER & SORT TOOLBAR */}
      <div className="bg-card border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-muted-foreground uppercase">Filter by:</span>
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px] h-9 border-2 border-foreground font-bold rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-bold">All</SelectItem>
                <SelectItem value="favorites" className="font-bold">My Favorites</SelectItem>
                <SelectItem value="high_priority" className="font-bold">High Priority</SelectItem>
                <SelectItem value="to_review" className="font-bold">To Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-muted-foreground uppercase ml-2 md:ml-4">Sort by:</span>
            <Select defaultValue="recent">
              <SelectTrigger className="w-[140px] h-9 border-2 border-foreground font-bold rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent" className="font-bold">Most Recent</SelectItem>
                <SelectItem value="match" className="font-bold">Match Score</SelectItem>
                <SelectItem value="funding" className="font-bold">Funding Ask</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-xl border-2 border-foreground/10">
            <Button variant="ghost" size="sm" className="h-7 px-2 font-bold text-muted-foreground hover:text-foreground">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 font-bold bg-foreground text-background shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:bg-foreground hover:text-background rounded-lg">
              <List className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative w-full md:w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search bookmarks..." 
              className="pl-9 h-9 border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] font-bold rounded-xl"
            />
          </div>
        </div>

      </div>

      {/* BOOKMARKED PITCHES LIST */}
      <div className="space-y-6">
        {mockBookmarks.map((bookmark) => (
          <Card key={bookmark.id} className="border-2 border-foreground shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_0_hsl(var(--foreground))]">
            
            {/* Top Row: Title & Status */}
            <div className="bg-muted/10 border-b-2 border-foreground/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-extrabold text-2xl text-foreground mb-2">
                  {bookmark.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] bg-background">
                    {bookmark.sector}
                  </Badge>
                  <Badge variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] bg-background">
                    {bookmark.stage}
                  </Badge>
                  <Badge variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] bg-[hsl(var(--pastel-blue))] text-foreground">
                    Funding: {bookmark.fundingAsk}
                  </Badge>
                </div>
              </div>
              <Badge className={cn("border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] text-xs uppercase px-3 py-1 whitespace-nowrap", bookmark.statusColor)}>
                Status: {bookmark.status}
              </Badge>
            </div>

            {/* Middle Section: Details */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-4">
                <div className="text-sm font-semibold text-muted-foreground flex flex-wrap gap-x-4 gap-y-2">
                  <span className="text-foreground">Founder: {bookmark.founder}</span>
                  <span className="text-foreground">Team: {bookmark.teamSize}</span>
                  <span className="text-foreground">Traction: {bookmark.traction}</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm font-bold">
                  <span className="bg-success/20 text-success-foreground border border-success/30 px-2 py-1 rounded-md">
                    Match Score: {bookmark.matchScore}%
                  </span>
                  <span className="flex items-center gap-1">
                    {[...Array(bookmark.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-[hsl(var(--pastel-yellow))] text-[hsl(var(--pastel-yellow))]" />
                    ))}
                  </span>
                </div>

                <div className="text-xs font-semibold text-muted-foreground space-y-1">
                  <p className="flex items-center gap-1"><Clock className="h-3 w-3" /> Saved: {bookmark.savedTime}</p>
                  <p className="flex items-center gap-1"><Activity className="h-3 w-3" /> Last Viewed: {bookmark.lastViewed}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-muted/20 border-2 border-[hsl(var(--pastel-pink))] p-4 rounded-xl relative">
                  <span className="absolute -top-2.5 left-4 bg-background px-2 text-[10px] font-extrabold uppercase text-[hsl(var(--pastel-pink))]-dark tracking-widest border-x-2 border-background">Your Notes</span>
                  <p className="text-sm font-semibold italic text-foreground">
                    "{bookmark.notes}"
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  {bookmark.unreadMessages > 0 ? (
                    <div className="flex items-center gap-2 text-sm font-bold text-destructive bg-destructive/5 p-2 rounded-lg border border-destructive/20">
                      <MessageSquare className="h-4 w-4" /> 
                      Messages: {bookmark.unreadMessages} unread 
                      {bookmark.messagePreview && <span className="font-semibold italic text-muted-foreground ml-1">("{bookmark.messagePreview}")</span>}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <MessageSquare className="h-4 w-4" /> Messages: 0 unread
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    Interest: {bookmark.interestText}
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Actions Row */}
            <div className="bg-muted/30 border-t-2 border-foreground/10 p-4 flex flex-wrap gap-2">
              <Button asChild size="sm" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
                <Link to="/pitches/1">View Full Pitch <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
              <Button variant="outline" size="sm" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] bg-background hover:bg-[hsl(var(--pastel-mint))] rounded-xl transition-all">
                Message Founder
              </Button>
              <Button variant="outline" size="sm" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] bg-background hover:bg-destructive hover:text-destructive-foreground rounded-xl transition-all">
                <BookmarkMinus className="h-3 w-3 mr-1" /> Remove Bookmark
              </Button>
              <div className="flex-1 min-w-[20px]" /> {/* Spacer */}
              <Button variant="ghost" size="sm" className="font-bold text-muted-foreground hover:text-foreground">
                Change Priority
              </Button>
              <Button variant="ghost" size="sm" className="font-bold text-[hsl(var(--pastel-blue))] hover:text-foreground hover:bg-[hsl(var(--pastel-blue))]/10">
                <Edit3 className="h-3 w-3 mr-1" /> Add Notes
              </Button>
            </div>
            
          </Card>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Button className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-extrabold shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-xl px-8 h-12 text-lg hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
          Load More Bookmarks
        </Button>
      </div>

    </div>
  );
}

import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ResultsList } from "@/components/ResultsList";
import { ChatBot } from "@/components/ChatBot";
import { YouTubeTutorFinder } from "@/components/YouTubeTutorFinder";
import { VoiceAvatar } from "@/components/VoiceAvatar";
import { AuthForm } from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, Search, Sparkles, Zap, BookOpen, Code2, Youtube, Globe, LogOut, User, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SearchResult {
  title: string;
  snippet: string;
  link: string;
}

const Index = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setShowAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out", description: "You have been signed out successfully." });
  };

  const handleVoiceSearch = (text: string) => {
    setQuery(text);
    handleSearch(text);
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
    
    const demoResults: SearchResult[] = [
      { title: "YouTube: Video Tutorials", snippet: "Find video tutorials and explanations", link: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}` },
      { title: "GeeksforGeeks", snippet: "Code examples and detailed explanations", link: `https://www.geeksforgeeks.org/?s=${encodeURIComponent(searchQuery)}` },
      { title: "Stack Overflow: Q&A", snippet: "Related questions and community answers", link: `https://stackoverflow.com/search?q=${encodeURIComponent(searchQuery)}` },
      { title: "MDN Web Docs", snippet: "Comprehensive web development documentation", link: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(searchQuery)}` },
      { title: "W3Schools", snippet: "Tutorials and references for web development", link: `https://www.w3schools.com/search/search_asp.asp?search=${encodeURIComponent(searchQuery)}` },
    ];
    setResults(demoResults);
  };

  const features = [
    { icon: Sparkles, title: "AI-Powered Learning", description: "Instant answers and explanations from our intelligent chatbot", gradient: true },
    { icon: Search, title: "Smart Search", description: "Find the best tutorials and documentation across the web", gradient: true },
    { icon: Zap, title: "Voice Input", description: "Speak your queries naturally with voice recognition", gradient: false },
    { icon: BookOpen, title: "Curated Resources", description: "Handpicked learning materials from top platforms", gradient: false },
    { icon: Code2, title: "Code Snippets", description: "Syntax-highlighted code examples with copy functionality", gradient: true },
    { icon: MessageSquare, title: "Interactive Chat", description: "Conversations with AI to deepen your understanding", gradient: true },
    { icon: Globe, title: "Multi-Language", description: "Search and learn in multiple programming languages", gradient: false },
    { icon: Youtube, title: "Video Learning", description: "Direct access to video tutorials from top educators", gradient: false },
  ];

  const quickActions = [
    { icon: Youtube, label: "Video Tutorials", url: "https://www.youtube.com/results?search_query=programming+tutorials" },
    { icon: Code2, label: "Code Examples", url: "https://www.geeksforgeeks.org/" },
    { icon: Globe, label: "Documentation", url: "https://developer.mozilla.org/" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-border/50 glass">
        <div className="container mx-auto px-4 py-3 max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              thing big
            </span>
          </div>
          
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setShowAuth(true)} className="gap-2">
              <User className="h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full glass text-sm font-medium text-muted-foreground animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Your AI Learning Companion
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight animate-fade-in" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <span className="text-gradient">think big</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-2 animate-fade-in">
            Learn programming smarter, not harder.
          </p>
          <p className="text-sm text-muted-foreground/70 italic mb-10 animate-fade-in">
            "Learn small, think big. Code with curiosity."
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-8 animate-slide-up">
            <SearchBar onSearch={handleSearch} />
            
            <div className="flex flex-wrap gap-3 mt-6 justify-center">
              <Button
                onClick={() => query && handleSearch(query)}
                size="lg"
                className="bg-gradient-primary hover:opacity-90 transition-all shadow-soft glow gap-2"
                disabled={!query}
              >
                <Search className="h-4 w-4" />
                Search Web
              </Button>
              <Button
                onClick={() => user ? setShowChat(!showChat) : setShowAuth(true)}
                size="lg"
                variant="outline"
                className="border-primary/30 hover:border-primary hover:bg-primary/5 transition-all gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                {showChat ? "Hide Chat" : "Ask AI"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Auth */}
      {showAuth && !user && (
        <div className="container mx-auto px-4 mb-12 max-w-4xl animate-slide-up relative z-10">
          <AuthForm />
        </div>
      )}

      {/* YouTube Tutor Finder */}
      <div className="container mx-auto px-4 mb-12 max-w-4xl animate-slide-up relative z-10">
        <YouTubeTutorFinder />
      </div>

      {/* Chat */}
      {showChat && user && (
        <div className="container mx-auto px-4 mb-12 max-w-4xl animate-slide-up relative z-10">
          <ChatBot initialQuery={query} />
        </div>
      )}

      {/* Voice */}
      <VoiceAvatar onVoiceInput={handleVoiceSearch} />

      {/* Results */}
      {results.length > 0 && (
        <div className="container mx-auto px-4 mb-16 max-w-4xl animate-slide-up relative z-10">
          <ResultsList results={results} />
        </div>
      )}

      {/* Features */}
      {results.length === 0 && (
        <section className="relative z-10 pb-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Everything you need to <span className="text-gradient">learn faster</span>
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Powerful tools designed to accelerate your programming journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="group p-6 glass hover:shadow-medium transition-all duration-300 hover:-translate-y-1 cursor-default"
                >
                  <div className={`rounded-xl w-11 h-11 flex items-center justify-center mb-4 ${
                    feature.gradient ? 'bg-gradient-primary' : 'bg-gradient-accent'
                  }`}>
                    <feature.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-base mb-1.5 text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Quick Access
              </h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="lg"
                    onClick={() => window.open(action.url, '_blank')}
                    className="glass border-border/50 hover:border-primary/50 hover:text-primary transition-all gap-2 group"
                  >
                    <action.icon className="h-4 w-4" />
                    {action.label}
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 glass">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground mb-1">
            <strong className="text-foreground">THING BIG AI</strong> — Founded by <strong>SHAIK WAHEED BABU</strong>
          </p>
          <p className="text-xs text-muted-foreground/70 mb-1">
            Co-Founders: <strong>CHATGPT</strong> · Built with <strong>Lovable</strong>
          </p>
          <p className="text-xs text-muted-foreground/60">
            Share knowledge freely; the world grows. 🌍
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ResultsList } from "@/components/ResultsList";
import { ChatBot } from "@/components/ChatBot";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, Search, Sparkles, Zap, BookOpen, Code2, Youtube, Globe } from "lucide-react";

export interface SearchResult {
  title: string;
  snippet: string;
  link: string;
}

const Index = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showChat, setShowChat] = useState(false);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    
    // Open web search in new tab
    window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
    
    // Populate demo results with helpful learning resources
    const demoResults: SearchResult[] = [
      {
        title: "YouTube: Video Tutorials",
        snippet: "Find video tutorials and explanations",
        link: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`
      },
      {
        title: "GeeksforGeeks",
        snippet: "Code examples and detailed explanations",
        link: `https://www.geeksforgeeks.org/?s=${encodeURIComponent(searchQuery)}`
      },
      {
        title: "Stack Overflow: Q&A",
        snippet: "Related questions and community answers",
        link: `https://stackoverflow.com/search?q=${encodeURIComponent(searchQuery)}`
      },
      {
        title: "MDN Web Docs",
        snippet: "Comprehensive web development documentation",
        link: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(searchQuery)}`
      },
      {
        title: "W3Schools",
        snippet: "Tutorials and references for web development",
        link: `https://www.w3schools.com/search/search_asp.asp?search=${encodeURIComponent(searchQuery)}`
      }
    ];
    
    setResults(demoResults);
  };

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Learning",
      description: "Get instant answers and explanations from our intelligent chatbot"
    },
    {
      icon: Search,
      title: "Smart Search",
      description: "Find the best tutorials and documentation across the web"
    },
    {
      icon: Zap,
      title: "Voice Input",
      description: "Speak your queries naturally with voice recognition"
    },
    {
      icon: BookOpen,
      title: "Curated Resources",
      description: "Access handpicked learning materials from top platforms"
    }
  ];

  const quickActions = [
    { icon: Youtube, label: "Video Tutorials", url: "https://www.youtube.com/results?search_query=programming+tutorials" },
    { icon: Code2, label: "Code Examples", url: "https://www.geeksforgeeks.org/" },
    { icon: Globe, label: "Documentation", url: "https://developer.mozilla.org/" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
        
        <div className="container mx-auto px-4 py-12 md:py-20 max-w-6xl relative">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>Your AI Learning Companion</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              <span className="bg-gradient-primary bg-clip-text text-transparent">thing big</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
              Learn programming smarter, not harder
            </p>
            <p className="text-sm md:text-base text-muted-foreground italic">
              "Learn small, think big. Code with curiosity."
            </p>
          </div>

          {/* Search Section */}
          <div className="max-w-3xl mx-auto mb-12 animate-slide-up">
            <SearchBar onSearch={handleSearch} />
            
            <div className="flex flex-wrap gap-3 mt-6 justify-center">
              <Button 
                onClick={() => query && handleSearch(query)}
                size="lg"
                className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-soft"
                disabled={!query}
              >
                <Search className="mr-2 h-5 w-5" />
                Search Web
              </Button>
              <Button 
                onClick={() => setShowChat(!showChat)}
                size="lg"
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary/10 shadow-soft"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                {showChat ? "Hide Chat" : "Ask AI Assistant"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Bot */}
      {showChat && (
        <div className="container mx-auto px-4 mb-12 max-w-4xl animate-slide-up">
          <ChatBot initialQuery={query} />
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="container mx-auto px-4 mb-12 max-w-4xl animate-slide-up">
          <ResultsList results={results} />
        </div>
      )}

      {/* Features Grid - Only show when no results */}
      {results.length === 0 && (
        <div className="container mx-auto px-4 pb-20 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-fade-in">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="p-6 hover:shadow-medium transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur-sm border-2"
              >
                <div className="rounded-full w-12 h-12 bg-gradient-primary flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="text-center animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Quick Access</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="lg"
                  onClick={() => window.open(action.url, '_blank')}
                  className="hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                >
                  <action.icon className="mr-2 h-5 w-5" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Share knowledge freely; the world grows. 🌍
          </p>
          <p className="text-xs text-muted-foreground">
            Built with 💙 for learners everywhere
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

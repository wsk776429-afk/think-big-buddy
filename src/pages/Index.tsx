import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { QuoteDisplay } from "@/components/QuoteDisplay";
import { ResultsList } from "@/components/ResultsList";
import { ChatBot } from "@/components/ChatBot";
import { Button } from "@/components/ui/button";
import { MessageSquare, Search } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">
            thing big
          </h1>
          <QuoteDisplay />
        </header>

        {/* Search Section */}
        <div className="mb-8 animate-slide-up">
          <SearchBar onSearch={handleSearch} />
          
          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <Button 
              onClick={() => query && handleSearch(query)}
              className="flex-1 h-12 bg-gradient-primary hover:opacity-90 transition-opacity"
              disabled={!query}
            >
              <Search className="mr-2 h-5 w-5" />
              Search Web
            </Button>
            <Button 
              onClick={() => setShowChat(!showChat)}
              variant="outline"
              className="flex-1 h-12 border-primary text-primary hover:bg-primary/10"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              {showChat ? "Hide Chat" : "Chat Bot"}
            </Button>
          </div>
        </div>

        {/* Chat Bot */}
        {showChat && (
          <div className="mb-8 animate-slide-up">
            <ChatBot initialQuery={query} />
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="animate-slide-up">
            <ResultsList results={results} />
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-12 text-sm text-muted-foreground">
          <p>Learn small, think big. 🚀</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;

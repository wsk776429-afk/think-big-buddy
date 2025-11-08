import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  const handleVoiceInput = () => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: "Not supported",
        description: "Voice input is not supported in your browser",
        variant: "destructive",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Speak your query",
      });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      onSearch(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      toast({
        title: "Error",
        description: "Could not recognize speech. Please try again.",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <Card className="p-4 shadow-medium">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Ask for any program, e.g. bubble sort in Python"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pr-12 h-12 text-base"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleVoiceInput}
            className={`absolute right-1 top-1/2 -translate-y-1/2 ${
              isListening ? "text-accent animate-pulse" : "text-muted-foreground hover:text-primary"
            }`}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
        </div>
      </form>
    </Card>
  );
};

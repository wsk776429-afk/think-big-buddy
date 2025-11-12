import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Volume2, VolumeX, Mic } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatBotProps {
  initialQuery?: string;
}

// Validation schemas
const chatInputSchema = z.string().trim().min(1, "Message cannot be empty").max(2000, "Message too long (max 2000 characters)");
const urlSchema = z.string().url("Invalid URL format").max(500, "URL too long (max 500 characters)");

export const ChatBot = ({ initialQuery }: ChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hello! I'm your AI learning assistant. Ask me anything about programming, or paste a URL to get a summary!",
    },
  ]);
  const [input, setInput] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { speak, stop, isSpeaking } = useSpeechSynthesis();
  const { toast } = useToast();

  // Load auth state and chat history
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadChatHistory();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadChatHistory();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (initialQuery && messages.length === 1) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedMessages = data.map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveChatMessage = async (role: string, content: string) => {
    if (!user) return;
    
    try {
      await supabase.from('chat_history').insert({
        user_id: user.id,
        role,
        content,
      });
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  };

  const searchAnswer = async (query: string) => {
    try {
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
      );
      const data = await response.json();
      
      if (data.AbstractText && data.AbstractText.trim()) {
        return data.AbstractText;
      }
      
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        for (const topic of data.RelatedTopics) {
          if (topic.Text) return topic.Text;
        }
      }
      
      return "I couldn't find a specific answer. Try rephrasing your question or check the search results above.";
    } catch (error) {
      console.error('Search error:', error);
      return "Sorry, I couldn't search for that right now. Please try again.";
    }
  };

  const handleSend = async (message?: string) => {
    const messageToSend = message || input;
    if (!messageToSend.trim() || isLoading) return;

    // Validate input length
    try {
      chatInputSchema.parse(messageToSend);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid Input",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    const userMessage: Message = { role: "user", content: messageToSend };
    setMessages((prev) => [...prev, userMessage]);
    await saveChatMessage('user', messageToSend);
    setInput("");
    setIsLoading(true);

    try {
      let response = "";
      
      // Check if input contains a URL
      const urlMatch = messageToSend.match(/https?:\/\/\S+/);
      
      if (urlMatch) {
        const url = urlMatch[0];
        
        // Validate URL
        try {
          urlSchema.parse(url);
        } catch (error) {
          if (error instanceof z.ZodError) {
            toast({
              title: "Invalid URL",
              description: error.errors[0].message,
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
        }
        
        toast({
          title: "Fetching webpage...",
          description: "Please wait while I read the content.",
        });
        
        // Use web scraper edge function
        const { data, error } = await supabase.functions.invoke('web-scraper', {
          body: { url }
        });

        if (error) throw error;

        if (data && data.html) {
          // Clean HTML and extract text
          const cleaned = data.html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 8000);

          const summary = cleaned.split('. ').slice(0, 6).join('. ') + (cleaned.indexOf('.') === -1 ? '' : '.');
          response = `📄 Website Summary (${url}):\n\n${summary}`;
        } else {
          response = "Couldn't read meaningful content from the page.";
        }
      } else {
        // Search for answer using DuckDuckGo API
        response = await searchAnswer(messageToSend);
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      await saveChatMessage('ai', response);
      
      if (voiceEnabled && !isSpeaking) {
        speak(response);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice input",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: "Error",
        description: "Could not recognize speech",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      stop();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <Card className="shadow-medium overflow-hidden">
      <div className="bg-gradient-primary p-4 text-primary-foreground">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Learning Assistant
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleVoice}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            {voiceEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-80 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`rounded-lg p-3 max-w-[80%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-accent" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={handleVoiceInput}
          className={isListening ? "bg-red-500 text-white animate-pulse" : ""}
        >
          <Mic className="h-4 w-4" />
        </Button>
        <Input
          type="text"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
        />
        <Button 
          type="submit" 
          size="icon"
          className="bg-gradient-primary hover:opacity-90 transition-opacity"
          disabled={!input.trim() || isLoading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
};

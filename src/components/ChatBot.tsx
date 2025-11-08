import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatBotProps {
  initialQuery?: string;
}

export const ChatBot = ({ initialQuery }: ChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your learning assistant. Ask me anything about programming, algorithms, or computer science concepts. I can help explain code, suggest resources, and guide your learning journey.",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const handleSend = async (message?: string) => {
    const messageToSend = message || input;
    if (!messageToSend.trim()) return;

    const userMessage: Message = { role: "user", content: messageToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate AI response (in production, connect to your backend/AI service)
    setTimeout(() => {
      const responses = [
        `Great question about "${messageToSend}"! Let me help you with that. This topic involves understanding core concepts and practical implementation. I recommend starting with the basics and gradually building complexity.`,
        `I can help you learn about ${messageToSend}. Check out the search results for tutorials, documentation, and code examples. Would you like me to break down any specific aspect?`,
        `Interesting! ${messageToSend} is an important topic. I suggest exploring the resources in the search results, especially the video tutorials on YouTube for visual learning and GeeksforGeeks for step-by-step code examples.`,
      ];
      const assistantMessage: Message = {
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <Card className="shadow-medium overflow-hidden">
      <div className="bg-gradient-primary p-4 text-primary-foreground">
        <h3 className="font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Learning Assistant
        </h3>
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
          disabled={!input.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
};

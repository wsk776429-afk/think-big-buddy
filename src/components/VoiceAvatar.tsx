import { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface VoiceAvatarProps {
  onVoiceInput: (text: string) => void;
}

export const VoiceAvatar = ({ onVoiceInput }: VoiceAvatarProps) => {
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

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
      toast({
        title: "Listening...",
        description: "Speak now",
      });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onVoiceInput(transcript);
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

  return (
    <Button
      onClick={handleVoiceInput}
      className={`fixed bottom-24 right-6 h-16 w-16 rounded-full shadow-lg transition-all duration-300 ${
        isListening 
          ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110' 
          : 'bg-gradient-primary hover:opacity-90'
      }`}
      size="icon"
    >
      {isListening ? (
        <MicOff className="h-7 w-7 text-white" />
      ) : (
        <Mic className="h-7 w-7 text-white" />
      )}
    </Button>
  );
};

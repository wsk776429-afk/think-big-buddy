import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Youtube, Search } from "lucide-react";

export const YouTubeTutorFinder = () => {
  const [topic, setTopic] = useState("");

  const handleSearch = () => {
    if (!topic.trim()) return;
    const searchQuery = encodeURIComponent(`${topic} tutorial`);
    window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-2">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-full w-12 h-12 bg-red-500 flex items-center justify-center">
          <Youtube className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">YouTube Tutor Finder</h3>
          <p className="text-sm text-muted-foreground">Find the best video tutorials</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          placeholder="What do you want to learn?"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="flex-1"
        />
        <Button 
          type="submit"
          className="bg-red-500 hover:bg-red-600"
          disabled={!topic.trim()}
        >
          <Search className="h-4 w-4 mr-2" />
          Find Tutors
        </Button>
      </form>
    </Card>
  );
};

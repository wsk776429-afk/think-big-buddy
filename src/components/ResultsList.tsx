import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import type { SearchResult } from "@/pages/Index";

interface ResultsListProps {
  results: SearchResult[];
}

export const ResultsList = ({ results }: ResultsListProps) => {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold mb-4 text-foreground">
        Helpful Resources
      </h2>
      {results.map((result, index) => (
        <Card
          key={index}
          className="p-4 hover:shadow-medium transition-all duration-200 cursor-pointer group"
          onClick={() => window.open(result.link, '_blank')}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1 truncate">
                {result.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {result.snippet}
              </p>
              <p className="text-xs text-primary truncate">
                {result.link}
              </p>
            </div>
            <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </div>
        </Card>
      ))}
    </div>
  );
};

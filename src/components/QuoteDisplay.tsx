import { useState, useEffect } from "react";

const quotes = [
  "Learn small, think big.",
  "Code with curiosity — the rest will follow.",
  "Share knowledge freely; the world grows.",
  "Every expert was once a beginner.",
  "The best time to start learning was yesterday. The second best time is now.",
];

export const QuoteDisplay = () => {
  const [currentQuote, setCurrentQuote] = useState("");

  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setCurrentQuote(randomQuote);

    // Change quote every 10 seconds
    const interval = setInterval(() => {
      const newQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setCurrentQuote(newQuote);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <p className="text-muted-foreground text-sm md:text-base italic transition-opacity duration-500">
      "{currentQuote}"
    </p>
  );
};

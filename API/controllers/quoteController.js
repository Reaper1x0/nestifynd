const quotes = [
  "You are stronger than you think.",
  "Small steps every day lead to big change.",
  "Focus on progress, not perfection.",
  "Believe in your journey.",
  "One task at a time. You've got this.",
  "Every routine started with a single step.",
  "Be kind to yourself today."
];

exports.getRandom = async (req, res) => {
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  res.json({ quote: random });
};

/** Server-side only: get a random quote string (for cron/reminders) */
exports.getRandomQuoteText = () => {
  return quotes[Math.floor(Math.random() * quotes.length)];
};

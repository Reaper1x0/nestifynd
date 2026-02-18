const quotes = [
  "You are stronger than you think.",
  "Small steps every day lead to big change.",
  "Focus on progress, not perfection.",
  "Believe in your journey."
];

exports.getRandom = async (req, res) => {
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  res.json({ quote: random });
};

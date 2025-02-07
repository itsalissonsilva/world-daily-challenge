const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const users = {}; // Store user submissions
const leaderboard = {};

const challenges = [
  "Write a haiku about the sky.",
  "Describe your day in exactly 10 words.",
  "Make a two-sentence horror story.",
  "Invent a new word and define it."
];

app.get("/api/challenge", (req, res) => {
  const dayIndex = new Date().getDate() % challenges.length;
  res.json({ challenge: challenges[dayIndex] });
});

app.post("/api/submit", (req, res) => {
  const { username, response } = req.body;
  if (!username || !response) return res.status(400).send("Missing data");

  if (!users[username]) users[username] = [];
  users[username].push(response);

  leaderboard[username] = (leaderboard[username] || 0) + 1;
  res.json({ message: "Submitted!" });
});

app.get("/api/social", (req, res) => {
  res.json({ responses: Object.entries(users).flatMap(([user, responses]) =>
    responses.map(response => ({ username: user, response }))) });
});

app.get("/api/leaderboard", (req, res) => {
  const sorted = Object.entries(leaderboard)
    .map(([username, challengesCompleted]) => ({ username, challengesCompleted }))
    .sort((a, b) => b.challengesCompleted - a.challengesCompleted);
  res.json({ leaderboard: sorted });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));

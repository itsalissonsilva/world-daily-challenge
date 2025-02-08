const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const users = {}; // Store user submissions
const leaderboard = {};
const votes = {}; // Store votes per response
const miniVotes = {}; // Store mini-votes separately

const challenges = [
  "Make a two-sentence horror story.",
  "Make a two-sentence horror story.",
  "Make a two-sentence horror story.",
  "Make a two-sentence horror story."
];

// ✅ Get daily challenge
app.get("/api/challenge", (req, res) => {
  const dayIndex = new Date().getDate() % challenges.length;
  res.json({ challenge: challenges[dayIndex] });
});

// ✅ Submit a response
app.post("/api/submit", (req, res) => {
  const { username, response } = req.body;
  if (!username || !response) return res.status(400).send("Missing data");

  if (!users[username]) users[username] = [];
  users[username].push(response);

  leaderboard[username] = (leaderboard[username] || 0) + 1;

  // Store votes for the new response
  const responseId = `${username}-${users[username].length - 1}`;
  votes[responseId] = 0; // Initialize votes at 0
  miniVotes[responseId] = 0; // Mini-votes start at 0

  res.json({ message: "Submitted!" });
});

// ✅ Get all responses with votes
app.get("/api/social", (req, res) => {
  res.json({
    responses: Object.entries(users).flatMap(([user, responses]) =>
      responses.map((response, index) => {
        const responseId = `${user}-${index}`;
        return {
          username: user,
          response,
          votes: votes[responseId] || 0,
          miniVotes: miniVotes[responseId] || 0,
          responseId, // Unique identifier for voting
        };
      })
    ),
  });
});

// ✅ Handle voting logic
app.post("/api/vote", (req, res) => {
  const { responseId, voteType } = req.body; // voteType: "upvote" or "mini-vote"
  if (!responseId || !["upvote", "mini-vote"].includes(voteType)) {
    return res.status(400).send("Invalid vote type");
  }

  if (voteType === "upvote") {
    votes[responseId] = (votes[responseId] || 0) + 1;
  } else if (voteType === "mini-vote") {
    miniVotes[responseId] = (miniVotes[responseId] || 0) + 1;

    // ✅ Convert mini-votes into an upvote when reaching 24
    if (miniVotes[responseId] >= 24) {
      votes[responseId] += 1;
      miniVotes[responseId] = 0; // Reset mini-votes
    }
  }

  res.json({
    success: true,
    votes: votes[responseId],
    miniVotes: miniVotes[responseId],
  });
});

// ✅ Get leaderboard
app.get("/api/leaderboard", (req, res) => {
  const sorted = Object.entries(leaderboard)
    .map(([username, challengesCompleted]) => ({ username, challengesCompleted }))
    .sort((a, b) => b.challengesCompleted - a.challengesCompleted);
  res.json({ leaderboard: sorted });
});

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));


app.listen(3000, () => console.log("Server running on http://localhost:3000"));

const backendURL = "http://localhost:3000"; // Change when deploying

let username = localStorage.getItem("username");

document.addEventListener("DOMContentLoaded", () => {
  if (username) startApp();
});

window.handleVerify = function handleVerify() {
  username = prompt("Enter your username:");
  if (!username) return;
  localStorage.setItem("username", username);
  startApp();
};

function startApp() {
  document.getElementById("verify-screen").classList.add("hidden");
  document.getElementById("app-screen").classList.remove("hidden");

  fetchChallenge();
  fetchSocialResponses();
  fetchLeaderboard();
}

// ✅ Updated tab switching logic
window.showTab = function showTab(tab) {
  document.querySelectorAll(".tab-content").forEach(div => div.classList.add("hidden"));
  document.getElementById(`${tab}-tab`).classList.remove("hidden");
};

// ✅ Fetch the daily challenge
function fetchChallenge() {
  fetch(`${backendURL}/api/challenge`)
    .then(res => res.json())
    .then(data => document.getElementById("challenge-text").innerText = data.challenge);
}

// ✅ Updated submission logic to hide textarea AND button
window.submitResponse = function submitResponse() {
  const responseInput = document.getElementById("response-input");
  const submitButton = document.querySelector("#submit-tab button"); // ✅ Get submit button
  const response = responseInput.value;

  if (!response.trim()) return alert("Write something!");

  fetch(`${backendURL}/api/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, response })
  }).then(() => {
    document.getElementById("submit-message").classList.remove("hidden");
    responseInput.classList.add("hidden"); // ✅ Hide textarea
    submitButton.classList.add("hidden"); // ✅ Hide submit button
  });
};

// ✅ Fetch all social responses (with votes)
function fetchSocialResponses() {
  fetch(`${backendURL}/api/social`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("social-feed").innerHTML = data.responses
        .map(
          r => `
          <div class="response">
            <p><strong>${r.username}:</strong> ${r.response}</p>
            <hr style="height: 1px; background-color: black; border: none;">
            <div class="vote-buttons">
              <button onclick="voteOnResponse('${r.responseId}', 1)">🟡</button>
              <span id="votes-${r.responseId}">${r.votes}</span>
              <p>|</p><button onclick="voteOnResponse('${r.responseId}', 'mini-vote')">⭐</button>
              <span id="mini-votes-${r.responseId}">${r.miniVotes}</span>
            </div>
          </div>`
        )
        .join("");
    });
}

// ✅ Handle voting
window.voteOnResponse = function voteOnResponse(responseId, voteType) {
  fetch(`${backendURL}/api/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ responseId, voteType }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById(`votes-${responseId}`).innerText = data.votes;
        document.getElementById(`mini-votes-${responseId}`).innerText = data.miniVotes;
      }
    })
    .catch(err => console.error("Voting failed", err));
};

// ✅ Fetch leaderboard rankings
function fetchLeaderboard() {
  fetch(`${backendURL}/api/leaderboard`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("leaderboard").innerHTML = data.leaderboard.map(
        (user, index) => `<p>${index + 1}. <strong>${user.username}</strong> - ${user.challengesCompleted} days</p>`
      ).join("");
    });
}

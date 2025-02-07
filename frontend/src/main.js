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

// ✅ Updated submission logic to hide textarea
window.submitResponse = function submitResponse() {
  const responseInput = document.getElementById("response-input");
  const response = responseInput.value;
  if (!response.trim()) return alert("Write something!");

  fetch(`${backendURL}/api/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, response })
  }).then(() => {
    document.getElementById("submit-message").classList.remove("hidden");
    responseInput.classList.add("hidden"); // ✅ Hides the textarea after submission
  });
};

// ✅ Fetch all social responses
function fetchSocialResponses() {
  fetch(`${backendURL}/api/social`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("social-feed").innerHTML = data.responses.map(
        r => `<p><strong>${r.username}:</strong> ${r.response}</p>`
      ).join("");
    });
}

// ✅ Fetch leaderboard rankings
function fetchLeaderboard() {
  fetch(`${backendURL}/api/leaderboard`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("leaderboard").innerHTML = data.leaderboard.map(
        (user, index) => `<p>${index + 1}. <strong>${user.username} - ${user.challengesCompleted} days</p>`
      ).join("");
    });
}
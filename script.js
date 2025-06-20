const choices = ["rock", "paper", "scissors"];
const userScoreSpan = document.getElementById("user-score");
const computerScoreSpan = document.getElementById("computer-score");
const resultDiv = document.getElementById("result");

let userScore = 0;
let computerScore = 0;

document.querySelectorAll(".choice").forEach(button => {
  button.addEventListener("click", () => {
    const userChoice = button.getAttribute("data-choice");
    playRound(userChoice);
  });
});

function playRound(userChoice) {
  const computerChoice = choices[Math.floor(Math.random() * 3)];
  let result = "";

  if (userChoice === computerChoice) {
    result = "It's a draw!";
  } else if (
    (userChoice === "rock" && computerChoice === "scissors") ||
    (userChoice === "paper" && computerChoice === "rock") ||
    (userChoice === "scissors" && computerChoice === "paper")
  ) {
    result = `You win! ${userChoice} beats ${computerChoice}`;
    userScore++;
  } else {
    result = `You lose! ${computerChoice} beats ${userChoice}`;
    computerScore++;
  }

  updateUI(result);
}

function updateUI(message) {
  userScoreSpan.textContent = userScore;
  computerScoreSpan.textContent = computerScore;
  resultDiv.textContent = message;
}

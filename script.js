// Cyber Rock Paper Scissors - Advanced Game Logic

class CyberRPSGame {
  constructor() {
    this.choices = ["rock", "paper", "scissors"];
    this.weaponEmojis = {
      rock: "🗿",
      paper: "📄", 
      scissors: "✂️"
    };
    
    // Game state
    this.userScore = 0;
    this.computerScore = 0;
    this.userStreak = 0;
    this.computerStreak = 0;
    this.maxUserStreak = 0;
    this.totalGames = 0;
    this.userChoiceHistory = [];
    this.gameHistory = [];
    
    // DOM elements
    this.initializeElements();
    this.attachEventListeners();
    this.loadGameData();
    
    // AI difficulty system
    this.aiDifficulty = 'normal';
    this.aiPatternMemory = [];
    
    console.log("🎮 Cyber RPS Game initialized");
  }
  
  initializeElements() {
    // Score elements
    this.userScoreElement = document.getElementById("user-score");
    this.computerScoreElement = document.getElementById("computer-score");
    this.userStreakElement = document.getElementById("user-streak");
    this.computerStreakElement = document.getElementById("computer-streak");
    
    // Display elements
    this.resultElement = document.getElementById("result");
    this.resultDetailsElement = document.getElementById("result-details");
    this.playerPreviewElement = document.getElementById("player-preview");
    this.aiPreviewElement = document.getElementById("ai-preview");
    
    // Control elements
    this.weaponButtons = document.querySelectorAll(".weapon-btn");
    this.resetButton = document.getElementById("reset-btn");
    this.statsButton = document.getElementById("stats-btn");
    
    // Modal elements
    this.statsModal = document.getElementById("stats-modal");
    this.closeModalButton = document.getElementById("close-modal");
    
    // Analytics elements
    this.totalGamesElement = document.getElementById("total-games");
    this.winRateElement = document.getElementById("win-rate");
    this.favoriteWeaponElement = document.getElementById("favorite-weapon");
    this.maxStreakElement = document.getElementById("max-streak");
  }
  
  attachEventListeners() {
    // Weapon selection
    this.weaponButtons.forEach(button => {
      button.addEventListener("click", (e) => {
        const choice = e.currentTarget.getAttribute("data-choice");
        this.playRound(choice);
        this.addButtonEffect(e.currentTarget);
      });
    });
    
    // Control buttons
    this.resetButton.addEventListener("click", () => this.resetGame());
    this.statsButton.addEventListener("click", () => this.showStatsModal());
    this.closeModalButton.addEventListener("click", () => this.hideStatsModal());
    
    // Modal close on outside click
    this.statsModal.addEventListener("click", (e) => {
      if (e.target === this.statsModal) {
        this.hideStatsModal();
      }
    });
    
    // Keyboard controls
    document.addEventListener("keydown", (e) => {
      switch(e.key.toLowerCase()) {
        case 'r':
          this.playRound('rock');
          break;
        case 'p':
          this.playRound('paper');
          break;
        case 's':
          this.playRound('scissors');
          break;
        case 'escape':
          this.hideStatsModal();
          break;
      }
    });
  }
  
  addButtonEffect(button) {
    button.style.transform = "translateY(-10px) scale(1.05)";
    button.style.boxShadow = "0 15px 40px rgba(0,255,65,0.5)";
    
    setTimeout(() => {
      button.style.transform = "";
      button.style.boxShadow = "";
    }, 200);
  }
  
  async playRound(userChoice) {
    // Disable buttons during animation
    this.setButtonsEnabled(false);
    
    // Show player choice immediately
    this.updatePlayerPreview(userChoice);
    
    // AI thinking animation
    await this.aiThinkingAnimation();
    
    // Get AI choice based on difficulty
    const computerChoice = this.getAIChoice();
    
    // Show AI choice
    this.updateAIPreview(computerChoice);
    
    // Determine winner
    const result = this.determineWinner(userChoice, computerChoice);
    
    // Update game state
    this.updateGameState(result, userChoice, computerChoice);
    
    // Display result with animation
    await this.displayResult(result, userChoice, computerChoice);
    
    // Save game data
    this.saveGameData();
    
    // Re-enable buttons
    this.setButtonsEnabled(true);
  }
  
  updatePlayerPreview(choice) {
    this.playerPreviewElement.innerHTML = `
      <div style="font-size: 4rem; position: relative; z-index: 2;">${this.weaponEmojis[choice]}</div>
      <div class="preview-text" style="position: relative; z-index: 2;">${choice.toUpperCase()}</div>
    `;
    this.playerPreviewElement.style.borderColor = "var(--primary-green)";
    this.playerPreviewElement.style.boxShadow = "0 0 30px rgba(0,255,65,0.5)";
  }
  
  updateAIPreview(choice) {
    this.aiPreviewElement.innerHTML = `
      <div style="font-size: 4rem; position: relative; z-index: 2;">${this.weaponEmojis[choice]}</div>
      <div class="preview-text" style="position: relative; z-index: 2;">${choice.toUpperCase()}</div>
    `;
    this.aiPreviewElement.style.borderColor = "var(--danger-red)";
    this.aiPreviewElement.style.boxShadow = "0 0 30px rgba(255,7,58,0.5)";
  }
  
  async aiThinkingAnimation() {
    const thinkingStates = ["ANALYZING...", "PROCESSING...", "CALCULATING...", "DECIDING..."];
    
    for (let i = 0; i < thinkingStates.length; i++) {
      this.aiPreviewElement.innerHTML = `
        <div class="preview-text" style="position: relative; z-index: 2; animation: pulse 0.5s infinite;">
          ${thinkingStates[i]}
        </div>
      `;
      await this.delay(300);
    }
  }
  
  getAIChoice() {
    // Simple AI with pattern recognition
    if (this.userChoiceHistory.length >= 3) {
      const lastThree = this.userChoiceHistory.slice(-3);
      const pattern = this.detectPattern(lastThree);
      
      if (pattern && Math.random() < 0.7) {
        return this.getCounterChoice(pattern);
      }
    }
    
    // Adaptive AI based on user's most frequent choice
    if (this.userChoiceHistory.length >= 5) {
      const mostFrequent = this.getMostFrequentChoice();
      if (Math.random() < 0.4) {
        return this.getCounterChoice(mostFrequent);
      }
    }
    
    // Random choice with slight bias
    const weights = [0.33, 0.33, 0.34];
    const random = Math.random();
    let sum = 0;
    
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random < sum) {
        return this.choices[i];
      }
    }
    
    return this.choices[Math.floor(Math.random() * 3)];
  }
  
  detectPattern(choices) {
    // Simple pattern detection for last 3 moves
    const patterns = {
      "rock,rock,rock": "rock",
      "paper,paper,paper": "paper", 
      "scissors,scissors,scissors": "scissors",
      "rock,paper,scissors": "rock",
      "scissors,paper,rock": "scissors"
    };
    
    const patternKey = choices.join(",");
    return patterns[patternKey] || null;
  }
  
  getMostFrequentChoice() {
    const counts = { rock: 0, paper: 0, scissors: 0 };
    this.userChoiceHistory.forEach(choice => counts[choice]++);
    
    return Object.keys(counts).reduce((a, b) => 
      counts[a] > counts[b] ? a : b
    );
  }
  
  getCounterChoice(choice) {
    const counters = {
      rock: "paper",
      paper: "scissors", 
      scissors: "rock"
    };
    return counters[choice];
  }
  
  determineWinner(userChoice, computerChoice) {
    if (userChoice === computerChoice) {
      return "draw";
    }
    
    const winConditions = {
      rock: "scissors",
      paper: "rock",
      scissors: "paper"
    };
    
    return winConditions[userChoice] === computerChoice ? "win" : "lose";
  }
  
  updateGameState(result, userChoice, computerChoice) {
    this.totalGames++;
    this.userChoiceHistory.push(userChoice);
    
    // Keep history manageable
    if (this.userChoiceHistory.length > 50) {
      this.userChoiceHistory.shift();
    }
    
    // Store game result
    this.gameHistory.push({
      userChoice,
      computerChoice,
      result,
      timestamp: Date.now()
    });
    
    // Update scores and streaks
    if (result === "win") {
      this.userScore++;
      this.userStreak++;
      this.computerStreak = 0;
      this.maxUserStreak = Math.max(this.maxUserStreak, this.userStreak);
    } else if (result === "lose") {
      this.computerScore++;
      this.computerStreak++;
      this.userStreak = 0;
    } else {
      this.userStreak = 0;
      this.computerStreak = 0;
    }
    
    this.updateScoreDisplay();
  }
  
  updateScoreDisplay() {
    this.userScoreElement.textContent = this.userScore;
    this.computerScoreElement.textContent = this.computerScore;
    this.userStreakElement.textContent = this.userStreak;
    this.computerStreakElement.textContent = this.computerStreak;
    
    // Add visual effects for streaks
    if (this.userStreak >= 3) {
      this.userStreakElement.style.color = "var(--primary-green)";
      this.userStreakElement.style.textShadow = "0 0 10px var(--primary-green)";
    } else {
      this.userStreakElement.style.color = "";
      this.userStreakElement.style.textShadow = "";
    }
    
    if (this.computerStreak >= 3) {
      this.computerStreakElement.style.color = "var(--danger-red)";
      this.computerStreakElement.style.textShadow = "0 0 10px var(--danger-red)";
    } else {
      this.computerStreakElement.style.color = "";
      this.computerStreakElement.style.textShadow = "";
    }
  }
  
  async displayResult(result, userChoice, computerChoice) {
    const messages = {
      win: [
        "VICTORY ACHIEVED!",
        "HUMAN SUPERIORITY CONFIRMED!",
        "AI SYSTEM DEFEATED!",
        "COMBAT SUCCESSFUL!"
      ],
      lose: [
        "SYSTEM FAILURE DETECTED!",
        "AI DOMINANCE ESTABLISHED!",
        "HUMAN ERROR DETECTED!",
        "COMBAT LOST!"
      ],
      draw: [
        "NEURAL DEADLOCK!",
        "SYSTEMS MATCHED!",
        "COMBAT DRAW!",
        "EQUAL PROCESSING POWER!"
      ]
    };
    
    const details = {
      win: `${this.weaponEmojis[userChoice]} ${userChoice.toUpperCase()} eliminates ${this.weaponEmojis[computerChoice]} ${computerChoice.toUpperCase()}`,
      lose: `${this.weaponEmojis[computerChoice]} ${computerChoice.toUpperCase()} destroys ${this.weaponEmojis[userChoice]} ${userChoice.toUpperCase()}`,
      draw: `Both systems deployed ${this.weaponEmojis[userChoice]} ${userChoice.toUpperCase()}`
    };
    
    // Clear previous classes
    this.resultElement.className = "result-text";
    
    // Random message selection
    const randomMessage = messages[result][Math.floor(Math.random() * messages[result].length)];
    
    this.resultElement.textContent = randomMessage;
    this.resultDetailsElement.textContent = details[result];
    
    // Add result class for styling
    this.resultElement.classList.add(result);
    
    // Special effects for streaks
    if (result === "win" && this.userStreak >= 3) {
      this.createFireworks();
    }
    
    await this.delay(100);
  }
  
  createFireworks() {
    const colors = ["var(--primary-cyan)", "var(--primary-purple)", "var(--primary-green)"];
    
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const firework = document.createElement("div");
        firework.style.position = "fixed";
        firework.style.width = "4px";
        firework.style.height = "4px";
        firework.style.background = colors[Math.floor(Math.random() * colors.length)];
        firework.style.borderRadius = "50%";
        firework.style.pointerEvents = "none";
        firework.style.zIndex = "9999";
        firework.style.left = Math.random() * window.innerWidth + "px";
        firework.style.top = Math.random() * window.innerHeight + "px";
        firework.style.boxShadow = `0 0 20px ${colors[Math.floor(Math.random() * colors.length)]}`;
        
        document.body.appendChild(firework);
        
        setTimeout(() => {
          if (firework.parentNode) {
            firework.parentNode.removeChild(firework);
          }
        }, 2000);
      }, i * 100);
    }
  }
  
  setButtonsEnabled(enabled) {
    this.weaponButtons.forEach(button => {
      button.disabled = !enabled;
      button.style.opacity = enabled ? "1" : "0.6";
      button.style.cursor = enabled ? "pointer" : "not-allowed";
    });
  }
  
  resetGame() {
    // Confirmation dialog
    if (this.totalGames > 0) {
      const confirmed = confirm("Are you sure you want to reset all game data?");
      if (!confirmed) return;
    }
    
    // Reset all game state
    this.userScore = 0;
    this.computerScore = 0;
    this.userStreak = 0;
    this.computerStreak = 0;
    this.maxUserStreak = 0;
    this.totalGames = 0;
    this.userChoiceHistory = [];
    this.gameHistory = [];
    
    // Reset UI
    this.updateScoreDisplay();
    this.resultElement.textContent = "INITIALIZE COMBAT PROTOCOL";
    this.resultElement.className = "result-text";
    this.resultDetailsElement.textContent = "";
    
    // Reset previews
    this.playerPreviewElement.innerHTML = '<div class="preview-text">Select Weapon</div>';
    this.aiPreviewElement.innerHTML = '<div class="preview-text">AI Thinking...</div>';
    this.playerPreviewElement.style.borderColor = "";
    this.playerPreviewElement.style.boxShadow = "";
    this.aiPreviewElement.style.borderColor = "";
    this.aiPreviewElement.style.boxShadow = "";
    
    // Clear saved data
    localStorage.removeItem("cyberRPSGameData");
    
    console.log("🔄 Game reset completed");
  }
  
  showStatsModal() {
    this.updateAnalytics();
    this.statsModal.style.display = "block";
    
    // Animate modal in
    const modalContent = this.statsModal.querySelector(".modal-content");
    modalContent.style.transform = "scale(0.8)";
    modalContent.style.opacity = "0";
    
    setTimeout(() => {
      modalContent.style.transform = "scale(1)";
      modalContent.style.opacity = "1";
      modalContent.style.transition = "all 0.3s ease";
    }, 10);
  }
  
  hideStatsModal() {
    const modalContent = this.statsModal.querySelector(".modal-content");
    modalContent.style.transform = "scale(0.8)";
    modalContent.style.opacity = "0";
    
    setTimeout(() => {
      this.statsModal.style.display = "none";
    }, 300);
  }
  
  updateAnalytics() {
    // Total games
    this.totalGamesElement.textContent = this.totalGames;
    
    // Win rate
    const winRate = this.totalGames > 0 ? 
      Math.round((this.userScore / this.totalGames) * 100) : 0;
    this.winRateElement.textContent = winRate + "%";
    
    // Favorite weapon
    if (this.userChoiceHistory.length > 0) {
      const favorite = this.getMostFrequentChoice();
      this.favoriteWeaponElement.textContent = 
        favorite.charAt(0).toUpperCase() + favorite.slice(1);
    } else {
      this.favoriteWeaponElement.textContent = "None";
    }
    
    // Max streak
    this.maxStreakElement.textContent = this.maxUserStreak;
  }
  
  saveGameData() {
    const gameData = {
      userScore: this.userScore,
      computerScore: this.computerScore,
      userStreak: this.userStreak,
      computerStreak: this.computerStreak,
      maxUserStreak: this.maxUserStreak,
      totalGames: this.totalGames,
      userChoiceHistory: this.userChoiceHistory,
      gameHistory: this.gameHistory.slice(-20) // Keep last 20 games
    };
    
    try {
      localStorage.setItem("cyberRPSGameData", JSON.stringify(gameData));
    } catch (error) {
      console.warn("Could not save game data:", error);
    }
  }
  
  loadGameData() {
    try {
      const savedData = localStorage.getItem("cyberRPSGameData");
      
      if (savedData) {
        const gameData = JSON.parse(savedData);
        
        this.userScore = gameData.userScore || 0;
        this.computerScore = gameData.computerScore || 0;
        this.userStreak = gameData.userStreak || 0;
        this.computerStreak = gameData.computerStreak || 0;
        this.maxUserStreak = gameData.maxUserStreak || 0;
        this.totalGames = gameData.totalGames || 0;
        this.userChoiceHistory = gameData.userChoiceHistory || [];
        this.gameHistory = gameData.gameHistory || [];
        
        this.updateScoreDisplay();
        console.log("💾 Game data loaded successfully");
      }
    } catch (error) {
      console.warn("Could not load game data:", error);
    }
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize game when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const game = new CyberRPSGame();
  
  // Add some debug info
  console.log(`
    🎮 CYBER RPS GAME CONTROLS:
    - Click weapon buttons to play
    - Press R for Rock, P for Paper, S for Scissors
    - Press ESC to close modals
    - Game data is automatically saved
  `);
  
  // Add version info to console
  console.log("🔥 Cyber RPS v2.1 - Neural Combat Simulator");
});
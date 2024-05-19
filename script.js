// Get references to DOM elements
const character = document.getElementById("character");
const blocks = [document.getElementById("block1"), document.getElementById("block2"), document.getElementById("block3")];
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");
const gameOverMessage = document.getElementById("gameOver");
const gameOverScore = document.getElementById("gameOverScore");

// Initialize game state variables
let jumping = false;
let gameStarted = false;
let paused = true; // Start with the game paused
let score = 0;
let highScore = 0;

// Retrieve the high score from storage
chrome.storage.sync.get(["highScore"], (result) => {
  if (result.highScore) {
    highScore = result.highScore;
    highScoreDisplay.textContent = "High Score: " + highScore;
  }
});

// Function to handle character jumping
function jump() {
  if (!jumping && gameStarted && !paused) {
    jumping = true;
    character.classList.add("animate");
    setTimeout(() => {
      character.classList.remove("animate");
      jumping = false;
    }, 500); // Match the animation duration
  }
}

// Function to check collision between character and blocks
function checkCollision() {
  const characterRect = character.getBoundingClientRect();
  
  for (let i = 0; i < blocks.length; i++) {
    const blockRect = blocks[i].getBoundingClientRect();
    
    if (
      characterRect.bottom >= blockRect.top &&
      characterRect.left <= blockRect.right &&
      characterRect.right >= blockRect.left
    ) {
      return true; // Collision detected
    }
  }
  
  return false; // No collision
}

// Function to toggle game state (pause/resume)
function toggleGame() {
  if (!paused) {
    character.style.animationPlayState = "paused";
    for (let i = 0; i < blocks.length; i++) {
      blocks[i].style.animationPlayState = "paused";
    }
  } else {
    character.style.animationPlayState = "running";
    for (let i = 0; i < blocks.length; i++) {
      blocks[i].style.animationPlayState = "running";
      blocks[i].style.display = "block"; // Show the blocks
    }
  }
  paused = !paused;
}

// Function to start the game
function startGame() {
  gameStarted = true;
  toggleGame();
  score = 0; // Reset the score to 0
  scoreDisplay.textContent = "Score: " + score; // Update the score display
}

// Event listener for keydown events
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") {
    if (gameStarted && !paused) {
      jump();
    }
  }  
  if (event.key === " ") {
    if (!gameStarted) {
      startGame();
      hideInstructions();
    } else if (paused) {
      startGame();
      gameOverMessage.style.display = "none";
    } else {
      toggleGame();
    }
    if (gameOverMessage.style.display === "block") {
      // Remove game over message if it's displayed
      gameOverMessage.style.display = "none";
      startGame(); // Start new game immediately
    }
  }
});

// Function to hide the instructions
function hideInstructions() {
  const instructions = document.getElementById("instructions");
  instructions.style.display = "none";
}

// Check collision and end the game
function gameLoop() {
  if (gameStarted && !paused) {
    if (checkCollision()) {
      paused = true;
      toggleGame();
      if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = "High Score: " + highScore;
        // Store the updated high score
        chrome.storage.sync.set({ highScore: highScore });
      }
      gameOverScore.textContent = score;
      gameOverMessage.style.display = "block";
      character.style.animationPlayState = "paused";
      for (let i = 0; i < blocks.length; i++) {
        blocks[i].style.animationPlayState = "paused";
        blocks[i].style.display = "none"; // Hide the blocks
      }
    } else {
      // Check if the blocks have passed the character
      const characterRight = parseInt(getComputedStyle(character).left) + parseInt(getComputedStyle(character).width);
      for (let i = 0; i < blocks.length; i++) {
        const blockLeft = parseInt(getComputedStyle(blocks[i]).left);
        if (blockLeft < characterRight) {
          // The block has passed the character without collision
          if (!paused) {
            score++;
            scoreDisplay.textContent = "Score: " + score;
          }
        }
      }
    }
  }

  requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);

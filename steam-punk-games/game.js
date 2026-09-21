/**
 * Clockwork Words - Timed Spiral Drill
 * Letters appear automatically as enemy escapes!
 * Type the current target letter before it reaches the edge.
 */

class ClockworkWordsTimedSpiral {
    constructor() {
        // Game state
        this.state = {
            isPlaying: false,
            isPaused: false,
            level: 1,
            score: 0,
            totalScore: 0,
            unlockedLevels: 1,
            spiralLetters: [],
            spinePoints: [],
            enemyProgress: 0, // 0.0 to 1.0 (0% to 100%)
            letterPool: '', // Current level's letter pool
            levelThreshold: 0, // Score needed to reach next level
            nextRevealTime: 0,
            lastTime: 0
        };

        // HOME ROW LETTERS (Always available for drills)
        this.homeRowLetters = 'asdfghjkl;';
        
        // Available letters by level
        this.availableLetters = {
            1: this.homeRowLetters,                 // Home row only
            2: 'qwertyuiop' + this.homeRowLetters, // + Top row
            3: this.availableLetters[2] + 'zxcvbnm', // + Bottom row
            4: this.availableLetters[3] + ' ,.'     // + Full keyboard
        };

        // Letter sequence length by level
        this.sequenceLengths = {
            1: 30, // Start with 30 letters
            2: 35,
            3: 40,
            4: 45
        };

        // Unlock thresholds
        this.unlockThresholds = {
            1: { threshold: 0, name: "Home Row", alwaysAvailable: true },
            2: { threshold: 100, name: "Top Row Explorer" },
            3: { threshold: 250, name: "Bottom Row Master" },
            4: { threshold: 500, name: "Keyboard Commander" }
        };

        // DOM elements
        this.elements = {
            clockFace: document.getElementById('clock-face'),
            clockHand: document.getElementById('clock-hand'),
            letterTrail: document.getElementById('letter-trail'),
            wordDisplay: document.getElementById('word-display'),
            playerInput: document.getElementById('player-input'),
            feedback: document.getElementById('feedback'),
            levelDisplay: document.getElementById('level-display'),
            scoreDisplay: document.getElementById('score-display'),
            timeDisplay: document.getElementById('time-display'),
            startBtn: document.getElementById('start-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            restartBtn: document.getElementById('restart-btn'),
            overlay: document.getElementById('overlay'),
            overlayTitle: document.getElementById('overlay-title'),
            overlayMessage: document.getElementById('overlay-message'),
            closeOverlay: document.getElementById('close-overlay'),
            enemy: null,
            escapeBar: null // Visual escape progress bar
        };

        // Initialize event listeners
        this.initEventListeners();
        
        // Load saved progress
        this.loadProgress();
    }

    initEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.restartBtn.addEventListener('click', () => this.resetGame());
        this.elements.closeOverlay.addEventListener('click', () => this.hideOverlay());

        // Input handling - type continuously, no Enter key!
        this.elements.playerInput.addEventListener('input', (e) => this.handleTyping(e));
        
        document.addEventListener('click', () => {
            if (this.state.isPlaying && !this.state.isPaused) {
                this.elements.playerInput.focus();
            }
        });
    }

    loadProgress() {
        try {
            const savedUnlocked = localStorage.getItem('clockworkWords_unlocked');
            const savedTotalScore = localStorage.getItem('clockworkWords_totalScore');
            
            if (savedUnlocked) this.state.unlockedLevels = parseInt(savedUnlocked);
            if (savedTotalScore) this.state.totalScore = parseInt(savedTotalScore);
        } catch (e) { console.log('Could not load progress', e); }
    }

    saveProgress() {
        try {
            localStorage.setItem('clockworkWords_unlocked', this.state.unlockedLevels);
            localStorage.setItem('clockworkWords_totalScore', this.state.totalScore);
        } catch (e) { console.log('Could not save progress', e); }
    }

    isLevelUnlocked(levelNum) {
        if (levelNum === 1) return true;
        const threshold = this.unlockThresholds[levelNum]?.threshold;
        return threshold !== undefined && this.state.totalScore >= threshold;
    }

    startGame() {
        if (!this.state.isPlaying) this.startSession();
        else if (this.state.isPaused) this.resumeGame();
    }

    startSession() {
        this.state.isPlaying = true;
        this.state.isPaused = false;
        this.state.timeRemaining = 45 + (this.state.level - 1) * 5;
        this.state.lettersTypedThisSession = 0;
        
        // Set level threshold based on level
        const thresholds = { 1: 100, 2: 250, 3: 500, 4: 1000 };
        this.state.levelThreshold = thresholds[this.state.level] || 1000;
        
        // Set letter pool based on level
        const maxUnlocked = Math.min(this.state.unlockedLevels, 4);
        this.state.letterPool = this.availableLetters[maxUnlocked];
        
        this.updateUI();
        this.hideOverlay();
        
        this.elements.startBtn.textContent = 'Pause Session';
        this.elements.pauseBtn.disabled = false;
        
        // Initialize escape bar if it doesn't exist
        if (!this.elements.escapeBar) {
            this.elements.escapeBar = document.createElement('div');
            this.elements.escapeBar.id = 'escape-progress';
            this.elements.escapeBar.style.position = 'absolute';
            this.elements.escapeBar.style.bottom = '20px';
            this.elements.escapeBar.style.left = '50%';
            this.elements.escapeBar.style.transform = 'translateX(-50%)';
            this.elements.escapeBar.style.width = '200px';
            this.elements.escapeBar.style.height = '8px';
            this.elements.escapeBar.style.background = 'rgba(61, 40, 23, 0.8)';
            this.elements.escapeBar.style.borderRadius = '4px';
            this.elements.escapeBar.style.border = '1px solid var(--steam-brass-gold)';
            this.elements.escapeBar.style.overflow = 'hidden';
            this.elements.escapeBar.style.zIndex = '5';
            
            const fill = document.createElement('div');
            fill.id = 'escape-fill';
            fill.style.width = '0%';
            fill.style.height = '100%';
            fill.style.background = 'linear-gradient(90deg, #ff4444, #ffaa00)';
            fill.style.transition = 'width 0.3s ease';
            
            this.elements.escapeBar.appendChild(fill);
            this.elements.clockFace.appendChild(this.elements.escapeBar);
        }
        
        // Reset enemy progress
        this.state.enemyProgress = 0;
        
        // Start the continuous drill
        this.startContinuousDrill();
    }

    resumeGame() {
        this.state.isPaused = false;
        this.elements.pauseBtn.textContent = 'Resume';
        this.state.lastTime = performance.now();
        this.state.gameLoopId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    togglePause() {
        if (!this.state.isPlaying) return;

        this.state.isPaused = !this.state.isPaused;
        
        if (this.state.isPaused) {
            cancelAnimationFrame(this.state.gameLoopId);
            this.elements.pauseBtn.textContent = 'Resume';
            this.showOverlay('PAUSED', 'Drill paused!');
        } else {
            this.resumeGame();
        }
    }

    gameLoop(currentTime) {
        if (!this.state.isPaused && this.state.isPlaying) {
            const deltaTime = (currentTime - this.state.lastTime) / 1000;
            this.state.lastTime = currentTime;

            // 1. Check if Enemy Escaped
            if (this.state.enemyProgress >= 1.0) {
                this.endSession(false); // Enemy escaped
                return;
            }

            // 2. Check if Level Complete (Score Threshold Reached)
            if (this.state.score >= this.state.levelThreshold) {
                this.onLevelComplete();
                return;
            }

            // 3. Update Enemy Progress (Constant slow movement)
            // Enemy moves 0.5% per second at Level 1, scales up with level
            const enemySpeed = 0.005 * this.state.level; // Level 1: 0.5%/s, Level 4: 2%/s
            this.state.enemyProgress += enemySpeed * deltaTime;
            
            // Update visual enemy position
            this.updateEnemyPosition();
            this.updateEscapeBar();

            // 4. Reveal next letter if it's time
            if (currentTime > this.state.nextRevealTime) {
                this.revealNextLetter();
            }

            this.updateUI();

            // Continue loop
            this.state.gameLoopId = requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    updateEscapeBar() {
        if (!this.elements.escapeBar || !this.state.spiralLetters.length) return;
        
        const maxIndex = Math.min(this.state.currentIndex, this.state.currentSequence.length - 1);
        const progressPercent = (maxIndex / this.state.currentSequence.length) * 100;
        
        const fill = document.getElementById('escape-fill');
        if (fill) {
            fill.style.width = `${progressPercent}%`;
            
            // Color changes as escape progresses
            if (progressPercent < 50) {
                fill.style.background = 'linear-gradient(90deg, #4a90e2, #ffd700)';
            } else if (progressPercent < 80) {
                fill.style.background = 'linear-gradient(90deg, #ffaa00, #ff4444)';
            } else {
                fill.style.background = 'linear-gradient(90deg, #ff4444, #ff0000)';
            }
        }
    }

    startContinuousDrill() {
        // Clear existing spiral layout
        this.elements.letterTrail.innerHTML = '';
        this.state.spiralLetters = [];
        this.state.spinePoints = [];
        
        // Create a visual path of 20 slots (enemy moves along this)
        const numSlots = 20;
        const centerX = 160;
        const centerY = 160;
        const maxRadius = 130;
        
        for (let i = 0; i < numSlots; i++) {
            const progress = i / Math.max(numSlots - 1, 1);
            const radius = progress * maxRadius;
            const angle = (progress * Math.PI) + (Math.PI / 2); // Counter-clockwise spiral
            
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            // Add visual slot marker (subtle dot)
            const slot = document.createElement('div');
            slot.className = 'letter-slot';
            slot.style.position = 'absolute';
            slot.style.left = `${x - 6}px`;
            slot.style.top = `${y - 6}px`;
            slot.style.width = '12px';
            slot.style.height = '12px';
            slot.style.background = 'rgba(184, 158, 108, 0.2)';
            slot.style.borderRadius = '50%';
            slot.style.zIndex = '1';
            
            this.elements.letterTrail.appendChild(slot);
            this.state.spinePoints.push({x, y});
        }
        
        // Reset enemy position
        if (!this.elements.enemy) {
            this.elements.enemy = document.createElement('div');
            this.elements.enemy.id = 'steam-enemy';
            this.elements.enemy.style.position = 'absolute';
            this.elements.enemy.style.width = '20px';
            this.elements.enemy.style.height = '20px';
            this.elements.enemy.style.background = '#ff4444';
            this.elements.enemy.style.borderRadius = '50%';
            this.elements.enemy.style.boxShadow = '0 0 10px #ff0000, 0 0 20px #ffaa00';
            this.elements.enemy.style.zIndex = '10';
            this.elements.enemy.innerHTML = '⚡';
            this.elements.letterTrail.appendChild(this.elements.enemy);
        }
        
        // Reset escape bar
        const fill = document.getElementById('escape-fill');
        if (fill) {
            fill.style.width = '0%';
            fill.style.background = 'linear-gradient(90deg, #ff4444, #ffaa00)';
        }
        
        // Reset state
        this.state.enemyProgress = 0;
        this.state.lastTime = performance.now();
        
        // Generate first letter
        this.revealNextLetter();
        
        // Start game loop
        this.state.gameLoopId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    updateEnemyPosition() {
        if (!this.elements.enemy) return;
        
        const centerX = 160;
        const centerY = 160;
        const maxRadius = 130;
        const numSlots = 20;
        
        // Calculate position along the spiral based on enemyProgress (0 to 1)
        const progress = this.state.enemyProgress;
        const slotIndex = Math.min(progress * (numSlots - 1), numSlots - 1);
        
        const r = (slotIndex / (numSlots - 1)) * maxRadius;
        const angle = (slotIndex / (numSlots - 1)) * Math.PI + (Math.PI / 2);
        
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        
        this.elements.enemy.style.left = `${x - 10}px`;
        this.elements.enemy.style.top = `${y - 10}px`;
    }

    handleTyping(event) {
        if (this.state.isPaused || !this.state.isPlaying) return;

        const typed = event.target.value.toLowerCase().trim();
        
        // Validate the letter just typed
        if (typed.length > 0) {
            this.validateSpiralLetter(typed);
        }
    }

    validateSpiralLetter(typedChar) {
        const targetLetter = this.currentTargetLetter;
        
        // Clear input after typing
        this.elements.playerInput.value = '';
        
        if (typedChar === targetLetter.toLowerCase()) {
            // Correct!
            this.handleCorrectLetter();
            
            // Auto-focus for continuous flow
            setTimeout(() => this.elements.playerInput.focus(), 50);
        } else {
            // Wrong letter - visual feedback
            this.elements.feedback.textContent = `❌ Try "${targetLetter.toUpperCase()}"!`;
            
            // Enemy gets a BIG jump on wrong answer (penalty)
            this.state.enemyProgress += 0.1; // 10% jump forward
            
            // Shake effect
            this.elements.wordDisplay.style.borderColor = '#ff4444';
            setTimeout(() => {
                this.elements.wordDisplay.style.borderColor = 'var(--steam-brass-gold)';
            }, 300);
        }
    }

    handleCorrectLetter() {
        const targetLetter = this.currentTargetLetter;
        
        // Calculate score
        const baseScore = 5;
        const isHomeRow = this.homeRowLetters.includes(targetLetter.toLowerCase());
        const bonusMultiplier = isHomeRow ? 1.5 : 1.0;
        
        const totalPoints = Math.floor(baseScore * bonusMultiplier);
        this.state.score += totalPoints;
        this.state.totalScore += totalPoints;
        
        this.elements.feedback.textContent = `+${totalPoints} points! ${isHomeRow ? '🌟' : ''}`;
        
        // Generate next letter immediately
        this.revealNextLetter();
        
        this.saveProgress();
        this.updateUI();
    }

    revealNextLetter() {
        // Generate random letter from current level's pool
        const letter = this.state.letterPool[Math.floor(Math.random() * this.state.letterPool.length)];
        
        // Display the letter (no spiral positions, just show it clearly)
        this.currentTargetLetter = letter;
        this.elements.wordDisplay.innerHTML = letter.toUpperCase();
        this.elements.feedback.textContent = `TYPE: "${letter.toUpperCase()}"!`;
        
        // Auto-focus input
        this.elements.playerInput.focus();
        
        // In this new model, the next letter appears immediately when you type the current one
        // (handled by the game loop checking nextRevealTime, but we set it to now)
        this.state.nextRevealTime = performance.now();
    }

    onLevelComplete() {
        // Level up!
        const bonus = 50; // Flat bonus for reaching threshold
        this.state.score += bonus;
        this.state.totalScore += bonus;
        
        if (this.state.level < 4) {
            this.state.level++;
            
            // Update threshold
            const thresholds = { 2: 250, 3: 500, 4: 1000 };
            this.state.levelThreshold = thresholds[this.state.level] || 1000;
            
            // Update letter pool
            const maxUnlocked = Math.min(this.state.unlockedLevels, 4);
            this.state.letterPool = this.availableLetters[maxUnlocked];
            
            // Reset enemy progress for new level
            this.state.enemyProgress = 0;
            
            // Visual feedback
            this.elements.feedback.textContent = `🎉 LEVEL UP! Target: ${this.state.levelThreshold} points!`;
            
            // Clear current display and show new level
            this.elements.wordDisplay.innerHTML = `LEVEL ${this.state.level}`;
            
            setTimeout(() => {
                this.revealNextLetter();
            }, 1000);
        } else {
            // Max level reached - end session with win
            this.endSession(true);
            return;
        }
        
        this.saveProgress();
        this.updateUI();
    }

    endSession(win) {
        this.state.isPlaying = false;
        cancelAnimationFrame(this.state.gameLoopId);

        let title, message;
        if (win) {
            title = '🎉 SPIRAL MASTER! 🎉';
            message = `You reached max level! Total score: ${this.state.totalScore} points.`;
        } else {
            title = '⚡ ESCAPED! ⚡';
            message = `The steam enemy escaped! Score: ${this.state.score} / ${this.state.levelThreshold}\nTry again!`;
        }

        this.showOverlay(title, message);
        this.elements.startBtn.textContent = 'Retry Level';
        this.elements.pauseBtn.disabled = true;
    }

    resetGame() {
        this.state.isPlaying = false;
        this.state.isPaused = false;
        this.state.level = 1;
        this.state.score = 0;
        this.state.enemyProgress = 0;
        
        // Reset threshold
        const thresholds = { 1: 100, 2: 250, 3: 500, 4: 1000 };
        this.state.levelThreshold = thresholds[this.state.level];
        this.state.letterPool = this.availableLetters[1];
        
        this.hideOverlay();
        this.elements.startBtn.textContent = 'Start Game';
        this.elements.pauseBtn.disabled = true;
        
        this.elements.wordDisplay.innerHTML = 'READY!';
        this.elements.feedback.textContent = 'Click Start to begin!';

        this.updateUI();
    }

    updateUI() {
        this.elements.levelDisplay.textContent = `Level ${this.state.level}`;
        this.elements.scoreDisplay.textContent = this.state.score;
        
        // Show "Score / Target" instead of timer
        this.elements.timeDisplay.textContent = `${this.state.score} / ${this.state.levelThreshold}`;
        this.elements.timeDisplay.style.color = '';
        
        // Update progress bar label to "Enemy Progress"
        const label = document.querySelector('.progress-label');
        if (label) label.textContent = 'Enemy Progress:';
        
        // Update progress bar width based on enemy progress
        const progressBar = document.getElementById('time-bar');
        if (progressBar) {
            progressBar.style.width = `${Math.max(0, this.state.enemyProgress * 100)}%`;
            
            // Color changes based on danger level
            if (this.state.enemyProgress < 0.5) {
                progressBar.style.background = 'linear-gradient(90deg, #4a90e2, #ffd700)';
            } else if (this.state.enemyProgress < 0.8) {
                progressBar.style.background = 'linear-gradient(90deg, #ffaa00, #ff4444)';
            } else {
                progressBar.style.background = 'linear-gradient(90deg, #ff4444, #ff0000)';
            }
        }
    }

    showOverlay(title, message) {
        this.elements.overlayTitle.textContent = title;
        this.elements.overlayMessage.textContent = message;
        this.elements.closeOverlay.textContent = 'Try Again';
        this.elements.closeOverlay.onclick = () => this.resetGame();
        this.elements.overlay.classList.remove('hidden');
    }

    hideOverlay() {
        this.elements.overlay.classList.add('hidden');
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new ClockworkWordsTimedSpiral();
    window.clockworkGame = game;
    console.log('Clockwork Words Timed Spiral Drill initialized!');
});

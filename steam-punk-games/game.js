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
            timeRemaining: 45,
            currentSequence: [],
            gameLoopId: null,
            lastTime: 0,
            lettersTypedThisSession: 0,
            totalScore: 0,
            unlockedLevels: 1,
            currentIndex: 0,
            spiralLetters: [],
            spinePoints: [],
            enemyPositionIndex: 0,
            lastRevealTime: 0,
            revealRate: 1000, // ms between letters (Level 1)
            isEnemyMoving: false
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
        
        // Adjust reveal rate based on level (faster as levels progress)
        this.state.revealRate = 1000 - ((this.state.level - 1) * 200); // Level 1: 1s, Level 4: 400ms
        
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
        
        // Start the spiral drill
        this.startSpiralDrill();
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
            
            this.state.timeRemaining -= deltaTime;
            
            // Visual timer: hand sweeps from -135° to +135°
            const maxTime = 45 + (this.state.level - 1) * 5;
            const progress = this.state.timeRemaining / maxTime;
            const rotation = progress * 270 - 135;
            
            this.elements.clockHand.style.transform = 
                `translateX(-50%) rotate(${rotation}deg)`;
            
            // Update escape bar
            this.updateEscapeBar();

            this.updateUI();

            if (this.state.timeRemaining <= 0) {
                this.endSession(false);
                return;
            }

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

    startSpiralDrill() {
        // Stop any existing game loop first
        if (this.state.gameLoopId) {
            cancelAnimationFrame(this.state.gameLoopId);
            this.state.gameLoopId = null;
        }
        
        // Clear existing spiral
        if (this.elements.enemy && this.elements.enemy.parentNode) {
            this.elements.enemy.parentNode.removeChild(this.elements.enemy);
        }
        
        const maxUnlocked = Math.min(this.state.unlockedLevels, 4);
        const letterPool = this.availableLetters[maxUnlocked];
        
        // Generate sequence of letters (25-30 for Level 1)
        const sequenceLength = this.sequenceLengths[this.state.level] || 30;
        let sequence = '';
        for (let i = 0; i < sequenceLength; i++) {
            const randomLetter = letterPool[Math.floor(Math.random() * letterPool.length)];
            sequence += randomLetter;
        }
        
        this.state.currentSequence = sequence.toLowerCase();
        this.state.currentIndex = 0;
        this.state.spiralLetters = [];
        this.state.spinePoints = [];
        this.state.enemyPositionIndex = 0;
        this.state.lastRevealTime = performance.now();
        this.state.isEnemyMoving = false;
        
        // Show all letter positions (initially hidden)
        this.showSpiralLayout(sequence);

        // Start the automatic reveal system
        this.state.lastTime = performance.now();
        this.state.gameLoopId = requestAnimationFrame((time) => this.revealLettersLoop(time));
    }

    showSpiralLayout(sequence) {
        const letters = sequence.split('');
        this.elements.letterTrail.innerHTML = '';
        
        const numLetters = letters.length;
        const centerX = 160;
        const centerY = 160;
        const maxRadius = 130;
        
        for (let i = 0; i < numLetters; i++) {
            const progress = i / Math.max(numLetters - 1, 1);
            const radius = progress * maxRadius;
            const angle = (progress * Math.PI) + (Math.PI / 2); // Counter-clockwise spiral
            
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            const dot = document.createElement('div');
            dot.className = 'letter-dot';
            dot.textContent = letters[i].toUpperCase();
            dot.style.left = `${x - 12}px`;
            dot.style.top = `${y - 12}px`;
            dot.style.opacity = '0'; // Hidden initially
            dot.style.transform = 'scale(0.5)';
            dot.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            const isVowel = 'aeiouAEIOU'.includes(letters[i]);
            dot.style.background = isVowel ? '#ffd700' : '#b89e6c';
            dot.dataset.letterIndex = i;
            dot.dataset.isTarget = 'false';
            
            this.elements.letterTrail.appendChild(dot);
            this.state.spiralLetters.push(dot);
            this.state.spinePoints.push({x, y});
        }
        
        // Add enemy element and escape bar
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
        } else {
            // Reset enemy position to center
            this.elements.enemy.style.left = `${centerX - 10}px`;
            this.elements.enemy.style.top = `${centerY - 10}px`;
        }
        
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
        } else {
            // Reset escape bar
            const fill = document.getElementById('escape-fill');
            if (fill) {
                fill.style.width = '0%';
            }
        }
        
        // Append both elements to letter trail
        this.elements.letterTrail.appendChild(this.elements.enemy);
        this.elements.letterTrail.appendChild(this.elements.escapeBar);
        
        console.log('🔧 Spiral initialized:', { sequenceLength: numLetters, enemy: !!this.elements.enemy, escapeBar: !!this.elements.escapeBar });
    }

    revealLettersLoop(currentTime) {
        if (!this.state.isPlaying || this.state.isPaused) {
            this.state.gameLoopId = requestAnimationFrame((time) => this.revealLettersLoop(time));
            return;
        }

        // Check if enemy should move (current target letter typed)
        if (this.state.currentIndex >= this.state.currentSequence.length) {
            // All letters revealed - wait for completion check
            setTimeout(() => {
                if (this.state.lettersTypedThisSession === this.state.currentSequence.length) {
                    this.onSpiralComplete();
                } else {
                    this.endSession(false);
                }
            }, 2000);
            this.state.gameLoopId = requestAnimationFrame((time) => this.revealLettersLoop(time));
            return;
        }

        // Calculate time since last reveal
        const timeSinceLastReveal = currentTime - this.state.lastRevealTime;
        
        if (timeSinceLastReveal >= this.state.revealRate && !this.state.isEnemyMoving) {
            // Reveal next letter!
            this.revealNextLetter(currentTime);
            
            this.state.gameLoopId = requestAnimationFrame((time) => this.revealLettersLoop(time));
            return;
        }

        this.state.gameLoopId = requestAnimationFrame((time) => this.revealLettersLoop(time));
    }

    revealNextLetter(currentTime) {
        if (this.state.currentIndex >= this.state.currentSequence.length) return;
        
        const letter = this.state.currentSequence[this.state.currentIndex];
        const dot = this.state.spiralLetters[this.state.currentIndex];
        
        if (dot && this.elements.enemy) {
            // Reveal this letter
            dot.style.opacity = '1';
            dot.style.transform = 'scale(1.2)'; // Pulse effect
            
            // Mark as current target
            dot.dataset.isTarget = 'true';
            
            // Update feedback
            this.elements.feedback.textContent = `TYPE: "${letter.toUpperCase()}"!`;
            
            // Move enemy to this position (it's "escaping" along the spiral)
            this.moveEnemyToPosition(this.state.spinePoints[this.state.currentIndex]);
            
            // Auto-focus input
            this.elements.playerInput.focus();
            
            // Reset enemy to stationary state after move
            setTimeout(() => {
                this.state.isEnemyMoving = false;
            }, 300);
        }

        // Update time tracking
        this.state.lastRevealTime = currentTime;
        this.state.currentIndex++;
    }

    moveEnemyToPosition(position) {
        if (!this.elements.enemy || !position) return;
        
        const targetX = position.x - 10; // Center of enemy (20px size)
        const targetY = position.y - 10;
        const currentEnemyX = this.elements.enemy.offsetLeft;
        const currentEnemyY = this.elements.enemy.offsetTop;
        
        // Smooth movement animation
        this.state.isEnemyMoving = true;
        
        // Simple lerp for smooth movement (or instant snap for urgency)
        const lerpedX = currentEnemyX + (targetX - currentEnemyX) * 0.6;
        const lerpedY = currentEnemyY + (targetY - currentEnemyY) * 0.6;
        
        this.elements.enemy.style.left = `${lerpedX}px`;
        this.elements.enemy.style.top = `${lerpedY}px`;
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
        const currentIndex = this.state.currentIndex;
        const targetLetter = this.state.currentSequence[currentIndex];
        
        // Clear input after typing
        this.elements.playerInput.value = '';
        
        if (typedChar === targetLetter.toLowerCase()) {
            // Correct! Enemy will move to next position
            this.handleCorrectSpiralLetter();
            
            // Auto-focus for continuous flow
            setTimeout(() => this.elements.playerInput.focus(), 50);
        } else {
            // Wrong letter - visual feedback
            this.elements.feedback.textContent = `❌ Try "${targetLetter.toUpperCase()}"!`;
            this.state.timeRemaining = Math.max(5, this.state.timeRemaining - 1);
            
            // Shake effect on word display
            this.elements.wordDisplay.style.borderColor = '#ff4444';
            setTimeout(() => {
                this.elements.wordDisplay.style.borderColor = 'var(--steam-brass-gold)';
            }, 300);
        }
    }

    handleCorrectSpiralLetter() {
        const currentIndex = this.state.currentIndex - 1; // Just completed
        
        // Calculate score for letter (home row bonus!)
        const baseScore = 5;
        const timeBonus = Math.floor(this.state.timeRemaining) * 2;
        
        const isHomeRow = this.homeRowLetters.includes(
            this.state.currentSequence[currentIndex].toLowerCase()
        );
        const bonusMultiplier = isHomeRow ? 1.5 : 1.0;
        
        const totalPoints = Math.floor((baseScore + timeBonus) * bonusMultiplier);
        this.state.score += totalPoints;
        this.state.totalScore += totalPoints;
        
        this.state.lettersTypedThisSession++;
        this.elements.feedback.textContent = `+${totalPoints} points! ${isHomeRow ? '🌟' : ''}`;
        
        // Update spiral to mark completed letter (dim it)
        const dot = this.state.spiralLetters[currentIndex];
        if (dot) {
            dot.style.opacity = '0.4';
            dot.style.transform = 'scale(0.8)';
            dot.dataset.isTarget = 'false';
        }
        
        // Check if all letters completed
        if (this.state.currentIndex >= this.state.currentSequence.length) {
            setTimeout(() => this.onSpiralComplete(), 500);
        } else {
            // Enemy will automatically move to next position in next loop iteration
            setTimeout(() => this.elements.playerInput.focus(), 300);
        }
        
        this.saveProgress();
        this.updateUI();
    }

    onSpiralComplete() {
        const sequenceLength = this.state.currentSequence.length;
        const baseScore = sequenceLength * 10;
        const timeBonus = Math.floor(this.state.timeRemaining) * 3;
        
        // Check if all letters were home-row (full bonus!)
        const isPureHomeRow = this.state.currentSequence.split('').every(
            letter => this.homeRowLetters.includes(letter.toLowerCase())
        );
        const bonusMultiplier = isPureHomeRow ? 1.5 : 1.0;
        
        const totalPoints = Math.floor((baseScore + timeBonus) * bonusMultiplier);
        
        this.state.score += totalPoints;
        this.state.totalScore += totalPoints;
        
        this.elements.feedback.textContent = 
            `🎉 SEQUENCE COMPLETE! +${totalPoints} points! ${isPureHomeRow ? '🌟 PURE HOME ROW BONUS!' : ''}`;

        // Progress tracking (10 sequences to advance level)
        this.state.lettersTypedThisSession += sequenceLength;
        const sequencesCompleted = Math.floor(this.state.lettersTypedThisSession / sequenceLength);

        if (sequencesCompleted >= 10 && this.state.level < 4) {
            this.state.level++;
            this.state.timeRemaining = 45 + (this.state.level - 1) * 5;
            
            // Increase reveal speed at higher levels
            this.state.revealRate = Math.max(400, 1000 - ((this.state.level - 1) * 200));
            
            this.elements.feedback.textContent = `LEVEL UP! Now at Level ${this.state.level}`;
        } else if (sequencesCompleted >= 10 && this.state.level >= 4) {
            this.endSession(true);
            return;
        }

        // Generate next sequence after delay
        setTimeout(() => this.startSpiralDrill(), 800);

        this.saveProgress();
    }

    endSession(win) {
        this.state.isPlaying = false;
        cancelAnimationFrame(this.state.gameLoopId);

        if (win) {
            this.showOverlay('🎉 SPIRAL COMPLETE! 🎉', `Total score: ${this.state.score} points.`);
        } else {
            this.showOverlay('GAME OVER', `Time's up! Total score: ${this.state.score} points.`);
        }

        this.elements.startBtn.textContent = 'Start Spiral';
        this.elements.pauseBtn.disabled = true;
    }

    resetGame() {
        this.state.isPlaying = false;
        this.state.isPaused = false;
        this.state.level = 1;
        this.state.score = 0;
        this.state.lettersTypedThisSession = 0;
        this.state.timeRemaining = 45;
        this.state.revealRate = 1000;
        
        this.hideOverlay();
        this.elements.startBtn.textContent = 'Start Spiral';
        this.elements.pauseBtn.disabled = true;
        
        const sampleWord = 'asdfghjkl;'; // Full home row
        this.elements.wordDisplay.innerHTML = `<span style="color: var(--steam-brass-gold)">SAMPLE: ${sampleWord.toUpperCase()}</span>`;

        this.updateUI();
    }

    updateUI() {
        this.elements.levelDisplay.textContent = `Level ${this.state.level}`;
        this.elements.scoreDisplay.textContent = this.state.score;
        
        const timeFormatted = Math.max(0, Math.ceil(this.state.timeRemaining));
        this.elements.timeDisplay.textContent = `${timeFormatted}s`;

        if (timeFormatted <= 5) {
            this.elements.timeDisplay.style.color = '#ff4444';
        } else {
            this.elements.timeDisplay.style.color = '';
        }

        const maxTime = 45 + (this.state.level - 1) * 5;
        document.getElementById('time-bar').style.width = `${Math.max(0, (this.state.timeRemaining / maxTime) * 100)}%`;
    }

    showOverlay(title, message) {
        this.elements.overlayTitle.textContent = title;
        this.elements.overlayMessage.textContent = message;
        this.elements.closeOverlay.textContent = 'Start Spiral';
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
    console.log('🔧 Clockwork Words Timed Spiral Drill initialized!');
});

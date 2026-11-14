/**
 * Clockwork Words - Spiral Drill Mode
 * Pure letter-by-letter typing drill!
 * No words, no Enter key - just type the pulsing letter as fast as you can!
 */

class ClockworkWordsSpiral {
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
            letterRevealInterval: null
        };

        // HOME ROW LETTERS (Always available for drills)
        this.homeRowLetters = 'asdfghjkl;';
        
        // Available letters by level (progressive unlock)
        this.availableLetters = {
            1: this.homeRowLetters,                 // Home row only
            2: 'qwertyuiop' + this.homeRowLetters, // + Top row
            3: this.availableLetters[2] + 'zxcvbnm',// + Bottom row
            4: this.availableLetters[3] + ' ,.'     // + Full keyboard
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
            sequenceDisplay: null // Display current target letter
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

        // Input handling - no Enter key, just type continuously!
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
        
        this.updateUI();
        this.hideOverlay();
        
        this.elements.startBtn.textContent = 'Pause Session';
        this.elements.pauseBtn.disabled = false;
        
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
            if (this.state.letterRevealInterval) clearInterval(this.state.letterRevealInterval);
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
            
            this.updateUI();

            if (this.state.timeRemaining <= 0) {
                this.endSession(false);
                return;
            }

            this.state.gameLoopId = requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    startSpiralDrill() {
        // Clear existing spiral
        if (this.elements.enemy && this.elements.enemy.parentNode) {
            this.elements.enemy.parentNode.removeChild(this.elements.enemy);
        }
        
        const maxUnlocked = Math.min(this.state.unlockedLevels, 4);
        const letterPool = this.availableLetters[maxUnlocked];
        
        // Generate a random sequence of letters (10-15 letters total)
        const sequenceLength = Math.floor(Math.random() * 6) + 10; // 10-15 letters
        let sequence = '';
        for (let i = 0; i < sequenceLength; i++) {
            const randomLetter = letterPool[Math.floor(Math.random() * letterPool.length)];
            sequence += randomLetter;
        }
        
        this.state.currentSequence = sequence.toLowerCase();
        this.state.currentIndex = 0;
        this.state.spiralLetters = [];
        this.state.spinePoints = [];
        
        // Show all letters around clock face (initially hidden)
        this.showSpiralLayout(sequence);

        // Start revealing letters one by one
        setTimeout(() => this.revealNextLetter(), 300);
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
            const angle = (progress * Math.PI) + (Math.PI / 2);
            
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            const dot = document.createElement('div');
            dot.className = 'letter-dot';
            dot.textContent = letters[i].toUpperCase();
            dot.style.left = `${x - 12}px`;
            dot.style.top = `${y - 12}px`;
            dot.style.opacity = '0'; // Initially hidden
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
        
        // Add enemy element
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
        } else {
            // Reset enemy position to center
            this.elements.enemy.style.left = `${centerX - 10}px`;
            this.elements.enemy.style.top = `${centerY - 10}px`;
        }
        
        this.elements.wordDisplay.textContent = 'TYPE THE LATTER!';
        this.elements.feedback.textContent = `Level ${this.state.level} - Home Row Letters Only`;
    }

    revealNextLetter() {
        if (!this.state.isPlaying || this.state.isPaused) return;
        
        if (this.state.currentIndex >= this.state.currentSequence.length) {
            // All letters revealed, wait for completion
            setTimeout(() => {
                // Check if player typed everything correctly
                if (this.state.lettersTypedThisSession === this.state.currentSequence.length) {
                    this.onSpiralComplete();
                } else {
                    // Time ran out or incomplete
                    this.endSession(false);
                }
            }, 2000);
            return;
        }

        const letter = this.state.currentSequence[this.state.currentIndex];
        const dot = this.state.spiralLetters[this.state.currentIndex];
        
        if (dot) {
            // Reveal this letter
            dot.style.opacity = '1';
            dot.style.transform = 'scale(1)';
            
            // Mark as current target (pulsing gold)
            dot.dataset.isTarget = 'true';
            
            // Reset feedback to prompt for this specific letter
            this.elements.feedback.textContent = `Type: "${letter.toUpperCase()}"`;
            
            // Auto-focus input
            setTimeout(() => this.elements.playerInput.focus(), 100);
            
            // Move enemy to this letter position
            this.updateEnemyPosition(this.state.spinePoints[this.state.currentIndex]);
        }

        // Schedule next letter reveal (with a slight delay between reveals)
        this.state.letterRevealInterval = setTimeout(() => {
            if (this.state.currentIndex < this.state.currentSequence.length - 1) {
                this.revealNextLetter();
            }
        }, 800); // 800ms between letter reveals for comfortable pacing
    }

    updateEnemyPosition(position) {
        if (!this.elements.enemy || !position) return;
        
        const targetX = position.x - 10; // Center of enemy (20px size)
        const targetY = position.y - 10;
        const currentEnemyX = this.elements.enemy.offsetLeft;
        const currentEnemyY = this.elements.enemy.offsetTop;
        
        // Simple lerp for smooth movement
        const lerpedX = currentEnemyX + (targetX - currentEnemyX) * 0.5;
        const lerpedY = currentEnemyY + (targetY - currentEnemyY) * 0.5;
        
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
            // Correct! Move to next letter
            this.handleCorrectSpiralLetter();
            
            // Auto-focus for continuous flow
            setTimeout(() => this.elements.playerInput.focus(), 50);
        } else {
            // Wrong letter - visual feedback
            this.elements.feedback.textContent = `❌ Try "${targetLetter.toUpperCase()}"`;
            this.state.timeRemaining = Math.max(5, this.state.timeRemaining - 1);
            
            // Shake effect on word display
            this.elements.wordDisplay.style.borderColor = '#ff4444';
            setTimeout(() => {
                this.elements.wordDisplay.style.borderColor = 'var(--steam-brass-gold)';
            }, 300);
        }
    }

    handleCorrectSpiralLetter() {
        const currentIndex = this.state.currentIndex;
        
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
        
        // Update spiral to mark completed letter
        const dot = this.state.spiralLetters[currentIndex];
        if (dot) {
            dot.style.opacity = '0.4';
            dot.style.transform = 'scale(0.8)';
            dot.dataset.isTarget = 'false';
        }
        
        // Move to next letter
        this.state.currentIndex++;
        
        // Check if all letters completed
        if (this.state.currentIndex >= this.state.currentSequence.length) {
            setTimeout(() => this.onSpiralComplete(), 500);
        } else {
            // Prepare for next letter reveal
            setTimeout(() => this.revealNextLetter(), 300);
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
        const wordsCompleted = Math.floor(this.state.lettersTypedThisSession / sequenceLength);

        if (wordsCompleted >= 10 && this.state.level < 4) {
            this.state.level++;
            this.state.timeRemaining = 45 + (this.state.level - 1) * 5;
            this.elements.feedback.textContent = `LEVEL UP! Now at Level ${this.state.level}`;
        } else if (wordsCompleted >= 10 && this.state.level >= 4) {
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
        if (this.state.letterRevealInterval) clearInterval(this.state.letterRevealInterval);

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
        
        this.hideOverlay();
        this.elements.startBtn.textContent = 'Start Spiral';
        this.elements.pauseBtn.disabled = true;
        
        const sampleWord = 'asdf'; // Home row example
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
    const game = new ClockworkWordsSpiral();
    window.clockworkGame = game;
    console.log('🔧 Clockwork Words Spiral Drill Mode initialized!');
});

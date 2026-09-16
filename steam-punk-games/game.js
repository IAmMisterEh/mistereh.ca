/**
 * Clockwork Words - Steampunk Typing Game
 * Core game logic and mechanics
 */

class ClockworkWords {
    constructor() {
        // Game state
        this.state = {
            isPlaying: false,
            isPaused: false,
            level: 1,
            score: 0,
            timeRemaining: 30,
            currentWord: '',
            wordIndex: 0,
            wordsTypedThisRound: 0,
            maxWordsPerLevel: 10,
            clockHandRotation: 0,
            gameLoopId: null,
            lastTime: 0
        };

        // Word lists by difficulty (expandable)
        this.wordLists = {
            easy: ['clock', 'steam', 'gear', 'brass', 'copper', 'bronze', 'smith', 'forge', 'anvil', 'piston', 
                   'lever', 'valve', 'wrench', 'gauge', 'boiler', 'engine', 'turbine', 'shaft', 'axle', 'flywheel'],
            medium: ['mechanism', 'instrument', 'telegraph', 'explosion', 'industrial', 'manufacture', 'precision', 
                     'automation', 'construction', 'engineering', 'discovery', 'invention', 'laboratory', 
                     'observation', 'calibration', 'transmission', 'propulsion', 'compression', 'rotation', 'velocity'],
            hard: ['microscopic', 'mechanically', 'automotive', 'atmospheric', 'technological', 'instrumental', 
                   'manufacturing', 'engineeringly', 'observational', 'calibrating', 'transmissional', 
                   'propulsive', 'compressional', 'rotational', 'kinematical', 'geometrically', 'dynamically', 
                   'metallurgy', 'aeronautical', 'architectural']
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
            timeBar: document.getElementById('time-bar'),
            startBtn: document.getElementById('start-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            restartBtn: document.getElementById('restart-btn'),
            overlay: document.getElementById('overlay'),
            overlayTitle: document.getElementById('overlay-title'),
            overlayMessage: document.getElementById('overlay-message'),
            finalScore: document.getElementById('final-score'),
            finalLevel: document.getElementById('final-level'),
            closeOverlay: document.getElementById('close-overlay')
        };

        // Initialize event listeners
        this.initEventListeners();
    }

    /**
     * Initialize all event listeners and UI state
     */
    initEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.restartBtn.addEventListener('click', () => this.resetGame());
        this.elements.closeOverlay.addEventListener('click', () => this.hideOverlay());
        
        // Input handling with enter key support
        this.elements.playerInput.addEventListener('input', (e) => this.handleTyping(e));
        this.elements.playerInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.validateWord();
            }
        });

        // Handle focus for mobile keyboards
        document.addEventListener('click', () => {
            if (this.state.isPlaying && !this.state.isPaused) {
                this.elements.playerInput.focus();
            }
        });
    }

    /**
     * Start or resume the game
     */
    startGame() {
        if (!this.state.isPlaying) {
            this.startLevel();
        } else if (this.state.isPaused) {
            this.resumeGame();
        }
    }

    /**
     * Start a new level
     */
    startLevel() {
        this.state.isPlaying = true;
        this.state.isPaused = false;
        this.state.timeRemaining = 30 + (this.state.level - 1) * 5; // Extra time per level
        this.state.wordsTypedThisRound = 0;
        this.state.wordIndex = 0;

        this.updateUI();
        this.hideOverlay();
        
        // Enable controls
        this.elements.startBtn.textContent = 'Pause Game';
        this.elements.pauseBtn.disabled = false;
        this.elements.restartBtn.disabled = false;

        // Focus input and start game loop
        this.elements.playerInput.focus();
        this.state.lastTime = performance.now();
        this.state.gameLoopId = requestAnimationFrame((time) => this.gameLoop(time));

        // Generate first word
        this.generateNewWord();
    }

    /**
     * Resume paused game
     */
    resumeGame() {
        this.state.isPaused = false;
        this.elements.pauseBtn.textContent = 'Pause';
        this.elements.timeDisplay.style.color = '';
        
        this.state.lastTime = performance.now();
        this.state.gameLoopId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    /**
     * Toggle pause state
     */
    togglePause() {
        if (!this.state.isPlaying || this.state.wordsTypedThisRound >= this.state.maxWordsPerLevel) return;

        this.state.isPaused = !this.state.isPaused;
        
        if (this.state.isPaused) {
            cancelAnimationFrame(this.state.gameLoopId);
            this.elements.pauseBtn.textContent = 'Resume';
            this.elements.timeDisplay.style.color = '#ff6b35';
            this.showOverlay('PAUSED', 'Game paused! Click Resume to continue.', false);
        } else {
            this.resumeGame();
        }
    }

    /**
     * Main game loop for time tracking and clock hand animation
     */
    gameLoop(currentTime) {
        if (!this.state.isPaused && this.state.isPlaying) {
            const deltaTime = (currentTime - this.state.lastTime) / 1000; // seconds
            this.state.lastTime = currentTime;

            // Decrease time
            this.state.timeRemaining -= deltaTime;
            
            // Update clock hand rotation (360 degrees in 30 seconds base, more per level)
            const maxTime = 30 + (this.state.level - 1) * 5;
            this.state.clockHandRotation = (this.state.timeRemaining / maxTime) * 360;
            
            // Update UI
            this.updateUI();

            // Check for time expiration
            if (this.state.timeRemaining <= 0) {
                this.endGame(false);
                return;
            }

            // Continue loop
            this.state.gameLoopId = requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    /**
     * Generate a new word based on current level difficulty
     */
    generateNewWord() {
        const difficulty = this.state.level <= 3 ? 'easy' : 
                          this.state.level <= 7 ? 'medium' : 'hard';
        
        const words = this.wordLists[difficulty];
        const wordIndex = Math.floor(Math.random() * words.length);
        
        this.state.currentWord = words[wordIndex];
        this.state.wordsTypedThisRound++;

        // Update display with underscores for untyped letters
        this.elements.wordDisplay.textContent = '_'.repeat(this.state.currentWord.length);
        this.elements.playerInput.value = '';
        this.elements.feedback.textContent = '';

        // Position letters around clock face
        this.positionLettersAroundClock();
    }

    /**
     * Position letter dots around the clock face perimeter
     */
    positionLettersAroundClock() {
        // Clear previous dots
        this.elements.letterTrail.innerHTML = '';
        
        const numLetters = this.state.currentWord.length;
        const radius = 130; // distance from center
        const centerX = 160; // clock face width/2
        const centerY = 160; // clock face height/2

        for (let i = 0; i < numLetters; i++) {
            const angle = (i / numLetters) * Math.PI * 2; // evenly spaced
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            const dot = document.createElement('div');
            dot.className = 'letter-dot';
            dot.textContent = this.state.currentWord[i];
            dot.style.left = `${x - 12}px`; // center the 24px dot
            dot.style.top = `${y - 12}px`;
            
            this.elements.letterTrail.appendChild(dot);
        }

        // Animate clock hand to show current letter position
        const progress = this.state.wordIndex / numLetters;
        const rotation = progress * 360;
        this.elements.clockHand.style.transform = 
            `translateX(-50%) rotate(${rotation}deg)`;
    }

    /**
     * Handle player typing input
     */
    handleTyping(event) {
        if (this.state.isPaused || !this.state.isPlaying) return;

        const typed = event.target.value.toLowerCase();
        const currentWord = this.state.currentWord;
        const typedLength = typed.length;

        // Clear previous feedback
        this.elements.feedback.textContent = '';

        // Highlight correctly typed letters
        let highlightedWord = '';
        for (let i = 0; i < Math.min(typedLength, currentWord.length); i++) {
            if (typed[i] === currentWord[i]) {
                highlightedWord += `<span style="color: var(--steam-glow-gold)">${currentWord[i]}</span>`;
            } else {
                highlightedWord += '<span style="color: #ff6b35">';
            }
        }

        // Show untyped letters as underscores
        for (let i = typedLength; i < currentWord.length; i++) {
            if (i < currentWord.length - 1) {
                highlightedWord += '___';
            }
        }

        this.elements.wordDisplay.innerHTML = highlightedWord || '_'.repeat(currentWord.length);
    }

    /**
     * Validate the word when player completes it
     */
    validateWord() {
        if (this.state.isPaused) return;

        const typed = this.elements.playerInput.value.toLowerCase().trim();
        
        if (typed === this.state.currentWord) {
            // Correct!
            this.onCorrectWord(typed);
        } else {
            // Incorrect - visual feedback
            this.elements.wordDisplay.style.borderColor = '#ff4444';
            setTimeout(() => {
                this.elements.wordDisplay.style.borderColor = 'var(--steam-brass-gold)';
            }, 300);

            this.elements.feedback.textContent = `Try again! The word is "${this.state.currentWord}"`;
            
            // Penalty: reduce time by 2 seconds
            this.state.timeRemaining = Math.max(0, this.state.timeRemaining - 2);
        }
    }

    /**
     * Handle successful word completion
     */
    onCorrectWord(word) {
        // Calculate score based on word length and speed bonus
        const baseScore = word.length * 10;
        const timeBonus = Math.floor(this.state.timeRemaining) * 2;
        const totalPoints = baseScore + timeBonus;

        this.state.score += totalPoints;
        this.elements.feedback.textContent = `Perfect! +${totalPoints} points`;

        // Update word display to show completed word
        this.elements.wordDisplay.innerHTML = 
            `<span style="color: var(--steam-glow-gold)">${word}</span>`;

        // Level progression
        if (this.state.wordsTypedThisRound >= this.state.maxWordsPerLevel) {
            this.completeLevel();
        } else {
            // Generate next word
            setTimeout(() => {
                this.generateNewWord();
            }, 500);
        }

        // Update UI
        this.updateUI();
    }

    /**
     * Complete a level and start the next
     */
    completeLevel() {
        const levelCompleted = true;
        
        // Show completion overlay
        this.showOverlay(
            'LEVEL COMPLETE!', 
            `Excellent work! You reached level ${this.state.level} with ${this.state.score} points.`,
            true,
            () => {
                this.state.level++;
                this.startLevel();
            }
        );

        // Add bonus for speed
        const timeBonus = Math.floor(this.state.timeRemaining) * 5;
        if (timeBonus > 0) {
            setTimeout(() => {
                alert(`Time bonus: +${timeBonus} points!`);
            }, 1000);
        }
    }

    /**
     * End the game completely
     */
    endGame(win) {
        this.state.isPlaying = false;
        cancelAnimationFrame(this.state.gameLoopId);

        if (win) {
            this.showOverlay(
                '🎉 ALL LEVELS COMPLETE! 🎉',
                `Incredible! Final score: ${this.state.score} points. You're a true master typist!`,
                false
            );
        } else {
            this.showOverlay(
                'GAME OVER',
                `Time's up! Final score: ${this.state.score} points. Try again to beat your record!`,
                false
            );
        }

        // Reset controls
        this.elements.startBtn.textContent = 'Start Game';
        this.elements.pauseBtn.disabled = true;
        this.elements.restartBtn.disabled = false;
    }

    /**
     * Reset game to initial state
     */
    resetGame() {
        this.state.isPlaying = false;
        this.state.isPaused = false;
        this.state.level = 1;
        this.state.score = 0;
        this.state.timeRemaining = 30;
        this.state.wordsTypedThisRound = 0;
        this.state.clockHandRotation = 0;
        cancelAnimationFrame(this.state.gameLoopId);

        this.hideOverlay();
        this.elements.startBtn.textContent = 'Start Game';
        this.elements.pauseBtn.disabled = true;
        
        this.updateUI();
    }

    /**
     * Update all UI elements with current state
     */
    updateUI() {
        this.elements.levelDisplay.textContent = this.state.level;
        this.elements.scoreDisplay.textContent = this.state.score;
        
        const timeFormatted = Math.max(0, Math.ceil(this.state.timeRemaining));
        this.elements.timeDisplay.textContent = timeFormatted;

        // Update progress bar
        const totalTime = 30 + (this.state.level - 1) * 5;
        const progressPercent = (this.state.timeRemaining / totalTime) * 100;
        this.elements.timeBar.style.width = `${Math.max(0, progressPercent)}%`;

        // Color change for low time
        if (timeFormatted <= 5) {
            this.elements.timeDisplay.style.color = '#ff4444';
            this.elements.timeBar.style.background = 'linear-gradient(90deg, #ff4444, #ff6b35)';
        } else {
            this.elements.timeDisplay.style.color = '';
            this.elements.timeBar.style.background = '';
        }
    }

    /**
     * Show game overlay with custom message
     */
    showOverlay(title, message, hasContinue = false, onContinueFn = null) {
        this.elements.overlayTitle.textContent = title;
        this.elements.overlayMessage.textContent = message;
        
        if (hasContinue) {
            this.elements.closeOverlay.textContent = 'Continue';
        } else {
            this.elements.closeOverlay.textContent = 'Play Again';
        }

        // Store callback for continue button
        this.elements.closeOverlay.onclick = onContinueFn || (() => this.resetGame());
        
        this.elements.overlay.classList.remove('hidden');
    }

    /**
     * Hide game overlay
     */
    hideOverlay() {
        this.elements.overlay.classList.add('hidden');
    }

    /**
     * Get current game state for debugging/exporting
     */
    getGameState() {
        return {
            level: this.state.level,
            score: this.state.score,
            timeRemaining: Math.floor(this.state.timeRemaining),
            isPlaying: this.state.isPlaying,
            isPaused: this.state.isPaused
        };
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new ClockworkWords();
    
    // Expose to global scope for debugging
    window.clockworkGame = game;
    console.log('🔧 Clockwork Words initialized! Ready to play.');
});

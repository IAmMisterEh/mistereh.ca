/**
 * Clockwork Words - Grade 6 Edition (Progressive Difficulty)
 * Side-by-side layout with increasing word complexity
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
            wordDisplayLetters: [],
            gameLoopId: null,
            lastTime: 0,
            wordsTypedThisLevel: 0,
            levelCompleteThreshold: 10
        };

        // PROGRESSIVE DIFFICULTY WORD BANKS
        // Easy level: Short words (4-5 letters), common vocabulary
        this.easyWords = [
            'steam', 'gear', 'brass', 'copper', 'forge', 'anvil', 
            'lever', 'valve', 'wrench', 'gauge', 'piston', 'engine',
            'wheel', 'shaft', 'axle', 'pump', 'belt', 'drum', 'coil', 'grid'
        ];

        // Medium level: Longer words (5-7 letters), science terms
        this.mediumWords = [
            'boiler', 'turbine', 'motor', 'magnet', 'voltage', 'current', 
            'energy', 'battery', 'solar', 'wind', 'heat', 'light',
            'sound', 'force', 'speed', 'mass', 'work', 'power', 'flow', 'heat'
        ];

        // Hard level: Complex words (7-9 letters), advanced concepts
        this.hardWords = [
            'mechanism', 'instrument', 'telegraph', 'velocity', 'pressure',
            'resistor', 'conductor', 'transmission', 'propulsion', 'turbine',
            'generator', 'transformer', 'calibrate', 'measuring', 'electricity'
        ];

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
            closeOverlay: document.getElementById('close-overlay')
        };

        // Initialize event listeners
        this.initEventListeners();
    }

    initEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.restartBtn.addEventListener('click', () => this.resetGame());
        this.elements.closeOverlay.addEventListener('click', () => this.hideOverlay());

        // Input handling
        this.elements.playerInput.addEventListener('input', (e) => this.handleTyping(e));
        this.elements.playerInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.validateWord();
            }
        });

        document.addEventListener('click', () => {
            if (this.state.isPlaying && !this.state.isPaused) {
                this.elements.playerInput.focus();
            }
        });
    }

    startGame() {
        if (!this.state.isPlaying) {
            this.startLevel();
        } else if (this.state.isPaused) {
            this.resumeGame();
        }
    }

    startLevel() {
        this.state.isPlaying = true;
        this.state.isPaused = false;
        this.state.timeRemaining = 30 + (this.state.level - 1) * 5;
        this.state.wordsTypedThisLevel = 0;
        this.state.wordDisplayLetters = [];

        this.updateUI();
        this.hideOverlay();
        
        this.elements.startBtn.textContent = 'Pause Game';
        this.elements.pauseBtn.disabled = false;
        this.elements.restartBtn.disabled = false;

        this.elements.playerInput.focus();
        this.state.lastTime = performance.now();
        this.state.gameLoopId = requestAnimationFrame((time) => this.gameLoop(time));

        this.generateNewWord();
    }

    resumeGame() {
        this.state.isPaused = false;
        this.elements.pauseBtn.textContent = 'Pause';
        this.elements.timeDisplay.style.color = '';
        
        this.state.lastTime = performance.now();
        this.state.gameLoopId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    togglePause() {
        if (!this.state.isPlaying || !this.isLevelComplete()) return;

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

    isLevelComplete() {
        return !this.state.isPlaying || 
               !this.elements.playerInput.value ||
               this.elements.playerInput.value.toLowerCase() === this.state.currentWord;
    }

    gameLoop(currentTime) {
        if (!this.state.isPaused && this.state.isPlaying) {
            const deltaTime = (currentTime - this.state.lastTime) / 1000;
            this.state.lastTime = currentTime;

            this.state.timeRemaining -= deltaTime;
            
            // Visual timer: hand sweeps from -135° to +135°
            const maxTime = 30 + (this.state.level - 1) * 5;
            const progress = this.state.timeRemaining / maxTime;
            const rotation = progress * 270 - 135; // Start at -135°, end at 135°
            
            this.elements.clockHand.style.transform = 
                `translateX(-50%) rotate(${rotation}deg)`;
            
            this.updateUI();

            if (this.state.timeRemaining <= 0) {
                this.endGame(false);
                return;
            }

            this.state.gameLoopId = requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    // PROGRESSIVE DIFFICULTY: Select word based on level
    getWordForDifficulty() {
        // Level 1-3: Easy words (4-5 letters)
        if (this.state.level <= 3) {
            const words = this.easyWords;
            return words[Math.floor(Math.random() * words.length)];
        }
        // Level 4-7: Medium words (5-7 letters)
        else if (this.state.level <= 7) {
            const words = this.mediumWords;
            return words[Math.floor(Math.random() * words.length)];
        }
        // Level 8+: Hard words (7-9+ letters)
        else {
            const words = this.hardWords;
            return words[Math.floor(Math.random() * words.length)];
        }
    }

    generateNewWord() {
        // Get word based on current difficulty level
        this.state.currentWord = this.getWordForDifficulty();

        // Display word clearly at top
        this.displayWordClearly();

        this.elements.playerInput.value = '';
        this.elements.feedback.textContent = `Type the word: "${this.state.currentWord}"`;
        
        // Show all letters around clock
        this.showLettersAroundClock();

        // Reset clock hand to starting position
        const maxTime = 30 + (this.state.level - 1) * 5;
        const rotation = (this.state.timeRemaining / maxTime) * 270 - 135;
        this.elements.clockHand.style.transform = 
            `translateX(-50%) rotate(${rotation}deg)`;
    }

    displayWordClearly() {
        this.elements.wordDisplay.textContent = this.state.currentWord.toUpperCase();
        this.elements.wordDisplay.style.color = 'var(--steam-brass-gold)';
        this.elements.wordDisplay.style.textShadow = '0 0 15px var(--steam-glow-orange)';
    }

    showLettersAroundClock() {
        const letters = this.state.currentWord.split('');
        this.elements.letterTrail.innerHTML = '';
        
        const numLetters = letters.length;
        const radius = 130;
        const centerX = 160; // clock face width/2
        const centerY = 160; // clock face height/2

        this.state.wordDisplayLetters = [];

        for (let i = 0; i < numLetters; i++) {
            const angle = (i / numLetters) * Math.PI * 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            const dot = document.createElement('div');
            dot.className = 'letter-dot';
            dot.textContent = letters[i].toUpperCase();
            dot.style.left = `${x - 12}px`;
            dot.style.top = `${y - 12}px`;
            
            // Color-coded: vowels gold, consonants brass
            const isVowel = 'aeiouAEIOU'.includes(letters[i]);
            dot.style.background = isVowel ? '#ffd700' : '#b89e6c';

            this.elements.letterTrail.appendChild(dot);
            this.state.wordDisplayLetters.push(dot);
        }
    }

    handleTyping(event) {
        if (this.state.isPaused || !this.state.isPlaying) return;

        const typed = event.target.value.toLowerCase();
        const currentWord = this.state.currentWord;
        const typedLength = typed.length;

        // Visual feedback on typing progress
        let highlightedText = '';
        
        for (let i = 0; i < currentWord.length; i++) {
            if (i < typedLength) {
                if (typed[i] === currentWord[i]) {
                    highlightedText += `<span style="color: var(--steam-glow-gold); text-decoration: underline;">${currentWord[i].toUpperCase()}</span>`;
                } else {
                    highlightedText += `<span style="color: #ff6b35; text-decoration: line-through;">${currentWord[i].toUpperCase()}</span>`;
                }
            } else {
                highlightedText += `${currentWord[i].toUpperCase()}`;
            }
        }

        this.elements.wordDisplay.innerHTML = highlightedText;
    }

    validateWord() {
        if (this.state.isPaused) return;

        const typed = this.elements.playerInput.value.toLowerCase().trim();
        
        if (typed === this.state.currentWord) {
            this.onCorrectWord(typed);
        } else {
            // Wrong answer feedback
            this.elements.wordDisplay.style.borderColor = '#ff4444';
            setTimeout(() => {
                this.elements.wordDisplay.style.borderColor = 'var(--steam-brass-gold)';
            }, 300);

            this.elements.feedback.textContent = `Try again! It's "${this.state.currentWord}"`;
            
            // Time penalty (max 5 seconds remaining to prevent instant loss)
            this.state.timeRemaining = Math.max(5, this.state.timeRemaining - 2);
        }
    }

    onCorrectWord(word) {
        // Score calculation: base + speed bonus
        const baseScore = word.length * 10;
        const timeBonus = Math.floor(this.state.timeRemaining) * 2;
        const totalPoints = baseScore + timeBonus;

        this.state.score += totalPoints;
        this.elements.feedback.textContent = `Perfect! +${totalPoints} points`;

        // Show completed word
        this.elements.wordDisplay.innerHTML = 
            `<span style="color: var(--steam-glow-gold)">${word.toUpperCase()}</span>`;

        // Progress tracking
        this.state.wordsTypedThisLevel++;

        // Check if level complete (10 words)
        if (this.state.wordsTypedThisLevel >= this.state.levelCompleteThreshold) {
            if (this.state.level === 3) {
                // Max level reached - end game with victory
                setTimeout(() => {
                    this.endGame(true);
                }, 1000);
            } else {
                // Advance to next level
                const currentScore = this.state.score;
                this.state.level++;
                this.state.timeRemaining = 30 + (this.state.level - 1) * 5;
                
                // Show level up message
                this.elements.feedback.textContent = `LEVEL UP! Now at Level ${this.state.level}`;
                setTimeout(() => {
                    this.generateNewWord();
                }, 800);
            }
        } else {
            // Continue with next word
            setTimeout(() => {
                this.generateNewWord();
            }, 800);
        }

        this.updateUI();
    }

    endGame(win) {
        this.state.isPlaying = false;
        cancelAnimationFrame(this.state.gameLoopId);

        if (win) {
            this.showOverlay(
                '🎉 ALL WORDS COMPLETE! 🎉',
                `Incredible! Final score: ${this.state.score} points. Master typist!`,
                false
            );
        } else {
            this.showOverlay(
                'GAME OVER',
                `Time's up! Final score: ${this.state.score} points. Try again!`,
                false
            );
        }

        this.elements.startBtn.textContent = 'Start Game';
        this.elements.pauseBtn.disabled = true;
        this.elements.restartBtn.disabled = false;
    }

    resetGame() {
        this.state.isPlaying = false;
        this.state.isPaused = false;
        this.state.level = 1;
        this.state.score = 0;
        this.state.timeRemaining = 30;
        this.state.wordsTypedThisLevel = 0;
        this.state.wordDisplayLetters = [];
        cancelAnimationFrame(this.state.gameLoopId);

        this.hideOverlay();
        this.elements.startBtn.textContent = 'Start Game';
        this.elements.pauseBtn.disabled = true;
        
        // Sample word display for new game
        const sampleWord = this.easyWords[0];
        this.elements.wordDisplay.innerHTML = 
            `<span style="color: var(--steam-brass-gold)">SAMPLE: ${sampleWord}</span>`;

        this.updateUI();
    }

    updateUI() {
        this.elements.levelDisplay.textContent = this.state.level;
        this.elements.scoreDisplay.textContent = this.state.score;
        
        const timeFormatted = Math.max(0, Math.ceil(this.state.timeRemaining));
        this.elements.timeDisplay.textContent = `${timeFormatted}s`;

        // Timer visual feedback
        const maxTime = 30 + (this.state.level - 1) * 5;
        if (timeFormatted <= 5) {
            this.elements.timeDisplay.style.color = '#ff4444';
            this.elements.clockHand.style.background = '#ff4444';
        } else {
            this.elements.timeDisplay.style.color = '';
            this.elements.clockHand.style.background = 'linear-gradient(to bottom, var(--steam-brass-gold) 0%, #ffd700 100%)';
        }

        // Progress bar update
        const progressPercent = (this.state.timeRemaining / maxTime) * 100;
        document.getElementById('time-bar').style.width = `${Math.max(0, progressPercent)}%`;
    }

    showOverlay(title, message, hasContinue = false, onContinueFn = null) {
        this.elements.overlayTitle.textContent = title;
        this.elements.overlayMessage.textContent = message;
        
        this.elements.closeOverlay.textContent = hasContinue ? 'Continue' : 'Play Again';
        this.elements.closeOverlay.onclick = onContinueFn || (() => this.resetGame());
        
        this.elements.overlay.classList.remove('hidden');
    }

    hideOverlay() {
        this.elements.overlay.classList.add('hidden');
    }

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
    
    window.clockworkGame = game;
    console.log('🔧 Clockwork Words - Progressive Difficulty Edition initialized!');
});

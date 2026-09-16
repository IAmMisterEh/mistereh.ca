/**
 * Clockwork Words - Steampunk Typing Game (Grade 6 Edition)
 * Enhanced with visual timer, larger clock, and clear word display
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
            wordDisplayLetters: [], // Array of letter elements
            gameLoopId: null,
            lastTime: 0
        };

        // GRADE 6 APPROPRIATE WORD BANK (expandable)
        this.wordLists = {
            easy: ['steam', 'gear', 'brass', 'copper', 'forge', 'anvil', 
                   'lever', 'valve', 'wrench', 'gauge', 'piston', 'engine'],
            medium: ['boiler', 'turbine', 'pump', 'shaft', 'axle', 'flywheel',
                     'circuit', 'battery', 'magnet', 'voltage', 'current', 'energy'],
            hard: ['mechanism', 'instrument', 'telegraph', 'velocity', 'pressure',
                   'resistor', 'conductor', 'transmission', 'propulsion', 'turbine']
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
            
            // Update clock hand to DECREASE (timer effect)
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

    generateNewWord() {
        const difficulty = this.state.level <= 3 ? 'easy' : 
                          this.state.level <= 7 ? 'medium' : 'hard';
        
        const words = this.wordLists[difficulty];
        const wordIndex = Math.floor(Math.random() * words.length);
        this.state.currentWord = words[wordIndex];

        // CLEARLY DISPLAY THE WORD - no guessing!
        this.displayWordClearly();

        this.elements.playerInput.value = '';
        this.elements.feedback.textContent = `Type the word: "${this.state.currentWord}"`;
        
        // Show letters around clock (visible, not hidden)
        this.showLettersAroundClock();

        // Reset clock hand to start position
        const maxTime = 30 + (this.state.level - 1) * 5;
        const rotation = (this.state.timeRemaining / maxTime) * 270 - 135;
        this.elements.clockHand.style.transform = 
            `translateX(-50%) rotate(${rotation}deg)`;
    }

    displayWordClearly() {
        // Show the word clearly at the top - no underscores!
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
            
            // Add color coding: vowels different from consonants
            const isVowel = 'aeiouAEIOU'.includes(letters[i]);
            if (isVowel) {
                dot.style.background = '#ffd700'; // Gold for vowels
            } else {
                dot.style.background = '#b89e6c'; // Brass for consonants
            }

            this.elements.letterTrail.appendChild(dot);
            this.state.wordDisplayLetters.push(dot);
        }
    }

    handleTyping(event) {
        if (this.state.isPaused || !this.state.isPlaying) return;

        const typed = event.target.value.toLowerCase();
        const currentWord = this.state.currentWord;
        const typedLength = typed.length;

        // Visual feedback: highlight correctly typed letters
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
            // Correct!
            this.onCorrectWord(typed);
        } else {
            // Incorrect - show which letters are wrong
            this.elements.wordDisplay.style.borderColor = '#ff4444';
            setTimeout(() => {
                this.elements.wordDisplay.style.borderColor = 'var(--steam-brass-gold)';
            }, 300);

            // Show feedback
            this.elements.feedback.textContent = `Try again! It's "${this.state.currentWord}"`;
            
            // Penalty: reduce time by 2 seconds
            this.state.timeRemaining = Math.max(5, this.state.timeRemaining - 2);
        }
    }

    onCorrectWord(word) {
        const baseScore = word.length * 10;
        const timeBonus = Math.floor(this.state.timeRemaining) * 2;
        const totalPoints = baseScore + timeBonus;

        this.state.score += totalPoints;
        this.elements.feedback.textContent = `Perfect! +${totalPoints} points`;

        // Show completed word in gold
        this.elements.wordDisplay.innerHTML = 
            `<span style="color: var(--steam-glow-gold)">${word.toUpperCase()}</span>`;

        // Check if all words for this level are done (10 words per level)
        // For now, we'll use a simple approach: complete word = next level or continue
        
        // Generate next word immediately
        setTimeout(() => {
            this.generateNewWord();
        }, 800);

        this.updateUI();
    }

    endGame(win) {
        this.state.isPlaying = false;
        cancelAnimationFrame(this.state.gameLoopId);

        if (win) {
            this.showOverlay(
                '🎉 ALL WORDS COMPLETE! 🎉',
                `Incredible! Final score: ${this.state.score} points. You're a master typist!`,
                false
            );
        } else {
            this.showOverlay(
                'GAME OVER',
                `Time's up! Final score: ${this.state.score} points. Try again to beat your record!`,
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
        this.state.wordDisplayLetters = [];
        cancelAnimationFrame(this.state.gameLoopId);

        this.hideOverlay();
        this.elements.startBtn.textContent = 'Start Game';
        this.elements.pauseBtn.disabled = true;
        
        // Show sample word for new game
        const sampleWord = this.wordLists.easy[0];
        this.elements.wordDisplay.textContent = sampleWord.toUpperCase();
        this.elements.wordDisplay.innerHTML = `<span style="color: var(--steam-brass-gold)">SAMPLE: ${sampleWord}</span>`;

        this.updateUI();
    }

    updateUI() {
        this.elements.levelDisplay.textContent = this.state.level;
        this.elements.scoreDisplay.textContent = this.state.score;
        
        const timeFormatted = Math.max(0, Math.ceil(this.state.timeRemaining));
        this.elements.timeDisplay.textContent = `${timeFormatted}s`;

        // Update clock hand rotation (visual timer)
        const maxTime = 30 + (this.state.level - 1) * 5;
        
        // Color change for low time
        if (timeFormatted <= 5) {
            this.elements.timeDisplay.style.color = '#ff4444';
            this.elements.clockHand.style.background = '#ff4444';
        } else {
            this.elements.timeDisplay.style.color = '';
            this.elements.clockHand.style.background = 'var(--steam-brass-gold)';
        }

        // Update progress bar at bottom (optional, keeps it there)
        const progressPercent = (this.state.timeRemaining / maxTime) * 100;
        document.getElementById('time-bar').style.width = `${Math.max(0, progressPercent)}%`;
    }

    showOverlay(title, message, hasContinue = false, onContinueFn = null) {
        this.elements.overlayTitle.textContent = title;
        this.elements.overlayMessage.textContent = message;
        
        if (hasContinue) {
            this.elements.closeOverlay.textContent = 'Continue';
        } else {
            this.elements.closeOverlay.textContent = 'Play Again';
        }

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
    
    // Expose to global scope for debugging
    window.clockworkGame = game;
    console.log('🔧 Clockwork Words Grade 6 Edition initialized! Ready to play.');
});

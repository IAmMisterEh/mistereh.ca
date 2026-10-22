/**
 * Clockwork Words - Letter Mode Edition
 * Pure letter-by-letter typing drill - no word memorization!
 */

class ClockworkWordsLetter {
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
            levelCompleteThreshold: 10,
            totalScore: 0,
            unlockedLevels: 1,
            lettersRevealed: 0
        };

        // HOME ROW LETTERS (Always available)
        this.homeRowLetters = 'asdfghjkl;';
        
        // Available letters by level
        this.availableLetters = {
            1: 'asdfghjkl;',     // Home row only
            2: 'qwertyuiopasdfghjkl;', // + Top row
            3: 'qwertyuiopasdfghjklzxcvbnm', // + Bottom row
            4: 'qwertyuiopasdfghjklzxcvbnm ,.' // + Full keyboard + space
        };

        // Unlock thresholds (same as before)
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
            enemy: null
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

        // Input handling - type continuously, no Enter needed!
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
        if (!this.state.isPlaying) this.startLevel();
        else if (this.state.isPaused) this.resumeGame();
    }

    startLevel() {
        this.state.isPlaying = true;
        this.state.isPaused = false;
        this.state.timeRemaining = 45 + (this.state.level - 1) * 5;
        this.state.wordsTypedThisLevel = 0;
        
        this.updateUI();
        this.hideOverlay();
        
        this.elements.startBtn.textContent = 'Pause Game';
        this.elements.pauseBtn.disabled = false;
        
        this.generateNewWord();
    }

    resumeGame() {
        this.state.isPaused = false;
        this.elements.pauseBtn.textContent = 'Resume';
        this.state.lastTime = performance.now();
        this.state.gameLoopId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    togglePause() {
        if (!this.state.isPlaying || this.state.wordsTypedThisLevel === 0) return;

        this.state.isPaused = !this.state.isPaused;
        
        if (this.state.isPaused) {
            cancelAnimationFrame(this.state.gameLoopId);
            this.elements.pauseBtn.textContent = 'Resume';
            this.showOverlay('PAUSED', 'Game paused!');
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
                this.endGame(false);
                return;
            }

            this.state.gameLoopId = requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    generateNewWord() {
        // Generate random word from available letters based on unlocked level
        const maxUnlocked = Math.min(this.state.unlockedLevels, 4);
        const letterPool = this.availableLetters[maxUnlocked];
        
        // Generate random length word (3-8 letters typical)
        const wordLength = Math.floor(Math.random() * 6) + 3; // 3-8 letters
        
        let word = '';
        for (let i = 0; i < wordLength; i++) {
            const randomLetter = letterPool[Math.floor(Math.random() * letterPool.length)];
            word += randomLetter;
        }
        
        this.state.currentWord = word.toLowerCase();
        this.state.lettersRevealed = 0;
        
        // Clear and display word clearly at top
        this.elements.wordDisplay.textContent = this.state.currentWord.toUpperCase();

        this.elements.playerInput.value = '';
        this.elements.feedback.textContent = `Type the letters: "${this.state.currentWord}"`;
        
        // Show all letters around clock face (initially hidden)
        this.showLettersAroundClock();

        // Reset clock hand
        const maxTime = 45 + (this.state.level - 1) * 5;
        const rotation = (this.state.timeRemaining / maxTime) * 270 - 135;
        this.elements.clockHand.style.transform = 
            `translateX(-50%) rotate(${rotation}deg)`;

        // Start sequential reveal
        setTimeout(() => this.revealSpiralSequentially(), 300);
    }

    showLettersAroundClock() {
        const letters = this.state.currentWord.split('');
        this.elements.letterTrail.innerHTML = '';
        
        const numLetters = letters.length;
        const centerX = 160;
        const centerY = 160;
        const maxRadius = 130;
        
        this.state.wordDisplayLetters = [];
        this.state.spinePoints = [];
        
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
            dot.style.opacity = '0';
            dot.style.transform = 'scale(0.5)';
            dot.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            const isVowel = 'aeiouAEIOU'.includes(letters[i]);
            dot.style.background = isVowel ? '#ffd700' : '#b89e6c';
            dot.dataset.letterIndex = i;
            dot.dataset.isTarget = 'false';
            
            this.elements.letterTrail.appendChild(dot);
            this.state.wordDisplayLetters.push(dot);
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
            this.elements.enemy.style.left = `${centerX - 10}px`;
            this.elements.enemy.style.top = `${centerY - 10}px`;
            this.elements.enemy.classList.add('escape');
        }
    }

    revealSpiralSequentially() {
        const totalLetters = this.state.currentWord.length;
        let index = 0;
        
        const intervalId = setInterval(() => {
            if (index >= totalLetters) {
                clearInterval(intervalId);
                return;
            }
            
            const dot = this.state.wordDisplayLetters[index];
            if (dot) {
                dot.style.opacity = '1';
                dot.style.transform = 'scale(1)';
            }
            
            index++;
        }, 200);
    }

    handleTyping(event) {
        if (this.state.isPaused || !this.state.isPlaying) return;

        const typed = event.target.value.toLowerCase();
        const currentWord = this.state.currentWord;
        
        // Validate the letter just typed
        if (typed.length > 0) {
            this.validateLetterOnSpiral(typed);
        }
    }

    validateLetterOnSpiral(typedChar) {
        const currentIndex = this.state.lettersRevealed;
        const currentWord = this.state.currentWord;
        const nextLetter = currentWord[currentIndex];
        
        if (!nextLetter) return; // Word complete
        
        if (typedChar === nextLetter.toLowerCase()) {
            // Correct! Move to next letter
            this.state.lettersRevealed++;
            this.handleCorrectSpiralLetter();
            
            // Auto-focus for continuous typing
            setTimeout(() => this.elements.playerInput.focus(), 50);
        } else {
            // Wrong letter - reset input and show feedback
            this.elements.playerInput.value = '';
            this.elements.feedback.textContent = `Try again! Type "${nextLetter.toUpperCase()}"`;
            
            // Time penalty for wrong attempts
            this.state.timeRemaining = Math.max(5, this.state.timeRemaining - 1);
        }
    }

    handleCorrectSpiralLetter() {
        const word = this.state.currentWord;
        const currentIndex = this.state.lettersRevealed - 1; // Just completed
        
        const baseScore = 5; // Per letter
        const timeBonus = Math.floor(this.state.timeRemaining) * 2;
        
        // Home row letters get bonus!
        const isHomeRow = this.homeRowLetters.includes(word[currentIndex].toLowerCase());
        const bonusMultiplier = isHomeRow ? 1.5 : 1.0;
        
        const totalPoints = Math.floor((baseScore + timeBonus) * bonusMultiplier);
        this.state.score += totalPoints;
        this.state.totalScore += totalPoints;
        
        this.elements.feedback.textContent = `+${totalPoints} points! ${isHomeRow ? '🌟' : ''}`;
        
        // Update spiral dots to show completed letter
        this.updateSpiralDots(word.substring(0, currentIndex), word);
        
        // Check if all letters complete
        if (this.state.lettersRevealed >= word.length) {
            this.onWordComplete();
        } else {
            // Continue game - update spiral to show next target
            this.updateSpiralDots(word.substring(0, currentIndex), word);
            this.elements.playerInput.focus();
        }
    }

    onWordComplete() {
        const wordLength = this.state.currentWord.length;
        const baseScore = wordLength * 10;
        const timeBonus = Math.floor(this.state.timeRemaining) * 3;
        
        // Check if all letters are home-row letters (full bonus!)
        const isPureHomeRow = this.state.currentWord.split('').every(
            letter => this.homeRowLetters.includes(letter.toLowerCase())
        );
        const bonusMultiplier = isPureHomeRow ? 1.5 : 1.0;
        
        const totalPoints = Math.floor((baseScore + timeBonus) * bonusMultiplier);
        
        this.state.score += totalPoints;
        this.state.totalScore += totalPoints;
        
        this.elements.feedback.textContent = 
            `🎉 COMPLETE! +${totalPoints} points! ${isPureHomeRow ? '🌟 HOME ROW BONUS!' : ''}`;

        this.state.wordsTypedThisLevel++;

        if (this.state.wordsTypedThisLevel >= this.state.levelCompleteThreshold) {
            if (this.state.unlockedLevels >= 4) {
                setTimeout(() => this.endGame(true), 1000);
            } else {
                let newUnlocked = false;
                for (let level = this.state.unlockedLevels + 1; level <= 4; level++) {
                    if (this.isLevelUnlocked(level)) {
                        this.state.unlockedLevels = level;
                        newUnlocked = true;
                        break;
                    }
                }

                const maxAvailableLevel = Math.min(this.state.unlockedLevels, 4);
                if (this.state.level < maxAvailableLevel) {
                    this.state.level++;
                    this.state.timeRemaining = 45 + (this.state.level - 1) * 5;
                    
                    let message = `LEVEL UP! Now at Level ${this.state.level}`;
                    if (newUnlocked) {
                        const unlockedName = this.unlockThresholds[this.state.unlockedLevels].name;
                        message += `\n🎉 UNLOCKED: ${unlockedName}!`;
                    }
                    this.elements.feedback.textContent = message;
                } else if (newUnlocked && this.state.level < maxAvailableLevel) {
                    this.state.level = this.state.unlockedLevels;
                    this.state.timeRemaining = 45 + (this.state.level - 1) * 5;
                    
                    const unlockedName = this.unlockThresholds[this.state.unlockedLevels].name;
                    this.elements.feedback.textContent = `🎉 UNLOCKED: ${unlockedName}!`;
                }

                setTimeout(() => this.generateNewWord(), 800);
            }
        } else {
            setTimeout(() => this.generateNewWord(), 800);
        }

        this.saveProgress();
        this.updateUI();
    }

    updateSpiralDots(typed, currentWord) {
        if (!this.state.wordDisplayLetters || this.state.wordDisplayLetters.length === 0) return;
        
        const typedLength = typed.length;
        
        this.state.wordDisplayLetters.forEach((dot, index) => {
            if (index < typedLength) {
                dot.style.opacity = '0.4';
                dot.style.transform = 'scale(0.8)';
                dot.style.boxShadow = 'none';
            } else if (index === typedLength) {
                dot.style.opacity = '1';
                dot.style.transform = 'scale(1.2)';
                dot.style.boxShadow = '0 0 15px var(--steam-glow-gold)';
                dot.dataset.isTarget = 'true';
            } else {
                dot.style.opacity = '1';
                dot.style.transform = 'scale(1)';
                dot.style.boxShadow = '0 0 8px rgba(245, 230, 200, 0.8)';
                dot.dataset.isTarget = 'false';
            }
        });
    }

    endGame(win) {
        this.state.isPlaying = false;
        cancelAnimationFrame(this.state.gameLoopId);

        if (win) {
            this.showOverlay('🎉 ALL WORDS COMPLETE! 🎉', `Final score: ${this.state.score} points.`);
        } else {
            this.showOverlay('GAME OVER', `Time's up! Final score: ${this.state.score} points.`);
        }

        this.elements.startBtn.textContent = 'Start Game';
        this.elements.pauseBtn.disabled = true;
    }

    resetGame() {
        this.state.isPlaying = false;
        this.state.isPaused = false;
        this.state.level = 1;
        this.state.score = 0;
        this.state.wordsTypedThisLevel = 0;
        
        this.hideOverlay();
        this.elements.startBtn.textContent = 'Start Game';
        this.elements.pauseBtn.disabled = true;
        
        const sampleWord = 'asd'; // Home row example
        this.elements.wordDisplay.innerHTML = `<span style="color: var(--steam-brass-gold)">SAMPLE: ${sampleWord}</span>`;

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
        this.elements.closeOverlay.textContent = 'Play Again';
        this.elements.closeOverlay.onclick = () => this.resetGame();
        this.elements.overlay.classList.remove('hidden');
    }

    hideOverlay() {
        this.elements.overlay.classList.add('hidden');
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new ClockworkWordsLetter();
    window.clockworkGame = game;
    console.log('🔧 Clockwork Words Letter Mode initialized!');
});

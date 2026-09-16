/**
 * Clockwork Words - Typing Mastery Edition
 * Progressive unlock system with home-row focus
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
            levelCompleteThreshold: 10,
            // Typing mastery progress
            totalScore: 0,
            unlockedLevels: 1,
            activeLetterIndex: 0
        };

        // TYPING MASTERY WORD BANKS (Progressive Unlock)
        
        // REAL HOME-ROW WORDS (Priority: Vocabulary First)
        const realHomeRowWords = [
            'dad', 'sad', 'mad', 'lad', 
            'gas', 'tag', 'gag', 'ask',
            'sea', 'tea', 'pee', 'lee', 'bee',
            'fast', 'last', 'cast', 'mast',
            'lass', 'saga', 'gala', 'gaga',
            'dada', 'mask', 'task', 'daddy'
        ];

        // HOME-ROW GIBBERISH CODES (For Muscle Memory Drills)
        const homeRowGibberish = [
            // Simple patterns
            'as', 'sa', 'ad', 'da', 'fs', 'sf', 'gs', 'sg',
            'aaaa', 'ssss', 'dddd', 'ffff', 'gggg', 'hhhh',
            'adas', 'safs', 'gags', 'tagg', 'fask', 'lask',
            
            // Complex patterns
            'asdasd', 'fsfsfs', 'gsgsgs', 'lklklk', 'jkjkjk',
            'dadada', 'sadads', 'gasag', 'lsgsl', 'faskas',
            'tasksk', 'maskas', 'lassal', 'gallag',
            
            // Full sweeps
            'asdfghjkl;', 'lkjhgfdsa;'
        ];

        // Level 1: Home Row Only (ALWAYS AVAILABLE)
        this.homeRowWords = [...realHomeRowWords, ...homeRowGibberish];
        
        // Store real words separately for bonus scoring
        this.realHomeRowWords = new Set(realHomeRowWords);

        // Level 2: Home Row + Top Row (Unlocks at 100 points)
        this.topRowWords = [
            'quick', 'water', 'better', 'letter', 'factory', 
            'keyboard', 'typing', 'party', 'early', 'story',
            'carry', 'funny', 'sunny', 'query', 'pretty'
        ];

        // Level 3: All Letters Except Bottom Row Special (Unlocks at 250 points)
        this.bottomRowWords = [
            'cabin', 'camera', 'computer', 'system', 'monitor', 
            'mouse', 'screen', 'zebra', 'zero', 'box', 'fox'
        ];

        // Level 4: Full Keyboard + Grade 6 Vocabulary (Unlocks at 500 points)
        this.masterWords = [
            'technology', 'education', 'learning', 'classroom', 'students', 
            'teacher', 'mathematics', 'science', 'history', 'geography',
            'library', 'research', 'project', 'report', 'essay'
        ];

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
            unlockBadge: document.getElementById('unlock-badge') || document.createElement('div')
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

    // Load saved progress from localStorage
    loadProgress() {
        try {
            const savedUnlocked = localStorage.getItem('clockworkWords_unlocked');
            const savedTotalScore = localStorage.getItem('clockworkWords_totalScore');
            
            if (savedUnlocked) {
                this.state.unlockedLevels = parseInt(savedUnlocked);
            }
            
            if (savedTotalScore) {
                this.state.totalScore = parseInt(savedTotalScore);
                // Update display to show current score
                this.elements.scoreDisplay.textContent = this.state.totalScore;
            }
        } catch (e) {
            console.log('Could not load saved progress', e);
        }
    }

    // Save progress to localStorage
    saveProgress() {
        try {
            localStorage.setItem('clockworkWords_unlocked', this.state.unlockedLevels);
            localStorage.setItem('clockworkWords_totalScore', this.state.totalScore);
        } catch (e) {
            console.log('Could not save progress', e);
        }
    }

    // Check if current level is unlocked based on total score
    isLevelUnlocked(levelNum) {
        if (levelNum === 1) return true; // Home row always available
        
        const threshold = this.unlockThresholds[levelNum]?.threshold;
        return threshold !== undefined && this.state.totalScore >= threshold;
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
        this.state.timeRemaining = 45 + (this.state.level - 1) * 5;
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

    // Select word based on current level and available unlocked levels
    getWordForCurrentLevel() {
        const currentUnlocked = Math.min(this.state.unlockedLevels, 4);
        
        if (currentUnlocked >= 4) {
            return this.masterWords[Math.floor(Math.random() * this.masterWords.length)];
        } else if (currentUnlocked >= 3) {
            return this.bottomRowWords[Math.floor(Math.random() * this.bottomRowWords.length)];
        } else if (currentUnlocked >= 2) {
            return this.topRowWords[Math.floor(Math.random() * this.topRowWords.length)];
        } else {
            // Only home row available
            return this.homeRowWords[Math.floor(Math.random() * this.homeRowWords.length)];
        }
    }

    generateNewWord() {
        this.state.currentWord = this.getWordForCurrentLevel();
        
        // Clear and display word clearly at top
        this.elements.wordDisplay.textContent = this.state.currentWord.toUpperCase();
        this.elements.wordDisplay.style.color = 'var(--steam-brass-gold)';
        this.elements.wordDisplay.style.textShadow = '0 0 15px var(--steam-glow-orange)';

        this.elements.playerInput.value = '';
        this.elements.feedback.textContent = `Type the word: "${this.state.currentWord}"`;
        
        // Show all letters around clock face
        this.showLettersAroundClock();

        // Reset clock hand to starting position
        const maxTime = 45 + (this.state.level - 1) * 5;
        const rotation = (this.state.timeRemaining / maxTime) * 270 - 135;
        this.elements.clockHand.style.transform = 
            `translateX(-50%) rotate(${rotation}deg)`;

        // Reset active letter index for chain reaction mode
        this.state.activeLetterIndex = 0;
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
        const centerX = 160;
        const centerY = 160;
        const maxRadius = 130; // Max distance from center
        
        this.state.wordDisplayLetters = [];
        
        // SPIRAL LAYOUT: Letters arranged along an Archimedean spiral
        for (let i = 0; i < numLetters; i++) {
            // Spiral parameter: distance increases with letter position
            const progress = i / Math.max(numLetters - 1, 1); // 0 to 1
            const radius = progress * maxRadius;
            
            // Angle wraps around as we move outward (creates spiral pattern)
            const angle = progress * Math.PI * 2; // Full circle for first letter
            
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
            
            // Visual indicator of position in sequence (1st, 2nd, etc.)
            dot.title = `Letter ${i + 1} of ${numLetters}`;

            this.elements.letterTrail.appendChild(dot);
            this.state.wordDisplayLetters.push(dot);
        }
    }

    handleTyping(event) {
        if (this.state.isPaused || !this.state.isPlaying) return;

        const typed = event.target.value.toLowerCase();
        const currentWord = this.state.currentWord;
        const typedLength = typed.length;

        // Update spiral dots visual feedback
        this.updateSpiralDots(typed, currentWord);

        // Visual feedback on typing progress
        let highlightedText = '';
        
        for (let i = 0; i < currentWord.length; i++) {
            if (i < typedLength) {
                if (typed[i] === currentWord[i]) {
                    highlightedText += `<span style="color: var(--steam-glow-gold); text-decoration: underline;">${currentWord[i].toUpperCase()}</span>`;
                } else {
                    highlightedText += `<span style="color: #ff4444; text-decoration: line-through;">${currentWord[i].toUpperCase()}</span>`;
                }
            } else {
                highlightedText += `${currentWord[i].toUpperCase()}`;
            }
        }

        this.elements.wordDisplay.innerHTML = highlightedText;
    }

    updateSpiralDots(typed, currentWord) {
        if (!this.state.wordDisplayLetters || this.state.wordDisplayLetters.length === 0) return;
        
        const typedLength = typed.length;
        
        this.state.wordDisplayLetters.forEach((dot, index) => {
            if (index < typedLength) {
                // Letter already typed - dim it
                dot.style.opacity = '0.4';
                dot.style.transform = 'scale(0.8)';
                dot.style.boxShadow = 'none';
            } else if (index === typedLength) {
                // Current target letter - pulse to indicate urgency
                dot.style.opacity = '1';
                dot.style.transform = 'scale(1.2)';
                dot.style.boxShadow = '0 0 15px var(--steam-glow-gold)';
            } else {
                // Future letters - normal state
                dot.style.opacity = '1';
                dot.style.transform = 'scale(1)';
                dot.style.boxShadow = '0 0 8px rgba(245, 230, 200, 0.8)';
            }
        });
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
        // Calculate base score
        const baseScore = word.length * 10;
        const timeBonus = Math.floor(this.state.timeRemaining) * 2;
        
        // Check if it's a real home-row word (50% bonus!)
        const isRealWord = this.realHomeRowWords.has(word.toLowerCase());
        const bonusMultiplier = isRealWord ? 1.5 : 1.0;
        
        const totalPoints = Math.floor((baseScore + timeBonus) * bonusMultiplier);

        this.state.score += totalPoints;
        this.state.totalScore += totalPoints; // Accumulate for unlocking
        
        // Visual feedback with bonus indicator
        if (isRealWord) {
            this.elements.feedback.textContent = `Perfect! +${totalPoints} points! 🌟 REAL WORD BONUS!`;
        } else {
            this.elements.feedback.textContent = `Perfect! +${totalPoints} points.`;
        }

        this.state.score += totalPoints;
        this.state.totalScore += totalPoints; // Accumulate for unlocking
        
        this.elements.feedback.textContent = `Perfect! +${totalPoints} points`;

        // Show completed word
        this.elements.wordDisplay.innerHTML = 
            `<span style="color: var(--steam-glow-gold)">${word.toUpperCase()}</span>`;

        // Progress tracking
        this.state.wordsTypedThisLevel++;

        // Check if level complete (10 words)
        if (this.state.wordsTypedThisLevel >= this.state.levelCompleteThreshold) {
            if (this.state.unlockedLevels >= 4) {
                // Max level reached - end game with victory
                setTimeout(() => {
                    this.endGame(true);
                }, 1000);
            } else {
                // Advance to next level
                const currentScore = this.state.totalScore;
                
                // Check if we should unlock a new level based on score
                let newUnlocked = false;
                for (let level = this.state.unlockedLevels + 1; level <= 4; level++) {
                    if (this.isLevelUnlocked(level)) {
                        this.state.unlockedLevels = level;
                        newUnlocked = true;
                        break;
                    }
                }

                // Check if we should advance level (10 words typed)
                const maxAvailableLevel = Math.min(this.state.unlockedLevels, 4);
                if (this.state.level < maxAvailableLevel) {
                    this.state.level++;
                    this.state.timeRemaining = 45 + (this.state.level - 1) * 5;
                    
                    // Show level up message
                    let message = `LEVEL UP! Now at Level ${this.state.level}`;
                    if (newUnlocked) {
                        const unlockedName = this.unlockThresholds[this.state.unlockedLevels].name;
                        message += `\n\n🎉 UNLOCKED: ${unlockedName}! More letters available!`;
                    }
                    
                    this.elements.feedback.textContent = message;
                } else if (newUnlocked && this.state.level < maxAvailableLevel) {
                    // Just unlocked, advance to that level
                    this.state.level = this.state.unlockedLevels;
                    this.state.timeRemaining = 45 + (this.state.level - 1) * 5;
                    
                    const unlockedName = this.unlockThresholds[this.state.unlockedLevels].name;
                    this.elements.feedback.textContent = `🎉 UNLOCKED: ${unlockedName}! Starting at Level ${this.state.level}`;
                }

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

        // Save progress (score and unlocked level)
        this.saveProgress();

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
        this.state.wordsTypedThisLevel = 0;
        this.state.wordDisplayLetters = [];
        cancelAnimationFrame(this.state.gameLoopId);

        this.hideOverlay();
        this.elements.startBtn.textContent = 'Start Game';
        this.elements.pauseBtn.disabled = true;
        
        // Show sample word display for new game
        const sampleWord = this.homeRowWords[0];
        this.elements.wordDisplay.innerHTML = 
            `<span style="color: var(--steam-brass-gold)">SAMPLE: ${sampleWord}</span>`;

        this.updateUI();
    }

    updateUI() {
        this.elements.levelDisplay.textContent = `Level ${this.state.level} (${this.getLevelName()})`;
        this.elements.scoreDisplay.textContent = this.state.score;
        
        const timeFormatted = Math.max(0, Math.ceil(this.state.timeRemaining));
        this.elements.timeDisplay.textContent = `${timeFormatted}s`;

        // Timer visual feedback
        const maxTime = 45 + (this.state.level - 1) * 5;
        if (timeFormatted <= 5) {
            this.elements.timeDisplay.style.color = '#ff4444';
            this.elements.clockHand.style.background = '#ff4444';
        } else {
            this.elements.timeDisplay.style.color = '';
            this.elements.clockHand.style.background = 'linear-gradient(to bottom, var(--steam-brass-gold) 0%, #ffd700 100%)';
        }

        // Update progress bar
        const progressPercent = (this.state.timeRemaining / maxTime) * 100;
        document.getElementById('time-bar').style.width = `${Math.max(0, progressPercent)}%`;
    }

    getLevelName() {
        if (this.state.unlockedLevels === 1) return "Home Row";
        if (this.state.unlockedLevels === 2) return "Top Row";
        if (this.state.unlockedLevels === 3) return "Bottom Row";
        return "Master";
    }

    showOverlay(title, message, hasContinue = false, onContinueFn = null) {
        this.elements.overlayTitle.textContent = title;
        this.elements.overlayMessage.innerHTML = message.replace(/\n/g, '<br>');
        
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
            totalScore: this.state.totalScore,
            unlockedLevels: this.state.unlockedLevels,
            isPlaying: this.state.isPlaying,
            isPaused: this.state.isPaused
        };
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new ClockworkWords();
    
    window.clockworkGame = game;
    console.log('🔧 Clockwork Words Typing Mastery initialized!');
});

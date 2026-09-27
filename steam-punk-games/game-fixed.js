/**
 * Clockwork Words - Timed Spiral Drill (FIXED VERSION)
 * Critical fixes:
 * - First letter visibility (larger, offset from center)
 * - Movement based on radius/distance, not center
 * - Letter "shooting" effect on correct typing
 * - Lowercase letters for early levels
 * - Boss moves with each spawn
 */

class ClockworkWordsTimedSpiralFixed {
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
            revealRate: 1000,
            isEnemyMoving: false,
            // FIX: Track enemy position for smooth movement
            enemyCurrentX: 150,
            enemyCurrentY: 150,
            // FIX: Boss spawn counter
            spawnsInSequence: 0
        };

        this.homeRowLetters = 'asdfghjkl;';
        
        // FIX: Letter pools by level - lowercase for early levels!
        const homeRow = this.homeRowLetters;
        this.availableLetters = {
            1: homeRow,                                   // Level 1: home row lowercase only
            2: 'qwertyuiop' + homeRow,                   // Level 2: + top row lowercase
            3: ('qwertyuiop' + homeRow) + 'zxcvbnm',    // Level 3: + bottom row lowercase
            4: ('qwertyuiop' + homeRow + 'zxcvbnm') + ' ,.' // Level 4: full keyboard (still lowercase)
        };

        this.sequenceLengths = {
            1: 30,
            2: 35,
            3: 40,
            4: 45
        };

        this.unlockThresholds = {
            1: { threshold: 0, name: "Home Row", alwaysAvailable: true },
            2: { threshold: 100, name: "Top Row Explorer" },
            3: { threshold: 250, name: "Bottom Row Master" },
            4: { threshold: 500, name: "Keyboard Commander" }
        };

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
            escapeBar: null
        };

        this.initEventListeners();
        this.loadProgress();
    }

    initEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.restartBtn.addEventListener('click', () => this.resetGame());
        this.elements.closeOverlay.addEventListener('click', () => this.hideOverlay());
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

    startGame() {
        if (!this.state.isPlaying) this.startSession();
        else if (this.state.isPaused) this.resumeGame();
    }

    startSession() {
        this.state.isPlaying = true;
        this.state.isPaused = false;
        this.state.timeRemaining = 45 + (this.state.level - 1) * 5;
        this.state.lettersTypedThisSession = 0;
        this.state.lastRevealTime = performance.now();
        this.state.spawnCounter = 0;
        
        this.state.revealRate = 1000 - ((this.state.level - 1) * 200);
        
        this.updateUI();
        this.hideOverlay();
        
        this.elements.startBtn.textContent = 'Pause Session';
        this.elements.pauseBtn.disabled = false;
        
        // Initialize escape bar
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
            
            const maxTime = 45 + (this.state.level - 1) * 5;
            const progress = this.state.timeRemaining / maxTime;
            const rotation = progress * 270 - 135;
            
            this.elements.clockHand.style.transform = 
                `translateX(-50%) rotate(${rotation}deg)`;
            
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
        if (this.state.gameLoopId) {
            cancelAnimationFrame(this.state.gameLoopId);
            this.state.gameLoopId = null;
        }
        
        // Clear existing spiral
        const existingEnemy = document.getElementById('steam-enemy');
        if (existingEnemy && existingEnemy.parentNode) {
            existingEnemy.parentNode.removeChild(existingEnemy);
        }
        
        const maxUnlocked = Math.min(this.state.unlockedLevels, 4);
        const letterPool = this.availableLetters[maxUnlocked];
        
        const sequenceLength = this.sequenceLengths[this.state.level] || 30;
        let sequence = '';
        for (let i = 0; i < sequenceLength; i++) {
            const randomLetter = letterPool[Math.floor(Math.random() * letterPool.length)];
            sequence += randomLetter; // Keep lowercase!
        }
        
        this.state.currentSequence = sequence;
        this.state.currentIndex = 0;
        this.state.spiralLetters = [];
        this.state.spinePoints = [];
        this.state.enemyPositionIndex = 0;
        this.state.lastRevealTime = performance.now();
        this.state.isEnemyMoving = false;
        this.state.spawnCounter = 0;
        
        // FIX: Start enemy slightly offset from center (not exactly on center)
        this.state.enemyCurrentX = 150 + 15; // Offset right by 15px (half of letter dot size + spacing)
        this.state.enemyCurrentY = 150;
        
        this.showSpiralLayout(sequence);

        this.state.lastTime = performance.now();
        this.state.gameLoopId = requestAnimationFrame((time) => this.revealLettersLoop(time));
    }

    showSpiralLayout(sequence) {
        const letters = sequence.split('');
        this.elements.letterTrail.innerHTML = '';
        
        const numLetters = letters.length;
        const centerX = 150; // Center of clock face
        const centerY = 150;
        const maxRadius = 130;
        
        // FIX: Start letters at a minimum radius to avoid overlap with boss
        const minRadius = 25; // Minimum distance from center
        
        for (let i = 0; i < numLetters; i++) {
            const progress = i / Math.max(numLetters - 1, 1);
            // FIX: Use minRadius to ensure first letter is visible
            const radius = minRadius + progress * (maxRadius - minRadius);
            const angle = (progress * Math.PI) + (Math.PI / 2);
            
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            const dot = document.createElement('div');
            dot.className = 'letter-dot';
            // FIX: Show letter immediately but hidden until reveal
            dot.textContent = letters[i].toUpperCase(); // Display uppercase for visibility
            dot.style.left = `${x - 14}px`; // Slightly larger (14px instead of 12px)
            dot.style.top = `${y - 14}px`;
            dot.style.opacity = '0';
            dot.style.transform = 'scale(0.5)';
            dot.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            dot.style.width = '28px'; // Larger width
            dot.style.height = '28px'; // Larger height
            dot.style.fontSize = '14px'; // Larger font
            
            const isVowel = 'aeiouAEIOU'.includes(letters[i]);
            dot.style.background = isVowel ? '#ffd700' : '#b89e6c';
            dot.dataset.letter = letters[i]; // Store lowercase letter
            dot.dataset.letterIndex = i;
            dot.dataset.isTarget = 'false';
            
            this.elements.letterTrail.appendChild(dot);
            this.state.spiralLetters.push(dot);
            this.state.spinePoints.push({x, y, radius});
        }
        
        // FIX: Create enemy element with proper positioning
        if (!this.elements.enemy) {
            this.elements.enemy = document.createElement('div');
            this.elements.enemy.id = 'steam-enemy';
            this.elements.enemy.style.position = 'absolute';
            this.elements.enemy.style.width = '24px'; // Slightly larger
            this.elements.enemy.style.height = '24px';
            this.elements.enemy.style.background = '#ff4444';
            this.elements.enemy.style.borderRadius = '50%';
            this.elements.enemy.style.boxShadow = '0 0 10px #ff0000, 0 0 20px #ffaa00';
            this.elements.enemy.style.zIndex = '10';
            this.elements.enemy.innerHTML = '⚡';
            this.elements.enemy.style.display = 'flex';
            this.elements.enemy.style.alignItems = 'center';
            this.elements.enemy.style.justifyContent = 'center';
            this.elements.enemy.style.fontSize = '14px';
        }
        
        // Set initial position
        this.elements.enemy.style.left = `${this.state.enemyCurrentX - 12}px`;
        this.elements.enemy.style.top = `${this.state.enemyCurrentY - 12}px`;
        
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
        }
        
        this.elements.letterTrail.appendChild(this.elements.enemy);
        this.elements.letterTrail.appendChild(this.elements.escapeBar);
        
        console.log('🔧 Fixed spiral initialized:', { 
            sequenceLength: numLetters, 
            enemyPos: {x: this.state.enemyCurrentX, y: this.state.enemyCurrentY},
            firstLetterRadius: minRadius
        });
    }

    revealLettersLoop(currentTime) {
        if (!this.state.isPlaying || this.state.isPaused) {
            this.state.gameLoopId = requestAnimationFrame((time) => this.revealLettersLoop(time));
            return;
        }

        if (this.state.currentIndex >= this.state.currentSequence.length) {
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

        const timeSinceLastReveal = currentTime - this.state.lastRevealTime;
        
        if (timeSinceLastReveal >= this.state.revealRate && !this.state.isEnemyMoving) {
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
            dot.style.transform = 'scale(1.2)';
            dot.dataset.isTarget = 'true';
            
            // FIX: Update UI to show the correct lowercase letter
            this.elements.feedback.textContent = `TYPE: "${letter}"!`;
            
            // FIX: Move enemy to this position (using radius-based distance)
            const targetPoint = this.state.spinePoints[this.state.currentIndex];
            if (targetPoint) {
                this.moveEnemyToPosition(targetPoint);
            }
            
            this.elements.playerInput.focus();
            
            setTimeout(() => {
                this.state.isEnemyMoving = false;
            }, 300);
        }

        this.state.lastRevealTime = currentTime;
        this.state.currentIndex++;
    }

    moveEnemyToPosition(targetPoint) {
        if (!this.elements.enemy || !targetPoint) return;
        
        const targetX = targetPoint.x;
        const targetY = targetPoint.y;
        
        // FIX: Smooth lerp movement
        const lerpFactor = 0.7;
        this.state.enemyCurrentX = this.state.enemyCurrentX + (targetX - this.state.enemyCurrentX) * lerpFactor;
        this.state.enemyCurrentY = this.state.enemyCurrentY + (targetY - this.state.enemyCurrentY) * lerpFactor;
        
        this.elements.enemy.style.left = `${this.state.enemyCurrentX - 12}px`;
        this.elements.enemy.style.top = `${this.state.enemyCurrentY - 12}px`;
        
        this.state.isEnemyMoving = true;
    }

    handleTyping(event) {
        if (this.state.isPaused || !this.state.isPlaying) return;

        const typed = event.target.value.toLowerCase().trim();
        
        if (typed.length > 0) {
            this.validateSpiralLetter(typed);
        }
    }

    validateSpiralLetter(typedChar) {
        // FIX: Get the ACTUAL target letter (lowercase) from the sequence
        const currentIndex = this.state.currentIndex;
        const targetLetter = this.state.currentSequence[currentIndex];
        
        // Clear input
        this.elements.playerInput.value = '';
        
        if (typedChar === targetLetter) {
            // Correct! Trigger shooting effect
            this.handleCorrectSpiralLetter(typedChar);
            setTimeout(() => this.elements.playerInput.focus(), 50);
        } else {
            this.elements.feedback.textContent = `❌ Try "${targetLetter}"!`;
            this.state.timeRemaining = Math.max(5, this.state.timeRemaining - 1);
            
            this.elements.wordDisplay.style.borderColor = '#ff4444';
            setTimeout(() => {
                this.elements.wordDisplay.style.borderColor = 'var(--steam-brass-gold)';
            }, 300);
        }
    }

    handleCorrectSpiralLetter(typedChar) {
        const currentIndex = this.state.currentIndex - 1;
        
        // FIX: Create shooting effect!
        this.createShootingEffect(typedChar);
        
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
        this.elements.feedback.textContent = `+${totalPoints}! ${isHomeRow ? '🌟' : ''}`;
        
        // Dim completed letter
        const dot = this.state.spiralLetters[currentIndex];
        if (dot) {
            dot.style.opacity = '0.4';
            dot.style.transform = 'scale(0.8)';
            dot.dataset.isTarget = 'false';
        }
        
        if (this.state.currentIndex >= this.state.currentSequence.length) {
            setTimeout(() => this.onSpiralComplete(), 500);
        } else {
            setTimeout(() => this.elements.playerInput.focus(), 300);
        }
        
        this.saveProgress();
        this.updateUI();
    }

    // FIX: Create shooting effect when letter is typed correctly
    createShootingEffect(letter) {
        // Find the target letter dot
        const currentDot = this.state.spiralLetters[this.state.currentIndex];
        if (!currentDot || !this.elements.enemy) return;
        
        const bullet = document.createElement('div');
        bullet.style.position = 'absolute';
        bullet.style.width = '8px';
        bullet.style.height = '8px';
        bullet.style.background = '#ffd700';
        bullet.style.borderRadius = '50%';
        bullet.style.boxShadow = '0 0 8px #ffd700';
        bullet.style.zIndex = '15';
        
        // Start from enemy position
        const startX = this.state.enemyCurrentX;
        const startY = this.state.enemyCurrentY;
        
        bullet.style.left = `${startX - 4}px`;
        bullet.style.top = `${startY - 4}px`;
        
        this.elements.letterTrail.appendChild(bullet);
        
        // Animate bullet moving to target
        const targetPoint = this.state.spinePoints[this.state.currentIndex];
        if (targetPoint) {
            const deltaX = targetPoint.x - startX;
            const deltaY = targetPoint.y - startY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const duration = Math.min(200, distance * 2); // Speed based on distance
            
            const startTime = performance.now();
            
            const animateBullet = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(1, elapsed / duration);
                
                const currentX = startX + deltaX * progress;
                const currentY = startY + deltaY * progress;
                
                bullet.style.left = `${currentX - 4}px`;
                bullet.style.top = `${currentY - 4}px`;
                
                if (progress < 1) {
                    requestAnimationFrame(animateBullet);
                } else {
                    // Bullet reached target - create hit effect
                    this.createHitEffect(targetPoint.x, targetPoint.y);
                    bullet.parentNode.removeChild(bullet);
                }
            };
            
            requestAnimationFrame(animateBullet);
        }
    }

    createHitEffect(x, y) {
        const hit = document.createElement('div');
        hit.style.position = 'absolute';
        hit.style.left = `${x - 15}px`;
        hit.style.top = `${y - 15}px`;
        hit.style.width = '30px';
        hit.style.height = '30px';
        hit.style.background = 'radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, rgba(255, 68, 68, 0) 70%)';
        hit.style.borderRadius = '50%';
        hit.style.zIndex = '14';
        hit.style.animation = 'hitPulse 0.3s ease-out forwards';
        
        // Add keyframes dynamically
        if (!document.getElementById('hit-effect-styles')) {
            const style = document.createElement('style');
            style.id = 'hit-effect-styles';
            style.textContent = `
                @keyframes hitPulse {
                    0% { transform: scale(0.5); opacity: 1; }
                    100% { transform: scale(2); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        this.elements.letterTrail.appendChild(hit);
        
        setTimeout(() => {
            if (hit.parentNode) {
                hit.parentNode.removeChild(hit);
            }
        }, 300);
    }

    onSpiralComplete() {
        const sequenceLength = this.state.currentSequence.length;
        const baseScore = sequenceLength * 10;
        const timeBonus = Math.floor(this.state.timeRemaining) * 3;
        
        const isPureHomeRow = this.state.currentSequence.split('').every(
            letter => this.homeRowLetters.includes(letter.toLowerCase())
        );
        const bonusMultiplier = isPureHomeRow ? 1.5 : 1.0;
        
        const totalPoints = Math.floor((baseScore + timeBonus) * bonusMultiplier);
        
        this.state.score += totalPoints;
        this.state.totalScore += totalPoints;
        
        this.elements.feedback.textContent = 
            `🎉 SEQUENCE COMPLETE! +${totalPoints}! ${isPureHomeRow ? '🌟 PURE HOME ROW!' : ''}`;

        this.state.lettersTypedThisSession += sequenceLength;
        const sequencesCompleted = Math.floor(this.state.lettersTypedThisSession / sequenceLength);

        if (sequencesCompleted >= 10 && this.state.level < 4) {
            this.state.level++;
            this.state.timeRemaining = 45 + (this.state.level - 1) * 5;
            this.state.revealRate = Math.max(400, 1000 - ((this.state.level - 1) * 200));
            
            this.elements.feedback.textContent = `LEVEL UP! Now at Level ${this.state.level}`;
        } else if (sequencesCompleted >= 10 && this.state.level >= 4) {
            this.endSession(true);
            return;
        }

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
        
        const sampleWord = 'asdfghjkl;';
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
    const game = new ClockworkWordsTimedSpiralFixed();
    window.clockworkGame = game;
    console.log('🔧 Clockwork Words FIXED version loaded!');
});

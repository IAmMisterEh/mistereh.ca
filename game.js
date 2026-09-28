/**
 * Clockwork Words - Steam Punk Maze Defense (v2.0)
 * 
 * Core Mechanics:
 * - Spiral maze connecting Origin to Escape points
 * - Boss starts at Origin, moves closer to Exit each new letter appears
 * - Player types letters from cannon interface
 * - Correct shots push boss back and break escape chain
 * - Letters reveal one per second
 * - Progress to next level after ~60 letters typed
 */

class ClockworkWordsMazeDefense {
    constructor() {
        // Game state
        this.state = {
            isPlaying: false,
            level: 1,
            score: 0,
            currentSequence: [],
            lettersTypedThisSession: 0,
            lastRevealTime: 0,
            revealRate: 1000, // ms between letters (Level 1)
            totalLettersNeeded: 60, // Letters per level
            gameLoopId: null,
            isBossMoving: false,
            bossPositionIndex: 0,
            lastTime: 0
        };

        // Letter chain (letters that support boss escape)
        this.chainLetters = [];
        
        // Maze path configuration (spiral from origin to escape)
        this.mazePath = [];
        this.originPoint = null;
        this.escapePoint = null;
        
        // DOM elements
        this.elements = {
            mazeContainer: document.getElementById('maze-container'),
            letterTrail: document.getElementById('letter-trail'),
            steamEnemy: document.getElementById('steam-enemy'),
            playerInput: document.getElementById('player-input'),
            levelDisplay: document.getElementById('level-display'),
            scoreDisplay: document.getElementById('score-display'),
            lettersTyped: document.getElementById('letters-typed'),
            startBtn: document.getElementById('start-btn'),
            restartBtn: document.getElementById('restart-btn'),
            overlay: document.getElementById('overlay'),
            overlayTitle: document.getElementById('overlay-title'),
            overlayMessage: document.getElementById('overlay-message'),
            closeOverlay: document.getElementById('close-overlay')
        };

        // Initialize event listeners
        this.initEventListeners();
        
        // Load saved progress
        this.loadProgress();
    }

    initEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.restartBtn.addEventListener('click', () => this.resetGame());
        this.elements.closeOverlay.addEventListener('click', () => this.hideOverlay());
        
        // Input handling - type continuously
        this.elements.playerInput.addEventListener('input', (e) => this.handleTyping(e));
        
        // Auto-focus input during gameplay
        document.addEventListener('click', () => {
            if (this.state.isPlaying && !this.elements.playerInput.disabled) {
                this.elements.playerInput.focus();
            }
        });
    }

    loadProgress() {
        try {
            const savedLevel = localStorage.getItem('clockworkWords_level');
            const savedScore = localStorage.getItem('clockworkWords_score');
            
            if (savedLevel) this.state.level = parseInt(savedLevel);
            if (savedScore) this.state.score = parseInt(savedScore);
        } catch (e) {
            console.log('Could not load progress', e);
        }
    }

    saveProgress() {
        try {
            localStorage.setItem('clockworkWords_level', this.state.level);
            localStorage.setItem('clockworkWords_score', this.state.score);
        } catch (e) {
            console.log('Could not save progress', e);
        }
    }

    startGame() {
        if (!this.state.isPlaying) {
            this.initNewSession();
        } else {
            this.resumeGame();
        }
    }

    resumeGame() {
        this.state.isPlaying = true;
        this.elements.startBtn.textContent = 'Pause';
        this.updateUI();
        
        // Start reveal loop
        this.state.lastTime = performance.now();
        this.state.gameLoopId = requestAnimationFrame((time) => this.revealLoop(time));
    }

    pauseGame() {
        if (this.state.isPlaying) {
            cancelAnimationFrame(this.state.gameLoopId);
            this.state.isPlaying = false;
            this.elements.startBtn.textContent = 'Resume';
            
            this.showOverlay('PAUSED', 'Game paused!');
        }
    }

    resetGame() {
        this.hideOverlay();
        this.initNewSession();
    }

    initNewSession() {
        // Reset game state
        this.state.isPlaying = true;
        this.state.lettersTypedThisSession = 0;
        this.state.lastRevealTime = 0; // Trigger immediate first reveal
        this.state.bossPositionIndex = 0;
        this.chainLetters = [];
        
        // Clear existing maze
        this.clearMaze();
        
        // Create maze path (spiral from origin to escape)
        this.generateSpiralPath();
        
        // Update UI
        this.updateUI();
        this.elements.startBtn.textContent = 'Pause';
        
        // Start reveal loop
        this.state.lastTime = performance.now();
        this.state.gameLoopId = requestAnimationFrame((time) => this.revealLoop(time));
    }

    generateSpiralPath() {
        const mazeWidth = 600;
        const mazeHeight = 400;
        const centerX = mazeWidth / 2;
        const centerY = mazeHeight / 2;
        const maxRadius = Math.min(centerX, centerY) - 20;
        
        // Generate spiral points (Archimedean spiral: r = a + bθ)
        const spiralPoints = [];
        const numPoints = 40; // Points along the spiral path
        
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2.5; // 2.5 full rotations
            const radius = maxRadius * (i / numPoints);
            
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            spiralPoints.push({ x, y });
        }
        
        this.originPoint = spiralPoints[0];
        this.escapePoint = spiralPoints[numPoints - 1];
        this.mazePath = spiralPoints;
    }

    clearMaze() {
        this.elements.letterTrail.innerHTML = '';
        if (this.elements.steamEnemy) {
            this.elements.steamEnemy.className = 'steam-enemy hidden';
            this.elements.steamEnemy.style.left = '';
            this.elements.steamEnemy.style.top = '';
        }
    }

    revealLoop(currentTime) {
        if (!this.state.isPlaying) {
            this.state.gameLoopId = requestAnimationFrame((time) => this.revealLoop(time));
            return;
        }

        // Check if should reveal next letter
        const timeSinceLastReveal = currentTime - this.state.lastRevealTime;
        
        if (timeSinceLastReveal >= this.state.revealRate && !this.state.isBossMoving) {
            // Reveal new letter at origin
            this.revealNextLetter(currentTime);
            
            this.state.gameLoopId = requestAnimationFrame((time) => this.revealLoop(time));
            return;
        }

        this.state.gameLoopId = requestAnimationFrame((time) => this.revealLoop(time));
    }

    revealNextLetter(currentTime) {
        // Generate random letter
        const letters = 'asdfghjklqwertyuiopzxcvbnm';
        const newLetter = letters[Math.floor(Math.random() * letters.length)];
        
        // Add to chain (at the origin point)
        this.chainLetters.push({
            letter: newLetter,
            positionIndex: 0, // At origin
            element: null
        });
        
        // Move boss one step closer to escape
        if (this.state.bossPositionIndex < this.chainLetters.length - 1) {
            this.state.bossPositionIndex = Math.min(
                this.state.bossPositionIndex + 1, 
                this.chainLetters.length - 1
            );
        }
        
        // Update UI - show new letter at origin
        this.renderLetterChain();
        
        // Update boss position
        this.updateBossPosition();
        
        // Reset timer
        this.state.lastRevealTime = currentTime;
        
        // Check if level complete
        this.state.lettersTypedThisSession++;
        if (this.state.lettersTypedThisSession >= this.state.totalLettersNeeded) {
            this.completeLevel();
        }
    }

    renderLetterChain() {
        const container = this.elements.letterTrail;
        container.innerHTML = '';
        
        // Render escape point first (furthest from origin)
        const escapePoint = document.createElement('div');
        escapePoint.className = 'escape-point';
        escapePoint.textContent = '🚪';
        escapePoint.style.left = `${this.escapePoint.x - 15}px`;
        escapePoint.style.top = `${this.escapePoint.y - 15}px`;
        container.appendChild(escapePoint);
        
        // Render all chain letters from origin outward
        this.chainLetters.forEach((chainLetter, index) => {
            const pointIndex = Math.min(index + 1, this.mazePath.length - 1);
            const point = this.mazePath[pointIndex];
            
            const letterElement = document.createElement('div');
            letterElement.className = `chain-letter ${index === 0 ? 'current-target' : ''}`;
            letterElement.textContent = chainLetter.letter.toUpperCase();
            letterElement.style.left = `${point.x - 14}px`;
            letterElement.style.top = `${point.y - 14}px`;
            
            // Color coding: vowels gold, consonants brass
            const isVowel = 'aeiou'.includes(chainLetter.letter);
            letterElement.style.background = isVowel ? '#ffd700' : '#b89e6c';
            
            this.chainLetters[index].element = letterElement;
            container.appendChild(letterElement);
        });
        
        // Render origin point
        const originPoint = document.createElement('div');
        originPoint.className = 'origin-point';
        originPoint.textContent = '🏠';
        originPoint.style.left = `${this.originPoint.x - 15}px`;
        originPoint.style.top = `${this.originPoint.y - 15}px`;
        container.appendChild(originPoint);
        
        // Add visual connections (lines between letters)
        this.drawMazeConnections(container);
    }

    drawMazeConnections(container) {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        canvas.style.position = 'absolute';
        canvas.style.pointerEvents = 'none';
        
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#b89e6c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        if (this.chainLetters.length > 0) {
            // Draw line from origin to first letter
            ctx.moveTo(this.originPoint.x, this.originPoint.y);
            
            // Draw lines through chain letters
            this.chainLetters.forEach((letter, index) => {
                const pointIndex = Math.min(index + 1, this.mazePath.length - 1);
                const point = this.mazePath[pointIndex];
                ctx.lineTo(point.x, point.y);
            });
            
            // Draw line to escape point
            ctx.lineTo(this.escapePoint.x, this.escapePoint.y);
        }
        
        ctx.stroke();
        container.insertBefore(canvas, container.firstChild);
    }

    updateBossPosition() {
        if (!this.elements.steamEnemy) return;
        
        const bossIndex = this.state.bossPositionIndex;
        const pointIndex = Math.min(bossIndex + 1, this.mazePath.length - 1);
        const point = this.mazePath[pointIndex];
        
        this.elements.steamEnemy.style.left = `${point.x - 10}px`;
        this.elements.steamEnemy.style.top = `${point.y - 10}px`;
        this.elements.steamEnemy.classList.remove('hidden');
        
        // Color based on escape progress (closer to edge = more dangerous)
        const progressPercent = (bossIndex + 1) / this.chainLetters.length * 100;
        let bgColor, boxShadow;
        
        if (progressPercent < 50) {
            bgColor = '#ff4444';
            boxShadow = '0 0 10px #ff0000, 0 0 20px #ffaa00';
        } else if (progressPercent < 80) {
            bgColor = '#ff8800';
            boxShadow = '0 0 15px #ff4444, 0 0 25px #ffaa00';
        } else {
            bgColor = '#ff0000';
            boxShadow = '0 0 20px #ff0000, 0 0 30px #ff6600';
        }
        
        this.elements.steamEnemy.style.background = `radial-gradient(circle, ${bgColor} 30%, transparent 70%)`;
        this.elements.steamEnemy.style.boxShadow = boxShadow;
    }

    handleTyping(e) {
        if (!this.state.isPlaying) return;
        
        const input = e.target.value.toLowerCase().trim();
        const targetLetter = this.chainLetters[0]?.letter;
        
        if (!targetLetter) return;
        
        // Check if first character matches current target
        if (input === targetLetter) {
            // Fire letter from cannon - eliminate chain entry
            this.fireLetter(targetLetter);
            
            // Clear input for next letter
            e.target.value = '';
        } else if (input.length > 0) {
            // Wrong character - visual feedback
            e.target.classList.add('wrong-input');
            setTimeout(() => e.target.classList.remove('wrong-input'), 200);
        }
    }

    fireLetter(letter) {
        // Create cannon fire effect
        this.createCannonFireEffect();
        
        // Remove first letter from chain (boss gets pushed back)
        this.chainLetters.shift();
        
        // Shift all remaining letters forward in the chain
        let indexDiff = 0;
        for (let i = 0; i < this.chainLetters.length; i++) {
            const oldIndex = i + 1; // Previous position
            const newIndex = Math.min(i, this.mazePath.length - 2); // New position
            
            if (this.chainLetters[i].element) {
                const point = this.mazePath[newIndex];
                this.chainLetters[i].element.style.left = `${point.x - 14}px`;
                this.chainLetters[i].element.style.top = `${point.y - 14}px`;
            }
        }
        
        // Update boss position (pushed back one step)
        if (this.state.bossPositionIndex > 0) {
            this.state.bossPositionIndex--;
        }
        this.updateBossPosition();
        
        // Update chain rendering
        this.renderLetterChain();
        
        // Score update - points for correct shot
        const points = 10 + (this.chainLetters.length * 5); // More points for later shots
        this.state.score += points;
        this.updateUI();
    }

    createCannonFireEffect() {
        const cannonIcon = document.querySelector('.cannon-fire-icon');
        if (cannonIcon) {
            // Create explosion effect
            cannonIcon.style.transform = 'scale(1.3)';
            cannonIcon.style.transition = 'transform 0.1s ease-out';
            
            setTimeout(() => {
                cannonIcon.style.transform = '';
            }, 100);
        }
    }

    completeLevel() {
        this.state.isPlaying = false;
        cancelAnimationFrame(this.state.gameLoopId);
        
        // Show level complete overlay
        this.showOverlay(
            `LEVEL ${this.state.level} COMPLETE!`,
            `Score: ${this.state.score} | Letters typed: ${this.state.lettersTypedThisSession}`
        );
        
        // Progress to next level
        this.state.level++;
        this.saveProgress();
    }

    updateUI() {
        this.elements.levelDisplay.textContent = this.state.level;
        this.elements.scoreDisplay.textContent = this.state.score;
        this.elements.lettersTyped.textContent = `${this.state.lettersTypedThisSession} / ${this.state.totalLettersNeeded}`;
    }

    showOverlay(title, message) {
        this.elements.overlayTitle.textContent = title;
        this.elements.overlayMessage.textContent = message;
        this.elements.overlay.classList.remove('hidden');
    }

    hideOverlay() {
        this.elements.overlay.classList.add('hidden');
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new ClockworkWordsMazeDefense();
});

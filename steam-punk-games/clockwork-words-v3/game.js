/**
 * Clockwork Words v3.0 - Spiral Escape
 * Steampunk typing game where letters spiral inward and must be typed before they reach the center
 */

class SpiralEscapeGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.level = 1;
        this.maxLevels = 7;
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.isRunning = false;
        this.isGameOver = false;
        this.hasWon = false;
        
        // Spiral configuration
        this.spiralPoints = [];
        this.numLevels = 5; // Number of spiral arms
        
        // Letters on the spiral
        this.letterParticles = [];
        this.currentWord = '';
        this.wordIndex = 0;
        this.levelProgress = 0; // 0 to 100
        
        // Timing
        this.spawnRate = 2000; // ms between spawns
        this.lastSpawnTime = 0;
        this.moveSpeed = 0.5; // pixels per frame
        
        // Colors
        this.colors = {
            brassDark: '#8b6c35',
            brassMed: '#b88a4a',
            brassLight: '#d4af6f',
            gold: '#ffd700',
            bg: '#1a1a1a'
        };
        
        // Keyboard layout (QWERTY)
        this.keyboardLayout = [
            'qwer', 'tyle',
            'asdf', 'ghij',
            'zxcv', 'bnml',
            ' '
        ];
        
        // Initialize
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Setup keyboard display
        this.setupKeyboardDisplay();
        
        // Event listeners
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('play-again-btn').addEventListener('click', () => this.restartGame());
        
        // Keyboard input
        window.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Initial render
        this.updateHUD();
    }
    
    resizeCanvas() {
        const size = Math.min(this.canvas.parentElement.clientWidth, 400);
        this.canvas.width = size;
        this.canvas.height = size;
        this.centerX = size / 2;
        this.centerY = size / 2;
        this.spiralRadius = size * 0.45;
        this.renderSpiral();
    }
    
    setupKeyboardDisplay() {
        const container = document.getElementById('keyboard-display');
        container.innerHTML = '';
        
        this.keyboardLayout.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'key-row';
            
            if (row === ' ') {
                const spaceKey = this.createKey('SPACE', true);
                rowDiv.appendChild(spaceKey);
            } else {
                for (const char of row) {
                    const key = this.createKey(char.toUpperCase(), false);
                    rowDiv.appendChild(key);
                }
            }
            
            container.appendChild(rowDiv);
        });
    }
    
    createKey(label, isSpace) {
        const keyDiv = document.createElement('div');
        keyDiv.className = `key ${isSpace ? 'space' : ''}`;
        keyDiv.dataset.key = label === 'SPACE' ? ' ' : label.toLowerCase();
        keyDiv.textContent = label;
        return keyDiv;
    }
    
    updateKeyVisual(key, isPressed) {
        const keyEl = document.querySelector(`[data-key="${key}"]`);
        if (keyEl) {
            keyEl.classList.toggle('pressed', isPressed);
        }
    }
    
    renderSpiral() {
        this.spiralPoints = [];
        const numPoints = 200; // Points per spiral arm
        
        for (let i = 0; i < this.numLevels; i++) {
            const points = [];
            for (let j = 0; j < numPoints; j++) {
                const t = j / numPoints; // 0 to 1
                const angle = t * Math.PI * 4 + (i * Math.PI * 2 / this.numLevels);
                const radius = this.spiralRadius * t;
                
                points.push({
                    x: this.centerX + Math.cos(angle) * radius,
                    y: this.centerY + Math.sin(angle) * radius,
                    t: t // Progress along spiral (0=start outer, 1=center)
                });
            }
            this.spiralPoints.push(points);
        }
        
        this.drawSpiralBackground();
    }
    
    drawSpiralBackground() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw spiral arms
        this.spiralPoints.forEach((arm, armIndex) => {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(212, 175, 111, ${0.1 + armIndex * 0.05})`;
            ctx.lineWidth = 2;
            
            if (arm.length > 0) {
                ctx.moveTo(arm[0].x, arm[0].y);
                for (let point of arm) {
                    ctx.lineTo(point.x, point.y);
                }
            }
            
            ctx.stroke();
        });
        
        // Draw center target
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139, 108, 53, 0.5)';
        ctx.fill();
        ctx.strokeStyle = this.colors.gold;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Outer ring
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.spiralRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(212, 175, 111, 0.3)`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    startGame() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('game-screen').classList.add('active');
        
        this.resetGame();
        this.isRunning = true;
        this.gameLoop(0);
    }
    
    resetGame() {
        this.level = 1;
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.letterParticles = [];
        this.spawnRate = 2000;
        this.moveSpeed = 0.5;
        this.isGameOver = false;
        this.hasWon = false;
        
        this.loadNextLevel();
        this.updateHUD();
    }
    
    restartGame() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        this.startGame();
    }
    
    loadNextLevel() {
        const words = this.getLevelWords(this.level);
        this.currentWord = words[Math.floor(Math.random() * words.length)];
        this.wordIndex = 0;
        this.levelProgress = 0;
        
        // Clear existing letters that aren't part of current word
        this.letterParticles = [];
    }
    
    getLevelWords(level) {
        const levelConfig = [
            '', // Level 0 unused
            ['word', 'data', 'code', 'type', 'byte'], // Level 1: home row basics
            ['speed', 'input', 'logic', 'script'], // Level 2: top row
            ['system', 'power', 'force', 'pulse'], // Level 3: bottom row
            ['matrix', 'cyber', 'quantum', 'vector'], // Level 4: more symbols
            ['spiral', 'escape', 'rotor', 'stator'], // Level 5: mixed
            ['steampunk', 'clockwork', 'brasswork', 'ironwork'], // Level 6: symbols
            ['engineer', 'mechanic', 'operator', 'survivor']  // Level 7: final challenge
        ];
        
        return levelConfig[level] || levelConfig[7];
    }
    
    spawnLetter() {
        const char = this.currentWord[this.wordIndex];
        if (!char) return;
        
        const spiralIndex = Math.floor(Math.random() * this.numLevels);
        const pointIndex = 0; // Start at outer edge
        
        this.letterParticles.push({
            char: char.toUpperCase(),
            position: { ...this.spiralPoints[spiralIndex][pointIndex] },
            spiralIndex,
            progress: 0,
            targetProgress: 1,
            speed: this.moveSpeed + (this.level * 0.2), // Get faster each level
            color: this.colors.gold
        });
        
        this.wordIndex++;
        
        if (this.wordIndex >= this.currentWord.length) {
            // Completed word
            this.levelProgress = Math.min(this.levelProgress + 15, 100);
            if (this.levelProgress >= 100) {
                this.nextLevel();
                return;
            }
            
            // Small delay before next word
            setTimeout(() => this.loadNextLevel(), 500);
        }
    }
    
    nextLevel() {
        this.level++;
        
        if (this.level > this.maxLevels) {
            this.gameWin();
            return;
        }
        
        // Bonus score for completing level
        const bonus = this.streak * 50;
        this.score += bonus;
        this.streak = Math.max(this.streak - 1, 0);
        
        this.spawnRate = Math.max(800, 2000 - (this.level * 200));
        this.moveSpeed = 0.5 + (this.level * 0.15);
        
        // Screen shake effect
        this.ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
        setTimeout(() => this.ctx.setTransform(1, 0, 0, 1, 0, 0), 200);
        
        this.loadNextLevel();
    }
    
    handleKeyPress(e) {
        if (!this.isRunning || !this.currentWord[this.wordIndex]) return;
        
        const expectedChar = this.currentWord[this.wordIndex].toLowerCase();
        const pressedKey = e.key.toLowerCase();
        
        // Update keyboard visual
        this.updateKeyVisual(pressedKey === ' ' ? 'SPACE' : pressedKey, true);
        setTimeout(() => {
            this.updateKeyVisual(pressedKey === ' ' ? 'SPACE' : pressedKey, false);
        }, 100);
        
        if (pressedKey !== expectedChar) return;
        
        // Successful press
        this.handleCorrectPress();
    }
    
    handleCorrectPress() {
        this.streak++;
        this.maxStreak = Math.max(this.maxStreak, this.streak);
        
        // Find the first matching letter on spiral
        const targetChar = this.currentWord[this.wordIndex].toUpperCase();
        const match = this.letterParticles.find(p => p.char === targetChar && !p.type);
        
        if (match) {
            match.type = 'matched';
            match.targetProgress = 0; // Move to center
            
            // Score based on how far along it was
            const progressBonus = Math.floor((1 - match.progress) * 100);
            this.score += 50 + this.streak * 10 + progressBonus;
            
            // Visual effect
            this.spawnParticleEffect(match.position.x, match.position.y, 'match');
        } else {
            // Letter not on spiral yet (shouldn't happen but safety check)
            this.score += 50 + this.streak * 10;
        }
        
        this.wordIndex++;
        
        if (this.wordIndex >= this.currentWord.length) {
            this.levelProgress = Math.min(this.levelProgress + 20, 100);
            setTimeout(() => this.loadNextLevel(), 500);
        } else {
            // Spawn next letter immediately
            setTimeout(() => this.spawnLetter(), 150);
        }
        
        this.updateHUD();
    }
    
    spawnParticleEffect(x, y, type) {
        // Simple particle burst effect (would need rendering system for full effect)
        console.log(`Particle effect at (${x}, ${y}) - ${type}`);
    }
    
    updateLetters(deltaTime) {
        const now = Date.now();
        
        // Spawn letters
        if (now - this.lastSpawnTime > this.spawnRate && !this.isGameOver) {
            this.spawnLetter();
            this.lastSpawnTime = now;
        }
        
        // Move existing letters toward center
        for (let i = this.letterParticles.length - 1; i >= 0; i--) {
            const particle = this.letterParticles[i];
            
            if (particle.type !== 'matched') {
                // Move along spiral toward center
                particle.progress += particle.speed * deltaTime / 16;
                
                // Get target position on spiral
                const progressStep = Math.floor(particle.progress * (this.spiralPoints[particle.spiralIndex].length - 1));
                const safeProgress = Math.min(progressStep, this.spiralPoints[particle.spiralIndex].length - 1);
                
                particle.position.x = this.spiralPoints[particle.spiralIndex][safeProgress].x;
                particle.position.y = this.spiralPoints[particle.spiralIndex][safeProgress].y;
            } else {
                // Move to center (matched)
                const dx = this.centerX - particle.position.x;
                const dy = this.centerY - particle.position.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 5) {
                    // Arrived at center - remove matched particles
                    this.letterParticles.splice(i, 1);
                    continue;
                }
                
                particle.position.x += (dx / dist) * 3;
                particle.position.y += (dy / dist) * 3;
            }
            
            // Check if letter reached center (game over condition)
            const distanceFromCenter = Math.sqrt(
                Math.pow(particle.position.x - this.centerX, 2) + 
                Math.pow(particle.position.y - this.centerY, 2)
            );
            
            if (distanceFromCenter < 15 && !particle.type) {
                this.gameOver();
                return;
            }
        }
        
        // Remove particles that have been collected
        this.letterParticles = this.letterParticles.filter(p => p.type !== 'matched' || distanceFromCenter > 15);
    }
    
    drawLetters() {
        const ctx = this.ctx;
        
        for (const particle of this.letterParticles) {
            // Letter bubble
            const radius = 20;
            
            ctx.beginPath();
            ctx.arc(particle.position.x, particle.position.y, radius, 0, Math.PI * 2);
            
            if (particle.type === 'matched') {
                ctx.fillStyle = `rgba(74, 222, 128, ${Math.max(0.3, 1 - particle.progress)})`;
            } else {
                ctx.fillStyle = this.colors.gold;
            }
            
            ctx.fill();
            ctx.strokeStyle = this.colors.brassDark;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Letter text
            ctx.font = 'bold 16px Courier New';
            ctx.fillStyle = '#0d0d0d';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(particle.char, particle.position.x, particle.position.y);
            
            // Glow effect for current target
            if (!particle.type && this.wordIndex < this.currentWord.length) {
                const nextChar = this.currentWord[this.wordIndex].toUpperCase();
                if (particle.char === nextChar) {
                    ctx.beginPath();
                    ctx.arc(particle.position.x, particle.position.y, radius + 5, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(255, 215, 0, ${0.3 + Math.sin(Date.now() / 200) * 0.2})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
        }
    }
    
    drawHUD() {
        // Level indicator at bottom of spiral
        const levelText = `LEVEL ${this.level}/${this.maxLevels}`;
        this.ctx.font = 'bold 14px Courier New';
        this.ctx.fillStyle = this.colors.gold;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(levelText, this.centerX, this.centerY + this.spiralRadius + 25);
    }
    
    updateHUD() {
        document.getElementById('level-display').textContent = `${this.level}/${this.maxLevels}`;
        document.getElementById('streak-display').textContent = this.streak;
        document.getElementById('score-display').textContent = this.score;
        
        const progressBar = document.getElementById('progress-fill');
        progressBar.style.width = `${this.levelProgress}%`;
    }
    
    gameOver() {
        if (this.isGameOver) return;
        
        this.isGameOver = true;
        this.isRunning = false;
        
        setTimeout(() => {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('game-over-screen').classList.add('active');
            
            document.getElementById('final-message').textContent = 
                `The spiral consumed you at level ${this.level}.`;
            document.getElementById('final-level').textContent = this.level;
            document.getElementById('final-score').textContent = this.score;
            document.getElementById('final-streak').textContent = this.maxStreak;
        }, 1000);
    }
    
    gameWin() {
        if (this.hasWon) return;
        
        this.hasWon = true;
        this.isRunning = false;
        this.score += 1000; // Completion bonus
        
        setTimeout(() => {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('victory-screen').classList.add('active');
            
            document.getElementById('victory-score').textContent = this.score;
            document.getElementById('victory-streak').textContent = this.maxStreak;
        }, 1500);
    }
    
    gameLoop(timestamp) {
        if (!this.isRunning || this.isGameOver) return;
        
        const deltaTime = timestamp - (this.lastFrameTime || timestamp);
        this.lastFrameTime = timestamp;
        
        // Clear and redraw spiral background
        this.drawSpiralBackground();
        
        // Update game state
        this.updateLetters(deltaTime);
        
        // Draw game elements
        this.drawLetters();
        this.drawHUD();
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new SpiralEscapeGame();
});


/**
 * CLOCKWORK WORDS v3.0 - SPIRAL ESCAPE
 * A steampunk typing game where you type letters to push enemies back
 * Core Mechanics: Spiral path, active bubbles, keyboard-first input
 */

class ClockworkWords {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game State
        this.gameState = 'menu'; // menu, playing, gameOver
        this.level = 1;
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.bubbles = [];
        this.enemies = [];
        this.particles = [];
        this.lettersPool = '';
        
        // Spiral Configuration
        this.sprialCenter = { x: 0, y: 0 };
        this.spiralRadiusStart = 50;
        this.spiralRadiusEnd = 350;
        this.spiralRotations = 2.5;
        this.totalSpiralLength = 0;
        this.nodes = [];
        
        // Timing & Progression
        this.spawnTimer = 0;
        this.spawnInterval = 2000; // ms between spawns (decreases with level)
        this.enemyProgress = 0; // 0 = center, 1 = edge
        this.winCondition = 500; // Score to win
        
        // Performance
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fpsDisplayTimer = 0;
        
        // Audio Context for procedural sounds
        this.audioContext = null;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.generateSpiralPath();
        this.addEventListeners();
        this.updateFPSDisplay();
        
        // Main game loop
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
    
    setupCanvas() {
        const container = document.getElementById('game-container');
        const rect = container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.sprialCenter.x = this.canvas.width / 2;
        this.sprialCenter.y = this.canvas.height / 2;
    }
    
    /**
     * Generate Archimedean spiral path using r = a + bθ
     */
    generateSpiralPath() {
        const numNodes = 60; // Number of letter positions along spiral
        
        for (let i = 0; i < numNodes; i++) {
            const theta = (i / numNodes) * this.spiralRotations * Math.PI * 2;
            
            // Archimedean spiral: r = a + bθ
            const a = this.spiralRadiusStart;
            const b = (this.spiralRadiusEnd - this.spiralRadiusStart) / (this.spiralRotations * Math.PI * 2);
            const r = a + b * theta;
            
            const x = this.sprialCenter.x + r * Math.cos(theta);
            const y = this.sprialCenter.y + r * Math.sin(theta);
            
            // Calculate tangent for letter orientation
            const dx = Math.cos(theta);
            const dy = Math.sin(theta);
            const angle = Math.atan2(dy, dx) + Math.PI / 2;
            
            this.nodes.push({ x, y, radius: r, theta, distance: i });
        }
        
        this.totalSpiralLength = numNodes;
    }
    
    addEventListeners() {
        // Keyboard input - no focus required!
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Window resize
        window.addEventListener('resize', () => this.setupCanvas());
        
        // UI Buttons
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('how-to-play-btn').addEventListener('click', () => 
            this.showModal('how-to-play-modal')
        );
        document.getElementById('close-how-to-btn').addEventListener('click', () => 
            this.hideModal('how-to-play-modal')
        );
        document.getElementById('play-again-btn').addEventListener('click', () => this.startGame());
        document.getElementById('menu-btn').addEventListener('click', () => this.showMainMenu());
        
        // Start screen visibility
        new MutationObserver(() => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        }).observe(document, { attributes: true, attributeFilter: ['hidden'] });
    }
    
    /**
     * Get keyboard level for current stage
     */
    getKeyboardLevel() {
        const levels = [
            'asdfjkl;',           // Level 1: Home row core
            'asdfjkl;gh',         // Level 2: Add g, h
            'erthyuiopqw',        // Level 3-4: Top row (expanded)
            'qwertiopasdfjk',     // Level 5: More top row
            'cvbnm,z./',          // Level 6: Bottom row
            '1234567890!@#$%^&*'  // Level 7+: Numbers & symbols
        ];
        
        const index = Math.min(this.level - 1, levels.length - 1);
        return levels[index];
    }
    
    /**
     * Start new game
     */
    startGame() {
        this.hideAllModals();
        this.gameState = 'playing';
        this.score = 0;
        this.level = 1;
        this.streak = 0;
        this.spawnInterval = 2000;
        this.winCondition = 500;
        
        this.resetGame();
        this.updateHUD();
        document.getElementById('game-screen').classList.remove('hidden');
        document.getElementById('main-menu').classList.add('hidden');
    }
    
    /**
     * Reset game state for new round
     */
    resetGame() {
        this.bubbles = [];
        this.enemies = [];
        this.particles = [];
        this.enemyProgress = 0;
        this.spawnTimer = 0;
        this.generateLevel();
    }
    
    /**
     * Generate letter pool based on level
     */
    generateLevel() {
        this.lettersPool = this.getKeyboardLevel();
    }
    
    /**
     * Spawn new enemy at center of spiral
     */
    spawnEnemy() {
        const nodeIndex = Math.floor(Math.random() * (this.nodes.length - 5)) + 2;
        const letter = this.lettersPool[Math.floor(Math.random() * this.lettersPool.length)];
        
        // Add some variety to letters
        const useCaps = Math.random() > 0.7;
        
        const bubble = {
            id: Date.now() + Math.random(),
            nodeIndex: nodeIndex,
            letter: letter,
            x: this.nodes[nodeIndex].x,
            y: this.nodes[nodeIndex].y,
            radius: this.nodes[nodeIndex].radius,
            theta: this.nodes[nodeIndex].theta,
            scale: 0, // Animation from 0 to 1
            targetScale: 1,
            opacity: 1,
            color: this.getBubbleColor(letter)
        };
        
        this.bubbles.push(bubble);
        
        const enemy = {
            id: bubble.id,
            letter: letter,
            distanceAlongPath: nodeIndex, // Same position as bubble
            progress: nodeIndex / (this.nodes.length - 1), // 0-1 scale
            scale: 0,
            targetScale: 1
        };
        
        this.enemies.push(enemy);
        
        // Decrease spawn interval as level increases
        const minInterval = 500;
        this.spawnInterval = Math.max(minInterval, 2000 - (this.level * 200));
    }
    
    /**
     * Get bubble color based on letter (accessibility-friendly)
     */
    getBubbleColor(letter) {
        const colors = [
            'rgba(255, 215, 0, 0.9)',   // Gold
            'rgba(220, 20, 60, 0.85)',  // Crimson
            'rgba(30, 144, 255, 0.85)', // DodgerBlue
            'rgba(50, 205, 50, 0.85)',  // LimeGreen
            'rgba(147, 112, 219, 0.85)' // MediumPurple
        ];
        
        const index = letter.charCodeAt(0) % colors.length;
        return colors[index];
    }
    
    /**
     * Main game loop with delta time
     */
    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        
        if (this.gameState === 'playing') {
            this.update(deltaTime);
        }
        
        this.render();
        this.updateFPSDisplay(deltaTime);
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    /**
     * Update game state
     */
    update(deltaTime) {
        // Spawn bubbles
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval && this.enemies.length < 30) {
            this.spawnEnemy();
            this.spawnTimer = 0;
        }
        
        // Update enemies (push out along spiral)
        this.enemies.forEach(enemy => {
            enemy.distanceAlongPath += 0.5 + (this.level * 0.1); // Speed increases with level
            enemy.progress = Math.min(1, enemy.distanceAlongPath / (this.nodes.length - 1));
            
            if (enemy.scale < enemy.targetScale) {
                enemy.scale += 0.1;
            }
        });
        
        // Update bubbles (follow enemies visually)
        this.bubbles.forEach((bubble, index) => {
            if (index < this.enemies.length) {
                const enemy = this.enemies[index];
                const targetNodeIndex = Math.floor(enemy.distanceAlongPath);
                
                if (targetNodeIndex >= 0 && targetNodeIndex < this.nodes.length) {
                    const node = this.nodes[targetNodeIndex];
                    
                    // Smooth movement toward target position
                    bubble.x += (node.x - bubble.x) * 0.1;
                    bubble.y += (node.y - bubble.y) * 0.1;
                    bubble.radius = node.radius;
                    bubble.theta = node.theta;
                }
            }
            
            // Update animation
            if (bubble.scale < bubble.targetScale) {
                bubble.scale += 0.2;
            }
        });
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Check win/loss conditions
        this.checkGameState();
        
        // Level progression based on score
        this.level = Math.floor(this.score / 50) + 1;
    }
    
    /**
     * Update particle system
     */
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // Gravity
            particle.life -= deltaTime * 0.001;
            particle.opacity = Math.max(0, particle.life);
            
            if (particle.life <= 0 || particle.opacity <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    /**
     * Create explosion particles at position
     */
    createExplosion(x, y, color, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 5;
            
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2, // Upward bias
                radius: 3 + Math.random() * 5,
                color: color,
                life: 0.8,
                opacity: 1
            });
        }
    }
    
    /**
     * Handle keyboard input
     */
    handleKeyPress(e) {
        if (this.gameState !== 'playing') return;
        
        const key = e.key.toLowerCase();
        const pressedChar = key.length === 1 ? key : null;
        
        if (!pressedChar) return;
        
        // Find closest bubble with matching letter to an enemy
        let targetIndex = -1;
        let minDistance = Infinity;
        
        this.enemies.forEach((enemy, index) => {
            // Find any bubble with matching letter
            for (let i = 0; i < this.bubbles.length; i++) {
                if (this.bubbles[i].letter.toLowerCase() === pressedChar && 
                    this.bubbles[i].opacity > 0.3) {
                    
                    // Calculate distance to enemy
                    const dx = this.bubbles[i].x - enemy.x;
                    const dy = this.bubbles[i].y - enemy.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        targetIndex = i;
                    }
                }
            }
        });
        
        if (targetIndex !== -1) {
            this.handleHit(targetIndex);
        } else {
            this.handleMiss();
        }
    }
    
    /**
     * Player hits correct letter
     */
    handleHit(bubbleIndex) {
        const bubble = this.bubbles[bubbleIndex];
        const enemyIndex = Math.min(bubbleIndex, this.enemies.length - 1);
        const enemy = this.enemies[enemyIndex];
        
        // Remove bubble
        this.bubbles.splice(bubbleIndex, 1);
        
        // Remove corresponding enemy (push back)
        if (this.enemies[enemyIndex]) {
            this.enemies.splice(enemyIndex, 1);
        }
        
        // Spawn explosion effect
        this.createExplosion(
            this.nodes[Math.floor(enemy.distanceAlongPath)].x,
            this.nodes[Math.floor(enemy.distanceAlongPath)].y,
            bubble.color,
            25
        );
        
        // Score calculation with streak multiplier
        const basePoints = 10 + Math.floor(this.enemies.length * 2);
        const streakBonus = this.streak >= 3 ? (this.streak * 2) : 0;
        const points = basePoints + streakBonus;
        
        this.score += points;
        this.streak++;
        this.maxStreak = Math.max(this.maxStreak, this.streak);
        
        // Play sound effect
        this.playSound('hit', points);
    }
    
    /**
     * Player presses wrong letter
     */
    handleMiss() {
        this.streak = 0;
        this.score = Math.max(0, this.score - 5);
        
        // Shake animation for feedback
        document.getElementById('hud').classList.add('miss-feedback');
        setTimeout(() => 
            document.getElementById('hud').classList.remove('miss-feedback'), 
            300
        );
        
        // Play penalty sound
        this.playSound('miss');
    }
    
    /**
     * Check game state conditions
     */
    checkGameState() {
        // Lose condition: enemy reaches edge
        if (this.enemies.length > 0) {
            const maxProgress = Math.max(...this.enemies.map(e => e.progress));
            
            if (maxProgress >= 0.95) {
                this.gameOver(false);
                return;
            }
        }
        
        // Win condition: clear all enemies or reach score threshold
        if (this.enemies.length === 0 && this.score >= this.winCondition) {
            this.gameOver(true);
            return;
        }
        
        // Level progression
        const newWinCondition = Math.floor(this.score / 50) * 50 + 500;
        if (this.score >= newWinCondition && this.enemies.length === 0) {
            this.levelUp();
        }
        
        this.updateHUD();
    }
    
    /**
     * Level up progression
     */
    levelUp() {
        this.level++;
        
        // Increase difficulty: faster spawn, more bubbles allowed
        this.spawnInterval = Math.max(500, 2000 - (this.level * 200));
        this.winCondition = Math.floor(this.score / 50) * 50 + 500;
        
        // Reset progress to give breathing room
        this.enemyProgress = 0;
        
        // Level up sound effect
        this.playSound('levelup');
    }
    
    /**
     * Game over handler
     */
    gameOver(won) {
        this.gameState = 'gameOver';
        
        const title = document.getElementById('game-over-title');
        const message = document.getElementById('game-over-message');
        const finalScore = document.getElementById('final-score');
        
        if (won) {
            title.textContent = 'VICTORY!';
            message.textContent = `You escaped the spiral with ${this.score} points!`;
            this.playSound('win');
        } else {
            title.textContent = 'GAME OVER';
            message.textContent = 'The enemy reached the edge of the spiral!';
            this.playSound('lose');
        }
        
        finalScore.textContent = `${this.score} (Max Streak: ${this.maxStreak})`;
        this.showModal('game-over-modal');
    }
    
    /**
     * Show/hide modals
     */
    showModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }
    
    hideAllModals() {
        document.querySelectorAll('.modal').forEach(el => el.classList.add('hidden'));
    }
    
    showMainMenu() {
        this.hideAllModals();
        this.gameState = 'menu';
        document.getElementById('main-menu').classList.remove('hidden');
        document.getElementById('game-screen').classList.add('hidden');
    }
    
    pause() {
        if (this.gameState === 'playing') {
            this.gamePaused = true;
        }
    }
    
    resume() {
        if (this.gameState === 'playing' && this.gamePaused) {
            this.gamePaused = false;
        }
    }
    
    /**
     * Render all game elements
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw spiral track background
        this.drawSpiralTrack();
        
        // Draw letters/bubbles first (behind enemies)
        this.renderBubbles();
        
        // Draw particles
        this.renderParticles();
        
        // Draw enemies last (foreground)
        this.renderEnemies();
    }
    
    /**
     * Draw the spiral track
     */
    drawSpiralTrack() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(184, 148, 28, 0.3)';
        this.ctx.lineWidth = 8;
        
        const numPoints = 200;
        let started = false;
        
        for (let i = 0; i <= numPoints; i++) {
            const theta = (i / numPoints) * this.spiralRotations * Math.PI * 2;
            const a = this.spiralRadiusStart;
            const b = (this.spiralRadiusEnd - this.spiralRadiusStart) / (this.spiralRotations * Math.PI * 2);
            const r = a + b * theta;
            
            const x = this.sprialCenter.x + r * Math.cos(theta);
            const y = this.sprialCenter.y + r * Math.sin(theta);
            
            if (!started) {
                this.ctx.moveTo(x, y);
                started = true;
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.stroke();
    }
    
    /**
     * Render bubble letters
     */
    renderBubbles() {
        this.bubbles.forEach(bubble => {
            const alpha = bubble.opacity * (0.5 + 0.5 * bubble.scale);
            
            // Bubble glow
            const gradient = this.ctx.createRadialGradient(
                bubble.x, bubble.y, 2,
                bubble.x, bubble.y, 15 * bubble.scale
            );
            
            gradient.addColorStop(0, bubble.color);
            gradient.addColorStop(0.7, bubble.color.replace(')', ', ' + alpha + ')'));
            gradient.addColorStop(1, bubble.color.replace(')', `, ${alpha * 0.3})`));
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(bubble.x, bubble.y, 15 * bubble.scale, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Inner highlight (steampunk brass effect)
            const innerGradient = this.ctx.createRadialGradient(
                bubble.x - 3, bubble.y - 3, 0,
                bubble.x, bubble.y, 8 * bubble.scale
            );
            
            innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            innerGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
            innerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.ctx.fillStyle = innerGradient;
            this.ctx.beginPath();
            this.ctx.arc(bubble.x, bubble.y, 8 * bubble.scale, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Letter text
            this.ctx.fillStyle = '#3d321e'; // Dark brown text for contrast
            this.ctx.font = `bold ${14 * bubble.scale}px Georgia`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(bubble.letter, bubble.x, bubble.y);
        });
    }
    
    /**
     * Render enemy sprites (brass cogs)
     */
    renderEnemies() {
        this.enemies.forEach(enemy => {
            const nodeIndex = Math.floor(enemy.distanceAlongPath);
            if (nodeIndex < 0 || nodeIndex >= this.nodes.length) return;
            
            const node = this.nodes[nodeIndex];
            const scale = enemy.scale;
            
            // Draw brass cog for enemy
            const x = node.x;
            const y = node.y;
            
            // Cog body with teeth
            const toothCount = 8;
            const outerRadius = 12 * scale;
            const innerRadius = 7 * scale;
            
            this.ctx.save();
            this.ctx.translate(x, y);
            
            // Shadow/glow
            this.ctx.shadowColor = 'rgba(212, 175, 55, 0.5)';
            this.ctx.shadowBlur = 10;
            
            for (let i = 0; i < toothCount; i++) {
                const angle = (i / toothCount) * Math.PI * 2;
                const nextAngle = ((i + 0.5) / toothCount) * Math.PI * 2;
                
                this.ctx.beginPath();
                this.ctx.moveTo(
                    outerRadius * Math.cos(angle),
                    outerRadius * Math.sin(angle)
                );
                this.ctx.lineTo(
                    outerRadius * Math.cos(nextAngle),
                    outerRadius * Math.sin(nextAngle)
                );
            }
            
            this.ctx.closePath();
            this.ctx.fillStyle = 'rgba(212, 175, 55, 0.9)';
            this.ctx.fill();
            
            // Inner circle
            this.ctx.beginPath();
            this.ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(184, 148, 28, 1)';
            this.ctx.fill();
            
            // Center hole
            this.ctx.beginPath();
            this.ctx.arc(0, 0, innerRadius * 0.4, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            this.ctx.fill();
            
            // Letter on enemy
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = '#3d321e';
            this.ctx.font = `bold ${10 * scale}px Georgia`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(enemy.letter, 0, 0);
            
            this.ctx.restore();
        });
    }
    
    /**
     * Render particles
     */
    renderParticles() {
        this.particles.forEach(particle => {
            if (particle.opacity <= 0) return;
            
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    /**
     * Update HUD display
     */
    updateHUD() {
        document.getElementById('level-display').textContent = this.level;
        document.getElementById('score-display').textContent = this.score;
        document.getElementById('streak-display').textContent = this.streak + 'x';
        document.getElementById('bubble-count').textContent = this.enemies.length;
        
        // Visual feedback for streak
        const streakEl = document.getElementById('streak-display');
        if (this.streak >= 5) {
            streakEl.classList.add('streak-boost');
        } else {
            streakEl.classList.remove('streak-boost');
        }
        
        // Progress bar shows how far enemies are from escaping
        const maxProgress = this.enemies.length > 0 
            ? Math.max(...this.enemies.map(e => e.progress)) * 100 
            : 0;
        
        const progressEl = document.getElementById('enemy-progress');
        progressEl.style.width = `${maxProgress}%`;
    }
    
    /**
     * Update FPS display periodically
     */
    updateFPSDisplay(deltaTime) {
        this.frameCount++;
        if (deltaTime > 0 && Date.now() - this.fpsDisplayTimer > 1000) {
            const fps = Math.round(this.frameCount * 1000 / deltaTime);
            // FPS logging for performance monitoring
            // console.log(`FPS: ${fps}`);
            this.frameCount = 0;
            this.fpsDisplayTimer = Date.now();
        }
    }
    
    /**
     * Play procedural sound effects using Web Audio API
     */
    playSound(type, multiplier = 1) {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        switch (type) {
            case 'hit':
                oscillator.frequency.setValueAtTime(440 * multiplier, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.15);
                break;
                
            case 'miss':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
                oscillator.frequency.linearRampToValueAtTime(100, this.audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.2);
                break;
                
            case 'levelup':
                oscillator.type = 'sine';
                [523, 659, 784, 1047].forEach((freq, i) => {
                    const time = this.audioContext.currentTime + i * 0.1;
                    oscillator.frequency.setValueAtTime(freq, time);
                    gainNode.gain.setValueAtTime(0.2, time);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
                });
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 1);
                break;
                
            case 'win':
                oscillator.type = 'triangle';
                [523, 659, 784, 1047, 1318].forEach((freq, i) => {
                    const time = this.audioContext.currentTime + i * 0.1;
                    oscillator.frequency.setValueAtTime(freq, time);
                    gainNode.gain.setValueAtTime(0.25, time);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
                });
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 1.5);
                break;
                
            case 'lose':
                oscillator.type = 'sawtooth';
                [392, 349, 329, 293].forEach((freq, i) => {
                    const time = this.audioContext.currentTime + i * 0.15;
                    oscillator.frequency.setValueAtTime(freq, time);
                    gainNode.gain.setValueAtTime(0.2, time);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
                });
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 1.5);
                break;
        }
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    const game = new ClockworkWords();
    
    // Make global for debugging
    window.game = game;
});

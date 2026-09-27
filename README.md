# Clockwork Words - Timed Spiral Drill ⚙️🕐

**Authoritative Source:** [Clockwork Words Developer Handoff](https://docs.google.com/document/d/1rMV-nFX2Bg75roY0YYo7iq0KL4nseXWjSHvWmuLP5aA)

*Last synced:* 2026-09-27 19:34 UTC

---
## Complete Developer Handoff Document

**Project:** Educational typing game for Grade 6 students  
**Concept:** Students type letters as they're revealed along a spiral path while an "enemy" escapes toward the edge  
**Status:** v2.0 (Beta) - Core mechanics not functional, needs polish  
**Live URL:** https://mistereh.ca/steam-punk-games/  
**Last Updated:** 2026-09-27  

> **Authoritative Reference:** This documentation should match the Google Doc: [Clockwork Words - Developer Handoff](https://docs.google.com/document/d/1rMV-nFX2Bg75roY0YYo7iq0KL4nseXWjSHvWmuLP5aA)

---


## 1. Executive Summary


### 1.1 What is This Game?

Clockwork Words is a **timed typing reflex drill** where:
- 🌀 Letters automatically reveal along an Archimedean spiral path
- 👾 A red/orange "enemy" orb moves along the spiral with each new letter
- ⌨️ Students must type each letter before the enemy "escapes" at the edge
- 📖 No word memorization needed - visual display shows what to type
- 📈 Progressive difficulty: faster reveals, starts with home row letters, gradually adds complexity


### 1.2 Educational Goals

- **Typing fluency:** Build muscle memory for keyboard layout
- **Visual processing:** Rapid recognition and response to visual stimuli  
- **Time management:** Develop pacing under pressure
- **Home row mastery:** Heavy bonus system encourages proper finger placement (ASDF JKL;)
- **Grade 6 appropriate:** No random letter sequences that spell inappropriate words
- **Cognitive development:** Pattern recognition, reaction time, working memory


### 1.3 Unique Value Proposition

Unlike traditional typing games:
- ✖️ **No word memorization** - pure reflex drill (not like "type 'elephant'" where you need to remember the spelling)
- ✖️ **Visual urgency** - enemy escape creates natural tension and focus
- ✖️ **Progressive difficulty** - auto-scales reveal speed and letter complexity
- ✖️ **Steampunk aesthetic** - engaging theme without copyright concerns
- ✖️ **Zero external dependencies** - pure HTML/CSS/JS, offline capable

---


## 2. Game Mechanics Deep Dive


### 2.1 Core Gameplay Loop

```
┌─────────────────────────────────────────────────────────┐
│ 1. Game starts                                          │
│ 2. Enemy appears at center of spiral                    │
│ 3. First letter pushes the enemy along the spiral       │
│ 4. If there are less than 10 letters, a new letter      │
│    spawns every 500ms (Level 1), faster at higher levels│
│ 5. As students type letters in the string, letters      │
│    are removed from sequence and enemy moves back       │
│    towards center                                        │
│ 6. If correct:                                           │
│    - Letter disappears (with animation)                  │
│    - Enemy moves back to previous position               │
│    - Score increases (base + consecutive letter bonus)   │
│ 7. If wrong:                                             │
│    - Letter stays as target                              │
│    - No penalty except time lost                         │
│ 8. Repeat until all letters typed or timer expires      │
└─────────────────────────────────────────────────────────┘
```


### 2.2 Spiral Path Architecture

**Archimedean Spiral:** `r = a + bθ` where:
- `r`: radius from center
- `θ`: angle in radians
- **Spiral geometry** creates progressive distance between letters
- **Letter placement** follows natural finger movement patterns
- **Visual flow** guides eyes from home row outward


### 2.3 Letter Revelation System

| Level | Reveal Speed | Letter Set | Home Row % | Complexity |
|-------|-------------|------------|-----------|------------|
| 1     | 500ms       | ASDF JKL;  | 100%      | Beginner   |
| 2     | 400ms       | + QWERTY   | 70%       | Easy       |
| 3     | 350ms       | + ZCVBNM   | 50%       | Medium     |
| 4-5   | 300ms       | All letters| 30%       | Hard       |
| 6+    | 250ms       | Mixed      | 10%       | Expert     |


### 2.4 Scoring System

**Base Scoring:**
- Each correctly typed letter: **1 point**
- Consecutive correct letters (combo): **+1 bonus per level** (max +5)
- Home row letters typed correctly: **+2 bonus** (reinforces proper technique)

**Difficulty Modifiers:**
- Speed penalty: Letters revealed faster = higher difficulty multiplier
- Complexity bonus: Non-home row letters earn more points
- Timer bonus: Remaining time × 0.1 points

---


## 3. Technical Architecture


### 3.1 File Structure

```
clockwork-words/
├── index.html          # Game container and DOM structure
├── game.css            # Steampunk visual styling, spiral rendering
├── game.js             # Core gameplay logic, spiral path algorithms
└── README.md           # This documentation file
```


### 3.2 Key JavaScript Components


##
## Spiral Path Engine
```javascript
class SpiralPath {
    constructor(canvas) {
        this.canvas = canvas;
        this.center = {x: 0, y: 0};
        this.radius = 0;
        this.angleStep = Math.PI / 12; // 15-degree steps
        this.letters = [];
    }
    
    // Archimedean spiral: r = a + bθ
    getPointForAngle(theta) {
        const r = this.a + (this.b * theta);
        return {
            x: this.center.x + r * Math.cos(theta),
            y: this.center.y + r * Math.sin(theta)
        };
    }
}
```


##
## Letter Reveal System
```javascript
class LetterReveal {
    constructor(speedMs) {
        this.speed = speedMs;
        this.timer = null;
        this.letters = [];
        this.isSpawning = false;
    }
    
    spawnLetter() {
        if (!this.isSpawning || this.letters.length >= 10) return;
        
        // Pick letter based on current level
        const letter = this.getNextLetter();
        
        // Add to spiral with animation
        this.addLetterToSpiral(letter);
        this.scheduleNextReveal();
    }
}
```


##
## Enemy Orb Tracker
```javascript
class EnemyOrb {
    constructor() {
        this.position = 0; // 0-100% along spiral
        this.speedMultiplier = 1.0;
        this.color = 'red';
    }
    
    update(currentProgress) {
        // Move away from center as letters accumulate
        const targetPosition = currentProgress * 0.8; // 80% of spiral length
        
        // Smooth movement (easing function)
        this.position += (targetPosition - this.position) * 0.1;
        
        // Visual feedback: color changes based on proximity to edge
        if (this.position > 80) {
            this.color = '#ff4444'; // Bright red warning
        } else if (this.position > 60) {
            this.color = '#ffaa00'; // Orange caution
        } else {
            this.color = '#cc3333'; // Red normal
        }
    }
}
```


### 3.3 DOM Structure

```html
<div id="game-container">
    <div id="clock-face">
        <!-- Spiral path drawn via Canvas API -->
        <canvas id="spiral-canvas"></canvas>
        
        <!-- Enemy orb positioned absolutely -->
        <div id="enemy-orb" class="orb"></div>
        
        <!-- Letter elements positioned along spiral -->
        <div class="letter" data-char="A" style="top: 120px; left: 180px;"></div>
    </div>
    
    <div id="input-display">
        <div id="current-target">Current: A</div>
        <div id="target-sequence">Target: ASDFJKL;</div>
        <div id="score-display">Score: 0</div>
    </div>
    
    <div id="progress-bar" class="bar"></div>
    <button id="start-btn">Start Game</button>
</div>
```


### 3.4 CSS Styling (Steampunk Theme)

**Color Palette:**
- **Brass**: `#b5a642` - Primary metallic color
- **Copper**: `#cd7f32` - Secondary accent
- **Dark Iron**: `#2c2c2c` - Background contrast
- **Gold**: `#ffd700` - Correct feedback, bonus indicators
- **Red**: `#ff4444` - Enemy, warnings
- **Orange**: `#ffaa00` - Caution zones

**Animations:**
```css
/* Letter spawn animation */
@keyframes letterSpawn {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
}

/* Enemy movement feedback */
@keyframes enemyPulse {
    0%, 100% { box-shadow: 0 0 10px red; }
    50% { box-shadow: 0 0 20px orange; }
}

/* Correct letter feedback */
@keyframes correctGlow {
    0% { text-shadow: 0 0 5px gold; }
    100% { text-shadow: none; }
}
```

---


## 4. Progressive Difficulty Implementation


### 4.1 Level Progression Logic

```javascript
function getDifficultyParams(level) {
    const baseSpeed = 500 - (level * 50); // Decreases 50ms per level
    
    const letterSet = {
        1: ['A', 'S', 'D', 'F', 'J', 'K', 'L', ';'],  // Home row only
        2: ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', 'Q', 'W', 'E', 'R', 'T'],  // + top row left
        3: /* ... adds more keys gradually */
    };
    
    return {
        revealSpeed: Math.max(200, baseSpeed), // Cap at 200ms min
        letterSet: letterSet[level] || letterSet[1],
        homeRowBonus: level <= 3 ? true : false,
        maxSequenceLength: Math.min(15, 5 + level)
    };
}
```


### 4.2 Adaptive Difficulty Features

- **Beginner mode** (Levels 1-3): Home row focus, slower reveals
- **Intermediate** (Levels 4-6): Mixed keys, moderate speed  
- **Advanced** (Level 7+): Full keyboard, rapid reveals, combo bonuses
- **Dynamic scaling**: If player achieves high accuracy (>90%), automatically suggest level increase

---


## 5. Implementation Status & Next Steps


### ✅ Completed Features:
- [x] Basic spiral path rendering (Canvas API)
- [x] Letter spawn system with timing control
- [x] Enemy orb movement along spiral
- [x] User input handling and validation
- [x] Scoring system with bonuses
- [x] Steampunk visual theme (CSS)
- [x] Responsive design for desktop/tablet


### ❌ NOT YET IMPLEMENTED (Core Issues):
- [ ] **Spiral letter reveal animation** - Letters should appear smoothly along path, not all at once
- [ ] **Enemy movement physics** - Should feel like "escaping" with easing/acceleration
- [ ] **Letter removal on correct input** - Current implementation may not properly remove typed letters from sequence
- [ ] **Visual feedback animations** - Explosion effects, glow pulses need implementation
- [ ] **Progressive difficulty tuning** - Speed curves and letter sets need balancing
- [ ] **Mobile touch support** - Keyboard input only currently
- [ ] **Sound effects** - Clock ticks, correct/wrong feedback (optional enhancement)


### 🔧 Requires Polishing:
- [x] Debug console logs removed before production
- [ ] Performance optimization for 10+ simultaneous letters
- [ ] Edge case handling (rapid typing, network issues if future sync added)
- [ ] Accessibility improvements (keyboard navigation, screen reader support)
- [ ] Analytics integration (track student progress, identify problem areas)

---


## 6. Classroom Integration Guide


### 6.1 Recommended Usage Patterns

**Daily Warm-up Routine:**
```
Time: 5 minutes
Level: Student's current level + 1 (challenging but achievable)
Focus: Accuracy first, speed follows naturally
Goal: Consistent practice builds muscle memory
```

**Progressive Training Plan:**
- **Week 1**: Master home row (Levels 1-2), accuracy > 90%
- **Week 2**: Add top row letters (Levels 3-4), focus on proper finger placement
- **Week 3**: Full keyboard integration (Levels 5+), build speed
- **Week 4**: Competitive challenges, combo bonuses, peer practice


### 6.2 Differentiation Strategies

**For struggling students:**
- Start at Level 1 with slower reveal speed
- Use "practice mode" without timer pressure
- Focus on individual letters before full sequences
- Extra home row bonus to build confidence

**For advanced students:**
- Immediate Level 5+ progression
- Enable combo bonuses and speed challenges
- Add time limits for sequences
- Peer competition: who can clear sequence fastest?


### 6.3 Assessment Integration

**Skill Metrics Tracked:**
- **Accuracy**: Percentage of correct keystrokes vs total attempts
- **Speed**: Average letters per minute (WPM equivalent)
- **Fluency**: Consecutive correct letter streaks
- **Recovery**: How quickly returns to accuracy after mistakes
- **Home row adherence**: Bonus system encourages proper technique

**Formative Assessment Ideas:**
- "Can you type this sequence without looking at your fingers?"
- "Notice which letters feel harder - is it reaching or home row?"
- "Try typing with eyes closed for one letter - can you find the key by touch?"

---


## 7. Future Enhancements (Backlog)


### Phase 2: Visual Polish
- [ ] Particle effects when letters are correctly typed
- [ ] Dynamic color changes based on proximity to edge
- [ ] Sound effects: clock ticks, correct/wrong feedback
- [ ] Achievement badges for milestones (100 consecutive home row chars)


### Phase 3: Advanced Features  
- [ ] Multiplayer mode: Race against classmates
- [ ] Teacher dashboard: View student progress in real-time
- [ ] Custom word sets: Align with current curriculum vocabulary
- [ ] Printable worksheets: Offline practice versions


### Phase 4: Analytics & Reporting
- [ ] Student progress tracking over time
- [ ] Identify problem areas (specific keys, patterns)
- [ ] Export data to CSV for LMS integration
- [ ] AI-powered adaptive difficulty suggestions

---


## 8. Technical Notes & Known Issues


### Current Limitations:
1. **No word-based sequences** - Pure letter-by-letter drill (intentional design)
2. **Desktop-focused** - Mobile keyboard support not yet implemented
3. **Single user mode** - No multi-player or leaderboards yet
4. **Local state only** - Progress not saved between sessions


### Browser Compatibility:
- ✅ Chrome/Edge (best experience, full Canvas API)
- ✅ Safari 13+ (limited animation support)
- ⚠️ Firefox (test for Canvas quirks)
- ❌ Internet Explorer (not supported)


### Performance Considerations:
- Optimize Canvas rendering for 10+ letter elements
- RequestAnimationFrame for smooth animations (60fps target)
- Debounce rapid input to prevent timing conflicts
- Memory cleanup when sequences exceed length limits

---


## 9. License & Usage Rights

**100% original educational game** - Free for classroom use:
- ✅ Embed on school websites
- ✅ Modify for your curriculum needs  
- ✅ No attribution required (but appreciated!)
- ✅ Commercial use allowed if desired
- ✅ Distribute to students without restrictions

**Copyright**: © 2026 MisterEh / OC1 Educational Games  
**Theme**: Steampunk Victorian Industrial aesthetic (original design)

---


## 10. Developer Notes


### Code Philosophy:
- **Clean separation**: Visuals (CSS), Logic (JS), Structure (HTML) distinct
- **Extensible architecture**: Easy to add new difficulty levels or visual effects
- **Educational focus**: Every feature serves learning objectives, not just entertainment
- **Performance first**: Smooth 60fps animations essential for timing-critical gameplay


### Debugging Tips:
```javascript
// Enable debug mode
window.debugMode = true;

// Log letter sequence generation
console.log('Current sequence:', currentSequence);
console.log('Enemy position:', enemyOrb.position);

// Visualize spiral path calculation
spiralPath.drawDebugLines();

// Profile performance
performance.mark('game-start');
setTimeout(() => {
    performance.measure('render-cycle', 'game-start');
    console.table(performance.getEntriesByType('measure'));
}, 5000);
```


### Testing Checklist:
- [ ] All home row letters work smoothly
- [ ] Enemy movement feels "escaped" not linear  
- [ ] Visual feedback clearly distinguishes correct/incorrect
- [ ] Timer doesn't interfere with rapid typing
- [ ] No animation jank or frame drops
- [ ] Touch input works on tablets (future)

---

**Ready for classroom testing and refinement!**

This document represents the current v2.0 specification. Future versions will reflect student feedback, classroom performance data, and feature expansions as outlined in the backlog section.

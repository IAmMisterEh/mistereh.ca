# Clockwork Words - New Score-Based Escape Mechanic

**Refactored**: 2026-09-21  
**Status**: ✅ **IMPLEMENTED, READY FOR TESTING**

---

## 🎮 How It Works Now

### **Core Loop:**
1. **Start** → Enemy appears at 0% progress, target score set (e.g., 100 for Level 1)
2. **Play** → Letters appear randomly from current level's pool
3. **Type** → Correct letters: +5 points (home row: +7.5)  
   Wrong letters: Enemy jumps 10% forward
4. **Enemy** → Moves continuously (0.5%/s × level)
5. **Win** → Reach target score before enemy escapes
6. **Level Up** → Reset enemy, higher target, new letters, harder speed

### **Lose Condition:**
- Enemy reaches 100% → "ESCAPED!" game over
- Try again same level

### **Win Condition:**
- Reach target score → Level up!
- Max level (4) reached → "SPIRAL MASTER!" victory

---

## 📊 Numbers (Tweakable)

| Level | Target Score | Enemy Speed | Letters Available | Points/Letter |
|-------|-------------|-------------|-------------------|---------------|
| 1 | 100 | 0.5%/s | Home row (asdfghjkl;) | 5 (7.5 home row) |
| 2 | 250 | 1.0%/s | + Top row (qwertyuiop) | 5 (7.5 home row) |
| 3 | 500 | 1.5%/s | + Bottom row (zxcvbnm) | 5 (7.5 home row) |
| 4 | 1000 | 2.0%/s | Full keyboard | 5 (7.5 home row) |

**Math:**
- Level 1: 20 correct letters (no misses) = 100 points, enemy takes 200s to escape
- Level 1: With 2 misses (20% jump): 22 letters needed, enemy takes ~180s
- Average player (1 miss per 5 letters): ~12-15 letters to win Level 1
- Estimated game time per level: 30-60 seconds

---

## 🔧 Code Changes Summary

### State Object:
```javascript
// REMOVED:
// - timeRemaining
// - currentSequence  
// - currentIndex
// - revealRate
// - lettersTypedThisSession
// - isEnemyMoving

// ADDED:
// - enemyProgress (0.0 to 1.0)
// - levelThreshold (score needed to advance)
// - letterPool (current level's letters)
// - nextRevealTime
// - currentTargetLetter
```

### Key Methods:
- `gameLoop()` → Now checks enemy progress and score threshold
- `revealNextLetter()` → Generates random letter from pool
- `validateSpiralLetter()` → Wrong answer = enemy jump
- `onLevelComplete()` → New method for level advancement
- `updateUI()` → Shows "Score / Target" instead of timer

### Removed Methods:
- `startSpiralDrill()` → Replaced by `startContinuousDrill()`
- `revealLettersLoop()` → Merged into `gameLoop()`
- `onSpiralComplete()` → Still exists but deprecated
- `showSpiralLayout()` → Replaced by `startContinuousDrill()`

---

## 🧪 Testing Checklist

**Before deploying, test:**

- [ ] **Start game** → Enemy appears, first letter shows
- [ ] **Type correct** → +points, next letter appears
- [ ] **Type wrong** → Enemy jumps, shake effect
- [ ] **Enemy movement** → Check if visible on progress bar
- [ ] **Level up** → Reach target, see level up message, enemy resets
- [ ] **Game over** → Let enemy escape, see "ESCAPED!" overlay
- [ ] **Progression** → Level 1 → 2 → 3 → 4 → Win
- [ ] **Pause/Resume** → Check enemy stops/starts correctly
- [ ] **Persistence** → Restart, verify progress saved in localStorage

**Balance questions to answer:**
- Is enemy too slow/easy at Level 1?
- Is enemy too fast/hard at Level 4?
- Is 10% jump on wrong answer too punishing?
- Should wrong answer also cost time/points instead of (or in addition to) enemy jump?

---

## 🎯 Suggested Balance Tweaks

**If too easy:**
- Increase enemy speed: `0.005` → `0.008` (Level 1)
- Increase jump penalty: `0.1` → `0.15` (15%)
- Increase targets: 100 → 150, 250 → 400, etc.

**If too hard:**
- Decrease enemy speed: `0.005` → `0.003` (Level 1)
- Decrease jump penalty: `0.1` → `0.05` (5%)
- Add points for correct answers: 5 → 8

**If boring:**
- Add combo system: 5 correct in a row = ×2 multiplier
- Add power-ups: "Freeze enemy for 5s" after 10 correct
- Add sound effects: Steam hiss on wrong, clang on correct

---

## 📝 Developer Notes

### Files Modified:
- `game.js` → Complete rewrite of game logic (~400 lines changed)

### Files Unchanged:
- `index.html` → Still valid
- `game.css` → Still valid (enemy and progress bar already styled)

### Browser Compatibility:
- Uses `requestAnimationFrame` (all modern browsers)
- Uses `localStorage` (all modern browsers)
- No external dependencies

### Known Issues:
- None yet! (Awaiting player testing)

### Future Enhancements:
- [ ] Combo multiplier system
- [ ] Sound effects
- [ ] Visual improvements (particles, animations)
- [ ] Stats tracking (accuracy, fastest level, etc.)
- [ ] Daily challenges with fixed seed
- [ ] Multiplayer competition (local high scores)

---

## 🚀 How to Test

1. Open `~/mistereh.ca/steam-punk-games/` in browser
2. Click "Start Game"
3. Type the letters that appear
4. Try to reach the target before the enemy escapes!
5. Report back: Which level was too easy/hard? How long did it take?

---

**Next Steps:**
- Play through all 4 levels
- Note your score at game over
- Suggest balance changes
- We'll tune numbers based on real play data!

---

*Refactored by OC1 on 2026-09-21 - From timed sequences to score-based escape prevention*
# Auto-redeploy Mon Sep 21 01:01:11 AM UTC 2026

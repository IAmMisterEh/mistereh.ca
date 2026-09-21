# Clockwork Words - Spiral Typing Drill ⚙️🕐

**An educational steampunk typing game for Grade 6 students!**

## 🎮 Game Features (Grade 6 Optimized)

### ✨ Core Mechanics - Spiral Letter Drill:
- **Continuous letter typing** - Type individual letters as they're revealed along a spiral path
- **All letters visible** - Spiral positions shown clearly, letters revealed one by one
- **Enemy escaping threat** - A red "enemy" moves along the spiral; type each letter before it escapes!
- **Progressive difficulty** - Letters appear faster as levels progress (1000ms → 500ms intervals)

### 📝 Educational Design:
- **Home row first** - Start with easy home row keys (asdfghjkl;)
- **Progressive keyboard access** - Unlock top row, bottom row, then full keyboard
- **Immediate feedback** - Correct letters glow gold, wrong letters show correction
- **Visual progress tracking** - Escape bar shows exact completion percentage

### ⏱️ Dual Timer System:
- **Clock hand** - Sweeps from -135° to +135° over session duration (45+ seconds)
- **Escape progress bar** - Shows spiral completion percentage (0% → 100%)
- **Color-coded urgency** - Bar shifts from gold → orange → red as escape progresses

## 🏫 How to Play

1. **Click "Start Game"** - Session timer begins (45 seconds at Level 1)
2. **Watch the spiral** - Letters are hidden but their positions are visible
3. **First letter reveals** - A letter appears, enemy moves to that position
4. **Type the letter** - Enter the shown letter before the next one reveals
5. **Continue the sequence** - Letters appear automatically every 1-0.5 seconds
6. **Complete the spiral** - Type all 30-45 letters to finish the sequence
7. **Earn points & repeat** - Get bonus points, then start the next sequence!

### ⚡ Goal:
Complete **10 sequences** to advance to the next level. Each level unlocks new keyboard keys and increases reveal speed!

## 📊 Scoring System

**Per Letter:**
- **Base**: 5 points
- **Time bonus**: +2 points per second remaining
- **Home row bonus**: ×1.5 if letter is on home row (a,s,d,f,g,h,j,k,l)
- **Example**: Typing "s" with 30 seconds left = 5 + 60 = 65 points (×1.5 = 97.5 → 97)

**Sequence Completion:**
- **Base bonus**: 10 points per letter in sequence
- **Time bonus**: +3 points per second remaining
- **Pure home row bonus**: ×1.5 if entire sequence used only home row keys

**Penalties:**
- Wrong letter: -1 second from timer
- Wrong letter: Visual shake and correction提示

## 🎓 Progression System

### Level 1: Home Row Master (Unlocked)
- **Letters**: a s d f g h j k l ;
- **Reveal rate**: 1000ms (1 letter per second)
- **Sequence length**: 30 letters
- **Session time**: 45 seconds

### Level 2: Top Row Explorer (100 total points)
- **Letters**: + q w e r t y u i o p
- **Reveal rate**: 800ms
- **Sequence length**: 35 letters
- **Session time**: 50 seconds

### Level 3: Bottom Row Master (250 total points)
- **Letters**: + z x c v b n m
- **Reveal rate**: 600ms
- **Sequence length**: 40 letters
- **Session time**: 55 seconds

### Level 4: Keyboard Commander (500 total points)
- **Letters**: Full keyboard + space, comma, period
- **Reveal rate**: 500ms
- **Sequence length**: 45 letters
- **Session time**: 60 seconds

## 🔧 Technical Architecture

### Core Components:

#### `ClockworkWordsTimedSpiral` Class
- **State Management**: Game state, progress tracking, localStorage persistence
- **Sequence Generation**: Random letter sequences with level-appropriate pools
- **Spiral Layout**: Calculates spiral coordinates for letter positioning
- **Reveal System**: Timed letter reveal with enemy movement
- **Input Validation**: Real-time letter validation with feedback
- **Score Calculation**: Complex scoring with bonuses and multipliers

#### Game Loops:
1. **revealLettersLoop()**: Controls letter reveal timing (1000ms → 500ms)
2. **gameLoop()**: Handles timer animation, UI updates, enemy movement
3. **handleTyping()**: Processes player input, validates letters

#### DOM Elements:
- `clock-face`: Visual timer with rotating hand
- `letter-trail`: Container for spiral letter positions
- `steam-enemy`: Red escaping threat element
- `escape-progress`: Progress bar showing completion percentage
- `player-input`: Hidden input field for typing
- `feedback`: Real-time feedback messages

### Key Methods:

```javascript
startSpiralDrill()
  → Generate sequence (30-45 letters)
  → Initialize spiral layout (all hidden)
  → Start reveal loop

revealLettersLoop(currentTime)
  → Check reveal timing
  → Call revealNextLetter() when ready
  → Monitor enemy movement
  → Trigger onSpiralComplete() when done

revealNextLetter(currentTime)
  → Reveal next letter (opacity 0→1)
  → Move enemy to target position
  → Update feedback display

validateSpiralLetter(typedChar)
  → Compare to current target
  → On correct: handleCorrectSpiralLetter()
  → On wrong: -1 second, visual feedback

onSpiralComplete()
  → Calculate completion bonus
  → Check level advancement (10 sequences)
  → Generate next sequence or end session
```

### State Persistence:
```javascript
localStorage:
  - 'clockworkWords_unlocked' → Highest unlocked level (1-4)
  - 'clockworkWords_totalScore' → Cumulative score
```

## 🎨 Steampunk Aesthetic

- **Brass & copper color scheme** - Victorian industrial theme
- **Clock face timer** - Integrated game mechanics
- **Spiral letter path** - Mechanical gear-like layout
- **Escaping enemy** - Red threat with lightning bolt (⚡)
- **Metallic borders** - Gear decorations in corners
- **Steam particle effects** - Animated particles (optional)

## 📱 Responsive Design

- **Mobile (<768px)**: Vertical layout, 240px clock, compact controls
- **Tablet (768-1000px)**: Side-by-side, 280px clock
- **Desktop (1000-1400px)**: Full layout, 300px clock
- **Large screens (>1400px)**: Expanded layout, 320px clock

## 🛠️ Customization Guide

### Adjusting Difficulty:

**Change reveal rates (game.js):**
```javascript
this.state.revealRate = 1000 - ((this.state.level - 1) * 150);
// Level 1: 1000ms, Level 2: 850ms, Level 3: 700ms, Level 4: 550ms
```

**Change sequences per level (game.js):**
```javascript
// In onSpiralComplete():
const sequencesPerLevel = 3; // Instead of 10 for shorter sessions
if (sequencesCompleted >= sequencesPerLevel && this.state.level < 4) {
    // Level up logic
}
```

**Change letter pools (game.js):**
```javascript
this.availableLetters = {
    1: 'asdfghjkl;',        // Custom home row
    2: 'asdfghjkl;qwerty',  // Custom addition
    3: 'asdfghjkl;qwertyzxcv',
    4: 'abcdefghijklmnopqrstuvwxyz'
};
```

### Visual Customization:

**Colors (game.css):**
```css
:root {
    --steam-brass-gold: #b89e6c;      /* Main accent */
    --steam-copper-brown: #8b4513;    /* Secondary */
    --steam-leather-dark: #3d2817;    /* Background */
    --steam-cream-parchment: #f5e6c8; /* Text */
    --steam-glow-orange: #ffaa33;     /* Glows */
}
```

**Enemy appearance (game.css):**
```css
#steam-enemy {
    background: radial-gradient(circle, #ff4444 30%, #ff8800 70%);
    /* Add custom styling */
}
```

## 🎓 Classroom Integration

### Lesson Ideas:

1. **Touch Typing Practice** - 10-minute warm-up before computer lab
2. **Home Row Mastery** - Focus on Level 1 until 90% accuracy
3. **Speed Challenge** - Who can complete Level 4 fastest?
4. **Progress Tracking** - Students track their total score over time
5. **Peer Competition** - Compare highest scores in class leaderboard

### Learning Objectives:

- **Keyboard familiarity** - Learn key positions without looking
- **Typing fluency** - Increase typing speed and accuracy
- **Time management** - Develop pacing under pressure
- **Sequential processing** - Follow ordered patterns
- **Error correction** - Learn from mistakes immediately

### Accessibility Features:

- **Large, clear text** - 28px letter size, high contrast
- **Visual progress cues** - Multiple indicators (clock, bar, enemy)
- **No time pressure to start** - Pause/resume available
- **Color-coded feedback** - Gold for correct, red for wrong
- **Audio cues** - (Future: optional sound effects)

## 🐛 Troubleshooting

**Enemy not moving?**
- Check JavaScript console for errors
- Verify `spinePoints` array is populated
- Ensure enemy element exists in DOM

**Letters not revealing?**
- Check `revealRate` value (should be 400-1000ms)
- Verify `currentIndex` increments correctly
- Check `state.isPlaying` is true

**Input not registering?**
- Ensure input field has focus (should auto-focus)
- Check for event listener conflicts
- Verify browser isn't blocking input

**Progress not saving?**
- Check localStorage permissions
- Verify `saveProgress()` called after each sequence
- Check browser in private/incognito mode (may not persist)

## 📈 Performance Notes

- **60 FPS target** - Uses `requestAnimationFrame` for smooth animation
- **Minimal DOM updates** - Only updates when state changes
- **Efficient layout** - CSS transforms instead of position updates
- **Memory management** - Event listeners properly cleaned up
- **No external dependencies** - Pure vanilla JavaScript

## 🔒 Privacy & Safety

- **100% client-side** - No server calls, no data sent
- **Local storage only** - Progress saved in browser
- **No accounts required** - Anonymous play
- **COPPA compliant** - Perfect for elementary classrooms
- **No ads or tracking** - Pure educational experience

## 📄 License & Usage

**CC BY-SA 4.0** - Free for educational use:
- ✅ Embed on school websites
- ✅ Modify for curriculum needs
- ✅ Use in commercial educational products
- ✅ Share with attribution

**Recommended Attribution:**
> "Clockwork Words Spiral Drill by OC1, based on original concept by MisterEh. Licensed under CC BY-SA 4.0."

---

**Created**: 2026-09-16  
**Last Updated**: 2026-09-20  
**Version**: 3.0 - Spiral Drill Edition  
**Theme**: Steampunk Victorian Industrial  
**Target**: Grade 6 (11-12 years)

**Related Docs:**
- [DESIGN-REVIEW.md](./DESIGN-REVIEW.md) - Technical change analysis
- [game.js](./game.js) - Source code
- [game.css](./game.css) - Stylesheet

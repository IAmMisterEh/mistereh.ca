# 🌀 Clockwork Words - Timed Spiral Drill

**A pure typing reflex game where letters appear automatically as an enemy escapes along a spiral path!**

## 🎮 How to Play

1. **Click "Start Spiral"** to begin
2. **Watch the spiral**: Letters will fade in one by one at the center
3. **The Enemy**: A red/orange glowing orb (⚡) starts at the center and moves outward
4. **Type the letter**: When a letter glows gold, type it immediately!
5. **Keep typing**: Each correct letter makes the enemy move toward escape
6. **Complete the sequence**: Type all 30+ letters before time runs out

### Visual Guide:
```
[Enemy at center] → [Letter appears] → [Type it!] → [Enemy moves outward]
       ↓
[Next letter appears further out] → [Repeat until all letters typed]
       ↓
[Escape progress bar fills blue→orange→red as enemy approaches edge]
```

## 🔑 Game Mechanics

### Automatic Reveal System
- **Level 1**: 1 letter per second (30 letters total) - Great for learning!
- **Level 2**: 1.25 letters/sec (35 letters)
- **Level 3**: ~1.67 letters/sec (40 letters)
- **Level 4**: 2.5 letters/sec max speed (45 letters)

### Escape Progress Bar
Located at bottom of clock face:
- 🔵 **Blue/Gold** (0-50%): Safe - you're ahead!
- 🟠 **Orange/Red** (50-80%): Warning - getting urgent!
- 🔴 **Red** (80-100%): Critical escape imminent!

### Scoring
- **+5 points**: Base score per letter
- **+2× Time bonus**: For quick responses
- **+50% Home Row Bonus**: All `a s d f g h j k l ;` letters get extra points!
- **+50% Pure Sequence Bonus**: Complete a 100% home-row drill for maximum points!

## 🏆 Progression System

**Advance Levels by completing 10 sequences:**
- Level 1: Home Row Letters (30 letters, 45s)
- Level 2: + Top Row (qwertyuiop, 35 letters, 50s)
- Level 3: + Bottom Row (zxcvbnm, 40 letters, 55s)
- Level 4: Full Keyboard (30 letters, 60s) - MAX SPEED!

## 💡 Educational Value

**Why this works:**
- ✅ **No memorization required**: Just see and type what's on screen
- ✅ **Pure typing reflex training**: Builds muscle memory without cognitive load
- ✅ **Visual urgency**: Creates natural pacing through time pressure
- ✅ **Progressive difficulty**: Scales with player skill
- ✅ **Home-row focus**: Ensures proper finger placement from start

## 🎨 Visual Elements

### The Enemy (⚡)
- Red/orange glowing orb representing escaped energy
- Smooth animation follows spiral path letter-by-letter
- Pulsing effect when moving to new position
- Visual urgency increases as progress bar fills

### Spiral Letters
- Arranged along Archimedean spiral from center outward
- Color-coded: **Gold** for vowels, **Brass** for consonants
- Current target letter **pulses gold** with glow effect
- Typed letters **dim** and scale down (0.8x)
- Future letters remain visible but normal size

### Clock Timer
- Hand sweeps from -135° to +135° as time expires
- Visual correlation between timer rotation and spiral completion
- Red warning when 5 seconds or less remaining

## 🛠️ Technical Details

**File Structure:**
```
steam-punk-games/
├── index.html              # Game container & layout
├── game.css                # Steampunk styling & animations
└── game.js                 # Timed spiral drill logic (this version)
```

**Key Functions:**
- `startSpiralDrill()` - Initialize new sequence
- `showSpiralLayout()` - Create letter positions on spiral
- `revealLettersLoop()` - Automatic reveal timer loop
- `revealNextLetter()` - Display next target letter
- `updateEscapeBar()` - Progress bar visualization
- `moveEnemyToPosition()` - Enemy animation along spiral

## 🚀 Future Enhancements

**Planned Features:**
- [ ] Sound effects for letter reveals
- [ ] Combo multiplier system for consecutive correct letters
- [ ] Different spiral patterns (clockwise, figure-8, etc.)
- [ ] Multiple enemy types with different visual themes
- [ ] "Boss level" - accelerated reveal rate with time bonus multipliers

## 📚 References

**Inspired by:**
- Timed typing drills for reflex training
- Visual rhythm games (Geometry Dash, osu!)
- Educational typing curricula focusing on home-row mechanics

**Technical Inspiration:**
- Archimedean spiral mathematics
- Smooth lerp animations for enemy movement
- CSS keyframe animations for pulsing effects

---

**Made with ❤️ by MisterEh | Licensed under MIT**
*Type fast, think quick!* ⌨️✨

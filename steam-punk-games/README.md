# Clockwork Words - Grade 6 Edition ⚙️🕐

**An educational steampunk typing game designed for Grade 6 students!**

## 🎮 Game Features (Grade 6 Optimized)

### ✨ Enhanced Visual Design:
- **Large, clear clock face** - The timer IS the clock! Watch the hand sweep around as time expires
- **Letters visible around clock** - No guessing which letter is next! All letters displayed clearly
- **Color-coded vowels vs consonants** - Gold for vowels, brass for consonants (educational reinforcement)

### 📝 Educational Improvements:
- **Word displayed prominently at top** - Players read the word clearly, no guessing required
- **Grade 6 vocabulary only** - Words appropriate for 11-12 year olds in science, history, and general knowledge
- **Visual feedback on typing** - Correct letters glow gold with underline, wrong letters show through strike-through
- **Immediate correction** - Wrong answers show correct word clearly

### ⏱️ Visual Timer:
- **Clock hand depletes as time runs out** - Start at -135° (top-left), sweep to 135° (bottom-right)
- **Color-coded timer** - Gold → orange → red as time expires
- **Progress bar backup** - Bottom progress bar for additional visual cue

## 🏫 Grade 6 Word Bank

Words are categorized by difficulty but all age-appropriate:

**Easy Level:** steam, gear, brass, copper, forge, anvil, lever, valve, wrench, gauge, piston, engine

**Medium Level:** boiler, turbine, pump, shaft, axle, flywheel, circuit, battery, magnet, voltage, current, energy

**Hard Level:** mechanism, instrument, telegraph, velocity, pressure, resistor, conductor, transmission, propulsion

*More words can be added by editing `this.wordLists` in `game.js`*

## 🔧 Technical Architecture

### Core Files:
- `index.html` - Game structure (no changes needed)
- `game.css` - Enhanced with larger clock, better responsive design
- `game.js` - Complete rewrite for Grade 6 educational gameplay

### Key Improvements:
1. **Word display**: Clear text at top instead of hidden underscores
2. **Letter visibility**: All letters displayed around clock face
3. **Visual timer**: Clock hand rotates to show time depletion
4. **Grade-appropriate words**: Curated vocabulary for 11-12 year olds
5. **Instant feedback**: Visual highlighting as player types

## 🎯 Educational Goals

- **Reading practice** - Students see complete word, read it aloud or silently before typing
- **Spelling reinforcement** - Repeated exposure to grade-level vocabulary
- **Science literacy** - Words related to mechanics, energy, engineering concepts
- **Typing skills** - Builds keyboard fluency with timed practice
- **Time management** - Visual timer teaches pacing under pressure

## 🚀 How to Play

1. **Click "Start Game"** - Timer begins at 30 seconds
2. **Read the word** - Clearly displayed at top of screen (e.g., "FLYWHEEL")
3. **Watch letters around clock** - All letters visible, no guessing!
4. **Type the word** - Use your keyboard to type exactly as shown
5. **Get instant feedback**:
   - ✅ Correct: Letters glow gold, +points awarded
   - ❌ Wrong: Incorrect letters strikethrough, timer penalty
6. **Complete 10 words per level** to advance!

## 📊 Scoring System

- **Base score**: Word length × 10 points (e.g., "FLYWHEEL" = 8 letters = 80 pts)
- **Speed bonus**: Remaining seconds × 2 points (encourages quick typing)
- **Penalty**: Wrong answers lose 2 seconds (teaches accuracy over speed)

## 🎨 Steampunk Aesthetic

- **Brass & copper color scheme** - Victorian industrial theme
- **Clock face timer** - Game mechanics match visual design
- **Gears and mechanical elements** - Corner decorations, metallic borders
- **Aged parchment feel** - Cream text on dark backgrounds
- **Steam effects** - Animated particles (optional enhancement)

## 🛠️ Customization Guide

### Adding New Words:
Edit `game.js` in the `wordLists` object:
```javascript
this.wordLists = {
    easy: ['your', 'grade6', 'words', ...],
    medium: [...],
    hard: [...]
};
```

**Tips for Grade 6 vocabulary:**
- Science terms (energy, circuit, magnet, pressure)
- History terms (telegraph, mechanism, transmission)
- General knowledge (velocity, engine, turbine)
- Avoid overly complex words or obscure jargon

### Adjusting Timer:
Modify `game.js`:
```javascript
state.timeRemaining = 30 + (this.state.level - 1) * 5;
// Time per level starts at 30s, adds 5s per level
```

### Color Scheme:
All colors defined as CSS variables in `game.css`. Change hex values to match your branding while maintaining steampunk aesthetic.

## 📱 Responsive Design

- **Mobile** (<600px): Compact layout, smaller fonts
- **Desktop** (1000-1399px): Medium clock (330px), spacious but fits screen
- **Large screens** (≥1400px): Extra large clock (350px), maximum visibility

## 🔒 Privacy & Safety

- No external data collection
- All game logic runs client-side in browser
- No user accounts or personal information required
- Perfect for classroom use without privacy concerns

## 🎓 Classroom Integration Ideas

1. **Daily warm-up** - 5-minute typing practice before science lessons
2. **Vocabulary building** - Use word lists aligned with current curriculum
3. **Competitive play** - Who can type "FLYWHEEL" fastest?
4. **Science reinforcement** - Words like "boiler," "turbine," "velocity" reinforce lesson content
5. **Accessibility** - Clear visual display helps students with learning differences

## 🐛 Troubleshooting

**Word not appearing clearly?**
- Check browser zoom level (should be 100%)
- Verify JavaScript is enabled
- Look for the large gold text at top of game area

**Timer not moving?**
- Ensure game has started (click "Start Game")
- Check if paused (button says "Resume")

**Can't type word?**
- Click in input box first - it should be focused with cursor blinking
- If using mobile, tap to focus keyboard

## 📄 License & Usage

**100% original educational game** - Free for classroom use:
- ✅ Embed on school websites
- ✅ Modify for your curriculum
- ✅ No attribution required (but appreciated!)
- ✅ Commercial use allowed if desired

---

**Created**: 2026-09-16  
**Version**: 2.0 - Grade 6 Educational Edition  
**Theme**: Steampunk Victorian Industrial

# Clockwork Words - Steampunk Typing Game

A modular, original steampunk-themed clock-based typing game. **100% your property** - no copyright concerns!

## 📁 Project Structure

```
steampunk-clock-games/
├── index.html          # Main game container
├── game.css           # All styling (steampunk theme)
├── game.js            # Core game logic and mechanics
└── README.md          # This documentation file
```

## 🎮 How to Play

1. **Open** `index.html` in a web browser
2. **Click** "Start Game" to begin
3. **Watch** letters appear around the clock face
4. **Type** each word before time runs out
5. **Complete** 10 words per level to advance
6. **Level up** increases difficulty and available time

## ⚙️ Technical Architecture

### Modular Design Pattern
- **HTML**: Semantic structure, accessible markup
- **CSS**: CSS custom properties (variables), responsive design, animations
- **JavaScript**: Class-based encapsulation (`ClockworkWords` class), event-driven architecture

### Key Features
- ✅ **Pure vanilla JS** - No dependencies, runs everywhere
- ✅ **Responsive** - Works on desktop and mobile
- ✅ **Progressive difficulty** - 3 word difficulty tiers
- ✅ **Score system** - Points based on length + speed bonus
- ✅ **Steampunk aesthetic** - Brass, copper, gears, steam effects
- ✅ **Clean separation** - Each file is independently extendable

### Game State Management
```javascript
{
    isPlaying: boolean,
    isPaused: boolean,
    level: number (1+),
    score: number,
    timeRemaining: seconds,
    currentWord: string,
    wordIndex: number (0-9 per level),
    maxWordsPerLevel: 10,
    clockHandRotation: degrees,
    gameLoopId: animation frame ID
}
```

## 🛠️ Extending the Game

### Adding New Words

Edit `game.js` in the `wordLists` object:

```javascript
this.wordLists = {
    easy: ['additional', 'words', 'you', 'want', ...],
    medium: [...],
    hard: [...]
};
```

**Suggested word categories for education:**
- Subject-specific vocabulary (science, history, math terms)
- Grade-level reading words
- Spelling practice lists
- Phonics patterns

### Customizing Difficulty

Modify these values in `game.js`:

```javascript
// Words per level
maxWordsPerLevel: 10,

// Base time and difficulty progression
timeRemaining: 30 + (this.state.level - 1) * 5,
```

### Changing the Theme

All steampunk colors are defined in `game.css` CSS variables:

```css
:root {
    --steam-dark-bg: #1a1614;
    --steam-panel-bg: #2d2520;
    --steam-brass-gold: #b89e6c;
    --steam-copper-brown: #8b4513;
    /* ... more variables ... */
}
```

To create a new theme (e.g., cyberpunk, nature), just update these hex values!

## 📱 Mobile Support

- ✅ Responsive clock face scaling
- ✅ Touch-friendly input handling
- ✅ Auto-focus for mobile keyboards
- ✅ Works on iOS and Android

## 🔧 Development Workflow

### Quick Start
```bash
cd steampunk-clock-games
# Open index.html in browser
```

### Adding Steam Particle Effects

Currently a placeholder. To implement:

1. Add particle generator in `game.js`:
```javascript
createSteamParticle() {
    const particle = document.createElement('div');
    particle.className = 'steam-particle';
    // Randomize size, position, animation duration
    this.steamContainer.appendChild(particle);
    
    setTimeout(() => particle.remove(), 3000);
}
```

2. Trigger periodically during gameplay

### Analytics Integration

Hook into game events for tracking:

```javascript
// Track word completions
this.onCorrectWord(word) {
    // Send to analytics
    gtag('event', 'word_complete', {
        word_length: word.length,
        level: this.state.level,
        score_earned: totalPoints
    });
}
```

## 🎨 Design Assets (Future)

Current implementation uses CSS-only graphics. For enhanced visuals:

- **SVG gears** for clock decorations
- **Animated steam fog overlays**
- **Sound effects** (clock ticks, correct/incorrect feedback)
- **Custom fonts** (Victorian-style typefaces)

## 📄 License & Usage

This game is **original code** created specifically for your website. You own 100% of it:
- ✅ Can embed in any website
- ✅ Can modify however you wish
- ✅ Can commercialize if desired
- ✅ No attribution required (but appreciated!)

## 🚀 Deployment Checklist

- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Verify mobile responsiveness
- [ ] Add your custom word lists
- [ ] Configure scoring to match educational goals
- [ ] Deploy to your web hosting
- [ ] Add analytics tracking (optional)

## 💡 Next Steps for Your Team

1. **Content Integration**: Replace placeholder words with actual educational vocabulary
2. **Progress Tracking**: Implement user accounts or localStorage for score persistence
3. **Achievement System**: Badges for milestones (e.g., "Speed Typist", "Perfect Round")
4. **Multiplayer Mode**: Competitive timed challenges between students
5. **Teacher Dashboard**: View student performance analytics

## 🐛 Troubleshooting

**Game not starting?**
- Check browser console for errors (F12)
- Ensure all three files are in same directory
- Verify file paths in `<link>` and `<script>` tags

**Mobile input issues?**
- Clear cache and reload
- Test different browsers on device
- Verify `autofocus` attribute is present

## 📞 Support

For questions or extension requests, consult this documentation first. The modular design makes it easy to:
- Add new features without breaking existing code
- Swap out components independently
- Scale difficulty curves for different age groups

---

**Created**: 2026-09-16  
**Version**: 1.0.0  
**Theme**: Steampunk Victorian Industrial

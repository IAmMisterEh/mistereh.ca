# Steam Defender - Spiral Mode

## Game Mechanics (Zuma/Snake Balls inspired)

### Core Gameplay
- **Enemies spawn at the center** of a spiral and move outward along the spiral path
- **Each enemy displays a random letter** (A-Z)
- **Type the letter of the closest enemy** to the spiral's end (escape point)
- **Cannon fires** when you type correctly, destroying that specific enemy
- **If ANY enemy reaches the end** of the spiral → Game Over
- **Clear all enemies in a round** → Victory! → Next round begins

### Round System
- **No health system** - it's all or nothing!
- **Each round has:**
  - A target score (starts at 50, +25 per round)
  - A fixed number of enemies (starts at 5, +2 per round)
  - Progressive difficulty (faster spawns, faster enemies)

### Scoring
- **+10 points** per correct letter typed
- **Round complete** when you reach target score AND eliminate all enemies
- **Fail condition** = any single enemy escapes

### Progressive Difficulty
| Round | Target Score | Enemies | Spawn Interval | Enemy Speed |
|-------|-------------|---------|----------------|-------------|
| 1     | 50          | 5       | 2500ms         | 1.3x        |
| 2     | 75          | 7       | 2100ms         | 1.6x        |
| 3     | 100         | 9       | 1900ms         | 1.9x        |
| 4+    | +25/round   | +2      | -200ms/round   | +0.3/round  |

### Controls
- **SPACE** - Start/Restart round
- **Letter keys (A-Z)** - Type the target letter

### Visual Features
- ✅ Spiral path guide (faint gold lines)
- ✅ Color-coded enemies (random HSL colors)
- ✅ Cannon animation (fires from bottom center)
- ✅ Projectile trajectory (visible arc)
- ✅ Explosion effects (expanding colored circles)
- ✅ Real-time target display (shows which letter to type)

## File Location
`/home/vboxuser/steampunk-clock-games/spiral-defender.html`

## To Play
1. Start a local server: `cd /home/vboxuser/steampunk-clock-games && python3 -m http.server 8080`
2. Open: `http://localhost:8080/spiral-defender.html`
3. Press SPACE to start
4. Type the **target letter** shown in the UI

## Next Enhancement Ideas
- [ ] Sound effects (cannon fire, explosion, success/fail)
- [ ] Different spiral patterns (tighter, wider, multi-turn)
- [ ] Power-ups (freeze time, multi-shot, letter shield)
- [ ] Boss enemies (require multiple hits)
- [ ] Combo system (consecutive correct hits = bonus points)
- [ ] Letter pool customization (remove difficult letters, focus on specific sets)

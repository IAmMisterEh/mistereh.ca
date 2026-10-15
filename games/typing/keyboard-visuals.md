# Clockwork Words - Keyboard Visual System Design

## 🎨 **Visual Concept: Dynamic Keyboard Overlay**

Instead of just showing the word, display a **virtual QWERTY keyboard** that lights up as letters appear in the word!

### **Layout:**
```
┌─────────────────────────────────────────────┐
│  [f] ← Enemy at center                       │
│   ↓                                         │
│  [l]-[y]-[w]-[h]-[e]-[e]-[l]               │
│             ↓                               │
│  ESCAPE PATH: Spiral expanding outward       │
└─────────────────────────────────────────────┘

Visual Elements:
1. Enemy sprite at center (clockwork steam-golem)
2. Chain line connecting enemy to each letter position
3. Letters arranged in spiral pattern
4. Light trail follows escape path
5. Steam particles erupt when letters typed
```

## ⌨️ **Keyboard Integration Design:**

### **On-Screen Keyboard Display:**

**Position:** Bottom of screen, below clock face

**Color Coding by Hand:**
- 🔵 **Left Hand Home Row**: a s d f (blue glow)
- 🟠 **Right Hand Home Row**: j k l ; (orange glow)  
- ⚪ **Home Row Other Keys**: g h (white glow)

**Visual States:**
1. **Locked Level**: Grayed out, lock icon
2. **Unlocked Level**: Full color, unlocked padlock icon
3. **Active Letter**: Bright pulse animation
4. **Typed Letter**: Dimmed, strike-through effect

```html
<!-- Keyboard Layout Structure -->
<div class="keyboard-display">
  <div class="row top-row" data-level="2">
    <button class="key locked" data-letter="q">Q</button>
    <button class="key locked" data-letter="w">W</button>
    <!-- ... other top row keys ... -->
  </div>
  
  <div class="row home-row" data-level="1">
    <button class="key active" data-letter="a">A</button>
    <button class="key active" data-letter="s">S</button>
    <!-- ... other home row keys ... -->
  </div>
  
  <div class="row bottom-row locked" data-level="3">
    <button class="key locked" data-letter="z">Z</button>
    <!-- ... other bottom row keys ... -->
  </div>
</div>
```

## 🎯 **Animation Flow:**

### **Game Start:**
1. Keyboard loads with:
   - Home row keys **fully colored** (unlocked)
   - Other rows **grayed out** (locked)
   - Lock icons on unavailable letters

2. Enemy spawns at keyboard center position

3. First letter appears in word → corresponding key lights up on virtual keyboard

### **Letter Appears:**
- Key flashes green/yellow based on level
- Chain line extends from enemy to that key's position
- Visual pull effect (enemy "jerked" toward letter)

### **Player Types Letter:**
- Key flashes bright white → dims
- Chain line breaks with steam burst animation
- Enemy halts movement

### **Delay Too Long:**
- Next key begins flashing (urgent red pulse)
- Enemy moves incrementally outward
- Timer bar shortens visibly

## 🌟 **Visual Feedback System:**

### **Color Palette:**
```css
--keyboard-home-left: #4a90e2;  /* Blue */
--keyboard-home-right: #ff8c00; /* Orange */
--keyboard-other: #f5e6c8;      /* Cream */
--keyboard-locked: #3d3d3d;     /* Gray */
--keyboard-active: #ffd700;     /* Gold pulse */
--keyboard-typed: #ff4444;      /* Red (for errors) */
```

### **Animation Types:**
1. **Flash**: Quick brightness pulse (letter appears)
2. **Pulse**: Rhythmic breathing (waiting for input)
3. **Burst**: Steam explosion when letter typed
4. **Slide**: Letter moves from center to position
5. **Break**: Chain line snaps with visual crack effect

### **Key States:**

| State | Visual Effect | Sound Effect |
|-------|--------------|--------------|
| Locked | Gray, lock icon | None |
| Unlocked | Full color, unlock sound | Chime |
| Active | Bright pulse, yellow glow | Tick tick tick |
| Typed | Dimmed + strike-through | Positive chime |
| Error | Red flash, shake animation | Negative buzz |

## 🎨 **CSS/Implementation Sketch:**

```css
.keyboard-display {
    display: grid;
    grid-template-rows: repeat(3, 1fr);
    gap: 8px;
    margin-top: 20px;
}

.row {
    display: flex;
    justify-content: center;
    gap: 6px;
}

.key {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: #3d3d3d; /* locked gray */
    color: #666;
    font-weight: bold;
    transition: all 0.2s ease;
}

.key.unlocked {
    background: var(--keyboard-home-left);
    color: #fff;
    box-shadow: 0 0 10px rgba(74, 144, 226, 0.5);
}

.key.active {
    animation: pulse-active 0.5s infinite;
    background: var(--keyboard-active);
}

.key.typed {
    opacity: 0.5;
    text-decoration: line-through;
}

@keyframes pulse-active {
    0%, 100% { box-shadow: 0 0 10px var(--keyboard-active); }
    50% { box-shadow: 0 0 20px var(--keyboard-active); }
}

.key.error {
    animation: shake-error 0.3s;
    background: #ff4444 !important;
}

@keyframes shake-error {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}
```

## 🎮 **Unlock System Visualization:**

### **Achievement Badge Display:**
```html
<div class="unlock-status">
  <div class="level-badge unlocked" title="Home Row Master">
    🔑 Home Row
  </div>
  
  <div class="level-badge locked" title="Top Row Explorer - Unlock at 100 points">
    🔒 Top Row
  </div>
  
  <div class="level-badge locked" title="Bottom Row Master - Unlock at 250 points">
    🔒 Bottom Row
  </div>
  
  <div class="level-badge locked" title="Keyboard Commander - Unlock at 500 points">
    🔒 Master Level
  </div>
</div>
```

### **Visual Progress Indicators:**
- **Progress bar** showing % to next unlock
- **Lock icon** on unavailable levels
- **Star rating** on completed levels (3 stars = perfect run)

## 🎯 **Implementation Priority:**

1. ✅ **Base word lists** (Home row first) - DONE
2. ✅ **Unlock logic system** - DONE  
3. ⏳ **On-screen keyboard UI** - Next step
4. ⏳ **Chain reaction animations** - Future
5. ⏳ **Enemy movement system** - Future

This visual integration will make the typing progression feel **tangible and rewarding** - students will literally "unlock" new keys on their virtual keyboard as they improve! 🎮⌨️✨

---

**Status:** Visual design complete, ready for implementation. Would you like to see a live prototype of the keyboard display next?

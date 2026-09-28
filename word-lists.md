# Clockwork Words - Typing Mastery Word Lists

## Level 1: Home Row (Unlocked by Default)
**Letters:** `a s d f j k l ;`  
**Words (only using these 10 letters):**

### Basic Words (3-4 letters)
```
dad, sad, mad, lad, gas, tag, gag, ask, task, mask, fast, last, sea, tee, pee, lee, bee, saga, gala, sally
```

### Extended Words (5+ letters)
```
daddy, maddie, lady, gaga, saga, gala, fad, mad, sad, dad, gas, tag, gag, ask, task, mask, fast, last, cast, mast, sea, tea, pee, lee, bee, saga, gala, sally, daisy (no i), galaxy (no x,y)
```

**Refined Home-Row Only List:**
```javascript
const homeRowWords = [
  'dad', 'sad', 'mad', 'lad', 
  'gas', 'tag', 'gag', 'saga', 'gala',
  'ask', 'task', 'mask',
  'fast', 'last', 'cast', 'mast',
  'sea', 'tee', 'pee', 'lee', 'bee',
  'sally', 'gala', 'daddy', 'maddie'
];
```

## Level 2: Top Row Unlock (Score: 100+)
**New Letters:** `q w e r t y u i o p`  
**Unlock Threshold:** 100 total points

**Words combining home row + top row:**
- Quick, water, better, letter, factory, keyboard, typing
- Party, early, story, carry, marry, funny, sunny, daddy
- Water, later, matter, butter, gutter, cutter, letter
- Query, pretty, city, fifty, thirty, forty, eighty

## Level 3: Bottom Row Unlock (Score: 250+)
**New Letters:** `z x c v b n m , . /`  
**Unlock Threshold:** 250 total points

**Words combining home row + top row + bottom row:**
- Cabin, camera, computer, system, monitor, mouse, screen
- Zebra, zero, box, fox, mix, fix, wax, tax
- Camera, camera, computer, system, monitor, screen
- Matrix, matrix, factory, battery, category, data

## Level 4: Full Keyboard + Space (Score: 500+)
**All letters accessible**  
**Unlock Threshold:** 500 total points

**Grade 6 Vocabulary:**
- Technology, education, learning, classroom, students, teacher
- Mathematics, science, history, geography, literature
- Computer, keyboard, screen, monitor, mouse, printer
- Library, research, project, report, essay, reading

## Word Categories by Difficulty:

### Beginner (Home Row Only)
**Focus:** Muscle memory for home positions  
**Goal:** Type 10 words correctly with no looking at keyboard

### Intermediate (Top Row Added)
**Focus:** Extending finger reach  
**Goal:** Type 15 words, maintain accuracy >85%

### Advanced (Bottom Row Added)
**Focus:** Full hand stretch and coordination  
**Goal:** Type 20 words, speed >30 WPM

### Master (All Keys)
**Focus:** Real-world typing fluency  
**Goal:** Type Grade 6 vocabulary at grade-level speed

## Unlock System Logic:

```javascript
const unlockThresholds = {
  level1: { threshold: 0, name: "Home Row", alwaysAvailable: true },
  level2: { threshold: 100, name: "Top Row Explorer" },
  level3: { threshold: 250, name: "Bottom Row Master" },
  level4: { threshold: 500, name: "Keyboard Commander" }
};

// Save progress to localStorage
function saveUnlockedLevel(level) {
  localStorage.setItem('clockworkWords_unlocked', level);
}

function getUnlockedLevel() {
  return parseInt(localStorage.getItem('clockworkWords_unlocked')) || 1;
}
```

## Implementation Notes:

- **Level 1** is always available (home row mastery)
- **Levels 2-4** unlock based on cumulative score
- **Score persistence** across game sessions
- **Visual indicators** for locked/unlocked levels
- **Achievement badges** for each unlock milestone

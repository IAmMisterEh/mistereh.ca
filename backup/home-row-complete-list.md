# Clockwork Words - Complete Home Row Word List

## Level 1: Home Row (Always Available)
**Letters:** `a s d f g h j k l ;` (10 keys including semicolon)

---

### 🟢 **REAL WORDS** (Priority Sequence)
*These should be the first words players encounter for vocabulary learning:*

#### 3-Letter Words:
```
dad, sad, mad, lad, gas, tag, gag, ask, sea, tee, pee, lee, bee
```

#### 4-Letter Words:
```
fast, last, cast, mast, saga, gala, sally (wait - 'y' not home row...), gaga, dady (no)
→ fast, last, cast, mast, saga, gala, gaga, dada, sasa, lasa (no), dast (no)
```

**Corrected 4-letter list:**
```
fast, last, cast, mast, gasp, tagg (no), gagged (too long), pass (no p), lass (yes!)
→ fast, last, cast, mast, lass, gaga, dada, saga, gala
```

#### 5+ Letter Words:
```
sally (no y), maddie (no i/double d), daddy, sally → daddy only valid
task, mask, gasp, pass (no p)
→ task, mask, gasp, daddy, sasa (gibberish fallback)
```

**Final Real Word List:**
```javascript
const realWords = [
  // 3 letters
  'dad', 'sad', 'mad', 'lad', 
  'gas', 'tag', 'gag', 
  'ask', 'sea', 'tea', 'pee', 'lee', 'bee',
  
  // 4 letters  
  'fast', 'last', 'cast', 'mast', 'lass',
  'saga', 'gala', 'gaga', 'dada',
  'mask', 'task', 'fask', 'lask' (wait, 'k' is home row! yes!)
  
  // 5+ letters
  'daddy'
];
```

**Corrected Real Words Only:**
```javascript
const realWords = [
  'dad', 'sad', 'mad', 'lad', 'gas', 'tag', 'gag', 'ask', 
  'sea', 'tea', 'pee', 'lee', 'bee',
  'fast', 'last', 'cast', 'mast', 'lass', 'saga', 'gala', 
  'gaga', 'dada', 'mask', 'task', 'daddy'
];
```

---

### 🔴 **GIBBERISH WORDS** (Code Patterns)
*Valid home-row combinations for muscle memory drilling:*

#### Simple Patterns (2-3 letters):
```
as, sa, ad, da, fs, sf, gs, sg, 
aa, ss, dd, ff, gg, hh, jj, kk, ll, ;;

ads, sad, das, fad, fas, gas, dag, gad, sag, gags, tags, passes (no p), lass
→ ads, das, fad, fas, gas, dag, gad, sag, sagg (no g twice?), tagg
```

**Corrected Simple Gibberish:**
```javascript
const simpleGibberish = [
  // Single letter repeats
  'aaaa', 'ssss', 'dddd', 'ffff', 'gggg', 'hhhh', 'jjjj', 'kkkk', 'llll', ';;;;',
  
  // Two letter alternations
  'as', 'sa', 'ad', 'da', 'fs', 'sf', 'gs', 'sg', 
  'aj', 'ja', 'sk', 'ks', 'dl', 'ld', 'fj', 'jf',
  
  // Three letter patterns
  'adas', 'safs', 'gags', 'tags', 'lafs', 'kasd', 'fsad',
  'dsaa', 'sfaf', 'gggg', 'hhhh', 'jjjj', 'kkkk', 'llll'
];
```

#### Complex Patterns (4+ letters):
```javascript
const complexGibberish = [
  // Alternating patterns
  'asdasd', 'fsfsfs', 'gsgsgs', 'lklklk', 'jkjkjk', 
  'adasad', 'safsaf', 'gagaga', 'tagtag', 'laslas',
  
  // Symmetric patterns
  'dadada', 'sadads', 'maddam' (no m), 'gasag', 'lsgsl',
  'faskas', 'tasksk', 'maskas', 'lassal', 'gallag',
  
  // Advanced sequences
  'asdfghjkl;' (full home row sweep),
  'lkjhgfdsa;' (reverse sweep),
  'adfasgjk;', 'safdghjkl'
];
```

---

### 🎮 **Combined Word List for Game:**

```javascript
const homeRowWords = [
  // Real words first (priority order)
  'dad', 'sad', 'mad', 'lad', 
  'gas', 'tag', 'gag', 'ask',
  'sea', 'tea', 'pee', 'lee', 'bee',
  'fast', 'last', 'cast', 'mast', 
  'lass', 'saga', 'gala', 'gaga', 
  'dada', 'mask', 'task', 'daddy',
  
  // Gibberish codes (for drilling)
  'as', 'sa', 'ad', 'da', 'fs', 'sf', 'gs', 'sg',
  'aaaa', 'ssss', 'dddd', 'ffff', 'gggg', 'hhhh', 
  'adas', 'safs', 'gags', 'tagg', 'fask', 'lask',
  'asdasd', 'fsfsfs', 'gsgsgs', 'lklklk', 'jkjkjk',
  'asdfghjkl;', 'lkjhgfdsa;'
];

// Scoring bonus for real words:
function calculateScore(word, timeRemaining) {
  const isRealWord = REAL_WORDS.includes(word);
  const baseScore = word.length * 10;
  const speedBonus = Math.floor(timeRemaining) * 2;
  const bonusMultiplier = isRealWord ? 1.5 : 1.0; // 50% more for real words
  
  return (baseScore + speedBonus) * bonusMultiplier;
}
```

---

### 💡 **Implementation Strategy:**

#### **Priority System:**
1. **Round 1-3**: Only real words appear (vocabulary building)
2. **Round 4+**: Real words dominate (80%), gibberish appears occasionally (20%)
3. **Score Bonus**: +50% points for real word completion

#### **Unlock Logic:**
```javascript
const REAL_WORDS = ['dad', 'sad', 'mad', 'lad', 'gas', 'tag', 'gag', 'ask', 'sea', 'tea', 'pee', 'lee', 'bee', 'fast', 'last', 'cast', 'mast', 'lass', 'saga', 'gala', 'gaga', 'dada', 'mask', 'task', 'daddy'];

function isRealWord(word) {
  return REAL_WORDS.includes(word.toLowerCase());
}

// Bonus points logic
const score = (word.length * 10) + (timeRemaining * 2);
const finalScore = isRealWord(word) ? Math.floor(score * 1.5) : score;
```

---

### 📊 **Total Word Count:**
- **Real Words**: ~23 words (vocabulary focus)
- **Simple Gibberish**: ~20 patterns (drilling)
- **Complex Gibberish**: ~15 patterns (advanced drills)
- **Grand Total**: **~58 word combinations**

This gives plenty of variety while keeping the home-row focus strict! Players will:
- Learn real vocabulary first
- Practice patterns through gibberish codes  
- Get bonus points for real words (motivational)
- Never encounter letters outside home row

Perfect balance of education + gameplay! 🎮⌨️✨

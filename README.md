# ⚡ DSA Progress Tracker

A fully self-contained, single-file HTML website for tracking your Data Structures & Algorithms practice — with live **LeetCode integration**, smart recommendations, and zero setup required.

> **No Node.js. No MongoDB. No installation. Just open `dsa-tracker.html` in your browser.**

---

## 🚀 Quick Start

1. Download `dsa-tracker.html`
2. Open it in any modern browser (Chrome, Firefox, Edge, Safari)
3. Done — your tracker is live and saving data locally

---

## 📸 What's Inside

### 📊 Dashboard
- **4 stat cards** — Total Solved, In Progress, This Week, Current Streak
- **Live LeetCode panel** — shows your real LC stats (total, Easy / Medium / Hard) once connected
- **Difficulty breakdown** — animated SVG rings for Easy / Medium / Hard completion %
- **Topic progress bars** — one bar per DSA topic, updates in real time as you solve problems

### 🧩 Problems Page
- **62 curated questions** pre-loaded across 18 DSA topics
- **Collapsible topic sections** with mini progress bars in the header
- **One-click status cycling** — click the status badge to go `Todo → In Progress → Solved`
- **Inline notes editor** — expand a notes panel on any question and save thoughts
- **LeetCode sync badges** — questions auto-matched from LeetCode are marked with 🟧
- **Filter bar** — filter by Difficulty, Status, or "LeetCode Synced" at the same time
- **Search** — instant search across titles and tags
- **+ Add Problem** — add any custom question with topic, difficulty, URL, tags, and platform

### 💡 Recommendations Sidebar *(Problems page)*
- **Daily picks** shown by default, based on your current In Progress / Todo questions
- **Per-question recommendations** — click 💡 on any problem for 3 similar suggestions
- **5-tier algorithm:**
  1. Same topic + same difficulty
  2. Same topic + one level harder
  3. Same topic + any difficulty
  4. Overlapping tags (cross-topic concept transfer)
  5. Any unsolved question (fallback)
- Already-solved questions are always excluded from recommendations

### 🟧 LeetCode Sync *(dedicated page)*
- Enter your **public LeetCode username** — no password or login needed
- Fetches your **profile** (real name, ranking, avatar), **total solved count**, and **difficulty breakdown**
- Pulls your **50 most recent accepted submissions**
- **Auto-matches** solved slugs against the tracker's question list and marks them Solved with a 🟧 badge
- Shows a **"Matched to Tracker"** list of every LC-synced problem
- **Re-sync anytime** with one click to pull fresh data
- **Disconnect** at any time — your progress stays, LC data is cleared

### ⚙️ Settings
- **Multi-user support** — create multiple users, each with independent progress and LeetCode connection
- **Switch users** instantly with one click
- **Edit profile** — username, email, notification preference
- **User chips** show a 🟧 indicator if that user has LeetCode connected

---

## 🗂️ Pre-loaded Questions (62 total)

| Topic | Count |
|---|---|
| Arrays | 8 |
| Strings | 6 |
| Linked Lists | 6 |
| Stacks & Queues | 4 |
| Trees | 8 |
| Graphs | 5 |
| Dynamic Programming | 7 |
| Binary Search | 4 |
| Two Pointers | 3 |
| Sliding Window | 3 |
| Heap / Priority Queue | 3 |
| Recursion & Backtracking | 4 |

All questions link directly to their LeetCode problem pages.

---

## 🟧 LeetCode Integration — How It Works

```
You enter username
       ↓
POST https://leetcode.com/graphql
  → matchedUser (profile + AC stats)
  → recentAcSubmissionList (last 50 accepted)
       ↓
Each submission slug is normalised and looked up
in the tracker's built-in slug index
       ↓
Matches → automatically set to "Solved" + lcSynced flag
       ↓
Dashboard panel updates with your real LC stats
```

### Slug Matching
Every pre-loaded question has a `slug` field (e.g. `two-sum`, `longest-substring-without-repeating-characters`). When LeetCode returns your accepted submissions, each one also carries a `titleSlug`. The tracker normalises both to lowercase-hyphen form and does a direct lookup — no fuzzy matching, no false positives.

### CORS Note
LeetCode's GraphQL API is a public endpoint, but browser CORS policies may block requests depending on how you open the file:

| How you open the file | LeetCode Sync |
|---|---|
| `file://` (double-click the HTML) | ✅ Usually works |
| `http://localhost` (local dev server) | ✅ Works |
| Hosted on a domain (e.g. GitHub Pages) | ⚠️ May be blocked by LC's CORS headers |

If you get a CORS error, open the file directly from your filesystem instead of serving it via a web server on a public domain.

---

## 💾 Data Storage

Everything is saved in **`localStorage`** under the key `dsa_app_v2`. This means:

- Data persists across browser sessions automatically
- Data is **per-browser** — it won't sync across devices
- Clearing browser storage will reset the tracker
- To back up your data: open the browser console and run:
  ```js
  copy(localStorage.getItem('dsa_app_v2'))
  ```
  Then paste it into a text file. To restore, run:
  ```js
  localStorage.setItem('dsa_app_v2', '<paste your backup here>')
  location.reload()
  ```

---

## ➕ Adding Custom Problems

Click **"+ Add Problem"** on the Problems page and fill in:

| Field | Required | Notes |
|---|---|---|
| Title | ✅ | Problem name |
| Topic | ✅ | Select from 18 DSA topics |
| Difficulty | ✅ | Easy / Medium / Hard |
| URL | — | Link to problem (LeetCode, HackerRank, etc.) |
| Platform | — | LeetCode / HackerRank / GeeksForGeeks / Codeforces / Other |
| Problem # | — | e.g. `1` for Two Sum |
| Tags | — | Comma-separated, e.g. `hash-map, two-pointers` |

Custom problems appear instantly in the topic list and count toward all stats and progress bars.

---

## 🏗️ Technical Architecture

Since this is a single HTML file, everything lives together:

```
dsa-tracker.html
├── <style>          CSS variables + all component styles (~300 lines)
├── <body>           HTML structure — nav, pages, modals, sidebar
└── <script>
    ├── SEED_QUESTIONS[]     62 pre-loaded question objects with slugs
    ├── SLUG_INDEX{}         Slug → question ID lookup map
    ├── loadData()           Bootstraps from localStorage
    ├── save()               Persists APP state to localStorage
    ├── getStats()           Computes dashboard aggregates
    ├── getRecommendations() 5-tier similarity engine
    ├── fetchLeetCodeData()  GraphQL fetch to leetcode.com/graphql
    ├── connectLeetCode()    First-time connection flow
    ├── syncLeetCode()       Re-sync flow
    ├── applyLCMatches()     Slug matching + auto-mark Solved
    ├── renderDashboard()    Dashboard page renderer
    ├── renderProblems()     Problems page renderer
    ├── renderLCPage()       LeetCode sync page renderer
    ├── renderSidebar()      Recommendations sidebar renderer
    └── renderSettings()     Settings page renderer
```

**State shape (stored in localStorage):**
```json
{
  "users": [{ "id": "u1", "username": "...", "email": "...", "streak": {...} }],
  "activeUserId": "u1",
  "questions": [ ...62 seed questions + any custom ones... ],
  "progress": {
    "u1": {
      "q1": { "status": "Solved", "notes": "...", "lcSynced": true, "dateCompleted": "..." }
    }
  },
  "leetcode": {
    "u1": {
      "username": "...", "stats": { "total": 0, "easy": 0, "med": 0, "hard": 0 },
      "recentAC": [...], "lastSync": "...", "matchedCount": 0
    }
  }
}
```

---

## 🌐 Browser Compatibility

| Browser | Support |
|---|---|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Mobile Chrome/Safari | ✅ Works (best on desktop) |

---

## 📄 License

Free to use, modify, and distribute. No attribution required.
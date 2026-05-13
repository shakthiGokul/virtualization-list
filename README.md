# ⚡ Virtualization List — React + Vite

This project explores two approaches to efficiently render large lists (5,000 items) using [react-virtuoso](https://virtuoso.dev/) with batch-loading on scroll.

---

## 🔧 Methods

### ✂️ Method 1 — Slice
Stores all fetched photos in a plain array. On every scroll, slices from index `0` to the current batch boundary.

```ts
photos.current.slice(0, (currentBatch.current += BATCH_PER_SCROLL))
```

### 🗂️ Method 2 — Hash Table
Pre-processes all photos into a hash table (object) keyed by batch index at fetch time. On every scroll, does an O(1) key lookup and concats only the new batch.

```ts
// Build: O(n) once
{ 0: [photos 0–9], 1: [photos 10–19], ..., 499: [photos 4990–4999] }

// Scroll: O(1) lookup + O(k) concat
hashTable[Math.round(currentBatch / BATCH_PER_SCROLL)]
```

---

## ⚖️ Method Comparison

| Category | ✂️ Method 1 — Slice | 🗂️ Method 2 — Hash Table |
|------------------------|-------------------------------------------------------|------------------------------------------------------------|
| **Approach** | `slice(0, currentBatch)` from full source array | Pre-built object keyed by batch index, `concat` new chunk |
| **Initial setup** | O(1) — no preprocessing | O(n) — builds hash table at fetch time |
| **Per-scroll lookup** | O(n) — slices from index 0, grows each scroll | O(1) — direct key access, always fixed cost |
| **Per-scroll copy** | O(k) — copies k items (k grows with each scroll) | O(k) — concats k items (k grows with each scroll) |
| **Total complexity** | O(n²) over all scrolls | O(n) over all scrolls |
| **Memory** | O(n) — one flat array | O(n) — one object with chunked arrays |
| **Source reads** | Reads cold 5,000-item array every scroll | Reads hot state + 10 items from pre-built table |
| **Cache efficiency** | 🔴 Low — always touches large source array | 🟢 High — works from CPU-hot state |
| **Scripting (DevTools)** | 552 ms | 565 ms (+13 ms) |
| **Rendering (DevTools)** | 81 ms | ✅ **73 ms** (−10%) |
| **Painting (DevTools)** | 51 ms | ✅ **42 ms** (−18%) |
| **At scroll 1** | ✅ Correct | ✅ Correct |
| **At scroll 499** | ✅ Correct — slices up to 5,000 items | ✅ Correct — hashTable[499] = photos[4990–4999] |
| **Beyond last scroll** | ✅ Returns `[]` cleanly | ✅ Guard returns early — no crash |
| **Code complexity** | 🟢 Simple — one line per scroll | 🟡 Moderate — preprocessing + key math |
| **Best for** | Small lists, quick prototypes | Large lists (1,000+ items), frequent scrolling |

---

## 📊 Benchmark Results

> Dataset: 5,000 photos · Batch size: 10 · Measured via Chrome DevTools Performance tab

### 🖥️ DevTools Recording Comparison

| Metric | ✂️ Slice Method | 🗂️ Hash Table | 🏆 Winner |
|-----------------|-------------|------------|---------------|
| Session length | 17,300 ms | 14,264 ms | — |
| Scripting | 552 ms | 565 ms | ✂️ Slice (tiny) |
| Rendering | 81 ms | **73 ms** | 🗂️ Hash Table |
| Painting | 51 ms | **42 ms** | 🗂️ Hash Table |
| localhost thread | 67.2 ms | 76.5 ms | ✂️ Slice |
| Passed insights | 18 | **19** | 🗂️ Hash Table |

### 📈 Scroll Cost Analysis (per scroll)

| Scroll # | ✂️ Slice — items copied | 🗂️ Hash Table — items copied | Lookup cost |
|----------|---------------------|--------------------------|-------------|
| 1 | 20 | 20 | O(1) |
| 10 | 110 | 110 | O(1) |
| 50 | 510 | 510 | O(1) |
| 100 | 1,010 | 1,010 | O(1) |
| 250 | 2,510 | 2,510 | O(1) |
| 499 | 5,000 | 5,000 | O(1) |

> Both methods copy a growing array on concat/slice. The key difference is **where** the source data comes from:
> - ✂️ Slice reads from the **cold 5,000-item source array** every scroll
> - 🗂️ Hash table reads from **hot state** (already in CPU cache) + 10 items from the pre-built table

### 🔢 Cumulative Operations (all scrolls combined)

| | ✂️ Slice | 🗂️ Hash Table |
|---|---|---|
| Total items copied | ~1,252,490 | ~1,252,490 |
| Source array accesses | ❌ 499 × full scan | ✅ **0** (pre-built) |
| Batch lookup | ❌ O(n) per scroll | ✅ **O(1) per scroll** |
| Initial preprocessing | None | O(n) once at load |

### 🧮 Big-O Summary

| Operation | ✂️ Slice | 🗂️ Hash Table |
|-----------|-------|------------|
| Initial setup | O(1) | O(n) |
| Per-scroll lookup | ❌ O(n) → grows | ✅ **O(1)** fixed |
| Per-scroll copy | O(k) | O(k) |
| Total over 499 scrolls | ❌ O(n²) | ✅ **O(n)** |
| Memory | O(n) | O(n) |

---

## 🏆 Verdict — Hash Table Wins

> ✂️ Slice pays the traversal cost **every scroll**.
> 🗂️ Hash Table pays it **once at load** — then never again.

| Scenario | Recommendation |
|----------|-----|
| Small list, dataset < 500 items | ✂️ Slice — less code |
| Large dataset (1,000+ items), many scrolls | 🗂️ **Hash Table** |
| Memory constrained | Either — both are O(n) |
| List reaches end | 🗂️ **Hash Table** — graceful guard |

**🗂️ Hash Table wins for large datasets** — 11% less rendering, 18% less painting, and O(1) lookup that never degrades as the list grows.

---

## 🚀 Setup

```bash
npm install
npm run dev
```

Built with React 19, Vite, TypeScript, Tailwind CSS, and react-virtuoso.

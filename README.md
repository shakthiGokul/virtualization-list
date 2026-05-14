# ⚡ react-batch-scroll

[![npm](https://img.shields.io/npm/v/react-batch-scroll)](https://www.npmjs.com/package/react-batch-scroll)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/shakthiGokul/virtualization-list/pulls)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

> A high-performance React infinite scroll component using **hash table batching** for O(1) lookup — measurably faster rendering and painting than traditional slice-based approaches.

---

## 📦 Installation

```bash
npm install react-batch-scroll react-virtuoso
```

---

## 🚀 Quick Start

```tsx
import { FlashList } from 'react-batch-scroll'

type Photo = { id: number; title: string }

function App() {
  const [photos, setPhotos] = useState<Photo[]>([])

  useEffect(() => {
    fetch('https://api.example.com/photos')
      .then(res => res.json())
      .then(setPhotos)
  }, [])

  return (
    <FlashList<Photo>
      data={photos}
      batchPerScroll={20}
      itemContent={(index, item) => (
        <div>{item.title}</div>
      )}
    />
  )
}
```

---

## 🔧 How It Works

Instead of `slice(0, n)` on every scroll (O(n²) total), `react-batch-scroll` pre-builds a hash table at load time and does O(1) key lookups on every scroll.

### 🧠 Core Algorithm — `getBatchPerList`

```ts
// O(n) time | O(n) space
export const getBatchPerList = <T>(
  batches: Array<T>,
  batchPerScroll: number
): HashTableBatchPerScrolls<T> => {
  const batchesPerPagination: HashTableBatchPerScrolls<T> = {}
  for (let idx = 0; idx < batches.length; idx++) {
    const batchKey = Math.floor(idx / batchPerScroll)
    if (!(batchKey in batchesPerPagination)) {
      batchesPerPagination[batchKey] = []
    }
    batchesPerPagination[batchKey].push(batches[idx])
  }
  return batchesPerPagination
}
```

**Trace with 7 items, batchPerScroll = 3:**

```
idx=0 → batchKey=0 → { 0: [A] }
idx=1 → batchKey=0 → { 0: [A, B] }
idx=2 → batchKey=0 → { 0: [A, B, C] }
idx=3 → batchKey=1 → { 0: [A,B,C], 1: [D] }
idx=4 → batchKey=1 → { 0: [A,B,C], 1: [D, E] }
idx=5 → batchKey=1 → { 0: [A,B,C], 1: [D, E, F] }
idx=6 → batchKey=2 → { 0: [A,B,C], 1: [D,E,F], 2: [G] }

Scroll 1 → hashTable[1] = [D, E, F]  ← O(1)
Scroll 2 → hashTable[2] = [G]        ← O(1)
```

`Math.floor(idx / batchPerScroll)` groups consecutive items into the same bucket — every `batchPerScroll` items share the same key.

**Space complexity:**
```
k keys × batchPerScroll items = k × C = n
Space = k + n = n/C + n = O(n)
```

---

## ⚖️ Method Comparison

| Category | ✂️ Slice (traditional) | 🗂️ Hash Table (this library) |
|------------------------|-------------------------------------------------------|------------------------------------------------------------|
| **Approach** | `slice(0, currentBatch)` from full source array | Pre-built object keyed by batch index, `concat` new chunk |
| **Initial setup** | O(1) — no preprocessing | O(n) — builds hash table at fetch time |
| **Per-scroll lookup** | O(n) — slices from index 0, grows each scroll | O(1) — direct key access, always fixed cost |
| **Per-scroll copy** | O(k) — copies k items (k grows with each scroll) | O(k) — concats k items (k grows with each scroll) |
| **Total complexity** | O(n²) over all scrolls | O(n) over all scrolls |
| **Memory** | O(n) — one flat array | O(n) — one object with chunked arrays |
| **Source reads** | Reads cold full array every scroll | Reads hot state + batch from pre-built table |
| **Cache efficiency** | 🔴 Low — always touches large source array | 🟢 High — works from CPU-hot state |
| **Scripting (DevTools)** | 552 ms | 565 ms (+13 ms) |
| **Rendering (DevTools)** | 81 ms | ✅ **73 ms** (−10%) |
| **Painting (DevTools)** | 51 ms | ✅ **42 ms** (−18%) |
| **At scroll 499** | ✅ Correct | ✅ Correct |
| **Beyond last scroll** | ✅ Returns `[]` cleanly | ✅ Guard returns early — no crash |
| **Best for** | Small lists, quick prototypes | Large lists (1,000+ items), frequent scrolling |

---

## 📊 Benchmark Results

> Dataset: 5,000 items · Batch size: 10 · Measured via Chrome DevTools Performance tab

### 🖥️ DevTools Recording

| Metric | ✂️ Slice | 🗂️ Hash Table | 🏆 Winner |
|--------|----------|--------------|-----------|
| Scripting | 552 ms | 565 ms | ✂️ Slice (tiny) |
| Rendering | 81 ms | **73 ms** | 🗂️ Hash Table |
| Painting | 51 ms | **42 ms** | 🗂️ Hash Table |
| Passed insights | 18 | **19** | 🗂️ Hash Table |

### 📈 Scroll Cost (per scroll)

| Scroll # | ✂️ Slice | 🗂️ Hash Table | Lookup |
|----------|----------|--------------|--------|
| 1 | 20 copies | 20 copies | O(1) |
| 50 | 510 copies | 510 copies | O(1) |
| 100 | 1,010 copies | 1,010 copies | O(1) |
| 499 | 5,000 copies | 5,000 copies | O(1) |

> Both copy a growing array. The difference is **where the source comes from** — slice re-scans the cold 5,000-item array; hash table reads from CPU-hot state.

### 🧮 Big-O Summary

| Operation | ✂️ Slice | 🗂️ Hash Table |
|-----------|----------|--------------|
| Per-scroll lookup | ❌ O(n) grows | ✅ O(1) fixed |
| Total over all scrolls | ❌ O(n²) | ✅ O(n) |
| Memory | O(n) | O(n) |

---

## 🏆 Verdict

> ✂️ Slice pays the traversal cost **every scroll**.
> 🗂️ Hash Table pays it **once at load** — then never again.

**Hash Table wins** — 10% less rendering, 18% less painting, O(1) lookup that never degrades as the list grows.

---

## 🔗 Proof & Comparison

Full implementation, benchmarks, and comparison available in the source repo:
**[github.com/shakthiGokul/virtualization-list](https://github.com/shakthiGokul/virtualization-list)**

- [`FlashList.tsx`](https://github.com/shakthiGokul/virtualization-list/blob/main/src/features/FlashList/FlashList.tsx) — component implementation
- [`FlashList.helper.ts`](https://github.com/shakthiGokul/virtualization-list/blob/main/src/features/FlashList/FlashList.helper.ts) — `getBatchPerList` algorithm

---

## 🛠️ API

### `<FlashList<T> />`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | `[]` | Array of items to render |
| `batchPerScroll` | `number` | `20` | Items to load per scroll batch |
| `itemContent` | `(index, item: T) => ReactNode` | required | Render function per item |
| `...rest` | `VirtuosoProps<T>` | — | All react-virtuoso props supported |

### `getBatchPerList<T>(batches, batchPerScroll)`

The core hash table builder — exported for advanced use.

```ts
import { getBatchPerList } from 'react-batch-scroll'

const table = getBatchPerList(items, 20)
// { 0: [items 0–19], 1: [items 20–39], ... }
```

---

## 📄 License

[MIT](./LICENSE) © [Shakthi Gokul](https://github.com/shakthiGokul)

---

## 🤝 Contributing

PRs are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'add your feature'`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 👤 Author

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/shakthiGokul">
        <img src="https://github.com/shakthiGokul.png" width="80" alt="Shakthi Gokul"/><br/>
        <sub><b>Shakthi Gokul</b></sub>
      </a><br/>
      <sub>Author & Maintainer</sub>
    </td>
  </tr>
</table>

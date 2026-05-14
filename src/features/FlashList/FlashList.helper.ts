export type HashTableBatchPerScrolls<T> = {
  [keyof: number]: T[]
}

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

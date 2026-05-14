export type HashTableBatchPerScrolls = {
  [keyof: number]: unknown[]
}

export const isObjectEmpty = (object: object) => {
  return typeof object == 'object' && JSON.stringify(object) === '{}'
}

// O(n) time | O(n) space
export const getBatchPerPhotos = (
  batches: Array<unknown>,
  batchPerScroll: number
): HashTableBatchPerScrolls => {
  const batchesPerPagination: HashTableBatchPerScrolls = {}
  for (let idx = 0; idx < batches.length; idx++) {
    const batchKey = Math.floor(idx / batchPerScroll)
    if (!(batchKey in batchesPerPagination)) {
      batchesPerPagination[batchKey] = []
    }
    batchesPerPagination[batchKey].push(batches[idx])
  }
  return batchesPerPagination
}

// O(1) time | O(1) space
export const getUpdatedPhotos = (
  newPhotos: HashTableBatchPerScrolls
): Array<unknown> => {
  return !isObjectEmpty(newPhotos) ? (newPhotos[0] as Array<unknown>) : []
}

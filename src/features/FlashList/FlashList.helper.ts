import { PhotoItem } from './FlashList.type'

export type HashTableBatchPerScrolls = {
  [keyof: number]: PhotoItem[]
}

export const getBatchPerPhotos = (
  newPhotos: Array<PhotoItem>,
  batchPerScroll: number
): HashTableBatchPerScrolls => {
  const batchPerPhotos: HashTableBatchPerScrolls = {}
  let newBatch: Array<PhotoItem> = []
  for (let idx = 0; idx < newPhotos.length; idx++) {
    const isThresHoldReached = idx % batchPerScroll == 0
    if (isThresHoldReached) {
      const batchKey = idx / batchPerScroll
      batchPerPhotos[batchKey] = newBatch
      newBatch = []
    }
    newBatch.push(newPhotos[idx])
  }
  return batchPerPhotos
}

export const getUpdatedPhotos = (
  method: string,
  newPhotos: Array<PhotoItem> | HashTableBatchPerScrolls,
  batchPerScroll: number
): Array<PhotoItem> => {
  if (method === 'slice-method' && Array.isArray(newPhotos)) {
    return newPhotos.slice(0, batchPerScroll)
  }
  return newPhotos[1] as Array<PhotoItem>
}

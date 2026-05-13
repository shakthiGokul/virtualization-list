import { PhotoItem } from './FlashList.type'

export type HashTableBatchPerScrolls = {
  [keyof: number]: PhotoItem[]
}

export const getBatchPerPhotos = (
  newPhotos: Array<PhotoItem>,
  batchPerScroll: number
): HashTableBatchPerScrolls => {
  const batchPerPhotos: HashTableBatchPerScrolls = {}
  for (let idx = 0; idx < newPhotos.length; idx++) {
    const batchKey = Math.floor(idx / batchPerScroll)
    if (!batchPerPhotos[batchKey]) batchPerPhotos[batchKey] = []
    batchPerPhotos[batchKey].push(newPhotos[idx])
  }
  return batchPerPhotos
}

export const getUpdatedPhotos = (
  method: string,
  newPhotos: Array<PhotoItem> | HashTableBatchPerScrolls,
  batchPerScroll: number
): Array<PhotoItem> => {
  if (method === 'slice-method' && Array.isArray(newPhotos)) {
    return newPhotos.length ? newPhotos.slice(0, batchPerScroll) : []
  }
  return newPhotos ? (newPhotos[0] as Array<PhotoItem>) : []
}

import { useEffect, useRef, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { PhotoItem } from './FlashList.type'
import {
  getBatchPerPhotos,
  getUpdatedPhotos,
  HashTableBatchPerScrolls,
} from './FlashList.helper'

const BATCH_PER_SCROLL = 10

/**
 * function component to helps to render the flash list
 * @returns
 */
const FlashList = (): React.ReactNode => {
  const method = useRef<string>('')
  const photos = useRef<Array<PhotoItem> | HashTableBatchPerScrolls>([])
  const [batchPerPhotos, setBatchPerPhotos] = useState<Array<PhotoItem>>([])

  const currentBatch = useRef(BATCH_PER_SCROLL)

  useEffect(() => {
    const controller = new AbortController()
    const fetchPhotos = async () => {
      const response = await fetch(
        'https://jsonplaceholder.typicode.com/photos',
        { signal: controller.signal }
      )
      const newPhotos = await response.json()
      photos.current =
        method.current === 'slice-method'
          ? newPhotos
          : getBatchPerPhotos(newPhotos, BATCH_PER_SCROLL)
      const updatedPhotos = getUpdatedPhotos(
        method.current,
        photos.current,
        BATCH_PER_SCROLL
      )
      setBatchPerPhotos(updatedPhotos)
    }
    fetchPhotos()
  }, [])

  console.log('photos', photos.current)

  if (!batchPerPhotos) {
    return null
  }

  const onReachEnd = (): void => {
    if (method.current === 'slice-method' && Array.isArray(photos.current)) {
      return setBatchPerPhotos(
        photos.current.slice(0, (currentBatch.current += BATCH_PER_SCROLL))
      )
    }
    const currentPhotos = (photos.current as HashTableBatchPerScrolls)[
      Math.round(currentBatch.current / BATCH_PER_SCROLL)
    ]
    const updatedPhotos = batchPerPhotos.concat(currentPhotos)
    setBatchPerPhotos(updatedPhotos)
    currentBatch.current += BATCH_PER_SCROLL
  }

  const itemContent = (idx: number, photo: PhotoItem) => {
    return (
      <div
        key={`photo${-idx}`}
        className="flex justify-center w-full h-full flex-1 px-8 py-16"
      >
        <div className="border-1 flex justify-center items-center bg-pink-500 border-black w-full h-30 md:w-[40%] ">
          <p className="text-white items-center">{photo.id}</p>
        </div>
      </div>
    )
  }

  return (
    <Virtuoso
      data={batchPerPhotos}
      itemContent={itemContent}
      totalCount={batchPerPhotos.length}
      style={{ flex: 1 }}
      endReached={onReachEnd}
    />
  )
}

export default FlashList

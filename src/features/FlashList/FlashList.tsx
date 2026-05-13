import { UIEventHandler, useEffect, useRef, useState } from 'react'
import { PhotoItem } from './FlashList.type'
import { Virtuoso } from 'react-virtuoso'

const BATCH_PER_SCROLL = 10

const FlashList = () => {
  const photos = useRef<Array<PhotoItem>>([])
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
      photos.current = newPhotos
      setBatchPerPhotos(newPhotos.slice(0, BATCH_PER_SCROLL))
    }
    fetchPhotos()
  }, [])

  if (!batchPerPhotos.length) {
    return null
  }

  const onReachEnd = () => {
    setBatchPerPhotos(
      photos.current.slice(0, (currentBatch.current += BATCH_PER_SCROLL))
    )
  }

  const itemContent = (_: number, photo: PhotoItem) => {
    return (
      <div
        key={photo.id}
        className="flex justify-center w-full h-full flex-1 px-8 py-16"
      >
        <div className="border-1 justify-center align-self bg-pink-500 border-black w-full h-30 md:w-[40%] ">
          <p className="text-white">{photo.id}</p>
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

import { useEffect, useState } from 'react'

import FlashList from './features/FlashList/FlashList'

function App() {
  const [photos, setPhotos] = useState<unknown[]>([])

  useEffect(() => {
    const controller = new AbortController()
    const fetchPhotos = async () => {
      const response = await fetch(
        'https://jsonplaceholder.typicode.com/photos',
        { signal: controller.signal }
      )
      setPhotos(await response.json())
    }
    fetchPhotos()
  }, [])

  console.log('phots', photos)

  const itemContent = (idx: number, photo: any): React.ReactNode => {
    return (
      <div
        key={`photo-${idx}`}
        className="flex justify-center w-full h-full flex-1 px-8 py-16"
      >
        <div className="border-1 flex justify-center items-center bg-pink-500 border-black w-full h-30 md:w-[40%] ">
          <p className="text-white items-center">{photo.id}</p>
        </div>
      </div>
    )
  }
  return <FlashList data={photos} itemContent={itemContent} />
}

export default App

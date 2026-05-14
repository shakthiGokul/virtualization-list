import { useMemo, useRef, useState } from 'react'
import { Virtuoso, VirtuosoProps } from 'react-virtuoso'
import { getBatchPerPhotos } from './FlashList.helper'

type FlashListProps = {
  batchPerScroll?: number // gy default 20
}

/**
 * Component helps to render the Flash List locally
 * @param {FlashListProps}
 * @returns {React.ReactNode}
 */
const FlashList: React.FC<FlashListProps & VirtuosoProps<unknown, unknown>> = (
  props
): React.ReactNode => {
  const { batchPerScroll = 20, data = [], ...virtuosoProps } = props

  const batchesHahTable = useMemo(() => {
    return getBatchPerPhotos(data as Array<unknown>, batchPerScroll)
  }, [data])

  const [batches, setBatches] = useState<Array<unknown>>(
    batchesHahTable[0] ?? []
  )

  const currentBatch = useRef(batchPerScroll)

  const onReachEnd = (): void => {
    const currentPhotos =
      batchesHahTable[Math.round(currentBatch.current / batchPerScroll)]
    if (!currentPhotos) return
    const updatedPhotos = batches.concat(currentPhotos)
    setBatches(updatedPhotos)
    currentBatch.current += batchPerScroll
  }

  return (
    <Virtuoso
      data={batches}
      totalCount={batches.length}
      style={{ flex: 1 }}
      endReached={onReachEnd}
      {...virtuosoProps}
    />
  )
}

export default FlashList

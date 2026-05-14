import { useRef, useState } from 'react'
import { Virtuoso, VirtuosoProps } from 'react-virtuoso'
import { getBatchPerPhotos, HashTableBatchPerScrolls } from './FlashList.helper'

type FlashListProps = {
  batchPerScroll: number
}

/**
 * function component to helps to render the flash list
 * @returns {React.ReactNode}
 */
const FlashList: React.FC<FlashListProps & VirtuosoProps<unknown, unknown>> = (
  props
): React.ReactNode => {
  const { batchPerScroll, data = [], ...virtuosoProps } = props
  const batchesHahTable = useRef<HashTableBatchPerScrolls>(
    getBatchPerPhotos(data as Array<unknown>, batchPerScroll)
  )
  const [batches, setBatches] = useState<Array<unknown>>(
    batchesHahTable.current[0] ?? []
  )

  const currentBatch = useRef(batchPerScroll)

  const onReachEnd = (): void => {
    const currentPhotos =
      batchesHahTable.current[Math.round(currentBatch.current / batchPerScroll)]
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

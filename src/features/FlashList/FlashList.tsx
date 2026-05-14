'use client'

import { useMemo, useRef, useState } from 'react'
import { Virtuoso, VirtuosoProps } from 'react-virtuoso'
import { getBatchPerList } from './FlashList.helper'

type FlashListProps<T> = {
  batchPerScroll?: number // by default 20
} & VirtuosoProps<T, unknown>

/**
 * Component helps to render the Flash List locally
 * @param {FlashListProps}
 * @returns {React.ReactNode}
 */
const FlashList = <T,>(props: FlashListProps<T>): React.ReactNode => {
  const { batchPerScroll = 20, data = [], ...virtuosoProps } = props

  const batchesHahTable = useMemo(() => {
    return getBatchPerList(data as Array<T>, batchPerScroll)
  }, [data, batchPerScroll])

  const [batches, setBatches] = useState<Array<T>>(batchesHahTable[0] ?? [])

  const currentBatch = useRef(batchPerScroll)
  const prevDataRef = useRef(data)

  if (prevDataRef.current !== data) {
    prevDataRef.current = data
    setBatches(batchesHahTable[0] ?? [])
    currentBatch.current = batchPerScroll
  }

  const onReachEnd = (): void => {
    const newBatches =
      batchesHahTable[Math.round(currentBatch.current / batchPerScroll)]
    if (!newBatches) return
    const updatedPhotos = batches.concat(newBatches)
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

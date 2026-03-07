import { useEffect, useRef, useState } from 'react'

export const SLIDE_WIDTH = 1920
export const SLIDE_HEIGHT = 1080

export function useSlideScale(scaleMultiplier: number) {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const element = viewportRef.current
    if (!element || typeof ResizeObserver === 'undefined') return

    const updateScale = () => {
      const { width, height } = element.getBoundingClientRect()
      if (!width || !height) return

      const nextScale = Math.min(width / SLIDE_WIDTH, height / SLIDE_HEIGHT) * scaleMultiplier
      const scaledWidth = SLIDE_WIDTH * nextScale
      const scaledHeight = SLIDE_HEIGHT * nextScale

      setScale(nextScale)
      setOffset({
        x: (width - scaledWidth) / 2,
        y: (height - scaledHeight) / 2,
      })
    }

    updateScale()

    const observer = new ResizeObserver(updateScale)
    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [scaleMultiplier])

  return { viewportRef, scale, offset }
}

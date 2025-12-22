'use client'

import { useState, useEffect } from 'react'
import { BlackFridayBanner } from '@/components/promotions/BlackFridayBanner'
import { GiftcemberBanner } from '@/components/promotions/GiftcemberBanner'
import { ChristmasDecorations } from '@/components/promotions/ChristmasDecorations'

export function PromotionalBanners() {
  const [activePromo, setActivePromo] = useState<'black-friday' | 'giftcember' | null>(null)
  const [showChristmas, setShowChristmas] = useState(false)

  useEffect(() => {
    // Only run on client to avoid hydration mismatch
    const now = new Date()
    const blackFridayStart = new Date('2025-11-25')
    const blackFridayEnd = new Date('2026-01-10')
    const giftcemberStart = new Date('2025-12-01')
    const giftcemberEnd = new Date('2026-01-10')
    const christmasStart = new Date('2025-11-01')
    const christmasEnd = new Date('2026-01-10')

    if (now >= blackFridayStart && now <= blackFridayEnd) {
      setActivePromo('black-friday')
    } else if (now >= giftcemberStart && now <= giftcemberEnd) {
      setActivePromo('giftcember')
    }

    setShowChristmas(now >= christmasStart && now <= christmasEnd)
  }, [])

  if (activePromo === 'black-friday') {
    return <BlackFridayBanner />
  }

  if (activePromo === 'giftcember') {
    return <GiftcemberBanner />
  }

  return null
}

export function ChristmasDecorationsWrapper() {
  const [showDecorations, setShowDecorations] = useState(false)

  useEffect(() => {
    // Only run on client to avoid hydration mismatch
    const now = new Date()
    const christmasStart = new Date('2025-11-01')
    const christmasEnd = new Date('2026-01-10')

    setShowDecorations(now >= christmasStart && now <= christmasEnd)
  }, [])

  if (showDecorations) {
    return <ChristmasDecorations />
  }

  return null
}
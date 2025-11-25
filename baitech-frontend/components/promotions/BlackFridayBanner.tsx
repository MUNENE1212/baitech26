'use client'

import { useState, useEffect } from 'react'
import { X, Gift, Zap, ShoppingBag, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export function BlackFridayBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  // Set Black Friday end date (adjust as needed)
  const blackFridayEnd = new Date('2026-01-10T23:59:59')

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = blackFridayEnd.getTime() - now

      if (distance < 0) {
        clearInterval(timer)
        return
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-black via-zinc-900 to-black border-b-4 border-amber-500"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-red-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-4 lg:px-12">
          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
            {/* Left side - Main message */}
            <div className="flex flex-col items-center gap-2 lg:flex-row lg:gap-4">
              <div className="flex items-center gap-2">
                <Zap className="h-8 w-8 fill-amber-400 text-amber-400 animate-pulse" />
                <div className="text-center lg:text-left">
                  <h2 className="text-2xl font-bold text-white lg:text-3xl">
                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                      BLACK FRIDAY
                    </span>
                  </h2>
                  <p className="text-sm text-amber-300 lg:text-base">
                    Up to 70% OFF + FREE GIFT on every purchase!
                  </p>
                </div>
              </div>
            </div>

            {/* Center - Countdown timer */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-400">Ends in:</span>
              <div className="flex gap-2">
                {Object.entries(timeLeft).map(([unit, value]) => (
                  <div key={unit} className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-lg font-bold text-white shadow-lg lg:h-14 lg:w-14">
                      {value.toString().padStart(2, '0')}
                    </div>
                    <span className="mt-1 text-xs font-medium uppercase text-zinc-400">
                      {unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - CTA */}
            <div className="flex items-center gap-3">
              <Link
                href="/catalogue"
                className="group relative overflow-hidden rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  SHOP NOW
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>

              <button
                onClick={() => setIsVisible(false)}
                className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                aria-label="Close banner"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom highlight strip */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
      </motion.div>
    </AnimatePresence>
  )
}

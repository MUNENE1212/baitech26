'use client'

import { useState } from 'react'
import { Gift, X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export function StickyPromoBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed left-0 top-1/2 z-40 -translate-y-1/2"
      >
        <div className="relative">
          {/* Main banner */}
          <div className="flex items-start gap-2 rounded-r-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 p-4 pr-6 shadow-2xl">
            {/* Animated gift icon */}
            <motion.div
              animate={{
                rotate: [0, -15, 15, -15, 0],
                scale: [1, 1.1, 1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              <Gift className="h-10 w-10 flex-shrink-0 fill-amber-300 text-amber-400" />
            </motion.div>

            {/* Content */}
            <div className="max-w-[180px]">
              <h3 className="mb-1 text-lg font-black leading-tight text-white">
                GIFTCEMBER
              </h3>
              <p className="mb-3 text-xs leading-tight text-green-50">
                Shop & get a <span className="font-bold text-amber-300">FREE GIFT</span> with every purchase!
              </p>

              <Link
                href="/catalogue"
                className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-4 py-1.5 text-xs font-bold text-green-900 transition-all hover:bg-amber-300 hover:scale-105"
              >
                <Sparkles className="h-3 w-3" />
                Shop Now
              </Link>
            </div>

            {/* Close button */}
            <button
              onClick={() => setIsVisible(false)}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-lg transition-transform hover:scale-110 hover:bg-red-600"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Decorative elements */}
          <div className="absolute -right-1 top-0 h-full w-1 bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-400" />

          {/* Sparkle decorations */}
          <motion.div
            className="absolute -right-3 top-2"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
          </motion.div>

          <motion.div
            className="absolute -right-2 bottom-3"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -180, -360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 1,
            }}
          >
            <Sparkles className="h-3 w-3 text-yellow-300" />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

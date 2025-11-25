'use client'

import { useState } from 'react'
import { X, Gift, Sparkles, Star, ShoppingCart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export function GiftcemberBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800"
      >
        {/* Animated snowflakes/sparkles background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{
                top: `-${Math.random() * 20}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                top: '120%',
                rotate: 360,
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: 'linear',
              }}
            >
              <Sparkles
                className="text-white/20"
                size={12 + Math.random() * 12}
              />
            </motion.div>
          ))}
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-6 lg:px-12">
          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
            {/* Left side - GIFTCEMBER branding */}
            <div className="flex items-center gap-4">
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              >
                <Gift className="h-16 w-16 fill-amber-300 text-amber-400 drop-shadow-2xl lg:h-20 lg:w-20" />
              </motion.div>

              <div>
                <h2 className="text-3xl font-black text-white drop-shadow-lg lg:text-4xl">
                  <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                    GIFTCEMBER
                  </span>
                  <span className="ml-2 text-2xl text-red-400 lg:text-3xl">🎄</span>
                </h2>
                <p className="mt-1 text-sm font-medium text-green-100 lg:text-base">
                  December Gift Bonanza - Free Gift with Every Purchase!
                </p>
              </div>
            </div>

            {/* Center - Gift tiers */}
            <div className="flex flex-wrap justify-center gap-3">
              <div className="flex flex-col items-center rounded-lg border-2 border-green-400/30 bg-white/10 px-4 py-2 backdrop-blur-sm">
                <div className="flex items-center gap-1 text-amber-300">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-xs font-bold">SHOP KES 5,000+</span>
                </div>
                <p className="text-xs text-white">Get Premium Gift</p>
              </div>

              <div className="flex flex-col items-center rounded-lg border-2 border-green-400/30 bg-white/10 px-4 py-2 backdrop-blur-sm">
                <div className="flex items-center gap-1 text-amber-300">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-xs font-bold">SHOP KES 10,000+</span>
                </div>
                <p className="text-xs text-white">Get Deluxe Gift</p>
              </div>

              <div className="flex flex-col items-center rounded-lg border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/20 to-orange-500/20 px-4 py-2 backdrop-blur-sm">
                <div className="flex items-center gap-1 text-amber-200">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-xs font-bold">SHOP KES 20,000+</span>
                </div>
                <p className="text-xs font-semibold text-yellow-200">Get MEGA Gift!</p>
              </div>
            </div>

            {/* Right side - CTA */}
            <div className="flex items-center gap-3">
              <Link
                href="/catalogue"
                className="group relative overflow-hidden rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 px-8 py-3 font-bold text-green-900 shadow-2xl transition-all hover:scale-105 hover:shadow-amber-500/50"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  START SHOPPING
                  <Sparkles className="h-4 w-4" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-400"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
              </Link>

              <button
                onClick={() => setIsVisible(false)}
                className="rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/20"
                aria-label="Close banner"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Bottom info strip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 rounded-full border border-green-400/30 bg-white/5 px-6 py-2 text-center backdrop-blur-sm"
          >
            <p className="text-sm font-medium text-green-50">
              <Sparkles className="mr-2 inline h-4 w-4 text-amber-300" />
              Valid throughout December 2024 • While stocks last • No minimum purchase for basic gifts
              <Sparkles className="ml-2 inline h-4 w-4 text-amber-300" />
            </p>
          </motion.div>
        </div>

        {/* Decorative bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
      </motion.div>
    </AnimatePresence>
  )
}

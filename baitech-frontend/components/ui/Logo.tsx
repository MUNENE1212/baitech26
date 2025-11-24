'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface LogoProps {
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function Logo({ variant = 'light', size = 'md', showText = false, className = '' }: LogoProps) {
  const sizeConfig = {
    sm: { dimension: 64, image: '/logo-sm.png' },
    md: { dimension: 128, image: '/logo-md.png' },
    lg: { dimension: 256, image: '/logo-lg.png' },
  }

  const config = sizeConfig[size]

  return (
    <Link
      href="/"
      className={`group relative flex items-center transition-all ${className}`}
    >
      {/* Animated Logo */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative transition-all"
      >
        <Image
          src={config.image}
          alt="BAITECH Solutions Logo"
          width={config.dimension}
          height={config.dimension}
          className="h-auto w-auto object-contain"
          priority
        />

        {/* Pulse effect on hover */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 opacity-0 group-hover:opacity-100"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </Link>
  )
}

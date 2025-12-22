'use client'

import { motion } from 'framer-motion'
import { Gift, Star, Sparkles, Snowflake } from 'lucide-react'

// Predefined values to avoid hydration mismatch
const snowflakeConfigs = [
  { top: '-19.6%', left: '91.3%', size: 8.6, x1: 20, x2: -30, duration: 20, delay: 1 },
  { top: '-12.9%', left: '79.4%', size: 14.9, x1: -40, x2: 10, duration: 18, delay: 2 },
  { top: '-18.4%', left: '70.3%', size: 8.9, x1: 30, x2: -20, duration: 22, delay: 0.5 },
  { top: '-7.9%', left: '39.5%', size: 17, x1: -10, x2: 40, duration: 16, delay: 3 },
  { top: '-7.8%', left: '99.1%', size: 10, x1: 50, x2: -50, duration: 24, delay: 1.5 },
  { top: '-14%', left: '19%', size: 14.2, x1: -20, x2: 30, duration: 19, delay: 4 },
  { top: '-1.8%', left: '50%', size: 9.7, x1: 40, x2: -40, duration: 21, delay: 0.8 },
  { top: '-7.3%', left: '51.8%', size: 8, x1: -30, x2: 20, duration: 17, delay: 2.5 },
  { top: '-16.1%', left: '5.6%', size: 18.6, x1: 10, x2: -10, duration: 23, delay: 3.5 },
  { top: '-15.1%', left: '81.9%', size: 13.2, x1: -50, x2: 50, duration: 18, delay: 1.2 },
  { top: '-19.1%', left: '1%', size: 13.4, x1: 25, x2: -25, duration: 20, delay: 4.5 },
  { top: '-2.1%', left: '26.6%', size: 16.2, x1: -15, x2: 35, duration: 22, delay: 0.3 },
  { top: '-4.8%', left: '63.8%', size: 13, x1: 45, x2: -45, duration: 19, delay: 2.8 },
  { top: '-12.4%', left: '32%', size: 14.9, x1: -35, x2: 15, duration: 21, delay: 1.8 },
  { top: '-2.5%', left: '87.2%', size: 12.7, x1: 30, x2: -30, duration: 17, delay: 3.2 },
  { top: '-2.5%', left: '9.2%', size: 9.1, x1: -20, x2: 40, duration: 24, delay: 0.6 },
  { top: '-2.8%', left: '96.8%', size: 14.5, x1: 50, x2: -50, duration: 18, delay: 4.2 },
  { top: '-19.2%', left: '70.2%', size: 11.4, x1: -40, x2: 20, duration: 23, delay: 1.4 },
  { top: '-14.9%', left: '46.7%', size: 10.8, x1: 15, x2: -35, duration: 20, delay: 2.1 },
  { top: '-5.9%', left: '31.3%', size: 9.2, x1: -25, x2: 25, duration: 19, delay: 3.8 },
  { top: '-9.6%', left: '88.8%', size: 8.7, x1: 35, x2: -15, duration: 21, delay: 0.9 },
  { top: '-9.6%', left: '25.6%', size: 14.9, x1: -45, x2: 45, duration: 17, delay: 4.8 },
  { top: '-10.3%', left: '28.4%', size: 15.8, x1: 20, x2: -40, duration: 22, delay: 1.6 },
  { top: '-15.4%', left: '69.4%', size: 8.9, x1: -30, x2: 10, duration: 18, delay: 3.4 },
  { top: '-2.4%', left: '17.8%', size: 19, x1: 40, x2: -20, duration: 24, delay: 0.2 },
  { top: '-14.7%', left: '94.5%', size: 11.8, x1: -10, x2: 30, duration: 19, delay: 2.3 },
  { top: '-5.2%', left: '2.3%', size: 16.2, x1: 25, x2: -25, duration: 21, delay: 4.1 },
  { top: '-7.9%', left: '6.9%', size: 19.1, x1: -50, x2: 50, duration: 17, delay: 1.7 },
  { top: '-17.6%', left: '66%', size: 18.2, x1: 15, x2: -35, duration: 23, delay: 3.6 },
  { top: '-15.1%', left: '67.7%', size: 18.1, x1: -20, x2: 40, duration: 20, delay: 0.4 },
]

export function ChristmasDecorations() {
  return (
    <>
      {/* Top Border - Christmas Lights */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="relative h-8 bg-gradient-to-r from-red-600 via-green-600 to-red-600">
          {/* Animated lights */}
          <div className="absolute inset-0 flex justify-around items-center">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={`top-light-${i}`}
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#ef4444' : '#22c55e',
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>

          {/* Garland wave pattern */}
          <svg className="absolute bottom-0 w-full h-4" preserveAspectRatio="none" viewBox="0 0 1200 50">
            <path
              d="M0,25 Q50,5 100,25 T200,25 T300,25 T400,25 T500,25 T600,25 T700,25 T800,25 T900,25 T1000,25 T1100,25 T1200,25 L1200,50 L0,50 Z"
              fill="#065f46"
              opacity="0.8"
            />
          </svg>
        </div>
      </div>

      {/* Bottom Border - Christmas Pattern */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="relative h-8 bg-gradient-to-r from-green-700 via-red-700 to-green-700">
          {/* Animated snowflakes */}
          <div className="absolute inset-0 flex justify-around items-center">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={`bottom-snow-${i}`}
                animate={{
                  rotate: [0, 360],
                  y: [-2, 2, -2],
                }}
                transition={{
                  duration: 3 + i * 0.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              >
                <Snowflake className="w-3 h-3 text-white/60" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Left Border - Vertical Decoration */}
      <div className="fixed left-0 top-32 bottom-32 z-40 pointer-events-none hidden lg:block">
        <div className="relative h-full w-12 bg-gradient-to-b from-red-600/80 via-green-600/80 to-red-600/80 rounded-r-2xl shadow-xl">
          {/* Vertical ornaments */}
          <div className="absolute inset-0 flex flex-col justify-around items-center py-8">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`left-ornament-${i}`}
                className="relative"
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                {i % 2 === 0 ? (
                  <Gift className="w-6 h-6 text-amber-300 fill-amber-400" />
                ) : (
                  <Star className="w-6 h-6 text-yellow-300 fill-yellow-400" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Sparkle effects */}
          <motion.div
            className="absolute top-1/4 left-1/2 -translate-x-1/2"
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </motion.div>

          <motion.div
            className="absolute bottom-1/4 left-1/2 -translate-x-1/2"
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1,
              repeatDelay: 1,
            }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </motion.div>
        </div>
      </div>

      {/* Right Border - Vertical Decoration */}
      <div className="fixed right-0 top-32 bottom-32 z-40 pointer-events-none hidden lg:block">
        <div className="relative h-full w-12 bg-gradient-to-b from-green-600/80 via-red-600/80 to-green-600/80 rounded-l-2xl shadow-xl">
          {/* Vertical ornaments */}
          <div className="absolute inset-0 flex flex-col justify-around items-center py-8">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`right-ornament-${i}`}
                className="relative"
                animate={{
                  rotate: [0, -10, 10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.4,
                }}
              >
                {i % 3 === 0 ? (
                  <Snowflake className="w-6 h-6 text-blue-200" />
                ) : i % 3 === 1 ? (
                  <Star className="w-6 h-6 text-amber-300 fill-amber-400" />
                ) : (
                  <Gift className="w-6 h-6 text-green-300 fill-green-400" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Sparkle effects */}
          <motion.div
            className="absolute top-1/3 left-1/2 -translate-x-1/2"
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.5,
              repeatDelay: 1,
            }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </motion.div>

          <motion.div
            className="absolute bottom-1/3 left-1/2 -translate-x-1/2"
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1.5,
              repeatDelay: 1,
            }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </motion.div>
        </div>
      </div>

      {/* Floating snowflakes across the screen */}
      <div className="fixed inset-0 z-30 pointer-events-none overflow-hidden">
        {snowflakeConfigs.map((config, i) => (
          <motion.div
            key={`snow-${i}`}
            className="absolute"
            initial={{
              top: config.top,
              left: config.left,
            }}
            animate={{
              top: '120%',
              x: [0, config.x1, config.x2, 0],
            }}
            transition={{
              duration: config.duration,
              repeat: Infinity,
              delay: config.delay,
              ease: 'linear',
            }}
          >
            <Snowflake
              className="text-white/30"
              size={config.size}
            />
          </motion.div>
        ))}
      </div>

      {/* Corner Decorations */}
      {/* Top Left Corner */}
      <div className="fixed top-8 left-0 z-40 pointer-events-none hidden lg:block">
        <motion.div
          className="relative w-32 h-32"
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        >
          {/* Holly leaves effect */}
          <div className="absolute inset-0">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="30" cy="30" r="8" fill="#dc2626" opacity="0.8" />
              <circle cx="45" cy="25" r="8" fill="#dc2626" opacity="0.8" />
              <circle cx="60" cy="30" r="8" fill="#dc2626" opacity="0.8" />
              <path d="M20,40 Q30,30 40,40 T60,40 T80,40" stroke="#065f46" strokeWidth="6" fill="none" opacity="0.9" />
            </svg>
          </div>
          <motion.div
            className="absolute top-8 left-8"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            <Star className="w-8 h-8 text-amber-400 fill-amber-500" />
          </motion.div>
        </motion.div>
      </div>

      {/* Top Right Corner */}
      <div className="fixed top-8 right-0 z-40 pointer-events-none hidden lg:block">
        <motion.div
          className="relative w-32 h-32"
          animate={{
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        >
          <div className="absolute inset-0">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="30" cy="30" r="8" fill="#16a34a" opacity="0.8" />
              <circle cx="45" cy="25" r="8" fill="#16a34a" opacity="0.8" />
              <circle cx="60" cy="30" r="8" fill="#16a34a" opacity="0.8" />
              <path d="M20,40 Q30,30 40,40 T60,40 T80,40" stroke="#dc2626" strokeWidth="6" fill="none" opacity="0.9" />
            </svg>
          </div>
          <motion.div
            className="absolute top-8 right-8"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, -180, -360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            <Gift className="w-8 h-8 text-green-400 fill-green-500" />
          </motion.div>
        </motion.div>
      </div>

      {/* Ribbon decoration on sides (mobile visible) */}
      <div className="fixed top-20 left-0 right-0 z-35 pointer-events-none lg:hidden">
        <div className="flex justify-between px-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Gift className="w-8 h-8 text-red-500 fill-red-600" />
          </motion.div>
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          >
            <Star className="w-8 h-8 text-yellow-400 fill-yellow-500" />
          </motion.div>
        </div>
      </div>
    </>
  )
}

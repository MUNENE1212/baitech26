'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Wifi, Globe, Cpu, Zap, Network } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-[60vh] flex items-center overflow-hidden bg-black">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 opacity-90" />

      {/* Minimal geometric pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Small badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-amber-900/30 bg-amber-950/50 px-4 py-2 text-sm text-amber-200 backdrop-blur-sm"
            >
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              Premium Tech & Services
            </motion.div>

            {/* Hero headline */}
            <h1 className="text-4xl font-light tracking-tight text-white lg:text-6xl">
              Elevate Your
              <br />
              <span className="font-semibold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
                Digital Experience
              </span>
            </h1>

            {/* Subheadline */}
            <p className="max-w-xl text-base text-zinc-400 leading-relaxed">
              Curated selection of premium gadgets and expert technical services.
              Where innovation meets craftsmanship.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/catalogue"
                className="group inline-flex items-center justify-center gap-2 bg-amber-500 px-8 py-4 font-medium text-black transition-all hover:bg-amber-400"
              >
                Explore Collection
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 border border-amber-700 bg-transparent px-8 py-4 font-medium text-amber-200 transition-all hover:border-amber-500 hover:bg-amber-950/50"
              >
                View Services
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-8 pt-8 border-t border-zinc-800">
              <div>
                <div className="text-2xl font-semibold text-white">500+</div>
                <div className="text-sm text-zinc-500">Products</div>
              </div>
              <div className="h-12 w-px bg-zinc-800" />
              <div>
                <div className="text-2xl font-semibold text-white">1000+</div>
                <div className="text-sm text-zinc-500">Happy Clients</div>
              </div>
              <div className="h-12 w-px bg-zinc-800" />
              <div>
                <div className="text-2xl font-semibold text-white">24/7</div>
                <div className="text-sm text-zinc-500">Support</div>
              </div>
            </div>
          </motion.div>

          {/* Right: Tech-Themed Animated Logo */}
          <motion.div
            className="relative hidden lg:flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative w-[500px] h-[500px]">
              {/* Global reach grid background */}
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" viewBox="0 0 500 500">
                  {/* Grid lines */}
                  {Array.from({ length: 10 }).map((_, i) => (
                    <g key={i}>
                      <motion.line
                        x1="0"
                        y1={i * 50}
                        x2="500"
                        y2={i * 50}
                        stroke="rgb(245, 158, 11)"
                        strokeWidth="0.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: i * 0.1 }}
                      />
                      <motion.line
                        x1={i * 50}
                        y1="0"
                        x2={i * 50}
                        y2="500"
                        stroke="rgb(245, 158, 11)"
                        strokeWidth="0.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: i * 0.1 }}
                      />
                    </g>
                  ))}
                </svg>
              </div>

              {/* Glowing tech ring animation */}
              <motion.div
                className="absolute inset-0 -m-12 rounded-full bg-gradient-to-r from-blue-500/20 via-amber-500/20 to-cyan-500/20 blur-3xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Outer rotating tech ring with dashed pattern */}
              <motion.div
                className="absolute inset-0 -m-8 rounded-full border-4 border-dashed border-cyan-400/40"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* Middle rotating ring */}
              <motion.div
                className="absolute inset-0 -m-4 rounded-full border-2 border-amber-500/30"
                animate={{
                  rotate: -360,
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  rotate: {
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  },
                  scale: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
              />

              {/* Center container */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Logo with floating animation */}
                <motion.div
                  className="relative z-20"
                  animate={{
                    y: [0, -15, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <img
                    src="/logo-lg.png"
                    alt="BAITECH Logo"
                    className="h-48 w-48 object-contain drop-shadow-2xl"
                  />

                  {/* Tech pulse effect behind logo */}
                  <motion.div
                    className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-cyan-400/30 to-blue-500/30 blur-xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              </div>

              {/* Tech icons orbiting - representing global reach */}
              {[
                { icon: Globe, rotation: 0, color: 'from-blue-400 to-cyan-500', delay: 0 },
                { icon: Wifi, rotation: 72, color: 'from-amber-400 to-orange-500', delay: 0.2 },
                { icon: Cpu, rotation: 144, color: 'from-purple-400 to-pink-500', delay: 0.4 },
                { icon: Zap, rotation: 216, color: 'from-green-400 to-emerald-500', delay: 0.6 },
                { icon: Network, rotation: 288, color: 'from-red-400 to-rose-500', delay: 0.8 },
              ].map(({ icon: Icon, rotation, color, delay }, index) => (
                <motion.div
                  key={index}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    transformOrigin: "center",
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotate: [rotation, rotation + 360],
                  }}
                  transition={{
                    opacity: { delay: delay, duration: 0.5 },
                    scale: { delay: delay, duration: 0.5 },
                    rotate: {
                      duration: 15,
                      repeat: Infinity,
                      ease: "linear",
                      delay: delay,
                    },
                  }}
                >
                  <motion.div
                    className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${color} shadow-lg`}
                    style={{
                      transform: "translateX(180px)",
                    }}
                    animate={{
                      rotate: [0, -360],
                    }}
                    transition={{
                      duration: 15,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>
                </motion.div>
              ))}

              {/* Connection lines - representing network */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 500">
                {[0, 72, 144, 216, 288].map((angle, i) => {
                  const nextAngle = (angle + 72) % 360
                  const x1 = 250 + 180 * Math.cos((angle * Math.PI) / 180)
                  const y1 = 250 + 180 * Math.sin((angle * Math.PI) / 180)
                  const x2 = 250 + 180 * Math.cos((nextAngle * Math.PI) / 180)
                  const y2 = 250 + 180 * Math.sin((nextAngle * Math.PI) / 180)

                  return (
                    <motion.line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="url(#gradient)"
                      strokeWidth="1"
                      opacity="0.3"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: [0, 1, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.3,
                      }}
                    />
                  )
                })}
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgb(59, 130, 246)" />
                    <stop offset="50%" stopColor="rgb(245, 158, 11)" />
                    <stop offset="100%" stopColor="rgb(6, 182, 212)" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Scanning radar effect */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 270deg, rgba(59, 130, 246, 0.3) 360deg)',
                }}
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* Floating data particles */}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}

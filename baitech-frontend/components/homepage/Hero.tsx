'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-black">
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
            <h1 className="text-5xl font-light tracking-tight text-white lg:text-7xl">
              Elevate Your
              <br />
              <span className="font-semibold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
                Digital Experience
              </span>
            </h1>

            {/* Subheadline */}
            <p className="max-w-xl text-lg text-zinc-400 leading-relaxed">
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

          {/* Right: Visual Element */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative aspect-square">
              {/* Decorative circles */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 opacity-50 blur-3xl" />
              <div className="absolute inset-12 rounded-full border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm" />
              <div className="absolute inset-24 rounded-full border border-zinc-700 bg-zinc-800/20 backdrop-blur-sm" />

              {/* Center content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-8xl">💎</div>
                  <div className="text-xl font-light text-zinc-300">Premium Quality</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}

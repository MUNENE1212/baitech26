'use client'

import { motion } from 'framer-motion'

interface SectionHeaderProps {
  badge?: string
  title: string
  highlightedText?: string
  description?: string
  badgeVariant?: 'default' | 'outlined' | 'gradient'
  className?: string
}

export function SectionHeader({
  badge,
  title,
  highlightedText,
  description,
  badgeVariant = 'default',
  className = ''
}: SectionHeaderProps) {
  const getBadgeStyles = () => {
    switch (badgeVariant) {
      case 'gradient':
        return 'inline-block rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-1 text-sm font-semibold text-white shadow-lg'
      case 'outlined':
        return 'inline-block rounded-full border border-amber-300 bg-amber-50 px-4 py-1 text-sm font-medium text-amber-900'
      default:
        return 'inline-block rounded-full border border-amber-300 bg-white px-4 py-1 text-sm font-medium text-amber-900'
    }
  }

  return (
    <motion.div
      className={`mb-12 text-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      {badge && (
        <motion.div
          className={getBadgeStyles()}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          {badge}
        </motion.div>
      )}

      <h2 className="text-3xl font-light tracking-tight text-zinc-900 lg:text-4xl">
        {title}
        {highlightedText && (
          <span className="font-semibold text-amber-600">{highlightedText}</span>
        )}
      </h2>

      {description && (
        <motion.p
          className="mx-auto mt-4 max-w-2xl text-zinc-600"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  )
}
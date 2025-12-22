'use client'

import { useState } from 'react'
import type { Review } from 'src/types'
import { Quote } from 'lucide-react'

interface ReviewSectionProps {
  reviews: Review[]
}

export function ReviewSection({ reviews }: ReviewSectionProps) {
  if (reviews.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review) => (
        <ReviewCard key={review._id} review={review} />
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="group relative border border-zinc-200 bg-white p-8 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Quote icon */}
      <div className="mb-6 inline-flex h-10 w-10 items-center justify-center border border-zinc-200 bg-zinc-50">
        <Quote className="h-5 w-5 text-zinc-400" />
      </div>

      {/* Review text */}
      <p className="mb-6 text-sm leading-relaxed text-zinc-700">
        {review.comment}
      </p>

      {/* Divider */}
      <div className={`mb-4 h-px bg-zinc-200 transition-all duration-300 ${isHovered ? 'w-full' : 'w-12'}`} />

      {/* Customer name */}
      <p className="text-sm font-medium text-zinc-900">
        {review.customer_name}
      </p>

      {/* Verified badge */}
      <div className="mt-2 inline-block border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
        Verified Customer
      </div>
    </div>
  )
}

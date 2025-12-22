'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'

interface ProductImageGalleryProps {
  images: string[]
  productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Ensure images is always an array
  const safeImages = images || []
  const hasMultipleImages = safeImages.length > 1

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % safeImages.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + safeImages.length) % safeImages.length)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextImage()
    if (e.key === 'ArrowLeft') prevImage()
    if (e.key === 'Escape') setIsFullscreen(false)
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div
          className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <Image
            src={safeImages[selectedImage] || '/logo-md.png'}
            alt={`${productName} - Image ${selectedImage + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            unoptimized={safeImages[selectedImage]?.includes('cloudinary')}
          />

          {/* Navigation Arrows */}
          {hasMultipleImages && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </button>
            </>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10"
            aria-label="View fullscreen"
          >
            <Maximize2 className="w-5 h-5 text-gray-800" />
          </button>

          {/* Image Counter */}
          {hasMultipleImages && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {selectedImage + 1} / {safeImages.length}
            </div>
          )}
        </div>

        {/* Thumbnail Grid */}
        {hasMultipleImages && (
          <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
            {safeImages.map((image, index) => (
              <motion.button
                key={index}
                onClick={() => setSelectedImage(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === index
                    ? 'border-amber-600 ring-2 ring-amber-200'
                    : 'border-gray-200 hover:border-amber-400'
                }`}
              >
                <Image
                  src={image || '/logo-md.png'}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 25vw, 10vw"
                  unoptimized={image?.includes('cloudinary')}
                />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setIsFullscreen(false)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors z-10"
              aria-label="Close fullscreen"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation Arrows in Fullscreen */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-8 h-8 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-8 h-8 text-white" />
                </button>
              </>
            )}

            {/* Fullscreen Image */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full h-full max-w-6xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={safeImages[selectedImage] || '/logo-md.png'}
                alt={`${productName} - Image ${selectedImage + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                unoptimized={safeImages[selectedImage]?.includes('cloudinary')}
              />
            </motion.div>

            {/* Image Counter in Fullscreen */}
            {hasMultipleImages && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                {selectedImage + 1} / {safeImages.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

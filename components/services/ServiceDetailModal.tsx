'use client'

import { useState } from 'react'
import type { Service } from '@/types'
import { X } from 'lucide-react'

interface ServiceDetailModalProps {
  service: Service
  isOpen: boolean
  onClose: () => void
}

export default function ServiceDetailModal({ service, isOpen, onClose }: ServiceDetailModalProps) {
  if (!service || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">{service.name}</h2>
          <p className="text-gray-700 mb-4">{service.description}</p>

          {service.category && (
            <div className="mb-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {service.category}
              </span>
            </div>
          )}

          {service.pricing && (
            <div className="mb-4">
              <span className="text-lg font-semibold text-blue-600">
                Ksh {service.pricing?.base_price ? service.pricing.base_price.toLocaleString() : '0'}
              </span>
              <span className="text-gray-500">/ {service.pricing?.unit || 'service'}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
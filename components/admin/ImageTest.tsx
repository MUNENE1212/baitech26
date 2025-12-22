'use client'

import { useState } from 'react'
import Image from 'next/image'

// Test component to verify Cloudinary images work
export function ImageTest() {
  const [testUrl, setTestUrl] = useState('')
  const [showTest, setShowTest] = useState(false)

  const testCloudinaryUrl = () => {
    // Use a known working Cloudinary URL from your uploads
    const url = 'https://res.cloudinary.com/dzobbamlm/image/upload/v1/baitech/products/test.jpg'
    setTestUrl(url)
    setShowTest(true)
  }

  return (
    <div className="p-4 border rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">Cloudinary Image Test</h3>
      <button
        onClick={testCloudinaryUrl}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test Cloudinary URL
      </button>

      {showTest && (
        <div className="mt-4">
          <p className="text-sm mb-2">Testing URL: {testUrl}</p>
          <div className="relative w-64 h-64 border rounded">
            <Image
              src={testUrl}
              alt="Test Cloudinary"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
              onError={() => console.error('Test image failed to load')}
              onLoad={() => console.log('Test image loaded successfully')}
              unoptimized={true}
            />
          </div>
        </div>
      )}
    </div>
  )
}
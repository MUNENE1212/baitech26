'use client'

import { useState } from 'react'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { Image, Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'

export default function ImagesPage() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const handleUploadComplete = (paths: string[]) => {
    setUploadedImages(prev => [...paths, ...prev])
    toast.success(`${paths.length} image(s) uploaded successfully!`)
  }

  const filteredImages = uploadedImages.filter(img =>
    img.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Image Management</h1>
        <p className="text-gray-600 mt-1">Upload and manage product images</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Image className="w-5 h-5" />
          Upload Images
        </h2>
        <ImageUpload
          onImagesUploaded={handleUploadComplete}
          maxFiles={10}
        />
      </div>

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Uploads ({uploadedImages.length})</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredImages.map((path, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={path}
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(path)
                      toast.success('Image path copied to clipboard!')
                    }}
                    className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-3 py-1 rounded text-sm font-medium transition-opacity"
                  >
                    Copy Path
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-1 truncate" title={path}>
                  {path.split('/').pop()}
                </p>
              </div>
            ))}
          </div>

          {filteredImages.length === 0 && searchQuery && (
            <p className="text-center text-gray-500 py-8">
              No images found matching "{searchQuery}"
            </p>
          )}
        </div>
      )}

      {uploadedImages.length === 0 && (
        <div className="text-center text-gray-500 py-12 bg-white rounded-lg">
          <Image className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p>No images uploaded yet. Use the uploader above to add images.</p>
        </div>
      )}
    </div>
  )
}

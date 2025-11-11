'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Check, AlertCircle } from 'lucide-react'

interface ImageUploadProps {
  onImagesUploaded: (imagePaths: string[]) => void
  multiple?: boolean
  maxFiles?: number
  existingImages?: string[]
}

export function ImageUpload({
  onImagesUploaded,
  multiple = true,
  maxFiles = 5,
  existingImages = []
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>(existingImages)
  const [uploading, setUploading] = useState(false)
  const [uploadedPaths, setUploadedPaths] = useState<string[]>(existingImages)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (files.length === 0) return

    // Validate file count
    if (!multiple && files.length > 1) {
      setError('Only one file allowed')
      return
    }

    if (previews.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`)
      return
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const invalidFiles = files.filter(f => !validTypes.includes(f.type))

    if (invalidFiles.length > 0) {
      setError('Only JPG, PNG, and WebP images are allowed')
      return
    }

    // Create previews
    const newPreviews = await Promise.all(
      files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })
      })
    )

    setPreviews([...previews, ...newPreviews])

    // Upload files
    await uploadFiles(files)
  }

  const uploadFiles = async (files: File[]) => {
    setUploading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      // Create FormData
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch(`${apiUrl}/admin/upload-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()

      if (data.success) {
        const newPaths = data.results.map((r: any) => r.primary_path)
        const allPaths = [...uploadedPaths, ...newPaths]
        setUploadedPaths(allPaths)
        onImagesUploaded(allPaths)
      } else {
        throw new Error(data.errors?.[0]?.error || 'Upload failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images')
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index)
    const newPaths = uploadedPaths.filter((_, i) => i !== index)

    setPreviews(newPreviews)
    setUploadedPaths(newPaths)
    onImagesUploaded(newPaths)
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || previews.length >= maxFiles}
          className={`
            w-full rounded-lg border-2 border-dashed p-8 text-center transition-colors
            ${uploading || previews.length >= maxFiles
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-amber-300 hover:border-amber-400 hover:bg-amber-50'
            }
          `}
        >
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <>
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
                <p className="font-medium text-gray-900">Uploading & optimizing...</p>
                <p className="text-sm text-gray-500">
                  Images are being resized and optimized
                </p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-amber-400" />
                <p className="font-medium text-gray-900">Click to upload images</p>
                <p className="text-sm text-gray-500">
                  JPG, PNG or WebP (max {maxFiles} files)
                </p>
                <p className="text-xs text-gray-400">
                  Images will be automatically optimized
                </p>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-600">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-lg border-2 border-gray-200"
            >
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="h-full w-full object-cover"
              />

              {/* Upload Status Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadedPaths[index] ? (
                  <div className="flex flex-col items-center gap-2 text-white">
                    <Check className="h-8 w-8" />
                    <span className="text-xs">Uploaded</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-white">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span className="text-xs">Processing...</span>
                  </div>
                )}
              </div>

              {/* Remove Button */}
              {uploadedPaths[index] && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Count */}
      {previews.length > 0 && (
        <p className="text-sm text-gray-600 text-center">
          {previews.length} / {maxFiles} images uploaded
        </p>
      )}
    </div>
  )
}

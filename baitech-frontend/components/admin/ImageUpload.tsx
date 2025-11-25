'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Check, AlertCircle, Camera, Edit } from 'lucide-react'
import { ImageEditor } from './ImageEditor'

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
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [editingImage, setEditingImage] = useState<{ url: string; index: number } | null>(null)
  const [pendingFiles, setPendingFiles] = useState<{ file: File; preview: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    // Store files and previews, but don't upload yet - wait for editing
    const filesWithPreviews = files.map((file, index) => ({
      file,
      preview: newPreviews[index]
    }))

    setPendingFiles([...pendingFiles, ...filesWithPreviews])
    setPreviews([...previews, ...newPreviews])

    // Open editor for first file
    if (filesWithPreviews.length > 0) {
      setEditingImage({
        url: filesWithPreviews[0].preview,
        index: previews.length
      })
    }
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

      const response = await fetch(`${apiUrl}/api/admin/upload-images`, {
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
        // Use 'url' which contains Cloudinary URL or local path
        const newPaths = data.results.map((r: any) => r.url || r.primary_path)
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

  const startCamera = async () => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
        audio: false
      })
      setStream(mediaStream)
      setShowCamera(true)

      // Set video stream after component renders
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      }, 100)
    } catch (err) {
      setError('Failed to access camera. Please grant camera permissions.')
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    const context = canvas.getContext('2d')
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setError('Failed to capture photo')
          return
        }

        // Create file from blob
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' })

        // Create preview
        const preview = URL.createObjectURL(blob)

        // Store as pending file
        setPendingFiles([...pendingFiles, { file, preview }])
        setPreviews([...previews, preview])

        // Stop camera
        stopCamera()

        // Open editor for captured image
        setEditingImage({
          url: preview,
          index: previews.length
        })
      }, 'image/jpeg', 0.9)
    }
  }

  const handleEditorSave = async (editedBlob: Blob) => {
    if (!editingImage) return

    // Create a new file from edited blob
    const editedFile = new File([editedBlob], `edited-${Date.now()}.jpg`, { type: 'image/jpeg' })

    // Update preview
    const newPreview = URL.createObjectURL(editedBlob)
    const newPreviews = [...previews]
    newPreviews[editingImage.index] = newPreview
    setPreviews(newPreviews)

    // Update pending file
    const fileIndex = pendingFiles.findIndex((_, i) => i === editingImage.index)
    if (fileIndex !== -1) {
      const newPendingFiles = [...pendingFiles]
      newPendingFiles[fileIndex] = { file: editedFile, preview: newPreview }
      setPendingFiles(newPendingFiles)
    }

    // Upload the edited file
    await uploadFiles([editedFile])

    // Close editor
    setEditingImage(null)
  }

  const handleEditorCancel = () => {
    setEditingImage(null)
  }

  const editImage = (index: number) => {
    setEditingImage({
      url: previews[index],
      index
    })
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

        {/* Upload buttons grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || previews.length >= maxFiles}
            className={`
              rounded-lg border-2 border-dashed p-8 text-center transition-colors
              ${uploading || previews.length >= maxFiles
                ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                : 'border-amber-300 hover:border-amber-400 hover:bg-amber-50'
              }
            `}
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-12 w-12 text-amber-400" />
              <p className="font-medium text-gray-900">Choose Files</p>
              <p className="text-sm text-gray-500">
                Select from device
              </p>
            </div>
          </button>

          {/* Camera button */}
          <button
            type="button"
            onClick={startCamera}
            disabled={uploading || previews.length >= maxFiles}
            className={`
              rounded-lg border-2 border-dashed p-8 text-center transition-colors
              ${uploading || previews.length >= maxFiles
                ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50'
              }
            `}
          >
            <div className="flex flex-col items-center gap-2">
              <Camera className="h-12 w-12 text-blue-400" />
              <p className="font-medium text-gray-900">Take Photo</p>
              <p className="text-sm text-gray-500">
                Use camera
              </p>
            </div>
          </button>
        </div>

        {/* Upload info */}
        {!uploading && previews.length < maxFiles && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              JPG, PNG or WebP (max {maxFiles} files)
            </p>
            <p className="text-xs text-gray-400">
              Images will be automatically optimized
            </p>
          </div>
        )}

        {/* Uploading indicator */}
        {uploading && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
            <p className="font-medium text-gray-900">Uploading & optimizing...</p>
            <p className="text-sm text-gray-500">
              Images are being resized and optimized
            </p>
          </div>
        )}
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

              {/* Action Buttons */}
              <div className="absolute left-2 top-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => editImage(index)}
                  className="rounded-full bg-blue-500 p-1.5 text-white hover:bg-blue-600 transition-colors"
                  title="Edit image"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>

              {/* Remove Button */}
              {uploadedPaths[index] && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
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

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-2xl">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Take Photo</h3>
              <button
                onClick={stopCamera}
                className="rounded-full p-2 hover:bg-gray-100 transition-colors"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Camera View */}
            <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />

              {/* Camera overlay guide */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-4 border-white/50 rounded-lg w-3/4 h-3/4" />
              </div>
            </div>

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Controls */}
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={stopCamera}
                className="rounded-lg border-2 border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={capturePhoto}
                disabled={uploading}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="h-5 w-5" />
                {uploading ? 'Processing...' : 'Capture Photo'}
              </button>
            </div>

            {/* Instructions */}
            <p className="mt-4 text-center text-sm text-gray-500">
              Position the item within the guide and click "Capture Photo"
            </p>
          </div>
        </div>
      )}

      {/* Image Editor */}
      {editingImage && (
        <ImageEditor
          image={editingImage.url}
          onSave={handleEditorSave}
          onCancel={handleEditorCancel}
        />
      )}
    </div>
  )
}

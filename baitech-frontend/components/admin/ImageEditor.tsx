'use client'

import { useState, useCallback, useRef } from 'react'
import Cropper from 'react-easy-crop'
import { X, RotateCw, FlipHorizontal, FlipVertical, Crop, Sun, Contrast, Sparkles, Save } from 'lucide-react'

interface ImageEditorProps {
  image: string
  onSave: (editedImage: Blob) => void
  onCancel: () => void
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export function ImageEditor({ image, onSave, onCancel }: ImageEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [flipHorizontal, setFlipHorizontal] = useState(false)
  const [flipVertical, setFlipVertical] = useState(false)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [filter, setFilter] = useState<'none' | 'grayscale' | 'sepia' | 'vintage'>('none')
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null)
  const [activeTab, setActiveTab] = useState<'crop' | 'adjust' | 'filter'>('crop')

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.src = url
    })

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: CropArea,
    rotation: number = 0,
    flip = { horizontal: false, vertical: false }
  ): Promise<Blob> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    const maxSize = Math.max(image.width, image.height)
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

    canvas.width = safeArea
    canvas.height = safeArea

    ctx.translate(safeArea / 2, safeArea / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
    ctx.translate(-safeArea / 2, -safeArea / 2)

    // Apply brightness and contrast
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    )

    const data = ctx.getImageData(0, 0, safeArea, safeArea)

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.putImageData(
      data,
      0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
      0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
    )

    // Apply filter
    if (filter !== 'none') {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        if (filter === 'grayscale') {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b
          data[i] = gray
          data[i + 1] = gray
          data[i + 2] = gray
        } else if (filter === 'sepia') {
          data[i] = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b)
          data[i + 1] = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b)
          data[i + 2] = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b)
        } else if (filter === 'vintage') {
          data[i] = Math.min(255, r * 1.2)
          data[i + 1] = Math.min(255, g * 0.9)
          data[i + 2] = Math.min(255, b * 0.7)
        }
      }

      ctx.putImageData(imageData, 0, 0)
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
      }, 'image/jpeg', 0.95)
    })
  }

  const handleSave = async () => {
    if (!croppedAreaPixels) return

    try {
      const croppedImage = await getCroppedImg(
        image,
        croppedAreaPixels,
        rotation,
        { horizontal: flipHorizontal, vertical: flipVertical }
      )
      onSave(croppedImage)
    } catch (error) {
      console.error('Error cropping image:', error)
    }
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleFlipHorizontal = () => {
    setFlipHorizontal((prev) => !prev)
  }

  const handleFlipVertical = () => {
    setFlipVertical((prev) => !prev)
  }

  const handleReset = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setFlipHorizontal(false)
    setFlipVertical(false)
    setBrightness(100)
    setContrast(100)
    setFilter('none')
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between bg-zinc-900 px-6 py-4">
        <div className="flex items-center gap-3">
          <Crop className="h-6 w-6 text-amber-400" />
          <h2 className="text-xl font-semibold text-white">Edit Image</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Reset
          </button>
          <button
            onClick={onCancel}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 bg-zinc-900">
        <button
          onClick={() => setActiveTab('crop')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'crop'
              ? 'border-b-2 border-amber-500 text-amber-500'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Crop className="h-4 w-4" />
          Crop & Rotate
        </button>
        <button
          onClick={() => setActiveTab('adjust')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'adjust'
              ? 'border-b-2 border-amber-500 text-amber-500'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sun className="h-4 w-4" />
          Adjust
        </button>
        <button
          onClick={() => setActiveTab('filter')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'filter'
              ? 'border-b-2 border-amber-500 text-amber-500'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Filters
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor Canvas */}
        <div className="relative flex-1">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={undefined}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            transform={`translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${zoom}) scaleX(${flipHorizontal ? -1 : 1}) scaleY(${flipVertical ? -1 : 1})`}
            style={{
              containerStyle: {
                filter: `brightness(${brightness}%) contrast(${contrast}%)`,
              },
            }}
          />
        </div>

        {/* Controls Panel */}
        <div className="w-80 overflow-y-auto bg-zinc-900 p-6">
          {activeTab === 'crop' && (
            <div className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-medium text-zinc-300">
                  Zoom
                </label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
                <div className="mt-1 text-xs text-zinc-500">{zoom.toFixed(1)}x</div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-zinc-300">
                  Rotation
                </label>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full"
                />
                <div className="mt-1 text-xs text-zinc-500">{rotation}°</div>
              </div>

              <div className="space-y-3 border-t border-zinc-800 pt-4">
                <label className="block text-sm font-medium text-zinc-300">
                  Transform
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleRotate}
                    className="flex flex-col items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 p-3 transition-colors hover:bg-zinc-700"
                  >
                    <RotateCw className="h-5 w-5 text-amber-400" />
                    <span className="text-xs text-zinc-300">Rotate</span>
                  </button>
                  <button
                    onClick={handleFlipHorizontal}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors ${
                      flipHorizontal
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700'
                    }`}
                  >
                    <FlipHorizontal className="h-5 w-5 text-amber-400" />
                    <span className="text-xs text-zinc-300">Flip H</span>
                  </button>
                  <button
                    onClick={handleFlipVertical}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors ${
                      flipVertical
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700'
                    }`}
                  >
                    <FlipVertical className="h-5 w-5 text-amber-400" />
                    <span className="text-xs text-zinc-300">Flip V</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'adjust' && (
            <div className="space-y-6">
              <div>
                <label className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <Sun className="h-4 w-4" />
                  Brightness
                </label>
                <input
                  type="range"
                  min={50}
                  max={150}
                  step={1}
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full"
                />
                <div className="mt-1 text-xs text-zinc-500">{brightness}%</div>
              </div>

              <div>
                <label className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <Contrast className="h-4 w-4" />
                  Contrast
                </label>
                <input
                  type="range"
                  min={50}
                  max={150}
                  step={1}
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full"
                />
                <div className="mt-1 text-xs text-zinc-500">{contrast}%</div>
              </div>
            </div>
          )}

          {activeTab === 'filter' && (
            <div className="space-y-3">
              <label className="mb-3 block text-sm font-medium text-zinc-300">
                Choose Filter
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'none', label: 'None' },
                  { value: 'grayscale', label: 'Grayscale' },
                  { value: 'sepia', label: 'Sepia' },
                  { value: 'vintage', label: 'Vintage' },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value as any)}
                    className={`rounded-lg border p-4 text-sm font-medium transition-colors ${
                      filter === f.value
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview info */}
          <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-800/50 p-4">
            <h3 className="mb-2 text-sm font-medium text-zinc-300">Tips</h3>
            <ul className="space-y-1 text-xs text-zinc-500">
              <li>• Drag to reposition the image</li>
              <li>• Use mouse wheel to zoom</li>
              <li>• Adjust sliders for fine control</li>
              <li>• Filters are applied on save</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

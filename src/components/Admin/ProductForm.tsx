import { useState } from 'react'

interface Category {
  id: string
  name: string
}

interface ProductFormProps {
  form: {
    title: string
    description_en: string
    description_ar: string
    price: number
    stock: number
    category_id: string
    image_url: string
    images: string[]
    tags: string
    specs: string
    features: string
    properties: string
    colors: string[]
    wood_types: string[]
  }
  categories: Category[]
  uploading: boolean
  onChange: (field: string, value: string | number | string[]) => void
  onFileUpload: (file: File) => Promise<void>
  onMultipleFileUpload: (files: FileList) => Promise<void>
  onRemoveImage: (index: number) => void
  onSubmit: () => void
  onCancel: () => void
}

const PREDEFINED_COLORS = [
  { name: 'Black', value: 'black', hex: '#000000' },
  { name: 'White', value: 'white', hex: '#FFFFFF' },
  { name: 'Brown', value: 'brown', hex: '#8B4513' },
  { name: 'Natural Wood', value: 'natural-wood', hex: '#D2B48C' },
  { name: 'Gray', value: 'gray', hex: '#808080' },
  { name: 'Beige', value: 'beige', hex: '#F5F5DC' },
  { name: 'Red', value: 'red', hex: '#DC2626' },
  { name: 'Blue', value: 'blue', hex: '#2563EB' },
  { name: 'Green', value: 'green', hex: '#16A34A' },
  { name: 'Yellow', value: 'yellow', hex: '#EAB308' },
]

const PREDEFINED_WOOD_TYPES = [
  'Oak',
  'Pine',
  'Maple',
  'Cherry',
  'Walnut',
  'Mahogany',
  'Birch',
  'Ash',
  'Teak',
  'Cedar',
  'Bamboo',
  'Plywood',
  'MDF',
  'Particle Board',
]

export default function ProductForm({
  form,
  categories,
  uploading,
  onChange,
  onFileUpload,
  onMultipleFileUpload,
  onRemoveImage,
  onSubmit,
  onCancel
}: ProductFormProps) {
  const [customColor, setCustomColor] = useState('')
  const [customWoodType, setCustomWoodType] = useState('')

  const toggleColor = (color: string) => {
    const currentColors = form.colors || []
    if (currentColors.includes(color)) {
      onChange('colors', currentColors.filter(c => c !== color))
    } else {
      onChange('colors', [...currentColors, color])
    }
  }

  const addCustomColor = () => {
    if (customColor.trim() && !form.colors.includes(customColor.trim())) {
      onChange('colors', [...form.colors, customColor.trim()])
      setCustomColor('')
    }
  }

  const removeColor = (color: string) => {
    onChange('colors', form.colors.filter(c => c !== color))
  }

  const toggleWoodType = (woodType: string) => {
    const currentWoodTypes = form.wood_types || []
    if (currentWoodTypes.includes(woodType)) {
      onChange('wood_types', currentWoodTypes.filter(w => w !== woodType))
    } else {
      onChange('wood_types', [...currentWoodTypes, woodType])
    }
  }

  const addCustomWoodType = () => {
    if (customWoodType.trim() && !form.wood_types.includes(customWoodType.trim())) {
      onChange('wood_types', [...form.wood_types, customWoodType.trim()])
      setCustomWoodType('')
    }
  }

  const removeWoodType = (woodType: string) => {
    onChange('wood_types', form.wood_types.filter(w => w !== woodType))
  }

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Basic Information */}
      <div className="pb-4 border-b" style={{ borderColor: "#E2E8F0" }}>
        <h3 className="text-lg font-semibold mb-3" style={{ color: "#0F172A" }}>Basic Information</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Product Title *</label>
            <input type="text" value={form.title} onChange={e => onChange('title', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: "#E2E8F0", color: "#1E293B" }} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Price ($) *</label>
              <input type="number" step="0.01" value={form.price} onChange={e => onChange('price', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: "#E2E8F0", color: "#1E293B" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Stock *</label>
              <input type="number" value={form.stock} onChange={e => onChange('stock', parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: "#E2E8F0", color: "#1E293B" }} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Category</label>
            <select value={form.category_id} onChange={e => onChange('category_id', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: "#E2E8F0", color: "#1E293B" }}>
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Descriptions */}
      <div className="pb-4 border-b" style={{ borderColor: "#E2E8F0" }}>
        <h3 className="text-lg font-semibold mb-3" style={{ color: "#0F172A" }}>Descriptions</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Description (English)</label>
            <textarea value={form.description_en} onChange={e => onChange('description_en', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg" rows={3} style={{ borderColor: "#E2E8F0", color: "#1E293B" }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Description (Arabic)</label>
            <textarea value={form.description_ar} onChange={e => onChange('description_ar', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg" rows={3} style={{ borderColor: "#E2E8F0", color: "#1E293B" }} />
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="pb-4 border-b" style={{ borderColor: "#E2E8F0" }}>
        <h3 className="text-lg font-semibold mb-3" style={{ color: "#0F172A" }}>Product Details</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Specifications</label>
            <textarea value={form.specs} onChange={e => onChange('specs', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg" rows={3} style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
              placeholder="E.g., Dimensions: 120x80x75cm, Weight: 25kg" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Features</label>
            <textarea value={form.features} onChange={e => onChange('features', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg" rows={3} style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
              placeholder="E.g., Waterproof, Easy assembly, Stackable" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Properties</label>
            <textarea value={form.properties} onChange={e => onChange('properties', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg" rows={3} style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
              placeholder="E.g., Material: Solid wood, Finish: Lacquered" />
          </div>
        </div>
      </div>

      {/* Colors */}
      <div className="pb-4 border-b" style={{ borderColor: "#E2E8F0" }}>
        <h3 className="text-lg font-semibold mb-3" style={{ color: "#0F172A" }}>Colors</h3>

        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            {PREDEFINED_COLORS.map(color => (
              <button
                key={color.value}
                type="button"
                onClick={() => toggleColor(color.value)}
                className="p-2 rounded-lg border-2 transition-all text-xs font-medium"
                style={{
                  borderColor: form.colors.includes(color.value) ? "#3B82F6" : "#E2E8F0",
                  backgroundColor: form.colors.includes(color.value) ? "#EFF6FF" : "#FFFFFF"
                }}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{
                      backgroundColor: color.hex,
                      borderColor: color.value === 'white' ? '#E2E8F0' : color.hex
                    }}
                  />
                  <span style={{ color: "#1E293B" }}>{color.name}</span>
                </div>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Custom Color</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customColor}
                onChange={e => setCustomColor(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addCustomColor())}
                className="flex-1 px-3 py-2 border rounded-lg"
                style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
                placeholder="Enter custom color name"
              />
              <button
                type="button"
                onClick={addCustomColor}
                className="px-4 py-2 rounded-lg font-semibold text-white"
                style={{ backgroundColor: "#3B82F6" }}
              >
                Add
              </button>
            </div>
          </div>

          {form.colors && form.colors.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: "#64748B" }}>
                Selected Colors ({form.colors.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {form.colors.map(color => (
                  <div
                    key={color}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
                    style={{ borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" }}
                  >
                    <span className="text-sm" style={{ color: "#1E293B" }}>{color}</span>
                    <button
                      type="button"
                      onClick={() => removeColor(color)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Wood Types */}
      <div className="pb-4 border-b" style={{ borderColor: "#E2E8F0" }}>
        <h3 className="text-lg font-semibold mb-3" style={{ color: "#0F172A" }}>Wood Types</h3>

        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {PREDEFINED_WOOD_TYPES.map(woodType => (
              <button
                key={woodType}
                type="button"
                onClick={() => toggleWoodType(woodType)}
                className="px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium"
                style={{
                  borderColor: form.wood_types.includes(woodType) ? "#10B981" : "#E2E8F0",
                  backgroundColor: form.wood_types.includes(woodType) ? "#ECFDF5" : "#FFFFFF",
                  color: "#1E293B"
                }}
              >
                {woodType}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Custom Wood Type</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customWoodType}
                onChange={e => setCustomWoodType(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addCustomWoodType())}
                className="flex-1 px-3 py-2 border rounded-lg"
                style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
                placeholder="Enter custom wood type"
              />
              <button
                type="button"
                onClick={addCustomWoodType}
                className="px-4 py-2 rounded-lg font-semibold text-white"
                style={{ backgroundColor: "#10B981" }}
              >
                Add
              </button>
            </div>
          </div>

          {form.wood_types && form.wood_types.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: "#64748B" }}>
                Selected Wood Types ({form.wood_types.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {form.wood_types.map(woodType => (
                  <div
                    key={woodType}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
                    style={{ borderColor: "#10B981", backgroundColor: "#F0FDF4" }}
                  >
                    <span className="text-sm" style={{ color: "#1E293B" }}>{woodType}</span>
                    <button
                      type="button"
                      onClick={() => removeWoodType(woodType)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="pb-4 border-b" style={{ borderColor: "#E2E8F0" }}>
        <h3 className="text-lg font-semibold mb-3" style={{ color: "#0F172A" }}>Tags & Keywords</h3>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Tags (comma separated)</label>
          <input type="text" value={form.tags} onChange={e => onChange('tags', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: "#E2E8F0", color: "#1E293B" }} placeholder="tag1, tag2, tag3" />
        </div>
      </div>

      {/* Images */}
      <div className="pb-4">
        <h3 className="text-lg font-semibold mb-3" style={{ color: "#0F172A" }}>Product Images</h3>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Upload Images</label>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={async e => {
              const files = e.target.files
              if (files && files.length > 0) {
                await onMultipleFileUpload(files)
              }
            }}
            className="w-full px-3 py-2 border rounded-lg"
            style={{ borderColor: "#E2E8F0" }}
          />
          <p className="text-xs mt-1" style={{ color: "#64748B" }}>You can select multiple images at once</p>
          {uploading && (
            <div className="mt-2 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#3B82F6", borderTopColor: "transparent" }}></div>
              <p className="text-sm" style={{ color: "#3B82F6" }}>Uploading images...</p>
            </div>
          )}

          {form.images && form.images.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2" style={{ color: "#64748B" }}>
                Uploaded Images ({form.images.length})
              </p>
              <div className="grid grid-cols-3 gap-3">
                {form.images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2"
                      style={{ borderColor: "#E2E8F0" }}
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveImage(index)}
                      className="absolute top-1 right-1 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: "rgba(239, 68, 68, 0.9)" }}
                      title="Remove image"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="absolute bottom-1 right-1 px-2 py-0.5 rounded text-xs font-semibold text-white" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}>
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t" style={{ borderColor: "#E2E8F0" }}>
        <button onClick={onSubmit} disabled={uploading} className="flex-1 py-2 rounded-lg font-semibold text-white" style={{ backgroundColor: uploading ? "#93C5FD" : "#3B82F6" }}>
          {uploading ? "Uploading..." : "Save Product"}
        </button>
        <button onClick={onCancel} className="flex-1 py-2 rounded-lg font-semibold" style={{ backgroundColor: "#E2E8F0", color: "#64748B" }}>Cancel</button>
      </div>
    </div>
  )
}

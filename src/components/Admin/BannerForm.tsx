"use client"

interface BannerFormProps {
  form: {
    title: string
    subtitle: string
    description: string
    discount_text: string
    button_text: string
    button_url: string
    image_url: string
    countdown_end: string
  }
  uploading?: boolean
  onChange: (field: string, value: string) => void
  onFileUpload: (file: File) => Promise<void>
  onSubmit: () => void
  onCancel: () => void
}

export default function BannerForm({ form, uploading, onChange, onFileUpload, onSubmit, onCancel }: BannerFormProps) {
  return (
    <div className="space-y-5 max-h-[70vh] overflow-y-auto px-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#64748B" }}>
            Title *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => onChange("title", e.target.value)}
            className="w-full px-4 py-2.5 border rounded-lg"
            style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
            placeholder="e.g. Apple iPhone 14 Plus"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#64748B" }}>
            Subtitle
          </label>
          <input
            type="text"
            value={form.subtitle}
            onChange={(e) => onChange("subtitle", e.target.value)}
            className="w-full px-4 py-2.5 border rounded-lg"
            style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
            placeholder="e.g. Apple iPhone 14 Plus"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "#64748B" }}>
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => onChange("description", e.target.value)}
          className="w-full px-4 py-2.5 border rounded-lg"
          style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
          rows={3}
          placeholder="iPhone 14 has the same superspeedy chip..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#64748B" }}>
            Discount Text
          </label>
          <input
            type="text"
            value={form.discount_text}
            onChange={(e) => onChange("discount_text", e.target.value)}
            className="w-full px-4 py-2.5 border rounded-lg"
            style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
            placeholder="e.g. UP TO 30% OFF"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#64748B" }}>
            Button Text
          </label>
          <input
            type="text"
            value={form.button_text}
            onChange={(e) => onChange("button_text", e.target.value)}
            className="w-full px-4 py-2.5 border rounded-lg"
            style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
            placeholder="e.g. Buy Now"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "#64748B" }}>
          Button URL
        </label>
        <input
          type="text"
          value={form.button_url}
          onChange={(e) => onChange("button_url", e.target.value)}
          className="w-full px-4 py-2.5 border rounded-lg"
          style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
          placeholder="e.g. /shop-with-sidebar"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "#64748B" }}>
          Countdown End Date & Time
        </label>
        <input
          type="datetime-local"
          value={form.countdown_end}
          onChange={(e) => onChange("countdown_end", e.target.value)}
          className="w-full px-4 py-2.5 border rounded-lg"
          style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
        />
        <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
          Set the date and time when the promotional offer ends
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "#64748B" }}>
          Banner Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onFileUpload(file)
          }}
          disabled={uploading}
          className="w-full px-4 py-2.5 border rounded-lg"
          style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
        />
        {uploading && (
          <p className="text-sm mt-2" style={{ color: "#3B82F6" }}>
            Uploading image...
          </p>
        )}
        {form.image_url && !uploading && (
          <div className="mt-3">
            <img
              src={form.image_url}
              alt="Banner preview"
              className="w-full h-48 object-cover rounded-lg border-2"
              style={{ borderColor: "#E2E8F0" }}
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t" style={{ borderColor: "#E2E8F0" }}>
        <button
          onClick={onSubmit}
          className="flex-1 py-3 rounded-lg font-semibold text-white transition-colors"
          style={{ backgroundColor: "#3B82F6" }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2563EB"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#3B82F6"}
        >
          Save Banner
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-lg font-semibold transition-colors"
          style={{ backgroundColor: "#E2E8F0", color: "#64748B" }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#CBD5E1"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#E2E8F0"}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

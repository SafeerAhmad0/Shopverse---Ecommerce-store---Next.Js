"use client"

interface SpecialOfferFormProps {
  form: {
    title: string
    description: string
    discount_percentage: number
    original_price: number
    discounted_price: number
    image_url: string
    product_ids: string[]
    category_ids: string[]
    start_date: string
    end_date: string
  }
  products: Array<{ id: string; title: string }>
  categories: Array<{ id: string; name: string }>
  uploading?: boolean
  onChange: (field: string, value: any) => void
  onFileUpload: (file: File) => Promise<void>
  onSubmit: () => void
  onCancel: () => void
}

export default function SpecialOfferForm({
  form,
  products,
  categories,
  uploading,
  onChange,
  onFileUpload,
  onSubmit,
  onCancel
}: SpecialOfferFormProps) {
  return (
    <div className="space-y-5 max-h-[70vh] overflow-y-auto px-1">
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
          placeholder="e.g. Black Friday Sale"
        />
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
          placeholder="Describe the special offer..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#64748B" }}>
            Discount %
          </label>
          <input
            type="number"
            value={form.discount_percentage}
            onChange={(e) => onChange("discount_percentage", parseFloat(e.target.value))}
            className="w-full px-4 py-2.5 border rounded-lg"
            style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
            placeholder="e.g. 30"
            min="0"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#64748B" }}>
            Original Price
          </label>
          <input
            type="number"
            value={form.original_price}
            onChange={(e) => onChange("original_price", parseFloat(e.target.value))}
            className="w-full px-4 py-2.5 border rounded-lg"
            style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
            placeholder="e.g. 99.99"
            step="0.01"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#64748B" }}>
            Discounted Price
          </label>
          <input
            type="number"
            value={form.discounted_price}
            onChange={(e) => onChange("discounted_price", parseFloat(e.target.value))}
            className="w-full px-4 py-2.5 border rounded-lg"
            style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
            placeholder="e.g. 69.99"
            step="0.01"
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#64748B" }}>
            Start Date
          </label>
          <input
            type="datetime-local"
            value={form.start_date}
            onChange={(e) => onChange("start_date", e.target.value)}
            className="w-full px-4 py-2.5 border rounded-lg"
            style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#64748B" }}>
            End Date
          </label>
          <input
            type="datetime-local"
            value={form.end_date}
            onChange={(e) => onChange("end_date", e.target.value)}
            className="w-full px-4 py-2.5 border rounded-lg"
            style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "#64748B" }}>
          Products (Optional)
        </label>
        <select
          multiple
          value={form.product_ids}
          onChange={(e) => {
            const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
            onChange("product_ids", selectedOptions)
          }}
          className="w-full px-4 py-2.5 border rounded-lg"
          style={{ borderColor: "#E2E8F0", color: "#1E293B", minHeight: "120px" }}
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.title}
            </option>
          ))}
        </select>
        <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
          Hold Ctrl/Cmd to select multiple products
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "#64748B" }}>
          Categories (Optional)
        </label>
        <select
          multiple
          value={form.category_ids}
          onChange={(e) => {
            const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
            onChange("category_ids", selectedOptions)
          }}
          className="w-full px-4 py-2.5 border rounded-lg"
          style={{ borderColor: "#E2E8F0", color: "#1E293B", minHeight: "100px" }}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
          Hold Ctrl/Cmd to select multiple categories
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "#64748B" }}>
          Offer Image
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
              alt="Offer preview"
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
          style={{ backgroundColor: "#F59E0B" }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#D97706"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#F59E0B"}
        >
          Save Special Offer
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

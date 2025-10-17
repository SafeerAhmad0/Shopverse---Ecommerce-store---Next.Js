interface CategoryFormProps {
  name: string
  imageUrl?: string
  uploading?: boolean
  onChange: (field: string, value: string) => void
  onFileUpload: (file: File) => Promise<void>
  onSubmit: () => void
  onCancel: () => void
}

export default function CategoryForm({ name, imageUrl, uploading, onChange, onFileUpload, onSubmit, onCancel }: CategoryFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Category Name *</label>
        <input type="text" value={name} onChange={e => onChange("name", e.target.value)}
          className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: "#E2E8F0", color: "#1E293B" }} placeholder="e.g. Electronics, Furniture" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Category Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onFileUpload(file)
          }}
          disabled={uploading}
          className="w-full px-3 py-2 border rounded-lg"
          style={{ borderColor: "#E2E8F0", color: "#1E293B" }}
        />
        {uploading && <p className="text-sm mt-1" style={{ color: "#3B82F6" }}>Uploading...</p>}
        {imageUrl && !uploading && (
          <div className="mt-2">
            <img src={imageUrl} alt="Category preview" className="w-32 h-32 object-cover rounded-lg border-2" style={{ borderColor: "#E2E8F0" }} />
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={onSubmit} className="flex-1 py-2 rounded-lg font-semibold text-white" style={{ backgroundColor: "#3B82F6" }}>Save</button>
        <button onClick={onCancel} className="flex-1 py-2 rounded-lg font-semibold" style={{ backgroundColor: "#E2E8F0", color: "#64748B" }}>Cancel</button>
      </div>
    </div>
  )
}

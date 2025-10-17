interface Product {
  id: string
  title: string
  description_en?: string
  description_ar?: string
  price: number
  stock: number
  category_id?: string
  image_url?: string
  images?: string[]
  tags?: string[]
  specs?: string
  features?: string
  properties?: string
  colors?: string[]
  wood_types?: string[]
}

interface ProductListProps {
  products: Product[]
  categories: { id: string; name: string }[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
}

export default function ProductList({ products, categories, onEdit, onDelete }: ProductListProps) {
  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "Uncategorized"
    const category = categories.find(c => c.id === categoryId)
    return category?.name || "Unknown"
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ backgroundColor: "#F8FAFC" }}>
            <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#64748B" }}>Image</th>
            <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#64748B" }}>Title</th>
            <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#64748B" }}>Category</th>
            <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#64748B" }}>Price</th>
            <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#64748B" }}>Stock</th>
            <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#64748B" }}>Description</th>
            <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#64748B" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} className="border-t" style={{ borderColor: "#E2E8F0" }}>
              <td className="px-4 py-3">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.title}
                    className="w-16 h-16 object-cover rounded border"
                    style={{ borderColor: "#E2E8F0" }}
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect fill='%23f0f0f0' width='64' height='64'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='10'%3ENo Image%3C/text%3E%3C/svg%3E"
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center rounded border" style={{ backgroundColor: "#F1F5F9", borderColor: "#E2E8F0" }}>
                    <svg className="w-8 h-8" style={{ color: "#CBD5E1" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <span className="font-semibold" style={{ color: "#1E293B" }}>{p.title}</span>
              </td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 rounded text-xs font-medium text-white" style={{ backgroundColor: "#60A5FA" }}>
                  {getCategoryName(p.category_id)}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="font-bold" style={{ color: "#3B82F6" }}>${p.price}</span>
              </td>
              <td className="px-4 py-3">
                <span style={{ color: p.stock > 10 ? "#10B981" : p.stock > 0 ? "#F59E0B" : "#EF4444" }}>
                  {p.stock}
                </span>
              </td>
              <td className="px-4 py-3 max-w-xs">
                <span className="text-sm" style={{ color: "#64748B" }}>
                  {p.description_en ? (p.description_en.length > 50 ? p.description_en.substring(0, 50) + "..." : p.description_en) : "No description"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(p)}
                    className="px-3 py-1 rounded text-sm font-medium"
                    style={{ backgroundColor: "#DBEAFE", color: "#3B82F6" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="px-3 py-1 rounded text-sm font-medium"
                    style={{ backgroundColor: "#FEE2E2", color: "#EF4444" }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {products.length === 0 && (
        <div className="text-center py-8" style={{ color: "#64748B" }}>
          No products found
        </div>
      )}
    </div>
  )
}

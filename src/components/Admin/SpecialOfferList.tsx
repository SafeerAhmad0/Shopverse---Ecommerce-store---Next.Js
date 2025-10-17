"use client"

interface SpecialOffer {
  id: string
  title: string
  description?: string
  discount_percentage?: number
  original_price?: number
  discounted_price?: number
  start_date?: string
  end_date?: string
  is_active: boolean
  image_url?: string
  product_ids?: string[]
  category_ids?: string[]
}

interface SpecialOfferListProps {
  specialOffers: SpecialOffer[]
  products: Array<{ id: string; title: string }>
  categories: Array<{ id: string; name: string }>
  onEdit: (offer: SpecialOffer) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, currentStatus: boolean) => void
}

export default function SpecialOfferList({
  specialOffers,
  products,
  categories,
  onEdit,
  onDelete,
  onToggleActive
}: SpecialOfferListProps) {
  if (specialOffers.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: "#64748B" }}>
        <svg
          className="mx-auto mb-4"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
        <p className="font-medium">No special offers yet</p>
        <p className="text-sm mt-1">Create your first special offer to get started</p>
      </div>
    )
  }

  const getProductNames = (productIds?: string[]) => {
    if (!productIds || productIds.length === 0) return "All Products"
    const names = productIds.map(id => {
      const product = products.find(p => p.id === id)
      return product?.title || "Unknown"
    })
    return names.slice(0, 2).join(", ") + (names.length > 2 ? ` +${names.length - 2} more` : "")
  }

  const getCategoryNames = (categoryIds?: string[]) => {
    if (!categoryIds || categoryIds.length === 0) return "All Categories"
    const names = categoryIds.map(id => {
      const category = categories.find(c => c.id === id)
      return category?.name || "Unknown"
    })
    return names.slice(0, 2).join(", ") + (names.length > 2 ? ` +${names.length - 2} more` : "")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {specialOffers.map((offer) => (
        <div
          key={offer.id}
          className="bg-white border-2 rounded-xl overflow-hidden transition-all"
          style={{ borderColor: offer.is_active ? "#F59E0B" : "#E2E8F0" }}
        >
          {/* Image */}
          {offer.image_url && (
            <div className="relative h-48 bg-gray-100">
              <img
                src={offer.image_url}
                alt={offer.title}
                className="w-full h-full object-cover"
              />
              {offer.is_active && (
                <div
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: "#F59E0B" }}
                >
                  Active
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            <h3 className="text-lg font-bold mb-2" style={{ color: "#1E293B" }}>
              {offer.title}
            </h3>

            {offer.description && (
              <p className="text-sm mb-3" style={{ color: "#64748B" }}>
                {offer.description}
              </p>
            )}

            {/* Pricing Info */}
            {(offer.discount_percentage || offer.original_price || offer.discounted_price) && (
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {offer.discount_percentage && (
                  <span
                    className="inline-block text-sm font-bold px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: "#F59E0B", color: "#FFFFFF" }}
                  >
                    {offer.discount_percentage}% OFF
                  </span>
                )}
                {offer.original_price && (
                  <span className="text-sm line-through" style={{ color: "#94A3B8" }}>
                    ${offer.original_price.toFixed(2)}
                  </span>
                )}
                {offer.discounted_price && (
                  <span className="text-lg font-bold" style={{ color: "#F59E0B" }}>
                    ${offer.discounted_price.toFixed(2)}
                  </span>
                )}
              </div>
            )}

            {/* Products & Categories */}
            <div className="mb-4 space-y-1">
              <p className="text-xs" style={{ color: "#64748B" }}>
                <span className="font-semibold">Products:</span> {getProductNames(offer.product_ids)}
              </p>
              <p className="text-xs" style={{ color: "#64748B" }}>
                <span className="font-semibold">Categories:</span> {getCategoryNames(offer.category_ids)}
              </p>
            </div>

            {/* Date Range */}
            {(offer.start_date || offer.end_date) && (
              <div className="mb-4">
                {offer.start_date && (
                  <p className="text-xs" style={{ color: "#64748B" }}>
                    <span className="font-semibold">Starts:</span> {new Date(offer.start_date).toLocaleString()}
                  </p>
                )}
                {offer.end_date && (
                  <p className="text-xs" style={{ color: "#64748B" }}>
                    <span className="font-semibold">Ends:</span> {new Date(offer.end_date).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onToggleActive(offer.id, offer.is_active)}
                className="flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                style={{
                  backgroundColor: offer.is_active ? "#FEE2E2" : "#FEF3C7",
                  color: offer.is_active ? "#EF4444" : "#F59E0B"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.8"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1"
                }}
              >
                {offer.is_active ? "Deactivate" : "Activate"}
              </button>

              <button
                onClick={() => onEdit(offer)}
                className="flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                style={{ backgroundColor: "#FEF3C7", color: "#F59E0B" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#FDE68A"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FEF3C7"
                }}
              >
                Edit
              </button>

              <button
                onClick={() => onDelete(offer.id)}
                className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                style={{ backgroundColor: "#FEE2E2", color: "#EF4444" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#FEE2E2"
                  e.currentTarget.style.opacity = "0.8"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1"
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

"use client"

interface Banner {
  id: string
  title: string
  subtitle?: string
  discount_text?: string
  countdown_end?: string
  is_active: boolean
  image_url?: string
}

interface BannerListProps {
  banners: Banner[]
  onEdit: (banner: Banner) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, currentStatus: boolean) => void
}

export default function BannerList({ banners, onEdit, onDelete, onToggleActive }: BannerListProps) {
  if (banners.length === 0) {
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
          <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2" />
          <line x1="8" y1="21" x2="16" y2="21" strokeWidth="2" />
          <line x1="12" y1="17" x2="12" y2="21" strokeWidth="2" />
        </svg>
        <p className="font-medium">No promotional banners yet</p>
        <p className="text-sm mt-1">Create your first banner to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {banners.map((banner) => (
        <div
          key={banner.id}
          className="bg-white border-2 rounded-xl overflow-hidden transition-all"
          style={{ borderColor: banner.is_active ? "#10B981" : "#E2E8F0" }}
        >
          {/* Image */}
          {banner.image_url && (
            <div className="relative h-48 bg-gray-100">
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              {banner.is_active && (
                <div
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: "#10B981" }}
                >
                  Active
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {banner.subtitle && (
              <p className="text-xs font-semibold mb-2" style={{ color: "#3B82F6" }}>
                {banner.subtitle}
              </p>
            )}

            <h3 className="text-lg font-bold mb-2" style={{ color: "#1E293B" }}>
              {banner.title}
            </h3>

            {banner.discount_text && (
              <div className="mb-3">
                <span
                  className="inline-block text-sm font-bold px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: "#3B82F6", color: "#FFFFFF" }}
                >
                  {banner.discount_text}
                </span>
              </div>
            )}

            {banner.countdown_end && (
              <p className="text-sm mb-4" style={{ color: "#64748B" }}>
                Ends: {new Date(banner.countdown_end).toLocaleString()}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onToggleActive(banner.id, banner.is_active)}
                className="flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                style={{
                  backgroundColor: banner.is_active ? "#FEE2E2" : "#DCFCE7",
                  color: banner.is_active ? "#EF4444" : "#10B981"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.8"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1"
                }}
              >
                {banner.is_active ? "Deactivate" : "Activate"}
              </button>

              <button
                onClick={() => onEdit(banner)}
                className="flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                style={{ backgroundColor: "#DBEAFE", color: "#3B82F6" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#BFDBFE"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#DBEAFE"
                }}
              >
                Edit
              </button>

              <button
                onClick={() => onDelete(banner.id)}
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

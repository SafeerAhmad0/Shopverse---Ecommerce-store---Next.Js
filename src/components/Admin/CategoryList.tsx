"use client"

import { useState } from "react"

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

interface Category {
  id: string
  name: string
}

interface CategoryListProps {
  categories: Category[]
  products: Product[]
  onEditCategory: (category: Category) => void
  onDeleteCategory: (id: string) => void
  onAddProduct: (categoryId: string) => void
  onEditProduct: (product: Product) => void
  onDeleteProduct: (id: string) => void
}

export default function CategoryList({
  categories,
  products,
  onEditCategory,
  onDeleteCategory,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}: CategoryListProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const getProductsForCategory = (categoryId: string) => {
    return products.filter(p => p.category_id === categoryId)
  }

  const uncategorizedProducts = products.filter(p => !p.category_id)

  return (
    <div className="space-y-4">
      {categories.map(category => {
        const categoryProducts = getProductsForCategory(category.id)
        const isExpanded = expandedCategories.has(category.id)

        return (
          <div key={category.id} className="border-2 rounded-lg" style={{ borderColor: "#E2E8F0" }}>
            {/* Category Header */}
            <div className="p-4" style={{ backgroundColor: "#F8FAFC" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="p-1 rounded hover:bg-white transition-colors"
                    style={{ color: "#3B82F6" }}
                  >
                    <svg
                      className="w-5 h-5 transition-transform"
                      style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <h3 className="font-bold text-lg" style={{ color: "#1E293B" }}>
                    {category.name}
                  </h3>
                  <span className="px-2 py-1 rounded text-xs font-medium text-white" style={{ backgroundColor: "#60A5FA" }}>
                    {categoryProducts.length} {categoryProducts.length === 1 ? "product" : "products"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onAddProduct(category.id)}
                    className="px-3 py-1 rounded text-sm font-medium"
                    style={{ backgroundColor: "#DBEAFE", color: "#3B82F6" }}
                  >
                    + Add Product
                  </button>
                  <button
                    onClick={() => onEditCategory(category)}
                    className="px-3 py-1 rounded text-sm font-medium"
                    style={{ backgroundColor: "#DBEAFE", color: "#3B82F6" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteCategory(category.id)}
                    className="px-3 py-1 rounded text-sm font-medium"
                    style={{ backgroundColor: "#FEE2E2", color: "#EF4444" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Products List (Expandable) */}
            {isExpanded && (
              <div className="p-4 border-t" style={{ borderColor: "#E2E8F0" }}>
                {categoryProducts.length === 0 ? (
                  <p className="text-center py-4" style={{ color: "#64748B" }}>
                    No products in this category yet
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ backgroundColor: "#F8FAFC" }}>
                          <th className="px-3 py-2 text-left text-xs font-semibold" style={{ color: "#64748B" }}>Image</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold" style={{ color: "#64748B" }}>Title</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold" style={{ color: "#64748B" }}>Price</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold" style={{ color: "#64748B" }}>Stock</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold" style={{ color: "#64748B" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryProducts.map(p => (
                          <tr key={p.id} className="border-t" style={{ borderColor: "#E2E8F0" }}>
                            <td className="px-3 py-2">
                              {p.image_url ? (
                                <img
                                  src={p.image_url}
                                  alt={p.title}
                                  className="w-12 h-12 object-cover rounded border"
                                  style={{ borderColor: "#E2E8F0" }}
                                  onError={(e) => {
                                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect fill='%23f0f0f0' width='48' height='48'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='8'%3ENo Image%3C/text%3E%3C/svg%3E"
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-12 flex items-center justify-center rounded border" style={{ backgroundColor: "#F1F5F9", borderColor: "#E2E8F0" }}>
                                  <svg className="w-6 h-6" style={{ color: "#CBD5E1" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <span className="font-medium text-sm" style={{ color: "#1E293B" }}>{p.title}</span>
                            </td>
                            <td className="px-3 py-2">
                              <span className="font-bold text-sm" style={{ color: "#3B82F6" }}>${p.price}</span>
                            </td>
                            <td className="px-3 py-2">
                              <span className="text-sm" style={{ color: p.stock > 10 ? "#10B981" : p.stock > 0 ? "#F59E0B" : "#EF4444" }}>
                                {p.stock}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => onEditProduct(p)}
                                  className="px-2 py-1 rounded text-xs font-medium"
                                  style={{ backgroundColor: "#DBEAFE", color: "#3B82F6" }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => onDeleteProduct(p.id)}
                                  className="px-2 py-1 rounded text-xs font-medium"
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
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Uncategorized Products */}
      {uncategorizedProducts.length > 0 && (
        <div className="border-2 rounded-lg" style={{ borderColor: "#F59E0B" }}>
          <div className="p-4" style={{ backgroundColor: "#FEF3C7" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleCategory("uncategorized")}
                  className="p-1 rounded transition-colors"
                  style={{ color: "#F59E0B" }}
                >
                  <svg
                    className="w-5 h-5 transition-transform"
                    style={{ transform: expandedCategories.has("uncategorized") ? "rotate(90deg)" : "rotate(0deg)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <h3 className="font-bold text-lg" style={{ color: "#92400E" }}>
                  Uncategorized
                </h3>
                <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: "#F59E0B", color: "white" }}>
                  {uncategorizedProducts.length} {uncategorizedProducts.length === 1 ? "product" : "products"}
                </span>
              </div>
            </div>
          </div>

          {expandedCategories.has("uncategorized") && (
            <div className="p-4 border-t" style={{ borderColor: "#F59E0B" }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: "#F8FAFC" }}>
                      <th className="px-3 py-2 text-left text-xs font-semibold" style={{ color: "#64748B" }}>Image</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold" style={{ color: "#64748B" }}>Title</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold" style={{ color: "#64748B" }}>Price</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold" style={{ color: "#64748B" }}>Stock</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold" style={{ color: "#64748B" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uncategorizedProducts.map(p => (
                      <tr key={p.id} className="border-t" style={{ borderColor: "#E2E8F0" }}>
                        <td className="px-3 py-2">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.title}
                              className="w-12 h-12 object-cover rounded border"
                              style={{ borderColor: "#E2E8F0" }}
                              onError={(e) => {
                                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect fill='%23f0f0f0' width='48' height='48'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='8'%3ENo Image%3C/text%3E%3C/svg%3E"
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center rounded border" style={{ backgroundColor: "#F1F5F9", borderColor: "#E2E8F0" }}>
                              <svg className="w-6 h-6" style={{ color: "#CBD5E1" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <span className="font-medium text-sm" style={{ color: "#1E293B" }}>{p.title}</span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="font-bold text-sm" style={{ color: "#3B82F6" }}>${p.price}</span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-sm" style={{ color: p.stock > 10 ? "#10B981" : p.stock > 0 ? "#F59E0B" : "#EF4444" }}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            <button
                              onClick={() => onEditProduct(p)}
                              className="px-2 py-1 rounded text-xs font-medium"
                              style={{ backgroundColor: "#DBEAFE", color: "#3B82F6" }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDeleteProduct(p.id)}
                              className="px-2 py-1 rounded text-xs font-medium"
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
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

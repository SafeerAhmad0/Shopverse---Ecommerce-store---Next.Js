"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import toast from "react-hot-toast"

interface Review {
  id: string
  user_id: string
  product_id: string
  rating: number
  comment: string
  created_at: string
  is_hidden: boolean
  users: {
    name: string
    email: string
  }
  products: {
    title: string
    category_id: string
  }
  categories?: {
    name: string
  }
}

export default function ReviewManagement() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    fetchCategories()
    fetchReviews()
  }, [filter, categoryFilter])

  const fetchCategories = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("categories").select("id, name").order("name")
    setCategories(data || [])
  }

  const fetchReviews = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      let query = supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false })

      if (filter === "visible") {
        query = query.eq("is_hidden", false)
      } else if (filter === "hidden") {
        query = query.eq("is_hidden", true)
      }

      const { data, error } = await query

      if (error) throw error

      // Fetch related data (users, products, categories) separately
      if (data) {
        const reviewsWithDetails = await Promise.all(
          data.map(async (review) => {
            // Fetch user data
            const { data: user } = await supabase
              .from("users")
              .select("name, email")
              .eq("id", review.user_id)
              .single()

            // Fetch product data
            const { data: product } = await supabase
              .from("products")
              .select("title, category_id")
              .eq("id", review.product_id)
              .single()

            // Fetch category data if product has category_id
            let category = null
            if (product?.category_id) {
              const { data: cat } = await supabase
                .from("categories")
                .select("name")
                .eq("id", product.category_id)
                .single()
              category = cat
            }

            return {
              ...review,
              users: user || { name: "Unknown", email: "N/A" },
              products: product || { title: "Unknown Product", category_id: null },
              categories: category
            }
          })
        )

        // Apply category filter
        let filtered = reviewsWithDetails
        if (categoryFilter !== "all") {
          filtered = reviewsWithDetails.filter(
            (review) => review.products?.category_id === categoryFilter
          )
        }

        setReviews(filtered)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
      toast.error("Failed to fetch reviews")
    } finally {
      setLoading(false)
    }
  }

  const toggleVisibility = async (reviewId: string, currentStatus: boolean) => {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("reviews")
        .update({ is_hidden: !currentStatus })
        .eq("id", reviewId)

      if (error) throw error

      toast.success(!currentStatus ? "Review hidden" : "Review visible")
      fetchReviews()
    } catch (error) {
      console.error("Error updating review:", error)
      toast.error("Failed to update review")
    }
  }

  const deleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return

    const supabase = createClient()

    try {
      const { error } = await supabase.from("reviews").delete().eq("id", reviewId)

      if (error) throw error

      toast.success("Review deleted")
      fetchReviews()
    } catch (error) {
      console.error("Error deleting review:", error)
      toast.error("Failed to delete review")
    }
  }

  const hideAllCategoryReviews = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to hide ALL reviews for category "${categoryName}"?`)) return

    const supabase = createClient()

    try {
      // Get all products in this category
      const { data: products } = await supabase
        .from("products")
        .select("id")
        .eq("category_id", categoryId)

      if (!products || products.length === 0) {
        toast.error("No products found in this category")
        return
      }

      const productIds = products.map(p => p.id)

      // Hide all reviews for products in this category
      const { error } = await supabase
        .from("reviews")
        .update({ is_hidden: true })
        .in("product_id", productIds)

      if (error) throw error

      toast.success(`All reviews for ${categoryName} have been hidden`)
      fetchReviews()
    } catch (error) {
      console.error("Error hiding category reviews:", error)
      toast.error("Failed to hide category reviews")
    }
  }

  const showAllCategoryReviews = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to show ALL reviews for category "${categoryName}"?`)) return

    const supabase = createClient()

    try {
      // Get all products in this category
      const { data: products } = await supabase
        .from("products")
        .select("id")
        .eq("category_id", categoryId)

      if (!products || products.length === 0) {
        toast.error("No products found in this category")
        return
      }

      const productIds = products.map(p => p.id)

      // Show all reviews for products in this category
      const { error } = await supabase
        .from("reviews")
        .update({ is_hidden: false })
        .in("product_id", productIds)

      if (error) throw error

      toast.success(`All reviews for ${categoryName} are now visible`)
      fetchReviews()
    } catch (error) {
      console.error("Error showing category reviews:", error)
      toast.error("Failed to show category reviews")
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className="w-4 h-4"
            fill={star <= rating ? "#FBBF24" : "none"}
            stroke={star <= rating ? "#FBBF24" : "#D1D5DB"}
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-pulse" style={{ color: "#64748B" }}>
          Loading reviews...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border-2 p-8" style={{ borderColor: "#E5E7EB" }}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2" style={{ color: "#0F172A" }}>
          Review Management
        </h2>
        <p className="text-sm" style={{ color: "#64748B" }}>
          Manage customer reviews and control visibility
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#64748B" }}>
            Status
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border rounded-lg"
            style={{ borderColor: "#E5E7EB", color: "#0F172A" }}
          >
            <option value="all">All Reviews</option>
            <option value="visible">Visible Only</option>
            <option value="hidden">Hidden Only</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#64748B" }}>
            Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
            style={{ borderColor: "#E5E7EB", color: "#0F172A" }}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Bulk Category Actions */}
        {categoryFilter !== "all" && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                const category = categories.find(c => c.id === categoryFilter)
                if (category) hideAllCategoryReviews(categoryFilter, category.name)
              }}
              className="px-4 py-2 rounded-lg font-medium text-white transition-colors"
              style={{ backgroundColor: "#EF4444" }}
            >
              Hide All in Category
            </button>
            <button
              onClick={() => {
                const category = categories.find(c => c.id === categoryFilter)
                if (category) showAllCategoryReviews(categoryFilter, category.name)
              }}
              className="px-4 py-2 rounded-lg font-medium text-white transition-colors"
              style={{ backgroundColor: "#10B981" }}
            >
              Show All in Category
            </button>
          </div>
        )}
      </div>

      {/* Reviews Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "#F8FAFC" }}>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#64748B" }}>
                User
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#64748B" }}>
                Product
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#64748B" }}>
                Category
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#64748B" }}>
                Rating
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#64748B" }}>
                Comment
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#64748B" }}>
                Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#64748B" }}>
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#64748B" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id} className="border-t" style={{ borderColor: "#E2E8F0" }}>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-sm" style={{ color: "#1E293B" }}>
                      {review.users?.name}
                    </p>
                    <p className="text-xs" style={{ color: "#64748B" }}>
                      {review.users?.email}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm" style={{ color: "#1E293B" }}>
                    {review.products?.title}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: "#60A5FA" }}
                  >
                    {review.categories?.name || "Uncategorized"}
                  </span>
                </td>
                <td className="px-4 py-3">{renderStars(review.rating)}</td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="text-sm truncate" style={{ color: "#64748B" }}>
                    {review.comment}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs" style={{ color: "#64748B" }}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium text-white"
                    style={{
                      backgroundColor: review.is_hidden ? "#EF4444" : "#10B981",
                    }}
                  >
                    {review.is_hidden ? "Hidden" : "Visible"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleVisibility(review.id, review.is_hidden)}
                      className="px-3 py-1 rounded text-sm font-medium"
                      style={{
                        backgroundColor: review.is_hidden ? "#DBEAFE" : "#FEE2E2",
                        color: review.is_hidden ? "#3B82F6" : "#EF4444",
                      }}
                    >
                      {review.is_hidden ? "Show" : "Hide"}
                    </button>
                    <button
                      onClick={() => deleteReview(review.id)}
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

        {reviews.length === 0 && (
          <div className="text-center py-12" style={{ color: "#64748B" }}>
            <p>No reviews found</p>
          </div>
        )}
      </div>
    </div>
  )
}

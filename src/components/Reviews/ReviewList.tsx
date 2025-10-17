"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"

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
}

interface ReviewListProps {
  productId?: string
  limit?: number
  showAll?: boolean
}

export default function ReviewList({ productId, limit, showAll = false }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const fetchReviews = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      let query = supabase
        .from("reviews")
        .select("*")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })

      if (productId) {
        query = query.eq("product_id", productId)
      }

      if (limit && !showAll) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) throw error

      // Fetch user data separately for each review
      if (data) {
        const reviewsWithUsers = await Promise.all(
          data.map(async (review) => {
            const { data: user } = await supabase
              .from("users")
              .select("name, email")
              .eq("id", review.user_id)
              .single()

            return {
              ...review,
              users: user || { name: "Anonymous", email: "" }
            }
          })
        )

        setReviews(reviewsWithUsers)

        // Calculate average rating
        if (reviewsWithUsers.length > 0) {
          const avg = reviewsWithUsers.reduce((sum, review) => sum + review.rating, 0) / reviewsWithUsers.length
          setAverageRating(Math.round(avg * 10) / 10)
        }
      } else {
        setReviews([])
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className="w-5 h-5"
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
      <div className="py-8 text-center" style={{ color: "#64748B" }}>
        <div className="animate-pulse">Loading reviews...</div>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="py-8 text-center" style={{ color: "#64748B" }}>
        <p>No reviews yet. Be the first to review!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Average Rating Summary */}
      {reviews.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-6 border-2" style={{ borderColor: "#E5E7EB" }}>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold" style={{ color: "#573621" }}>
                {averageRating}
              </div>
              <div className="text-sm" style={{ color: "#64748B" }}>
                out of 5
              </div>
            </div>
            <div>
              {renderStars(Math.round(averageRating))}
              <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-xl border-2 p-6"
            style={{ borderColor: "#E5E7EB" }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: "#573621" }}
                >
                  {review.users?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <h4 className="font-semibold" style={{ color: "#0F172A" }}>
                    {review.users?.name || "Anonymous"}
                  </h4>
                  <p className="text-xs" style={{ color: "#64748B" }}>
                    {new Date(review.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              {renderStars(review.rating)}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

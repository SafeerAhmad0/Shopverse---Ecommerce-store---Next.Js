"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import toast from "react-hot-toast"

interface ReviewFormProps {
  productId: string
  userId: string
  onReviewSubmitted: () => void
}

export default function ReviewForm({ productId, userId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    if (!comment.trim()) {
      toast.error("Please write a review")
      return
    }

    setSubmitting(true)
    const supabase = createClient()

    try {
      // Check if user already reviewed this product
      const { data: existing } = await supabase
        .from("reviews")
        .select("id")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .single()

      if (existing) {
        // Update existing review
        const { error } = await supabase
          .from("reviews")
          .update({ rating, comment, updated_at: new Date().toISOString() })
          .eq("id", existing.id)

        if (error) throw error
        toast.success("Review updated successfully!")
      } else {
        // Create new review
        const { error } = await supabase
          .from("reviews")
          .insert({
            user_id: userId,
            product_id: productId,
            rating,
            comment,
            is_hidden: false
          })

        if (error) throw error
        toast.success("Review submitted successfully!")
      }

      setRating(0)
      setComment("")
      onReviewSubmitted()
    } catch (error: any) {
      console.error("Error submitting review:", error)
      toast.error(error.message || "Failed to submit review")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border-2 p-6 mb-6" style={{ borderColor: "#E5E7EB" }}>
      <h3 className="text-xl font-bold mb-4" style={{ color: "#0F172A" }}>
        Write a Review
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Star Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: "#64748B" }}>
            Your Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <svg
                  className="w-8 h-8"
                  fill={(hoveredRating || rating) >= star ? "#FBBF24" : "none"}
                  stroke={(hoveredRating || rating) >= star ? "#FBBF24" : "#D1D5DB"}
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm mt-2" style={{ color: "#64748B" }}>
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: "#64748B" }}>
            Your Review
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
            style={{ borderColor: "#E5E7EB", color: "#0F172A" }}
            placeholder="Share your experience with this product..."
            disabled={submitting}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="px-6 py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#573621" }}
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  )
}

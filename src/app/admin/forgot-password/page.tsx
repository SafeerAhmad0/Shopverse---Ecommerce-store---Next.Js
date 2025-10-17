"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import toast from "react-hot-toast"
import Link from "next/link"

export default function ForgotPassword() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      })

      if (error) throw error

      setEmailSent(true)
      toast.success("Password reset email sent! Check your inbox.")
    } catch (error: any) {
      console.error("Reset password error:", error)
      toast.error(error.message || "Failed to send reset email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0F172A" }}>
      <div className="w-full max-w-md px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-2" style={{ borderColor: "#3B82F6" }}>
          {emailSent ? (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center p-4 rounded-xl mb-4" style={{ backgroundColor: "#DCFCE7" }}>
                  <svg className="w-10 h-10" style={{ color: "#16A34A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold mb-3" style={{ color: "#1E293B" }}>Check Your Email</h1>
                <p className="text-sm mb-6" style={{ color: "#64748B" }}>
                  We&apos;ve sent a password reset link to <strong>{email}</strong>
                </p>
                <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: "#EFF6FF", borderLeft: "4px solid #3B82F6" }}>
                  <p className="text-xs text-left" style={{ color: "#1E40AF" }}>
                    <strong>Next steps:</strong><br/>
                    1. Check your email inbox<br/>
                    2. Click the reset link (valid for 1 hour)<br/>
                    3. Create a new password<br/>
                    4. Sign in with your new password
                  </p>
                </div>
                <Link href="/admin/login">
                  <button className="w-full py-3 rounded-lg font-semibold text-white transition-all" style={{ backgroundColor: "#3B82F6" }}>
                    Back to Sign In
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Request Form */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-4 rounded-xl mb-4" style={{ backgroundColor: "#3B82F6" }}>
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: "#1E293B" }}>Forgot Password?</h1>
                <p className="text-base" style={{ color: "#64748B" }}>
                  Enter your email and we&apos;ll send you a reset link
                </p>
              </div>

              <form onSubmit={handleResetRequest} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: "#334155" }}>
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all"
                    style={{
                      backgroundColor: "#F8FAFC",
                      borderColor: "#CBD5E1",
                      color: "#0F172A"
                    }}
                    placeholder="admin@example.com"
                    disabled={loading}
                    onFocus={(e) => e.target.style.borderColor = "#3B82F6"}
                    onBlur={(e) => e.target.style.borderColor = "#CBD5E1"}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg font-bold text-white transition-all text-base"
                  style={{
                    backgroundColor: loading ? "#93C5FD" : "#3B82F6",
                    cursor: loading ? "not-allowed" : "pointer"
                  }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#2563EB")}
                  onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = "#3B82F6")}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/admin/login">
                  <button className="text-sm font-semibold transition-all" style={{ color: "#3B82F6" }}>
                    ← Back to Sign In
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "#94A3B8" }}>
          © {new Date().getFullYear()} Shopverse Ecommerce. All rights reserved.
        </p>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import toast from "react-hot-toast"
import { validatePassword, getPasswordStrength } from "@/lib/utils/password-validation"

export default function ResetPassword() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [validSession, setValidSession] = useState(false)

  const checkSession = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setValidSession(true)
      } else {
        toast.error("Invalid or expired reset link")
        setTimeout(() => router.push("/admin/forgot-password"), 2000)
      }
    } catch (error) {
      console.error("Session check error:", error)
      router.push("/admin/forgot-password")
    }
  }, [supabase.auth, router])

  useEffect(() => {
    // Check if user came from a valid reset link
    checkSession()
  }, [checkSession])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate password strength
      const validation = validatePassword(password)
      if (!validation.isValid) {
        toast.error("Password does not meet security requirements")
        setLoading(false)
        return
      }

      // Check if passwords match
      if (password !== confirmPassword) {
        toast.error("Passwords do not match")
        setLoading(false)
        return
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      toast.success("Password updated successfully!")

      // Sign out and redirect to login
      await supabase.auth.signOut()
      setTimeout(() => {
        router.push("/admin/login")
      }, 1500)
    } catch (error: any) {
      console.error("Reset password error:", error)
      toast.error(error.message || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  if (!validSession) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0F172A" }}>
        <div className="w-12 h-12 border-4 border-t-4 rounded-full animate-spin" style={{ borderColor: "#E0E7FF", borderTopColor: "#3B82F6" }}></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0F172A" }}>
      <div className="w-full max-w-md px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-2" style={{ borderColor: "#3B82F6" }}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 rounded-xl mb-4" style={{ backgroundColor: "#3B82F6" }}>
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: "#1E293B" }}>Reset Password</h1>
            <p className="text-base" style={{ color: "#64748B" }}>
              Create a strong, secure password
            </p>
          </div>

          {/* Reset Form */}
          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: "#334155" }}>
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none transition-all"
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderColor: "#CBD5E1",
                    color: "#0F172A"
                  }}
                  placeholder="••••••••••••"
                  disabled={loading}
                  onFocus={(e) => e.target.style.borderColor = "#3B82F6"}
                  onBlur={(e) => e.target.style.borderColor = "#CBD5E1"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${passwordStrength}%`,
                          backgroundColor:
                            passwordStrength >= 80 ? "#10B981" :
                            passwordStrength >= 50 ? "#F59E0B" :
                            "#EF4444"
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium" style={{
                      color:
                        passwordStrength >= 80 ? "#10B981" :
                        passwordStrength >= 50 ? "#F59E0B" :
                        "#EF4444"
                    }}>
                      {passwordStrength >= 80 ? "Strong" : passwordStrength >= 50 ? "Medium" : "Weak"}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "#64748B" }}>
                    Password must be 12+ characters with uppercase, lowercase, number & special character
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-2" style={{ color: "#334155" }}>
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none transition-all"
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderColor: "#CBD5E1",
                    color: "#0F172A"
                  }}
                  placeholder="••••••••••••"
                  disabled={loading}
                  onFocus={(e) => e.target.style.borderColor = "#3B82F6"}
                  onBlur={(e) => e.target.style.borderColor = "#CBD5E1"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs mt-2" style={{ color: "#EF4444" }}>
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword || password !== confirmPassword}
              className="w-full py-3 rounded-lg font-bold text-white transition-all text-base"
              style={{
                backgroundColor: loading || !password || !confirmPassword || password !== confirmPassword ? "#93C5FD" : "#3B82F6",
                cursor: loading || !password || !confirmPassword || password !== confirmPassword ? "not-allowed" : "pointer"
              }}
              onMouseEnter={(e) => {
                if (!loading && password && confirmPassword && password === confirmPassword) {
                  e.currentTarget.style.backgroundColor = "#2563EB"
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && password && confirmPassword && password === confirmPassword) {
                  e.currentTarget.style.backgroundColor = "#3B82F6"
                }
              }}
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "#94A3B8" }}>
          © {new Date().getFullYear()} Shopverse Ecommerce. All rights reserved.
        </p>
      </div>
    </div>
  )
}

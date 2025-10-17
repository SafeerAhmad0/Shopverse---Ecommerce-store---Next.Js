"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import toast from "react-hot-toast"
import Link from "next/link"
import TwoFactorVerify from "@/components/Admin/TwoFactorVerify"

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [userRole, setUserRole] = useState<"admin" | "super_admin" | null>(null)
  const supabase = createClient()

  const handleSuccessfulLogin = (role: "admin" | "super_admin") => {
    if (role === "super_admin") {
      toast.success("Welcome, Super Admin!")
      router.push("/admin/super-admin")
    } else {
      toast.success("Welcome, Admin!")
      router.push("/admin/dashboard")
    }
  }

  const handle2FAVerified = () => {
    if (userRole) {
      handleSuccessfulLogin(userRole)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        toast.error(authError.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        toast.error("Login failed")
        setLoading(false)
        return
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role, account_status")
        .eq("id", authData.user.id)
        .single()

      if (userError) {
        toast.error("Failed to verify user role")
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      if (userData.account_status !== "active") {
        toast.error("Your account is not active. Please contact support.")
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      if (userData.role !== "admin" && userData.role !== "super_admin") {
        toast.error("Access denied. Admin privileges required.")
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      // Check if user has 2FA enabled
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

      if (aal?.nextLevel === "aal2" && aal?.currentLevel === "aal1") {
        // User has 2FA enabled, show verification screen
        setUserRole(userData.role)
        setShow2FA(true)
        setLoading(false)
      } else {
        // No 2FA or already verified, proceed to dashboard
        handleSuccessfulLogin(userData.role)
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0F172A" }}>
      <div className="w-full max-w-md px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-2" style={{ borderColor: "#3B82F6" }}>
          {show2FA ? (
            <TwoFactorVerify
              onVerified={handle2FAVerified}
              onCancel={async () => {
                await supabase.auth.signOut()
                setShow2FA(false)
                setUserRole(null)
              }}
            />
          ) : (
            <>
              {/* Logo/Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-4 rounded-xl mb-4" style={{ backgroundColor: "#3B82F6" }}>
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: "#1E293B" }}>Admin Portal</h1>
                <p className="text-base" style={{ color: "#64748B" }}>Sign in to access the dashboard</p>
              </div>

              {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-6">
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

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-semibold" style={{ color: "#334155" }}>
                  Password
                </label>
                <Link href="/admin/forgot-password">
                  <span className="text-xs font-semibold transition-all cursor-pointer hover:underline" style={{ color: "#3B82F6" }}>
                    Forgot Password?
                  </span>
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all"
                style={{
                  backgroundColor: "#F8FAFC",
                  borderColor: "#CBD5E1",
                  color: "#0F172A"
                }}
                placeholder="••••••••"
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
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

              <div className="mt-6 text-center text-sm" style={{ color: "#94A3B8" }}>
                <p>Secure admin access only</p>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "#94A3B8" }}>
          © {new Date().getFullYear()} Pallets Ecommerce. All rights reserved.
        </p>
      </div>
    </div>
  )
}

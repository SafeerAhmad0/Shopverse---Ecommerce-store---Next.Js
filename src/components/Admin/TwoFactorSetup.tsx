"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import toast from "react-hot-toast"

interface TwoFactorSetupProps {
  onEnrolled: () => void
  onCancelled: () => void
}

export default function TwoFactorSetup({ onEnrolled, onCancelled }: TwoFactorSetupProps) {
  const supabase = createClient()
  const [factorId, setFactorId] = useState("")
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [verifyCode, setVerifyCode] = useState("")
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    enrollFactor()
  }, [])

  const enrollFactor = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator App",
      })

      if (error) throw error

      setFactorId(data.id)
      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
      setLoading(false)
    } catch (err: any) {
      toast.error("Failed to initialize 2FA: " + err.message)
      setError(err.message)
      setLoading(false)
    }
  }

  const handleVerifyAndEnable = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      setError("Please enter a valid 6-digit code")
      return
    }

    setVerifying(true)
    setError("")

    try {
      // Create a challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      })

      if (challengeError) throw challengeError

      // Verify the code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode,
      })

      if (verifyError) throw verifyError

      toast.success("2FA enabled successfully!")
      onEnrolled()
    } catch (err: any) {
      setError(err.message || "Invalid verification code")
      toast.error("Verification failed: " + (err.message || "Invalid code"))
    } finally {
      setVerifying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-t-4 rounded-full animate-spin" style={{ borderColor: "#E0E7FF", borderTopColor: "#3B82F6" }}></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2" style={{ color: "#1E293B" }}>
          Set Up Two-Factor Authentication
        </h3>
        <p className="text-sm" style={{ color: "#64748B" }}>
          Scan the QR code with your authenticator app
        </p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center p-4 bg-white border-2 rounded-lg" style={{ borderColor: "#E2E8F0" }}>
        {qrCode ? (
          <img src={qrCode} alt="QR Code" className="w-48 h-48" />
        ) : (
          <div className="w-48 h-48 flex items-center justify-center" style={{ backgroundColor: "#F8FAFC" }}>
            <p style={{ color: "#94A3B8" }}>QR Code unavailable</p>
          </div>
        )}
      </div>

      {/* Secret Key */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: "#64748B" }}>
          Or enter this key manually:
        </p>
        <div className="p-3 rounded-lg border font-mono text-sm break-all" style={{ backgroundColor: "#F8FAFC", borderColor: "#E2E8F0", color: "#1E293B" }}>
          {secret}
        </div>
      </div>

      {/* Verification Code Input */}
      <div>
        <label htmlFor="verify-code" className="block text-sm font-semibold mb-2" style={{ color: "#334155" }}>
          Enter 6-digit code from your app
        </label>
        <input
          id="verify-code"
          type="text"
          value={verifyCode}
          onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          maxLength={6}
          placeholder="000000"
          className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none text-center text-2xl font-mono tracking-widest"
          style={{
            backgroundColor: "#F8FAFC",
            borderColor: error ? "#EF4444" : "#CBD5E1",
            color: "#0F172A",
          }}
          disabled={verifying}
          onFocus={(e) => !error && (e.target.style.borderColor = "#3B82F6")}
          onBlur={(e) => !error && (e.target.style.borderColor = "#CBD5E1")}
        />
        {error && (
          <p className="text-sm mt-2" style={{ color: "#EF4444" }}>
            {error}
          </p>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: "#EFF6FF", borderLeft: "4px solid #3B82F6" }}>
        <p className="text-sm font-semibold mb-2" style={{ color: "#1E40AF" }}>
          Recommended Authenticator Apps:
        </p>
        <ul className="text-sm space-y-1" style={{ color: "#1E40AF" }}>
          <li>• Google Authenticator</li>
          <li>• Microsoft Authenticator</li>
          <li>• Authy</li>
          <li>• 1Password</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancelled}
          disabled={verifying}
          className="flex-1 px-4 py-3 rounded-lg font-semibold border-2 transition-all"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#E2E8F0",
            color: "#64748B",
            cursor: verifying ? "not-allowed" : "pointer",
            opacity: verifying ? 0.5 : 1,
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleVerifyAndEnable}
          disabled={verifying || verifyCode.length !== 6}
          className="flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all"
          style={{
            backgroundColor: verifying || verifyCode.length !== 6 ? "#93C5FD" : "#3B82F6",
            cursor: verifying || verifyCode.length !== 6 ? "not-allowed" : "pointer",
          }}
        >
          {verifying ? "Verifying..." : "Enable 2FA"}
        </button>
      </div>
    </div>
  )
}

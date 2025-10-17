"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import toast from "react-hot-toast"

interface TwoFactorVerifyProps {
  onVerified: () => void
  onCancel: () => void
}

export default function TwoFactorVerify({ onVerified, onCancel }: TwoFactorVerifyProps) {
  const supabase = createClient()
  const [verifyCode, setVerifyCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState("")

  const handleVerify = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      setError("Please enter a valid 6-digit code")
      return
    }

    setVerifying(true)
    setError("")

    try {
      // Get all factors for the user
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()

      if (factorsError) throw factorsError

      const totpFactor = factors?.totp?.[0]

      if (!totpFactor) {
        throw new Error("No 2FA factor found")
      }

      // Create a challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      })

      if (challengeError) throw challengeError

      // Verify the code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code: verifyCode,
      })

      if (verifyError) throw verifyError

      toast.success("2FA verification successful!")
      onVerified()
    } catch (err: any) {
      setError(err.message || "Invalid verification code")
      toast.error("Verification failed: " + (err.message || "Invalid code"))
      setVerifying(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-4 rounded-xl mb-4" style={{ backgroundColor: "#3B82F6" }}>
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: "#1E293B" }}>
          Two-Factor Authentication
        </h3>
        <p className="text-sm" style={{ color: "#64748B" }}>
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      {/* Verification Code Input */}
      <div>
        <input
          type="text"
          value={verifyCode}
          onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          maxLength={6}
          placeholder="000000"
          autoFocus
          className="w-full px-4 py-4 border-2 rounded-lg focus:outline-none text-center text-3xl font-mono tracking-widest"
          style={{
            backgroundColor: "#F8FAFC",
            borderColor: error ? "#EF4444" : "#CBD5E1",
            color: "#0F172A",
          }}
          disabled={verifying}
          onFocus={(e) => !error && (e.target.style.borderColor = "#3B82F6")}
          onBlur={(e) => !error && (e.target.style.borderColor = "#CBD5E1")}
          onKeyPress={(e) => {
            if (e.key === "Enter" && verifyCode.length === 6) {
              handleVerify()
            }
          }}
        />
        {error && (
          <p className="text-sm mt-2" style={{ color: "#EF4444" }}>
            {error}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
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
          Back
        </button>
        <button
          onClick={handleVerify}
          disabled={verifying || verifyCode.length !== 6}
          className="flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all"
          style={{
            backgroundColor: verifying || verifyCode.length !== 6 ? "#93C5FD" : "#3B82F6",
            cursor: verifying || verifyCode.length !== 6 ? "not-allowed" : "pointer",
          }}
        >
          {verifying ? "Verifying..." : "Verify"}
        </button>
      </div>
    </div>
  )
}

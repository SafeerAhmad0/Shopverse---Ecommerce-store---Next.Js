"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import toast from "react-hot-toast"
import Modal from "./Modal"
import TwoFactorSetup from "./TwoFactorSetup"

export default function TwoFactorManagement() {
  const supabase = createClient()
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [disabling, setDisabling] = useState(false)

  useEffect(() => {
    check2FAStatus()
  }, [])

  const check2FAStatus = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors()
      if (error) throw error

      const hasTOTP = data?.totp && data.totp.length > 0
      setIs2FAEnabled(hasTOTP || false)
    } catch (err) {
      console.error("Error checking 2FA status:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!confirm("Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.")) {
      return
    }

    setDisabling(true)

    try {
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const totpFactor = factors?.totp?.[0]

      if (!totpFactor) {
        toast.error("No 2FA factor found")
        return
      }

      const { error } = await supabase.auth.mfa.unenroll({
        factorId: totpFactor.id,
      })

      if (error) throw error

      toast.success("2FA disabled successfully")
      setIs2FAEnabled(false)
    } catch (err: any) {
      toast.error("Failed to disable 2FA: " + err.message)
    } finally {
      setDisabling(false)
    }
  }

  const handleSetupComplete = () => {
    setShowSetupModal(false)
    setIs2FAEnabled(true)
    check2FAStatus()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-4 border-t-4 rounded-full animate-spin" style={{ borderColor: "#E0E7FF", borderTopColor: "#3B82F6" }}></div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: "#E2E8F0" }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: is2FAEnabled ? "#DCFCE7" : "#FEF3C7" }}>
              <svg className="w-6 h-6" style={{ color: is2FAEnabled ? "#16A34A" : "#D97706" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1" style={{ color: "#1E293B" }}>
                Two-Factor Authentication (2FA)
              </h3>
              <p className="text-sm mb-2" style={{ color: "#64748B" }}>
                Add an extra layer of security to your account using an authenticator app
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-1 rounded" style={{
                  backgroundColor: is2FAEnabled ? "#DCFCE7" : "#FEF3C7",
                  color: is2FAEnabled ? "#16A34A" : "#D97706"
                }}>
                  {is2FAEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </div>
          <div>
            {is2FAEnabled ? (
              <button
                onClick={handleDisable2FA}
                disabled={disabling}
                className="px-4 py-2 rounded-lg font-semibold text-white transition-all"
                style={{
                  backgroundColor: disabling ? "#FCA5A5" : "#EF4444",
                  cursor: disabling ? "not-allowed" : "pointer"
                }}
              >
                {disabling ? "Disabling..." : "Disable 2FA"}
              </button>
            ) : (
              <button
                onClick={() => setShowSetupModal(true)}
                className="px-4 py-2 rounded-lg font-semibold text-white transition-all"
                style={{ backgroundColor: "#3B82F6" }}
              >
                Enable 2FA
              </button>
            )}
          </div>
        </div>

        {is2FAEnabled && (
          <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: "#DCFCE7", borderLeft: "4px solid #16A34A" }}>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 mt-0.5" style={{ color: "#16A34A" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#16A34A" }}>
                  Your account is protected with 2FA
                </p>
                <p className="text-xs mt-1" style={{ color: "#15803D" }}>
                  You&apos;ll need to enter a code from your authenticator app each time you sign in
                </p>
              </div>
            </div>
          </div>
        )}

        {!is2FAEnabled && (
          <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: "#FEF3C7", borderLeft: "4px solid #D97706" }}>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 mt-0.5" style={{ color: "#D97706" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#D97706" }}>
                  2FA is not enabled
                </p>
                <p className="text-xs mt-1" style={{ color: "#B45309" }}>
                  We strongly recommend enabling 2FA to protect your admin account
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Setup Modal */}
      <Modal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        title="Enable Two-Factor Authentication"
        size="lg"
      >
        <TwoFactorSetup
          onEnrolled={handleSetupComplete}
          onCancelled={() => setShowSetupModal(false)}
        />
      </Modal>
    </>
  )
}

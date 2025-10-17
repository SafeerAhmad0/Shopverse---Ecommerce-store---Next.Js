import { useEffect, useState } from "react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
}

export default function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
      setTimeout(() => setIsVisible(false), 200)
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isVisible) return null

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{
        backgroundColor: isOpen ? "rgba(15, 23, 42, 0.6)" : "rgba(15, 23, 42, 0)",
        backdropFilter: isOpen ? "blur(4px)" : "blur(0px)",
        transition: "all 200ms ease-in-out"
      }}
      onClick={onClose}
    >
      <div className="min-h-screen px-4 flex items-center justify-center p-4">
        <div
          className={`bg-white rounded-2xl w-full ${sizeClasses[size]} border-2`}
          style={{
            borderColor: "#E5E7EB",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            transform: isOpen ? "scale(1) translateY(0)" : "scale(0.95) translateY(20px)",
            opacity: isOpen ? 1 : 0,
            transition: "all 200ms ease-out"
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: "#E5E7EB" }}>
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 rounded-full" style={{ backgroundColor: "#3B82F6" }}></div>
              <h3 className="text-xl font-bold tracking-tight" style={{ color: "#0F172A" }}>{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition-all border-2"
              style={{
                color: "#64748B",
                borderColor: "transparent",
                backgroundColor: "transparent"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#FEE2E2"
                e.currentTarget.style.borderColor = "#FCA5A5"
                e.currentTarget.style.color = "#DC2626"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent"
                e.currentTarget.style.borderColor = "transparent"
                e.currentTarget.style.color = "#64748B"
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

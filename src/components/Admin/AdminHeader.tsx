interface AdminHeaderProps {
  title: string
  userName?: string
  userEmail?: string
  onSignOut: () => void
}

export default function AdminHeader({ title, userName, userEmail, onSignOut }: AdminHeaderProps) {
  const initials = (userName || userEmail || "AD").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <header className="bg-white border-b" style={{ borderColor: "#E5E7EB", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)" }}>
      <div className="max-w-7xl mx-auto px-8 py-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: "#EFF6FF", border: "2px solid #DBEAFE" }}>
              <svg className="w-7 h-7" style={{ color: "#2563EB" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0F172A" }}>{title}</h1>
              <p className="text-sm mt-0.5" style={{ color: "#64748B" }}>Manage your e-commerce platform</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm" style={{ backgroundColor: "#3B82F6", color: "white" }}>
                {initials}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold" style={{ color: "#1E293B" }}>{userName || "Admin"}</p>
                <p className="text-xs" style={{ color: "#94A3B8" }}>{userEmail}</p>
              </div>
            </div>

            <button
              onClick={onSignOut}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border-2"
              style={{
                backgroundColor: "white",
                borderColor: "#FCA5A5",
                color: "#DC2626"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#FEF2F2"
                e.currentTarget.style.borderColor = "#F87171"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white"
                e.currentTarget.style.borderColor = "#FCA5A5"
              }}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

interface StatsCardProps {
  label: string
  value: string | number
  color: string
  icon: string
}

export default function StatsCard({ label, value, color, icon }: StatsCardProps) {
  const getBgColor = () => {
    if (color === "#3B82F6") return "#EFF6FF"
    if (color === "#60A5FA") return "#DBEAFE"
    if (color === "#16A34A") return "#DCFCE7"
    if (color === "#10B981") return "#D1FAE5"
    return "#EFF6FF"
  }

  const getBorderColor = () => {
    if (color === "#3B82F6") return "#BFDBFE"
    if (color === "#60A5FA") return "#93C5FD"
    if (color === "#16A34A") return "#BBF7D0"
    if (color === "#10B981") return "#A7F3D0"
    return "#BFDBFE"
  }

  return (
    <div
      className="bg-white rounded-2xl p-6 border-2 transition-all cursor-default"
      style={{
        borderColor: getBorderColor(),
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)"
        e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)"
        e.currentTarget.style.boxShadow = "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#94A3B8" }}>
            {label}
          </p>
          <h3 className="text-4xl font-bold tracking-tight" style={{ color: "#0F172A" }}>
            {value}
          </h3>
        </div>
        <div className="p-4 rounded-xl border-2 transition-all" style={{ backgroundColor: getBgColor(), borderColor: getBorderColor() }}>
          <svg className="w-7 h-7" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
      </div>
    </div>
  )
}

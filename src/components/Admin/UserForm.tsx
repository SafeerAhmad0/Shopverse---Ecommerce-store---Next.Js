interface UserFormProps {
  form: {
    name: string
    email: string
    password: string
    role: string
    phone: string
  }
  isEditing: boolean
  onChange: (field: string, value: string) => void
  onSubmit: () => void
  onCancel: () => void
}

export default function UserForm({ form, isEditing, onChange, onSubmit, onCancel }: UserFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Name *</label>
        <input type="text" value={form.name} onChange={e => onChange('name', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: "#E2E8F0", color: "#1E293B" }} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Email *</label>
        <input type="email" value={form.email} onChange={e => onChange('email', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: "#E2E8F0", color: "#1E293B" }} disabled={isEditing} />
      </div>
      {!isEditing && (
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Password</label>
          <input type="password" value={form.password} onChange={e => onChange('password', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: "#E2E8F0", color: "#1E293B" }} placeholder="Leave empty for auto-generated" />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Phone</label>
        <input type="text" value={form.phone} onChange={e => onChange('phone', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: "#E2E8F0", color: "#1E293B" }} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: "#64748B" }}>Role *</label>
        <select value={form.role} onChange={e => onChange('role', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: "#E2E8F0", color: "#1E293B" }}>
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={onSubmit} className="flex-1 py-2 rounded-lg font-semibold text-white" style={{ backgroundColor: "#3B82F6" }}>Save</button>
        <button onClick={onCancel} className="flex-1 py-2 rounded-lg font-semibold" style={{ backgroundColor: "#E2E8F0", color: "#64748B" }}>Cancel</button>
      </div>
    </div>
  )
}

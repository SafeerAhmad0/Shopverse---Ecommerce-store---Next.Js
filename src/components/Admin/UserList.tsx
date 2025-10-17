interface User {
  id: string
  name: string
  email: string
  role: string
  account_status: string
  phone?: string
}

interface UserListProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (id: string) => void
  currentUserRole?: string
}

export default function UserList({ users, onEdit, onDelete, currentUserRole }: UserListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ backgroundColor: "#F8FAFC" }}>
            <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#64748B" }}>Name</th>
            <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#64748B" }}>Email</th>
            <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#64748B" }}>Role</th>
            <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#64748B" }}>Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: "#64748B" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => {
            // Super admin cannot edit/delete other super admins
            const canEditDelete = !(currentUserRole === 'super_admin' && u.role === 'super_admin');

            return (
              <tr key={u.id} className="border-t" style={{ borderColor: "#E2E8F0" }}>
                <td className="px-4 py-3" style={{ color: "#1E293B" }}>{u.name}</td>
                <td className="px-4 py-3" style={{ color: "#64748B" }}>{u.email}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded text-xs font-medium text-white" style={{ backgroundColor: u.role === "super_admin" ? "#3B82F6" : u.role === "admin" ? "#60A5FA" : "#94A3B8" }}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded text-xs font-medium text-white" style={{ backgroundColor: u.account_status === "active" ? "#10B981" : "#EF4444" }}>
                    {u.account_status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {canEditDelete && (
                    <>
                      <button onClick={() => onEdit(u)}
                        className="text-sm mr-2 px-3 py-1 rounded" style={{ backgroundColor: "#DBEAFE", color: "#3B82F6" }}>Edit</button>
                      <button onClick={() => onDelete(u.id)} className="text-sm px-3 py-1 rounded" style={{ backgroundColor: "#FEE2E2", color: "#EF4444" }}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="text-center py-8" style={{ color: "#64748B" }}>
          No users found
        </div>
      )}
    </div>
  )
}

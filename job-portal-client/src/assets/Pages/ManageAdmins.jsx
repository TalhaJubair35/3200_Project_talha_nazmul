import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { FiUserPlus, FiTrash2, FiShield } from "react-icons/fi";
import Swal from "sweetalert2";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const ManageAdmins = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchAdmins();
    }
  }, [user]);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/admins?email=${encodeURIComponent(user?.email)}`);
      if (!res.ok) throw new Error("Failed to fetch admins");
      const data = await res.json();
      setAdmins(data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Could not load admins.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/add-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, newAdminEmail: newAdminEmail.trim() })
      });
      const data = await res.json();

      if (!res.ok) {
        Swal.fire("Error", data.message || "Failed to add admin", "error");
        return;
      }

      Swal.fire("Success!", `${newAdminEmail} is now an admin.`, "success");
      setNewAdminEmail("");
      fetchAdmins();
    } catch (err) {
      Swal.fire("Error", "An unexpected error occurred.", "error");
    }
  };

  const handleRemoveAdmin = async (targetEmail) => {
    const confirm = await Swal.fire({
      title: "Remove Admin?",
      text: `Are you sure you want to revoke admin privileges for ${targetEmail}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove"
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`${API_BASE_URL}/remove-admin/${encodeURIComponent(targetEmail)}?email=${encodeURIComponent(user?.email)}`, {
          method: "DELETE"
        });
        const data = await res.json();

        if (!res.ok) {
          Swal.fire("Error", data.message || "Failed to remove admin", "error");
          return;
        }

        Swal.fire("Removed!", "Admin privileges revoked.", "success");
        fetchAdmins();
      } catch (err) {
        Swal.fire("Error", "Could not remove admin.", "error");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FiShield className="text-blue-600" />
          Manage Admins
        </h1>
        <p className="text-gray-500 mt-2">Add or remove administrator privileges for users on your platform.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Add New Admin</h2>
          <form onSubmit={handleAddAdmin} className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="Enter user's email address..."
                className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-black font-bold rounded-xl flex items-center gap-2 transition-colors shadow-sm"
            >
              <FiUserPlus /> Promote User
            </button>
          </form>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Current Administrators ({admins.length})</h2>

          {/* Mobile: card list */}
          <div className="sm:hidden space-y-3">
            {admins.map((admin, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-base flex-shrink-0">
                  {admin.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{admin.email}</p>
                  <p className="text-xs text-gray-400">
                    {admin.isSuperAdmin ? 'Super Admin' : `Added by ${admin.addedBy || '—'}`}
                  </p>
                  {admin.isSuperAdmin && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Super Admin
                    </span>
                  )}
                  {!admin.isSuperAdmin && admin.email === user?.email && (
                    <span className="text-xs text-gray-400 italic">You</span>
                  )}
                </div>
                {!admin.isSuperAdmin && admin.email !== user?.email && (
                  <button
                    onClick={() => handleRemoveAdmin(admin.email)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    title="Revoke Admin Access"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            {admins.length === 0 && (
              <p className="text-center text-gray-500 py-8">No admins found.</p>
            )}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-sm text-gray-500">
                  <th className="pb-3 font-semibold">Email Address</th>
                  <th className="pb-3 font-semibold">Added By</th>
                  <th className="pb-3 font-semibold">Date Promoted</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {admins.map((admin, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                          {admin.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{admin.email}</p>
                          {admin.isSuperAdmin && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                              Super Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-gray-500">
                      {admin.addedBy}
                    </td>
                    <td className="py-4 text-sm text-gray-500">
                      {admin.addedAt ? new Date(admin.addedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-4 text-right">
                      {!admin.isSuperAdmin && admin.email !== user?.email && (
                        <button
                          onClick={() => handleRemoveAdmin(admin.email)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Revoke Admin Access"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      )}
                      {!admin.isSuperAdmin && admin.email === user?.email && (
                        <span className="text-xs text-gray-400 italic px-2">You</span>
                      )}
                    </td>
                  </tr>
                ))}
                {admins.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">
                      No admins found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAdmins;

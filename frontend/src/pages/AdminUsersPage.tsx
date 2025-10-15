import React, { useState } from "react";
import { Users, Shield, UserMinus, Search, Edit } from "lucide-react";
import {
  useUsers,
  useDeleteUser,
  useUpdateUserRole,
  useUpdateUser,
} from "../hooks/useUsers";
import { useDebounce } from "../hooks/useDebounce";
import { useAuthStore } from "../store/authStore";
import { Button, Loading } from "../components/ui";
import type { User, UserRole } from "../types";

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    bio: "",
  });

  // Debounce search input to avoid triggering API calls on every keystroke
  const debouncedSearch = useDebounce(search, 500);
  const {
    data: usersData,
    isLoading,
    isFetching,
  } = useUsers({ search: debouncedSearch, pageSize: 50 });
  const deleteUserMutation = useDeleteUser();
  const updateRoleMutation = useUpdateUserRole();
  const updateUserMutation = useUpdateUser();

  const isSuperuser = currentUser?.role?.toLowerCase() === "superuser";
  const isAdmin =
    currentUser?.role?.toLowerCase() === "admin" ||
    currentUser?.role?.toLowerCase() === "superuser";

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleUpdateRole = (role: UserRole) => {
    if (!selectedUser) return;

    updateRoleMutation.mutate(
      { userId: selectedUser.id, role },
      {
        onSuccess: () => {
          setIsRoleModalOpen(false);
          setSelectedUser(null);
        },
      }
    );
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phoneNumber: user.phoneNumber || "",
      bio: user.bio || "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;

    updateUserMutation.mutate(
      {
        userId: selectedUser.id,
        data: {
          firstName: editForm.firstName || undefined,
          lastName: editForm.lastName || undefined,
          phoneNumber: editForm.phoneNumber || undefined,
          bio: editForm.bio || undefined,
        },
      },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        },
      }
    );
  };

  // Only show full-page loading on initial load (not during search)
  if (isLoading) {
    return <Loading text="Loading users..." />;
  }

  const users = usersData?.items || [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isFetching && !isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-600 font-medium">
                            {user.username[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {[user.firstName, user.lastName].filter(Boolean).join(" ") || user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    {user.emailConfirmed && (
                      <span className="text-xs text-green-600">✓ Verified</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role?.toLowerCase() === "superuser"
                          ? "bg-purple-100 text-purple-800"
                          : user.role?.toLowerCase() === "admin"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {isAdmin && user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit User"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      )}
                      {isSuperuser && user.id !== currentUser?.id && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsRoleModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Change Role"
                        >
                          <Shield className="w-5 h-5" />
                        </button>
                      )}
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete User"
                        >
                          <UserMinus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">
                {usersData?.total || 0}
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Admins</p>
              <p className="text-3xl font-bold text-gray-900">
                {users.filter((u) => u.role?.toLowerCase() === "admin").length}
              </p>
            </div>
            <Shield className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Superusers</p>
              <p className="text-3xl font-bold text-gray-900">
                {
                  users.filter((u) => u.role?.toLowerCase() === "superuser")
                    .length
                }
              </p>
            </div>
            <Shield className="w-12 h-12 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Role Update Modal */}
      {isRoleModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Update User Role
            </h2>
            <p className="text-gray-600 mb-6">
              Change role for <strong>{selectedUser.username}</strong>
            </p>

            <div className="space-y-3">
              {(["User", "Admin", "Superuser"] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => handleUpdateRole(role)}
                  disabled={
                    selectedUser.role?.toLowerCase() === role.toLowerCase()
                  }
                  className={`w-full px-4 py-3 rounded-lg border-2 transition text-left ${
                    selectedUser.role?.toLowerCase() === role.toLowerCase()
                      ? "border-blue-500 bg-blue-50 cursor-not-allowed"
                      : "border-gray-300 hover:border-blue-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{role}</span>
                    {selectedUser.role?.toLowerCase() ===
                      role.toLowerCase() && (
                      <span className="text-sm text-blue-600">Current</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsRoleModalOpen(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit User</h2>
            <p className="text-gray-600 mb-6">
              Update details for <strong>{selectedUser.username}</strong>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                  autoComplete="off"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Username cannot be changed
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, firstName: e.target.value })
                    }
                    autoComplete="off"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lastName: e.target.value })
                    }
                    autoComplete="off"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editForm.phoneNumber}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phoneNumber: e.target.value })
                  }
                  autoComplete="off"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bio: e.target.value })
                  }
                  rows={4}
                  autoComplete="off"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateUser}
                isLoading={updateUserMutation.isPending}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

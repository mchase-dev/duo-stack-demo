import { Outlet, NavLink } from "react-router-dom";
import {
  Calendar,
  MessageSquare,
  MessageCircle,
  FileText,
  User,
  Users,
  LogOut,
  Home,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../api";
import { toast } from "sonner";
import { useRealtimeConnection } from "../../hooks/useRealtimeConnection";

export const MainLayout: React.FC = () => {
  const { user, logout: storeLogout } = useAuthStore();

  // Automatically connect/disconnect realtime based on auth state
  useRealtimeConnection();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      storeLogout();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const isAdmin =
    user?.role?.toLowerCase() === "admin" ||
    user?.role?.toLowerCase() === "superuser";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">DuoStackDemo</h1>
        </div>

        <nav className="p-4">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <Calendar className="w-5 h-5" />
            <span>Calendar</span>
          </NavLink>

          <NavLink
            to="/messages"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <MessageSquare className="w-5 h-5" />
            <span>Messages</span>
          </NavLink>

          <NavLink
            to="/rooms"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <MessageCircle className="w-5 h-5" />
            <span>Chat Rooms</span>
          </NavLink>

          <NavLink
            to="/pages"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <FileText className="w-5 h-5" />
            <span>Pages</span>
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <Users className="w-5 h-5" />
              <span>Manage Users</span>
            </NavLink>
          )}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
          <NavLink
            to="/profile"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 text-gray-700 hover:bg-gray-100 transition"
          >
            <User className="w-5 h-5" />
            <span>{user?.username}</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

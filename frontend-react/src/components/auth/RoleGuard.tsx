import { ReactNode } from "react";
import { useAuthStore } from "../../store/authStore";
import { Loading } from "../ui";
import type { UserRole } from "../../types";

interface RoleGuardProps {
  roles: UserRole[];
  children: ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ roles, children }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <Loading />;
  }

  // Superuser has access to everything (case-insensitive comparison)
  const hasAccess =
    user &&
    (user.role?.toLowerCase() === "superuser" ||
      roles.some((role) => role.toLowerCase() === user.role?.toLowerCase()));

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

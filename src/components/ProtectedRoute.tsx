import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth, AppRole } from "@/hooks/useAuth";

export default function ProtectedRoute({
  children,
  requireRole,
}: {
  children: ReactNode;
  requireRole?: AppRole;
}) {
  const { user, roles, loading } = useAuth();
  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Loading…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (requireRole && !roles.includes(requireRole)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
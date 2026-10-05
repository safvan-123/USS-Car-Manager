import { useAuth } from "../auth/AuthContext";

export default function RoleGate({ admin = false, write = false, fallback = null, children }) {
  const { isAdmin, canWrite } = useAuth();
  if (admin && !isAdmin) return fallback;
  if (write && !canWrite) return fallback;
  return children;
}

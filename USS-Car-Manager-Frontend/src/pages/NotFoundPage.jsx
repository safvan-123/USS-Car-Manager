import { Link } from "react-router-dom";
export default function NotFoundPage() {
  return <div className="empty-state page-empty"><div className="empty-illustration">404</div><h2>Page not found</h2><p>The page you opened doesn’t exist.</p><Link className="btn btn-primary" to="/">Back to dashboard</Link></div>;
}

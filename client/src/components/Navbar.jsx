import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-indigo-600 text-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">📚 BookNest</Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/books/new" className="hover:underline">Add Book</Link>
              <span className="text-sm opacity-90">Hi, {user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-white text-indigo-600 px-3 py-1 rounded font-medium hover:bg-indigo-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link
                to="/register"
                className="bg-white text-indigo-600 px-3 py-1 rounded font-medium hover:bg-indigo-50"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
import { Link } from "react-router";
import {
  House,
  Link2,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { authStore } from "../store/authStore";

export function Navbar() {
  const { authUser, logout } = authStore();

  return (
    <div className="navbar bg-base-100 shadow-lg border-b border-base-300">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="text-3xl">🔗</div>

          <div>
            <h1 className="text-2xl font-bold text-primary">
              Linkora
            </h1>

            <p className="text-sm text-base-content/70">
              Fast • Secure • Simple
            </p>
          </div>
        </Link>

        {/* User Dropdown */}
        <div className="dropdown dropdown-end">

            <div
  tabIndex={0}
  role="button"
  className="btn btn-ghost h-auto px-2 py-2 gap-3 normal-case"
>
  {/* Avatar */}
  <div className="avatar">
    <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
      <span className="text-lg font-semibold leading-none">
        {authUser?.username?.charAt(0).toUpperCase()}
      </span>
    </div>
  </div>

  {/* User Info */}
  <div className="hidden md:flex flex-col items-start leading-tight">
    <span className="font-semibold text-sm">
      {authUser?.username}
    </span>

    <span className="text-xs text-base-content/60">
      {authUser?.email}
    </span>
  </div>

  <ChevronDown className="hidden md:block w-4 h-4 text-base-content/60" />
</div>

          {/* Dropdown */}
          <ul
            tabIndex={0}
            className="dropdown-content z-[100] mt-3 w-52 rounded-box bg-base-100 shadow-xl border border-base-300 p-2"
          >

            <li>
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2 rounded-lg"
              >
                <House size={18} />
                Home
              </Link>
            </li>

            <li>
              <Link
                to="/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-lg"
              >
                <Link2 size={18} />
                My URLs
              </Link>
            </li>

            <div className="divider my-1"></div>

            <li>
              <button
                onClick={logout}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-error"
              >
                <LogOut size={18} />
                Logout
              </button>
            </li>

          </ul>
        </div>

      </div>
    </div>
  );
}
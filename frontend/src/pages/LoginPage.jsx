import React, { useState } from "react";
import { Link } from "react-router";
import { LoaderIcon, LockIcon, MailIcon, MessageCircleIcon } from "lucide-react";
import { authStore } from "../store/authStore.js";

function LoginPage() {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const { login, isLoggingIn } = authStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300">
        <div className="card-body">

          {/* Heading */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageCircleIcon className="w-8 h-8 text-primary" />
            </div>

            <h1 className="text-3xl font-bold">
              Welcome Back
            </h1>

            <p className="text-base-content/70 mt-2">
              Login to continue using Linkora.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Username / Email */}
            <div>
              <label className="auth-input-label">
                Username or Email
              </label>

              <div className="relative">
                <MailIcon className="auth-input-icon" />

                <input
                  type="text"
                  className="input input-bordered w-full pl-11"
                  placeholder="Enter username or email"
                  value={formData.identifier}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      identifier: e.target.value,
                    })
                  }
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="auth-input-label">
                Password
              </label>

              <div className="relative">
                <LockIcon className="auth-input-icon" />

                <input
                  type="password"
                  className="input input-bordered w-full pl-11"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center gap-2"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <LoaderIcon className="w-5 h-5 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="divider my-6"></div>

          <p className="text-center text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="link link-primary font-medium"
            >
              Sign Up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;
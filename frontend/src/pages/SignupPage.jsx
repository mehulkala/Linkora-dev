import React, { useState } from "react";
import { Link } from "react-router";
import {
  LoaderIcon,
  LockIcon,
  MailIcon,
  MessageCircleIcon,
  UserIcon,
} from "lucide-react";
import { authStore } from "../store/authStore";

function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = authStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
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
              Create Account
            </h1>

            <p className="text-base-content/70 mt-2">
              Join Linkora and start managing your shortened URLs.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Username */}
            <div>
              <label className="auth-input-label">
                Username
              </label>

              <div className="relative">
                <UserIcon className="auth-input-icon" />

                <input
                  type="text"
                  className="input input-bordered w-full pl-11"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      username: e.target.value,
                    })
                  }
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="auth-input-label">
                Email Address
              </label>

              <div className="relative">
                <MailIcon className="auth-input-icon" />

                <input
                  type="email"
                  className="input input-bordered w-full pl-11"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  autoComplete="email"
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
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center gap-2"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <LoaderIcon className="w-5 h-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="divider my-6"></div>

          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="link link-primary font-medium"
            >
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default SignupPage;
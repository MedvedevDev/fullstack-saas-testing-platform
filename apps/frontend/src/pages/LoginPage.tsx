import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Loader2 } from "lucide-react";
import api from "../api/axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-flow-bg p-4 font-sans">
      <div className="max-w-md w-full">
        {/* Login Card starts directly here */}
        <div className="bg-white p-10 rounded-xl shadow-sm border border-flow-border">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-flow-text-main">
              Login to your account
            </h2>
            <p className="text-sm text-flow-text-muted mt-1">
              Enter your details below to continue.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 text-xs font-medium text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-wider text-flow-text-muted mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-flow-text-muted" />
                  <input
                    type="email"
                    id="email"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-flow-border rounded-lg bg-gray-50 text-flow-text-main placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-flow-blue/20 focus:border-flow-blue transition-all sm:text-sm"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-flow-text-muted mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-flow-text-muted" />
                  <input
                    type="password"
                    id="password"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-flow-border rounded-lg bg-gray-50 text-flow-text-main placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-flow-blue/20 focus:border-flow-blue transition-all sm:text-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-flow-blue hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-flow-blue/20 transition-all shadow-sm active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-sm text-flow-text-muted">
          Don't have an account?{" "}
          <span className="text-flow-blue font-medium cursor-pointer">
            Contact Admin
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

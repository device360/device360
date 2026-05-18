import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const DEFAULT_USERNAME = "Admin";
const DEFAULT_PASSWORD = "Admin@device360";
const ADMIN_EMAIL = "device360recycle@gmail.com";

export const AdminLogin = () => {
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (user !== DEFAULT_USERNAME || pass !== DEFAULT_PASSWORD) {
      setError("Invalid credentials");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${BACKEND_URL}/api/admin/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user,
          password: pass,
          email: ADMIN_EMAIL,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to send verification code");
      }

      setStep("otp");
      setInfo("Verification code sent to the admin email.");
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!otp.trim()) {
      setError("Enter the verification code");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${BACKEND_URL}/api/admin/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user,
          password: pass,
          email: ADMIN_EMAIL,
          otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Invalid verification code");
      }

      localStorage.setItem("adminAuth", "true");
      navigate("/admin", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const resetLogin = () => {
    setStep("credentials");
    setOtp("");
    setError("");
    setInfo("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-200">
            D
          </div>
          <h2 className="mt-4 text-2xl font-black text-gray-900">
            Admin Login
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Two-step verification enabled
          </p>
        </div>

        {step === "credentials" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter username"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}
            {info && (
              <p className="text-green-600 text-sm font-medium">{info}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Sending code..." : "Send Verification Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
              <p className="text-sm text-blue-800 font-medium">
                A verification code has been sent to{" "}
                <span className="font-bold">{ADMIN_EMAIL}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 tracking-[0.4em] text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>

            <button
              type="button"
              onClick={resetLogin}
              className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
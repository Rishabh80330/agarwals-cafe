import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, UserPlus } from "lucide-react";
import api from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      await api.post("/auth/register", formData);

      navigate("/login");
    } catch (err) {
      console.error("Register error:", err);

      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f4ee] px-5 pb-20 pt-36 lg:px-8">

      <div className="mx-auto max-w-md">

        <div className="rounded-[2rem] bg-white p-7 shadow-sm sm:p-9">

          <div className="text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eee5d9] text-[#a76d3e]">
              <UserPlus size={24} />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-[#a76d3e]">
              Welcome
            </p>

            <h1 className="mt-2 font-serif text-4xl text-[#2b2118]">
              Create an account
            </h1>

            <p className="mt-3 text-sm text-[#75685d]">
              Join Agarwal's Cafe and keep track of your orders.
            </p>

          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">

            <input
              type="text"
              name="name"
              placeholder="Full name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-[#ded3c6] bg-[#fdfbf8] px-4 py-3.5 text-sm outline-none focus:border-[#a76d3e]"
            />

            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-[#ded3c6] bg-[#fdfbf8] px-4 py-3.5 text-sm outline-none focus:border-[#a76d3e]"
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#ded3c6] bg-[#fdfbf8] px-4 py-3.5 text-sm outline-none focus:border-[#a76d3e]"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full rounded-xl border border-[#ded3c6] bg-[#fdfbf8] px-4 py-3.5 text-sm outline-none focus:border-[#a76d3e]"
            />

            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2b2118] py-4 text-sm font-semibold text-white transition hover:bg-[#3b2c20] disabled:opacity-60"
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  Create Account
                  <ArrowRight size={17} />
                </>
              )}
            </button>

          </form>

          <p className="mt-7 text-center text-sm text-[#75685d]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#a76d3e]"
            >
              Login
            </Link>
          </p>

        </div>

      </div>

    </main>
  );
};

export default Register;
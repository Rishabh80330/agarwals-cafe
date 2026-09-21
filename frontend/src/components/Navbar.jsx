import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LogOut,
  Menu,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const { cartCount } = useCart();

  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("agarwals-cafe-token");
  const savedUser = localStorage.getItem("agarwals-cafe-user");

  let user = null;

  try {
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch {
    user = null;
  }

  const logout = () => {
    localStorage.removeItem("agarwals-cafe-token");
    localStorage.removeItem("agarwals-cafe-user");

    setAccountOpen(false);
    setMobileOpen(false);

    navigate("/login");
  };

  const closeMenus = () => {
    setMobileOpen(false);
    setAccountOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="absolute left-0 top-0 z-50 w-full">
      <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-5 sm:py-5 lg:px-8">

        {/* ================= NAVBAR ================= */}

        <nav className="relative flex min-h-[62px] items-center justify-between rounded-full border border-white/20 bg-[#211810]/90 px-3 py-2 text-white shadow-lg backdrop-blur-md sm:px-5">

          {/* ================= LOGO ================= */}

          <Link
            to="/"
            onClick={closeMenus}
            className="flex min-w-0 items-center gap-2 sm:gap-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#c78b55] font-serif text-base font-bold sm:h-10 sm:w-10 sm:text-lg">
              A
            </div>

            <div className="min-w-0">
              <h1 className="truncate font-serif text-base font-semibold tracking-wide sm:text-lg">
                Agarwal&apos;s
              </h1>

              <p className="-mt-1 text-[8px] uppercase tracking-[0.22em] text-[#d9b38c] sm:text-[9px]">
                Cafe
              </p>
            </div>
          </Link>

          {/* ================= DESKTOP NAV ================= */}

          <div className="hidden items-center gap-6 lg:flex xl:gap-8">

            <Link
              to="/"
              className={`text-sm transition ${
                isActive("/") || isActive("/home")
                  ? "text-[#d9b38c]"
                  : "text-white/85 hover:text-[#d9b38c]"
              }`}
            >
              Home
            </Link>

            <Link
              to="/menu"
              className={`text-sm transition ${
                isActive("/menu")
                  ? "text-[#d9b38c]"
                  : "text-white/85 hover:text-[#d9b38c]"
              }`}
            >
              Menu
            </Link>

            <Link
              to="/#about"
              className="text-sm text-white/85 transition hover:text-[#d9b38c]"
            >
              Our Story
            </Link>

            <Link
              to="/contact"
              onClick={closeMenus}
              className={`text-sm transition ${
                isActive("/contact")
                  ? "text-[#d9b38c]"
                  : "text-white/85 hover:text-[#d9b38c]"
              }`}
            >
              Contact
            </Link>

          </div>

          {/* ================= ACTIONS ================= */}

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">

            {/* CART */}

            <Link
              to="/cart"
              onClick={() => setMobileOpen(false)}
              className="relative rounded-full p-2 transition hover:bg-white/10"
              aria-label="Cart"
            >
              <ShoppingBag size={19} />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c78b55] px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* ================= ACCOUNT ================= */}

            {token ? (
              <div className="relative hidden lg:block">

                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex max-w-[180px] items-center gap-2 rounded-full px-2 py-2 transition hover:bg-white/10 xl:px-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c78b55]">
                    <User size={16} />
                  </div>

                  <span className="max-w-24 truncate text-sm">
                    {user?.name || "Account"}
                  </span>

                  <ChevronDown
                    size={15}
                    className={`shrink-0 transition ${
                      accountOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-2xl border border-[#e5dbd0] bg-white p-2 text-[#2b2118] shadow-2xl">

                    <div className="border-b border-[#eee5d9] px-4 py-3">
                      <p className="text-sm font-semibold">
                        {user?.name || "Customer"}
                      </p>

                      <p className="mt-1 truncate text-xs text-[#8b7b6d]">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setAccountOpen(false)}
                      className="mt-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition hover:bg-[#f8f4ee]"
                    >
                      <User size={17} />
                      My Profile
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition hover:bg-[#f8f4ee]"
                    >
                      <ShoppingBag size={17} />
                      My Orders
                    </Link>

                    <Link
                      to="/rewards"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition hover:bg-[#f8f4ee]"
                    >
                      <span className="text-base">★</span>
                      Rewards
                    </Link>

                    {user?.role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#a76d3e] transition hover:bg-[#f8f4ee]"
                      >
                        <span>⚙</span>
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={logout}
                      className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={17} />
                      Logout
                    </button>

                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium transition hover:bg-white/10 lg:block"
              >
                Login
              </Link>
            )}

            {/* ORDER NOW */}

            <Link
              to="/menu"
              className="hidden rounded-full bg-[#c78b55] px-5 py-2.5 text-sm font-medium transition hover:bg-[#b87843] lg:block"
            >
              Order Now
            </Link>

            {/* MOBILE BUTTON */}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-full p-2 transition hover:bg-white/10 lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

          </div>
        </nav>

        {/* ================= MOBILE MENU ================= */}

        {mobileOpen && (
          <div className="mt-2 overflow-hidden rounded-3xl border border-white/10 bg-[#211810]/95 p-4 text-white shadow-2xl backdrop-blur-md lg:hidden">

            <div className="flex flex-col gap-1">

              <Link
                to="/"
                onClick={closeMenus}
                className={`rounded-xl px-4 py-3 transition ${
                  isActive("/") ? "bg-white/10 text-[#d9b38c]" : "hover:bg-white/10"
                }`}
              >
                Home
              </Link>

              <Link
                to="/menu"
                onClick={closeMenus}
                className={`rounded-xl px-4 py-3 transition ${
                  isActive("/menu")
                    ? "bg-white/10 text-[#d9b38c]"
                    : "hover:bg-white/10"
                }`}
              >
                Menu
              </Link>

              <Link
                to="/#about"
                onClick={closeMenus}
                className="rounded-xl px-4 py-3 transition hover:bg-white/10"
              >
                Our Story
              </Link>

              <Link
                to="/contact"
                onClick={closeMenus}
                className={`rounded-xl px-4 py-3 transition ${
                  isActive("/contact")
                    ? "bg-white/10 text-[#d9b38c]"
                    : "hover:bg-white/10"
                }`}
              >
                Contact
              </Link>

              <Link
                to="/cart"
                onClick={closeMenus}
                className="flex items-center justify-between rounded-xl px-4 py-3 transition hover:bg-white/10"
              >
                <span>Cart</span>

                {cartCount > 0 && (
                  <span className="rounded-full bg-[#c78b55] px-2 py-1 text-xs">
                    {cartCount}
                  </span>
                )}
              </Link>

              {token ? (
                <>
                  <Link
                    to="/profile"
                    onClick={closeMenus}
                    className="rounded-xl px-4 py-3 transition hover:bg-white/10"
                  >
                    My Profile
                  </Link>

                  <Link
                    to="/orders"
                    onClick={closeMenus}
                    className="rounded-xl px-4 py-3 transition hover:bg-white/10"
                  >
                    My Orders
                  </Link>

                  <Link
                    to="/rewards"
                    onClick={closeMenus}
                    className="rounded-xl px-4 py-3 transition hover:bg-white/10"
                  >
                    Rewards
                  </Link>

                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={closeMenus}
                      className="rounded-xl px-4 py-3 text-[#d9b38c] transition hover:bg-white/10"
                    >
                      ⚙ Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={logout}
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-left text-red-300 hover:bg-red-500/10"
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMenus}
                  className="mt-2 rounded-full bg-[#c78b55] px-5 py-3 text-center"
                >
                  Login
                </Link>
              )}

              <Link
                to="/menu"
                onClick={closeMenus}
                className="mt-2 rounded-full bg-[#c78b55] px-5 py-3 text-center"
              >
                Order Now
              </Link>

            </div>
          </div>
        )}

      </div>
    </header>
  );
};

export default Navbar;
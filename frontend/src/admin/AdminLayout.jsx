import React, { useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Tags,
  Gift,
  Users,
  MessageSquare,
  Menu,
  X,
  ExternalLink,
  LogOut,
  Coffee,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const adminLinks = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Orders",
      path: "/admin/orders",
      icon: ShoppingBag,
    },
    {
      label: "Menu",
      path: "/admin/menu",
      icon: UtensilsCrossed,
    },
    {
      label: "Categories",
      path: "/admin/categories",
      icon: Tags,
    },
    {
      label: "Rewards",
      path: "/admin/rewards",
      icon: Gift,
    },
    {
      label: "Customers",
      path: "/admin/customers",
      icon: Users,
    },
    {
      label: "Messages",
      path: "/admin/messages",
      icon: MessageSquare,
    },
  ];

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) return;

    localStorage.removeItem("agarwals-cafe-token");
    localStorage.removeItem("agarwals-cafe-user");

    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f4ef]">

      {/* =========================
          MOBILE TOP BAR
      ========================= */}

      <div className="fixed left-0 right-0 top-0 z-40 flex h-[72px] items-center justify-between border-b border-[#e3dad2] bg-[#3b2920] px-4 shadow-sm lg:hidden">

        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-xl p-2 text-white transition hover:bg-white/10"
        >
          <Menu size={23} />
        </button>

        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 text-white"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9b08f] text-[#3b2920]">
            <Coffee size={18} />
          </div>

          <div className="text-left">
            <p className="font-serif text-base font-semibold leading-none">
              Agarwal's
            </p>

            <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-[#d9c4b5]">
              Admin
            </p>
          </div>
        </button>

        <div className="w-9" />
      </div>

      {/* =========================
          MOBILE OVERLAY
      ========================= */}

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-[270px] flex-col bg-[#3b2920] text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* BRAND */}

        <div className="flex h-[88px] items-center justify-between border-b border-white/10 px-5">

          <button
            onClick={() => handleNavigation("/admin")}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d9b08f] text-[#3b2920]">
              <Coffee size={21} />
            </div>

            <div>
              <p className="font-serif text-xl font-semibold">
                Agarwal's Cafe
              </p>

              <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-[#d8c4b6]">
                Admin Panel
              </p>
            </div>
          </button>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-[#d8c4b6] hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>

        </div>

        {/* NAVIGATION */}

        <div className="flex-1 overflow-y-auto px-4 py-6">

          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#bca698]">
            Management
          </p>

          <nav className="space-y-1.5">

            {adminLinks.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/admin"}
                  onClick={() =>
                    setSidebarOpen(false)
                  }
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-[#d9b08f] text-[#3b2920] shadow-sm"
                        : "text-[#d9cbc2] hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <Icon size={18} />

                  <span>{item.label}</span>
                </NavLink>
              );
            })}

          </nav>

          {/* WEBSITE */}

          <div className="mt-8 border-t border-white/10 pt-6">

            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#bca698]">
              Website
            </p>

            <button
              onClick={() => {
                navigate("/");
                setSidebarOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#d9cbc2] transition hover:bg-white/10 hover:text-white"
            >
              <ExternalLink size={18} />

              <span>View Website</span>
            </button>

          </div>

        </div>

        {/* BOTTOM */}

        <div className="border-t border-white/10 p-4">

          <div className="mb-3 rounded-xl bg-white/5 p-3">
            <p className="text-xs font-medium text-[#d9cbc2]">
              Logged in as
            </p>

            <p className="mt-1 truncate text-sm font-semibold text-white">
              Admin
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-200 transition hover:bg-red-500/10 hover:text-red-100"
          >
            <LogOut size={18} />

            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="min-h-screen lg:ml-[270px]">
        {children}
      </main>

    </div>
  );
};

export default AdminLayout;
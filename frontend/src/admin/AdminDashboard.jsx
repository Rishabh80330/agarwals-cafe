import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  Tags,
  Gift,
  MessageSquare,
  RefreshCw,
  ArrowRight,
  Clock3,
  CheckCircle2,
  IndianRupee,
  TrendingUp,
  Award,
  PackageCheck,
  CircleAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboardData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const results = await Promise.allSettled([
        api.get("/orders"),
        api.get("/users"),
        api.get("/menu"),
        api.get("/categories"),
        api.get("/rewards"),
        api.get("/contact"),
      ]);

      const [
        ordersResponse,
        customersResponse,
        menuResponse,
        categoriesResponse,
        rewardsResponse,
        messagesResponse,
      ] = results;

      if (ordersResponse.status === "fulfilled") {
        setOrders(ordersResponse.value.data.orders || []);
      }

      if (customersResponse.status === "fulfilled") {
        setCustomers(
          customersResponse.value.data.users || []
        );
      }

      if (menuResponse.status === "fulfilled") {
        setMenuItems(
          menuResponse.value.data.menuItems || []
        );
      }

      if (categoriesResponse.status === "fulfilled") {
        setCategories(
          categoriesResponse.value.data.categories || []
        );
      }

      if (rewardsResponse.status === "fulfilled") {
        setRewards(
          rewardsResponse.value.data.rewards || []
        );
      }

      if (messagesResponse.status === "fulfilled") {
        setMessages(
          messagesResponse.value.data.messages || []
        );
      }

      const failedRequests = results.filter(
        (result) => result.status === "rejected"
      );

      if (failedRequests.length === results.length) {
        setError("Failed to load dashboard data.");
      }
    } catch (error) {
      console.error("Dashboard error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /* =========================
     DATE
  ========================= */

  const today = new Date();

  const isToday = (date) => {
    if (!date) return false;

    const itemDate = new Date(date);

    return (
      itemDate.getDate() === today.getDate() &&
      itemDate.getMonth() === today.getMonth() &&
      itemDate.getFullYear() === today.getFullYear()
    );
  };

  /* =========================
     ORDER STATS
  ========================= */

  const stats = useMemo(() => {
    const todayOrders = orders.filter((order) =>
      isToday(order.createdAt)
    );

    const completedOrders = orders.filter(
      (order) => order.orderStatus === "completed"
    );

    const activeOrders = orders.filter(
      (order) =>
        !["completed", "cancelled"].includes(
          order.orderStatus
        )
    );

    const todayCompletedOrders = todayOrders.filter(
      (order) => order.orderStatus === "completed"
    );

    const todaySales = todayCompletedOrders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    const completedSales = completedOrders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    const activeOrderValue = activeOrders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    const averageOrderValue =
      completedOrders.length > 0
        ? completedSales / completedOrders.length
        : 0;

    const totalLoyaltyPoints = customers.reduce(
      (sum, customer) =>
        sum + Number(customer.loyaltyPoints || 0),
      0
    );

    const newMessages = messages.filter(
      (message) => message.status === "new"
    ).length;

    return {
      todayOrders: todayOrders.length,
      todaySales,
      activeOrders: activeOrders.length,
      activeOrderValue,
      completedOrders: completedOrders.length,
      completedSales,
      averageOrderValue,
      totalLoyaltyPoints,
      newMessages,
    };
  }, [orders, customers, messages]);

  /* =========================
     MENU STATS
  ========================= */

  const menuStats = useMemo(() => {
    const available = menuItems.filter(
      (item) => item.isAvailable
    ).length;

    const unavailable = menuItems.filter(
      (item) => !item.isAvailable
    ).length;

    const featured = menuItems.filter(
      (item) => item.featured
    ).length;

    return {
      total: menuItems.length,
      available,
      unavailable,
      featured,
    };
  }, [menuItems]);

  /* =========================
     RECENT ORDERS
  ========================= */

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 5);
  }, [orders]);

  /* =========================
     HELPERS
  ========================= */

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 0,
      }
    )}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    const styles = {
      placed:
        "bg-amber-50 text-amber-700 border-amber-200",
      confirmed:
        "bg-blue-50 text-blue-700 border-blue-200",
      preparing:
        "bg-orange-50 text-orange-700 border-orange-200",
      ready:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      completed:
        "bg-green-50 text-green-700 border-green-200",
      cancelled:
        "bg-red-50 text-red-700 border-red-200",
    };

    return (
      styles[status] ||
      "bg-gray-50 text-gray-600 border-gray-200"
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f4ef] px-4 pb-10 pt-36 sm:px-6 sm:pt-40 lg:px-8 lg:pt-40">
      <div className="mx-auto max-w-7xl">

        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <LayoutDashboard
                size={16}
                className="text-[#9a6b45]"
              />

              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9a6b45]">
                Admin Dashboard
              </p>
            </div>

            <h1 className="font-serif text-3xl font-semibold text-[#2f211a] sm:text-4xl">
              Welcome back
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#75675f]">
              Manage Agarwal's Cafe operations from one place.
            </p>
          </div>

          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#ded4cb] bg-white px-4 py-3 text-sm font-semibold text-[#3a2a21] shadow-sm transition hover:bg-[#faf8f5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            Refresh Dashboard
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <CircleAlert size={18} />

            <span>{error}</span>
          </div>
        )}

        {/* =========================
            TOP STATS
        ========================= */}

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <DashboardStat
            label="Today's Orders"
            value={stats.todayOrders}
            icon={ShoppingBag}
          />

          <DashboardStat
            label="Today's Sales"
            value={formatCurrency(stats.todaySales)}
            icon={IndianRupee}
          />

          <DashboardStat
            label="Active Orders"
            value={stats.activeOrders}
            icon={Clock3}
          />

          <DashboardStat
            label="Customers"
            value={customers.length}
            icon={Users}
          />

        </div>

        {/* =========================
            SALES + ORDER OVERVIEW
        ========================= */}

        <div className="mb-8 grid gap-6 lg:grid-cols-3">

          <div className="rounded-2xl border border-[#e3dad2] bg-white p-6 shadow-sm lg:col-span-2">

            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a6b45]">
                  Business Overview
                </p>

                <h2 className="mt-1 font-serif text-2xl font-semibold text-[#33251e]">
                  Sales & Orders
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4ede7] text-[#9a6b45]">
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">

              <OverviewItem
                label="Completed Sales"
                value={formatCurrency(
                  stats.completedSales
                )}
                icon={IndianRupee}
              />

              <OverviewItem
                label="Completed Orders"
                value={stats.completedOrders}
                icon={CheckCircle2}
              />

              <OverviewItem
                label="Average Order"
                value={formatCurrency(
                  stats.averageOrderValue
                )}
                icon={TrendingUp}
              />

              <OverviewItem
                label="Active Order Value"
                value={formatCurrency(
                  stats.activeOrderValue
                )}
                icon={PackageCheck}
              />

            </div>
          </div>

          {/* LOYALTY */}

          <div className="rounded-2xl bg-[#3b2920] p-6 text-white shadow-sm">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d8b79c]">
                  Loyalty
                </p>

                <h2 className="mt-1 font-serif text-2xl font-semibold">
                  Rewards
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <Award size={20} />
              </div>
            </div>

            <div className="mt-8">

              <p className="text-sm text-[#d6c7bd]">
                Total customer points
              </p>

              <p className="mt-1 text-3xl font-semibold">
                {stats.totalLoyaltyPoints.toLocaleString(
                  "en-IN"
                )}
              </p>

            </div>

            <div className="mt-6 border-t border-white/10 pt-5">

              <div className="flex items-center justify-between">
                <span className="text-sm text-[#d6c7bd]">
                  Active rewards
                </span>

                <span className="font-semibold">
                  {
                    rewards.filter(
                      (reward) => reward.isActive
                    ).length
                  }
                </span>
              </div>

            </div>

            <button
              onClick={() => navigate("/admin/rewards")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#3b2920] transition hover:bg-[#f7f2ee]"
            >
              Manage Rewards
              <ArrowRight size={16} />
            </button>

          </div>

        </div>

        {/* =========================
            MANAGEMENT
        ========================= */}

        <div className="mb-8">

          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a6b45]">
              Management
            </p>

            <h2 className="mt-1 font-serif text-2xl font-semibold text-[#33251e]">
              Cafe Operations
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            <ManagementCard
              icon={UtensilsCrossed}
              title="Menu Management"
              description={`${menuStats.total} menu items • ${menuStats.available} available`}
              action="Manage Menu"
              onClick={() => navigate("/admin/menu")}
            />

            <ManagementCard
              icon={Tags}
              title="Categories"
              description={`${categories.length} categories available`}
              action="Manage Categories"
              onClick={() =>
                navigate("/admin/categories")
              }
            />

            <ManagementCard
              icon={ShoppingBag}
              title="Orders"
              description={`${stats.activeOrders} active orders`}
              action="Manage Orders"
              onClick={() => navigate("/admin/orders")}
            />

            <ManagementCard
              icon={Users}
              title="Customers"
              description={`${customers.length} registered customers`}
              action="View Customers"
              onClick={() =>
                navigate("/admin/customers")
              }
            />

            <ManagementCard
              icon={Gift}
              title="Rewards"
              description={`${
                rewards.filter(
                  (reward) => reward.isActive
                ).length
              } active rewards`}
              action="Manage Rewards"
              onClick={() =>
                navigate("/admin/rewards")
              }
            />

            {/* CUSTOMER MESSAGES */}

            <ManagementCard
              icon={MessageSquare}
              title="Customer Messages"
              description={
                stats.newMessages > 0
                  ? `${stats.newMessages} new message${
                      stats.newMessages > 1
                        ? "s"
                        : ""
                    } waiting`
                  : "No new customer messages"
              }
              action="View Messages"
              badge={`${stats.newMessages} New`}
              onClick={() =>
                navigate("/admin/messages")
              }
            />

          </div>
        </div>

        {/* =========================
            MENU OVERVIEW
        ========================= */}

        <div className="mb-8 rounded-2xl border border-[#e3dad2] bg-white p-6 shadow-sm">

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a6b45]">
                Menu Operations
              </p>

              <h2 className="mt-1 font-serif text-2xl font-semibold text-[#33251e]">
                Menu Overview
              </h2>
            </div>

            <button
              onClick={() => navigate("/admin/menu")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#9a6b45] hover:text-[#6f4930]"
            >
              Manage Menu
              <ArrowRight size={16} />
            </button>

          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

            <SmallStat
              label="Total Items"
              value={menuStats.total}
            />

            <SmallStat
              label="Available"
              value={menuStats.available}
            />

            <SmallStat
              label="Unavailable"
              value={menuStats.unavailable}
            />

            <SmallStat
              label="Featured"
              value={menuStats.featured}
            />

          </div>

        </div>

        {/* =========================
            RECENT ORDERS
        ========================= */}

        <div className="rounded-2xl border border-[#e3dad2] bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-[#eee7e1] p-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a6b45]">
                Recent Activity
              </p>

              <h2 className="mt-1 font-serif text-2xl font-semibold text-[#33251e]">
                Recent Orders
              </h2>
            </div>

            <button
              onClick={() => navigate("/admin/orders")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#9a6b45] hover:text-[#6f4930]"
            >
              View All Orders
              <ArrowRight size={16} />
            </button>

          </div>

          {loading ? (
            <div className="p-10 text-center">

              <RefreshCw
                size={26}
                className="mx-auto mb-3 animate-spin text-[#9a6b45]"
              />

              <p className="text-sm text-[#75675f]">
                Loading recent orders...
              </p>

            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-10 text-center">

              <ShoppingBag
                size={28}
                className="mx-auto mb-3 text-[#b3a49a]"
              />

              <p className="font-medium text-[#51433b]">
                No orders yet
              </p>

              <p className="mt-1 text-sm text-[#887970]">
                New orders will appear here.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-[#eee7e1]">

              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex flex-col gap-4 p-5 transition hover:bg-[#fdfbf9] sm:flex-row sm:items-center sm:justify-between"
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f4ede7] text-[#9a6b45]">
                      <ShoppingBag size={19} />
                    </div>

                    <div>

                      <p className="font-semibold text-[#33251e]">
                        #{order.orderNumber}
                      </p>

                      <p className="mt-1 text-xs text-[#887970]">
                        {order.items?.length || 0} item
                        {order.items?.length === 1
                          ? ""
                          : "s"}{" "}
                        • {formatDate(order.createdAt)}
                      </p>

                    </div>

                  </div>

                  <div className="flex items-center justify-between gap-5 sm:justify-end">

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>

                    <p className="min-w-[75px] text-right font-semibold text-[#33251e]">
                      {formatCurrency(order.total)}
                    </p>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};


/* =========================
   DASHBOARD STAT
========================= */

const DashboardStat = ({
  label,
  value,
  icon: Icon,
}) => {
  return (
    <div className="rounded-2xl border border-[#e3dad2] bg-white p-4 shadow-sm sm:p-5">

      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4ede7] text-[#9a6b45]">
        <Icon size={19} />
      </div>

      <p className="text-xs font-medium text-[#887970]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold text-[#30221b]">
        {value}
      </p>

    </div>
  );
};


/* =========================
   OVERVIEW ITEM
========================= */

const OverviewItem = ({
  label,
  value,
  icon: Icon,
}) => {
  return (
    <div className="rounded-xl border border-[#eee7e1] bg-[#fcfaf8] p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f4ede7] text-[#9a6b45]">
          <Icon size={17} />
        </div>

        <div>
          <p className="text-xs text-[#887970]">
            {label}
          </p>

          <p className="mt-1 text-lg font-semibold text-[#33251e]">
            {value}
          </p>
        </div>

      </div>

    </div>
  );
};


/* =========================
   MANAGEMENT CARD
========================= */

const ManagementCard = ({
  icon: Icon,
  title,
  description,
  action,
  badge,
  onClick,
}) => {
  return (
    <div className="rounded-2xl border border-[#e3dad2] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">

      <div className="flex items-start justify-between gap-4">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4ede7] text-[#9a6b45]">
          <Icon size={20} />
        </div>

        {badge && (
          <span className="rounded-full bg-[#f4ede7] px-3 py-1 text-xs font-semibold text-[#9a6b45]">
            {badge}
          </span>
        )}

      </div>

      <h3 className="mt-5 font-serif text-xl font-semibold text-[#33251e]">
        {title}
      </h3>

      <p className="mt-1 min-h-[40px] text-sm leading-5 text-[#75675f]">
        {description}
      </p>

      <button
        onClick={onClick}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#9a6b45] transition hover:text-[#6f4930]"
      >
        {action}
        <ArrowRight size={16} />
      </button>

    </div>
  );
};


/* =========================
   SMALL STAT
========================= */

const SmallStat = ({ label, value }) => {
  return (
    <div className="rounded-xl border border-[#eee7e1] bg-[#fcfaf8] p-4">

      <p className="text-xs text-[#887970]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold text-[#33251e]">
        {value}
      </p>

    </div>
  );
};

export default AdminDashboard;
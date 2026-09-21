import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Star,
  UserRound,
  Users,
  LoaderCircle,
  CalendarDays,
  Award,
  UserCheck,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("en-IN");
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdminCustomers = () => {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const fetchCustomers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setSuccess("");

      const response = await api.get("/users");

      setUsers(response.data.users || []);

      if (isRefresh) {
        setSuccess("Customer list refreshed successfully.");
      }
    } catch (err) {
      console.error("Customers fetch error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load customers. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return [...users].sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );
    }

    return users
      .filter((user) => {
        const name = user.name?.toLowerCase() || "";
        const email = user.email?.toLowerCase() || "";
        const phone = user.phone?.toLowerCase() || "";

        return (
          name.includes(query) ||
          email.includes(query) ||
          phone.includes(query)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );
  }, [users, search]);

  const stats = useMemo(() => {
    const totalCustomers = users.length;

    const totalPoints = users.reduce(
      (total, user) =>
        total + Number(user.loyaltyPoints || 0),
      0
    );

    const customersWithPhone = users.filter(
      (user) => user.phone?.trim()
    ).length;

    const customersWithPoints = users.filter(
      (user) => Number(user.loyaltyPoints || 0) > 0
    ).length;

    const averagePoints =
      totalCustomers > 0
        ? Math.round(totalPoints / totalCustomers)
        : 0;

    return {
      totalCustomers,
      totalPoints,
      customersWithPhone,
      customersWithPoints,
      averagePoints,
    };
  }, [users]);

  const recentCustomers = useMemo(() => {
    return [...users]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      )
      .slice(0, 5);
  }, [users]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f5ef] px-4">
        <div className="text-center">
          <LoaderCircle
            size={38}
            className="mx-auto animate-spin text-[#8c624a]"
          />

          <p className="mt-4 text-sm font-medium text-[#5f5146]">
            Loading customers...
          </p>

          <p className="mt-1 text-xs text-[#8b7b6d]">
            Please wait a moment.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f5ef] text-[#2d211b]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#e4d9cc] bg-[#f8f5ef]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/admin"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#ded3c6] bg-white text-[#4b3327] transition hover:bg-[#f2ece4]"
            >
              <ArrowLeft size={18} />
            </Link>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a7258] sm:text-xs">
                Admin Panel
              </p>

              <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
                Customers
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => fetchCustomers(true)}
              disabled={refreshing}
              className="flex h-10 items-center gap-2 rounded-xl border border-[#ded3c6] bg-white px-3 text-sm font-medium text-[#4b3327] transition hover:bg-[#f2ece4] disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing ? "animate-spin" : ""
                }
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            <Link
              to="/admin"
              className="hidden h-10 items-center gap-2 rounded-xl bg-[#3b281f] px-4 text-sm font-medium text-white transition hover:bg-[#2d1f18] sm:flex"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p>{error}</p>

            <button
              onClick={() => setError("")}
              className="shrink-0"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <div className="flex items-center gap-2">
              <UserCheck size={17} />
              <p>{success}</p>
            </div>

            <button
              onClick={() => setSuccess("")}
              className="shrink-0"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Intro */}
        <section className="mb-7">
          <div className="mb-2 flex items-center gap-2 text-[#9a7258]">
            <Users size={18} />

            <span className="text-sm font-medium">
              Customer Management
            </span>
          </div>

          <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Your Customers
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#75665c]">
            View customer information, loyalty points and
            registration details from one place.
          </p>
        </section>

        {/* Stats */}
        <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            icon={<Users size={18} />}
            label="Total Customers"
            value={formatNumber(
              stats.totalCustomers
            )}
          />

          <StatCard
            icon={
              <Star
                size={18}
                fill="currentColor"
              />
            }
            label="Points Issued"
            value={formatNumber(
              stats.totalPoints
            )}
          />

          <StatCard
            icon={<Award size={18} />}
            label="Customers With Points"
            value={formatNumber(
              stats.customersWithPoints
            )}
          />

          <StatCard
            icon={<Phone size={18} />}
            label="With Phone"
            value={formatNumber(
              stats.customersWithPhone
            )}
          />

          <StatCard
            icon={<Star size={18} />}
            label="Avg. Points"
            value={formatNumber(
              stats.averagePoints
            )}
          />
        </section>

        {/* Search */}
        <section className="mb-6 rounded-3xl border border-[#e4d9cc] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xl">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a8a7f]"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by name, email or phone..."
                className="w-full rounded-xl border border-[#ded3c6] bg-[#fffdfa] py-3 pl-10 pr-10 text-sm outline-none transition placeholder:text-[#aa9b90] focus:border-[#9a7258] focus:ring-2 focus:ring-[#9a7258]/10"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b7b6d] hover:text-[#4b3327]"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="text-sm text-[#75665c]">
              Showing{" "}
              <span className="font-semibold text-[#2d211b]">
                {filteredUsers.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#2d211b]">
                {users.length}
              </span>{" "}
              customers
            </div>
          </div>
        </section>

        {/* Recent customers */}
        {!search && recentCustomers.length > 0 && (
          <section className="mb-7">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Recently Joined
                </h3>

                <p className="mt-1 text-xs text-[#81736a]">
                  Latest customer registrations
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {recentCustomers.map((user) => (
                <div
                  key={user._id}
                  className="rounded-2xl border border-[#e4d9cc] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3eae1] text-[#8c624a]">
                      <UserRound size={17} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {user.name}
                      </p>

                      <p className="mt-1 text-[11px] text-[#8b7b6d]">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-[#75665c]">
                    <Star
                      size={13}
                      className="text-[#a76d3e]"
                      fill="currentColor"
                    />

                    <span>
                      {formatNumber(
                        user.loyaltyPoints || 0
                      )}{" "}
                      points
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Customer list */}
        <section>
          {filteredUsers.length === 0 ? (
            <div className="rounded-3xl border border-[#e4d9cc] bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f3eae1] text-[#8c624a]">
                <UserRound size={28} />
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                {users.length === 0
                  ? "No customers yet"
                  : "No customers found"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#81736a]">
                {users.length === 0
                  ? "Customer accounts will appear here once people register on your cafe website."
                  : "Try changing your search to find another customer."}
              </p>

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-5 rounded-xl border border-[#ded3c6] px-5 py-3 text-sm font-semibold text-[#5c4b41] transition hover:bg-[#f8f5ef]"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-[#e4d9cc] bg-white shadow-sm">
              {/* Desktop Header */}
              <div className="hidden grid-cols-[2fr_2fr_1fr_1.2fr_1fr] gap-4 border-b border-[#eee6dd] bg-[#faf7f3] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#81736a] md:grid">
                <span>Customer</span>
                <span>Contact</span>
                <span>Points</span>
                <span>Joined</span>
                <span>Status</span>
              </div>

              <div className="divide-y divide-[#eee6dd]">
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="px-5 py-5 transition hover:bg-[#fcfaf7] sm:px-6"
                  >
                    {/* Desktop */}
                    <div className="hidden grid-cols-[2fr_2fr_1fr_1.2fr_1fr] items-center gap-4 md:grid">
                      {/* Customer */}
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f3eae1] text-[#8c624a]">
                          <UserRound size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#2d211b]">
                            {user.name}
                          </p>

                          <p className="mt-1 text-xs text-[#9b8b7c]">
                            Customer
                          </p>
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-sm text-[#5f5146]">
                          <Mail
                            size={14}
                            className="shrink-0 text-[#a76d3e]"
                          />

                          <span className="truncate">
                            {user.email}
                          </span>
                        </div>

                        {user.phone && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-[#8b7b6d]">
                            <Phone size={13} />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Points */}
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5eee6] text-[#a76d3e]">
                          <Star
                            size={14}
                            fill="currentColor"
                          />
                        </div>

                        <div>
                          <p className="font-semibold text-[#2d211b]">
                            {formatNumber(
                              user.loyaltyPoints || 0
                            )}
                          </p>

                          <p className="text-[10px] text-[#9b8b7c]">
                            points
                          </p>
                        </div>
                      </div>

                      {/* Joined */}
                      <div>
                        <div className="flex items-center gap-2 text-sm text-[#75665c]">
                          <CalendarDays size={14} />

                          <span>
                            {formatDate(
                              user.createdAt
                            )}
                          </span>
                        </div>

                        <p className="mt-1 text-[10px] text-[#a09084]">
                          {formatDateTime(
                            user.createdAt
                          )}
                        </p>
                      </div>

                      {/* Status */}
                      <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        Active
                      </span>
                    </div>

                    {/* Mobile */}
                    <div className="md:hidden">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f3eae1] text-[#8c624a]">
                          <UserRound size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-semibold text-[#2d211b]">
                                {user.name}
                              </h3>

                              <p className="mt-1 truncate text-xs text-[#8b7b6d]">
                                {user.email}
                              </p>
                            </div>

                            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                              Active
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-[#faf7f3] p-3">
                              <p className="text-[10px] uppercase tracking-wider text-[#9b8b7c]">
                                Loyalty Points
                              </p>

                              <div className="mt-1 flex items-center gap-1.5">
                                <Star
                                  size={14}
                                  className="text-[#a76d3e]"
                                  fill="currentColor"
                                />

                                <span className="text-sm font-semibold text-[#2d211b]">
                                  {formatNumber(
                                    user.loyaltyPoints ||
                                      0
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="rounded-xl bg-[#faf7f3] p-3">
                              <p className="text-[10px] uppercase tracking-wider text-[#9b8b7c]">
                                Joined
                              </p>

                              <p className="mt-1 text-sm font-medium text-[#2d211b]">
                                {formatDate(
                                  user.createdAt
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 space-y-2">
                            {user.phone && (
                              <div className="flex items-center gap-2 text-xs text-[#75665c]">
                                <Phone size={13} />
                                <span>{user.phone}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-xs text-[#75665c]">
                              <CalendarDays size={13} />
                              <span>
                                Joined{" "}
                                {formatDateTime(
                                  user.createdAt
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-[#e4d9cc] bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4eee7] text-[#8c624a]">
        {icon}
      </div>

      <p className="text-xs font-medium text-[#81736a]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight text-[#30231c]">
        {value}
      </p>
    </div>
  );
}

export default AdminCustomers;
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Clock3,
  CreditCard,
  LoaderCircle,
  PackageCheck,
  RefreshCw,
  Search,
  ShoppingBag,
  UserRound,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

const STATUS_OPTIONS = [
  "placed",
  "confirmed",
  "preparing",
  "ready",
  "completed",
  "cancelled",
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/orders");

      setOrders(response.data.orders || []);
    } catch (err) {
      console.error("Orders error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);

      await api.put(`/orders/${orderId}/status`, {
        orderStatus: newStatus,
      });

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? { ...order, orderStatus: newStatus }
            : order
        )
      );
    } catch (err) {
      console.error("Status update error:", err);

      alert(
        err.response?.data?.message ||
          "Unable to update order status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatStatus = (status) => {
    if (!status) return "";

    return status
      .replace("-", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatOrderType = (type) => {
    if (!type) return "";

    return type
      .replace("-", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700";

      case "cancelled":
        return "bg-red-50 text-red-700";

      case "ready":
        return "bg-blue-50 text-blue-700";

      case "preparing":
        return "bg-orange-50 text-orange-700";

      case "confirmed":
        return "bg-purple-50 text-purple-700";

      default:
        return "bg-[#f8f0e7] text-[#a76d3e]";
    }
  };

  const getPaymentClass = (status) => {
    switch (status) {
      case "paid":
        return "text-green-600";

      case "failed":
        return "text-red-600";

      default:
        return "text-[#a76d3e]";
    }
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.orderNumber?.toLowerCase().includes(query) ||
        order.user?.name?.toLowerCase().includes(query) ||
        order.user?.email?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        order.orderStatus === statusFilter;

      const matchesType =
        typeFilter === "all" ||
        order.orderType === typeFilter;

      const matchesPayment =
        paymentFilter === "all" ||
        order.paymentStatus === paymentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesPayment
      );
    });
  }, [
    orders,
    search,
    statusFilter,
    typeFilter,
    paymentFilter,
  ]);

  const stats = useMemo(() => {
    const totalRevenue = orders
      .filter((order) => order.orderStatus !== "cancelled")
      .reduce(
        (total, order) => total + Number(order.total || 0),
        0
      );

    return {
      total: orders.length,

      active: orders.filter(
        (order) =>
          !["completed", "cancelled"].includes(
            order.orderStatus
          )
      ).length,

      completed: orders.filter(
        (order) => order.orderStatus === "completed"
      ).length,

      revenue: totalRevenue,
    };
  }, [orders]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f0e9] px-4 pt-24">
        <div className="flex flex-col items-center">
          <LoaderCircle
            size={36}
            className="animate-spin text-[#a76d3e]"
          />

          <p className="mt-4 text-sm text-[#75685d]">
            Loading orders...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f0e9] pt-24 sm:pt-28">
      {/* HEADER */}

      <header className="border-b border-[#ded3c6] bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-5 lg:px-8">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a76d3e] sm:text-xs">
              Agarwal's Cafe
            </p>

            <h1 className="mt-1 font-serif text-2xl text-[#2b2118] sm:text-3xl md:text-4xl">
              Orders
            </h1>

            <p className="mt-1 text-xs text-[#8b7b6d] sm:text-sm">
              Manage customer orders and order status.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-2 rounded-full border border-[#ded3c6] px-3 py-2.5 text-sm text-[#5f5146] transition hover:bg-[#f8f4ee] sm:px-4"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            <Link
              to="/admin"
              className="flex items-center gap-2 rounded-full bg-[#2b2118] px-4 py-2.5 text-sm text-white transition hover:bg-[#3b2c20]"
            >
              <ArrowLeft size={16} />

              <span className="hidden sm:inline">
                Dashboard
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}

      <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-5 sm:py-8 lg:px-8">
        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* STATS */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.5rem] bg-[#2b2118] p-5 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#cbb8a8]">
                  Total Orders
                </p>

                <p className="mt-2 font-serif text-3xl">
                  {stats.total}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#a76d3e]">
                <ClipboardList size={20} />
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8b7b6d]">
                  Active Orders
                </p>

                <p className="mt-2 font-serif text-3xl text-[#2b2118]">
                  {stats.active}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f8f0e7] text-[#a76d3e]">
                <Clock3 size={20} />
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8b7b6d]">
                  Completed
                </p>

                <p className="mt-2 font-serif text-3xl text-[#2b2118]">
                  {stats.completed}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-green-600">
                <CheckCircle2 size={20} />
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8b7b6d]">
                  Order Value
                </p>

                <p className="mt-2 font-serif text-3xl text-[#2b2118]">
                  ₹{stats.revenue.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eee5d9] text-[#a76d3e]">
                <CreditCard size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS */}

        <div className="mt-7 rounded-[1.5rem] bg-white p-4 shadow-sm sm:p-5">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b8b7c]"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order number, customer or email..."
              className="w-full rounded-xl border border-[#ded3c6] bg-[#faf7f3] py-3.5 pl-12 pr-4 text-sm text-[#2b2118] outline-none transition focus:border-[#a76d3e] focus:ring-2 focus:ring-[#c78b55]/10"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-[#ded3c6] bg-[#faf7f3] px-4 py-3 text-sm text-[#5f5146] outline-none focus:border-[#a76d3e]"
            >
              <option value="all">All Statuses</option>

              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-[#ded3c6] bg-[#faf7f3] px-4 py-3 text-sm text-[#5f5146] outline-none focus:border-[#a76d3e]"
            >
              <option value="all">All Order Types</option>
              <option value="dine-in">Dine In</option>
              <option value="takeaway">Takeaway</option>
              <option value="delivery">Delivery</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) =>
                setPaymentFilter(e.target.value)
              }
              className="w-full rounded-xl border border-[#ded3c6] bg-[#faf7f3] px-4 py-3 text-sm text-[#5f5146] outline-none focus:border-[#a76d3e]"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* RESULT COUNT */}

        <div className="mb-4 mt-7 flex items-center justify-between">
          <p className="text-sm text-[#75685d]">
            Showing{" "}
            <span className="font-semibold text-[#2b2118]">
              {filteredOrders.length}
            </span>{" "}
            order
            {filteredOrders.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* EMPTY */}

        {filteredOrders.length === 0 ? (
          <div className="rounded-[1.5rem] bg-white px-5 py-14 text-center shadow-sm sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eee5d9] text-[#a76d3e]">
              <ClipboardList size={28} />
            </div>

            <h2 className="mt-5 font-serif text-2xl text-[#2b2118]">
              No orders found
            </h2>

            <p className="mt-2 text-sm text-[#75685d]">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP */}

            <div className="hidden overflow-hidden rounded-[1.5rem] bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left">
                  <thead className="border-b border-[#eee5d9] bg-[#faf7f3]">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#8b7b6d]">
                        Order
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#8b7b6d]">
                        Customer
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#8b7b6d]">
                        Items
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#8b7b6d]">
                        Type
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#8b7b6d]">
                        Amount
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#8b7b6d]">
                        Payment
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#8b7b6d]">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#eee5d9]">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="transition hover:bg-[#fcfaf7]"
                      >
                        {/* ORDER */}

                        <td className="px-6 py-5">
                          <p className="font-semibold text-[#2b2118]">
                            {order.orderNumber}
                          </p>

                          <p className="mt-1 text-xs text-[#9b8b7c]">
                            {formatDateTime(order.createdAt)}
                          </p>
                        </td>

                        {/* CUSTOMER */}

                        <td className="px-6 py-5">
                          <p className="font-medium text-[#2b2118]">
                            {order.user?.name || "Guest"}
                          </p>

                          <p className="mt-1 max-w-[190px] truncate text-xs text-[#8b7b6d]">
                            {order.user?.email || "—"}
                          </p>
                        </td>

                        {/* ITEMS */}

                        <td className="px-6 py-5">
                          <div className="max-w-[220px] space-y-1">
                            {order.items
                              ?.slice(0, 2)
                              .map((item, index) => (
                                <p
                                  key={index}
                                  className="truncate text-sm text-[#5f5146]"
                                >
                                  {item.name} × {item.quantity}
                                </p>
                              ))}

                            {order.items?.length > 2 && (
                              <p className="text-xs text-[#a76d3e]">
                                +{order.items.length - 2} more
                              </p>
                            )}
                          </div>
                        </td>

                        {/* TYPE */}

                        <td className="px-6 py-5">
                          <span className="rounded-full bg-[#f8f0e7] px-3 py-1.5 text-xs font-medium text-[#a76d3e]">
                            {formatOrderType(order.orderType)}
                          </span>
                        </td>

                        {/* AMOUNT */}

                        <td className="px-6 py-5">
                          <p className="font-semibold text-[#2b2118]">
                            ₹
                            {Number(
                              order.total || 0
                            ).toLocaleString("en-IN")}
                          </p>
                        </td>

                        {/* PAYMENT */}

                        <td className="px-6 py-5">
                          <p className="text-sm capitalize text-[#5f5146]">
                            {order.paymentMethod || "—"}
                          </p>

                          <p
                            className={`mt-1 text-xs ${getPaymentClass(
                              order.paymentStatus
                            )}`}
                          >
                            {formatStatus(
                              order.paymentStatus
                            )}
                          </p>
                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-5">
                          <select
                            value={order.orderStatus}
                            disabled={
                              updatingId === order._id
                            }
                            onChange={(e) =>
                              updateStatus(
                                order._id,
                                e.target.value
                              )
                            }
                            className={`rounded-full border-0 px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-[#c78b55]/30 ${getStatusClass(
                              order.orderStatus
                            )}`}
                          >
                            {STATUS_OPTIONS.map(
                              (status) => (
                                <option
                                  key={status}
                                  value={status}
                                >
                                  {formatStatus(status)}
                                </option>
                              )
                            )}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MOBILE + TABLET */}

            <div className="grid gap-4 lg:hidden">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="rounded-[1.5rem] bg-white p-5 shadow-sm sm:p-6"
                >
                  {/* TOP */}

                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#2b2118]">
                        {order.orderNumber}
                      </p>

                      <p className="mt-1 text-xs text-[#9b8b7c]">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${getStatusClass(
                        order.orderStatus
                      )}`}
                    >
                      {formatStatus(order.orderStatus)}
                    </span>
                  </div>

                  {/* CUSTOMER */}

                  <div className="mt-5 border-t border-[#eee5d9] pt-4">
                    <div className="flex items-center gap-2">
                      <UserRound
                        size={16}
                        className="text-[#a76d3e]"
                      />

                      <p className="font-medium text-[#2b2118]">
                        {order.user?.name || "Guest"}
                      </p>
                    </div>

                    {order.user?.email && (
                      <p className="mt-1 pl-6 text-xs text-[#8b7b6d]">
                        {order.user.email}
                      </p>
                    )}
                  </div>

                  {/* ITEMS */}

                  <div className="mt-5">
                    <div className="flex items-center gap-2">
                      <ShoppingBag
                        size={16}
                        className="text-[#a76d3e]"
                      />

                      <p className="text-xs font-semibold uppercase tracking-wider text-[#9b8b7c]">
                        Items
                      </p>
                    </div>

                    <div className="mt-3 space-y-2">
                      {order.items?.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between gap-4 text-sm"
                        >
                          <span className="min-w-0 truncate text-[#5f5146]">
                            {item.name}
                          </span>

                          <span className="shrink-0 text-[#8b7b6d]">
                            × {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* DETAILS */}

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#faf7f3] p-3">
                      <p className="text-[10px] uppercase tracking-wider text-[#9b8b7c]">
                        Order Type
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#2b2118]">
                        {formatOrderType(order.orderType)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#faf7f3] p-3">
                      <p className="text-[10px] uppercase tracking-wider text-[#9b8b7c]">
                        Payment
                      </p>

                      <p className="mt-1 text-sm font-medium capitalize text-[#2b2118]">
                        {order.paymentMethod || "—"}
                      </p>

                      <p
                        className={`mt-0.5 text-xs ${getPaymentClass(
                          order.paymentStatus
                        )}`}
                      >
                        {formatStatus(
                          order.paymentStatus
                        )}
                      </p>
                    </div>
                  </div>

                  {/* TOTAL */}

                  <div className="mt-5 flex items-center justify-between border-t border-[#eee5d9] pt-4">
                    <span className="text-sm text-[#75685d]">
                      Total
                    </span>

                    <span className="font-serif text-2xl text-[#2b2118]">
                      ₹
                      {Number(
                        order.total || 0
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* STATUS */}

                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-medium text-[#75685d]">
                      Update Order Status
                    </label>

                    <select
                      value={order.orderStatus}
                      disabled={
                        updatingId === order._id
                      }
                      onChange={(e) =>
                        updateStatus(
                          order._id,
                          e.target.value
                        )
                      }
                      className={`w-full rounded-xl border-0 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-[#c78b55]/30 ${getStatusClass(
                        order.orderStatus
                      )}`}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {formatStatus(status)}
                        </option>
                      ))}
                    </select>

                    {updatingId === order._id && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-[#8b7b6d]">
                        <LoaderCircle
                          size={14}
                          className="animate-spin"
                        />

                        Updating...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default AdminOrders;
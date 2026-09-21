import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Store,
  Truck,
  UtensilsCrossed,
} from "lucide-react";

import api from "../services/api";

const STATUS_STEPS = [
  "placed",
  "confirmed",
  "preparing",
  "ready",
  "completed",
];

const STATUS_LABELS = {
  placed: "Order Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_DESCRIPTIONS = {
  placed: "We have received your order.",
  confirmed: "Your order has been confirmed.",
  preparing: "Our team is preparing your order.",
  ready: "Your order is ready.",
  completed: "Order completed. Enjoy!",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/orders/my-orders");

      setOrders(response.data.orders || []);
    } catch (err) {
      console.error("Orders fetch error:", err);

      if (err.response?.status === 401) {
        setError("Please login to view your orders.");
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load your orders."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const activeOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.orderStatus !== "completed" &&
        order.orderStatus !== "cancelled"
    );
  }, [orders]);

  const completedOrders = useMemo(() => {
    return orders.filter(
      (order) => order.orderStatus === "completed"
    );
  }, [orders]);

  const getStatusIndex = (status) => {
    return STATUS_STEPS.indexOf(status);
  };

  const formatStatus = (status) => {
    return STATUS_LABELS[status] || status;
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("en-IN");
  };

  const getOrderTypeIcon = (orderType) => {
    if (orderType === "delivery") return Truck;
    if (orderType === "dine-in") return UtensilsCrossed;

    return ShoppingBag;
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f4ee] px-5 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">

          <div className="mb-10">
            <div className="h-3 w-36 animate-pulse rounded-full bg-[#e5d9cc]" />
            <div className="mt-4 h-12 w-56 animate-pulse rounded-xl bg-[#e5d9cc]" />
            <div className="mt-4 h-4 w-80 max-w-full animate-pulse rounded-full bg-[#e5d9cc]" />
          </div>

          <div className="space-y-6">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm"
              >
                <div className="flex justify-between gap-5">
                  <div className="space-y-3">
                    <div className="h-3 w-24 animate-pulse rounded-full bg-[#e5d9cc]" />
                    <div className="h-7 w-40 animate-pulse rounded-lg bg-[#e5d9cc]" />
                  </div>

                  <div className="h-8 w-24 animate-pulse rounded-lg bg-[#e5d9cc]" />
                </div>

                <div className="mt-8 h-16 animate-pulse rounded-2xl bg-[#f3ede6]" />
                <div className="mt-5 h-16 animate-pulse rounded-2xl bg-[#f3ede6]" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <main className="min-h-screen bg-[#f8f4ee] px-5 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[65vh] max-w-xl items-center justify-center">

          <div className="w-full rounded-[2rem] bg-white p-10 text-center shadow-[0_15px_50px_rgba(61,43,31,0.07)] sm:p-14">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
              <PackageCheck size={34} />
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.3em] text-[#a76d3e]">
              Orders
            </p>

            <h1 className="mt-3 font-serif text-3xl text-[#2b2118]">
              {error}
            </h1>

            <p className="mt-4 text-sm leading-6 text-[#75685d]">
              Login to your account to view your order history.
            </p>

            <Link
              to="/login"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#2b2118] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#3b2c20]"
            >
              Login
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#f8f4ee] px-5 pb-24 pt-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-9">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a76d3e]">
                Your journey with us
              </p>

              <h1 className="mt-2 font-serif text-4xl text-[#2b2118] sm:text-5xl">
                My Orders
              </h1>

              <p className="mt-3 text-sm leading-6 text-[#75685d]">
                Keep track of your recent Agarwal&apos;s Cafe orders.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d8cabb] bg-white px-5 py-3 text-sm font-medium text-[#5f5146] transition hover:bg-[#eee5d9] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* =================================================
           STATS
        ================================================= */}

        {orders.length > 0 && (
          <div className="mb-8 grid gap-3 sm:grid-cols-3">

            <div className="rounded-2xl border border-[#eadfd3] bg-white p-5">
              <p className="text-xs uppercase tracking-wider text-[#9b8b7c]">
                Total Orders
              </p>

              <p className="mt-2 font-serif text-3xl text-[#2b2118]">
                {orders.length}
              </p>
            </div>

            <div className="rounded-2xl border border-[#eadfd3] bg-white p-5">
              <p className="text-xs uppercase tracking-wider text-[#9b8b7c]">
                Active Orders
              </p>

              <p className="mt-2 font-serif text-3xl text-[#a76d3e]">
                {activeOrders.length}
              </p>
            </div>

            <div className="rounded-2xl border border-[#eadfd3] bg-white p-5">
              <p className="text-xs uppercase tracking-wider text-[#9b8b7c]">
                Completed
              </p>

              <p className="mt-2 font-serif text-3xl text-[#2b2118]">
                {completedOrders.length}
              </p>
            </div>

          </div>
        )}

        {/* =================================================
           EMPTY
        ================================================= */}

        {orders.length === 0 && (
          <div className="rounded-[2rem] bg-white p-10 text-center shadow-[0_12px_40px_rgba(61,43,31,0.05)] sm:p-14">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#eee5d9] text-[#a76d3e]">
              <PackageCheck size={34} strokeWidth={1.7} />
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.25em] text-[#a76d3e]">
              Your table is waiting
            </p>

            <h2 className="mt-3 font-serif text-3xl text-[#2b2118]">
              No orders yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#75685d]">
              Your delicious first order is waiting. Explore our menu
              and discover your next favourite.
            </p>

            <Link
              to="/menu"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#2b2118] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#3b2c20]"
            >
              Explore Menu
              <ArrowRight size={17} />
            </Link>
          </div>
        )}

        {/* =================================================
           ORDERS
        ================================================= */}

        <div className="space-y-6">
          {orders.map((order) => {
            const currentStep = getStatusIndex(order.orderStatus);
            const OrderTypeIcon = getOrderTypeIcon(order.orderType);

            const isCancelled =
              order.orderStatus === "cancelled";

            return (
              <article
                key={order._id}
                className="overflow-hidden rounded-[2rem] border border-[#eadfd3] bg-white shadow-[0_10px_35px_rgba(61,43,31,0.05)]"
              >

                {/* ================= HEADER ================= */}

                <div className="border-b border-[#eee5d9] p-5 sm:p-6">

                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9b8b7c]">
                        Order number
                      </p>

                      <h2 className="mt-1 font-serif text-2xl text-[#2b2118]">
                        {order.orderNumber}
                      </h2>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#75685d]">

                        <span>
                          {formatDate(order.createdAt)}
                        </span>

                        <span className="text-[#c3b5a7]">
                          •
                        </span>

                        <span>
                          {formatTime(order.createdAt)}
                        </span>

                        <span className="text-[#c3b5a7]">
                          •
                        </span>

                        <span className="flex items-center gap-1 capitalize">
                          <OrderTypeIcon size={13} />
                          {order.orderType?.replace("-", " ")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-5 sm:block sm:text-right">

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9b8b7c]">
                          Total
                        </p>

                        <p className="mt-1 text-2xl font-semibold text-[#2b2118]">
                          ₹{formatPrice(order.total)}
                        </p>
                      </div>

                      <div
                        className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${
                          isCancelled
                            ? "bg-red-50 text-red-600"
                            : order.orderStatus === "completed"
                            ? "bg-green-50 text-green-700"
                            : "bg-[#f8f0e7] text-[#a76d3e]"
                        }`}
                      >
                        {formatStatus(order.orderStatus)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ================= ITEMS ================= */}

                <div className="space-y-4 p-5 sm:p-6">

                  {order.items?.map((item, index) => (
                    <div
                      key={
                        item.menuItem?._id ||
                        `${item.name}-${index}`
                      }
                      className="flex items-center gap-4"
                    >

                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#e8dfd4]">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[#9b8b7c]">
                            <ShoppingBag size={19} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#2b2118]">
                          {item.name}
                        </p>

                        <p className="mt-1 text-sm text-[#75685d]">
                          {item.quantity} × ₹
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      <p className="shrink-0 font-semibold text-[#2b2118]">
                        ₹
                        {formatPrice(
                          Number(item.price || 0) *
                            Number(item.quantity || 0)
                        )}
                      </p>
                    </div>
                  ))}

                </div>

                {/* ================= STATUS ================= */}

                {!isCancelled && (
                  <div className="border-t border-[#eee5d9] bg-[#fdfbf8] p-5 sm:p-6">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eee5d9] text-[#a76d3e]">
                        {order.orderStatus === "completed" ? (
                          <CheckCircle2 size={17} />
                        ) : (
                          <Clock3 size={17} />
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[#2b2118]">
                          {formatStatus(order.orderStatus)}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#75685d]">
                          {STATUS_DESCRIPTIONS[order.orderStatus] ||
                            "Your order status has been updated."}
                        </p>
                      </div>
                    </div>

                    {/* Desktop Timeline */}
                    <div className="mt-7 hidden sm:block">

                      <div className="flex items-center">
                        {STATUS_STEPS.map((step, index) => {
                          const completed =
                            index <= currentStep;

                          return (
                            <div
                              key={step}
                              className="flex flex-1 items-center"
                            >
                              <div
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                                  completed
                                    ? "bg-[#a76d3e] text-white"
                                    : "bg-[#ded3c6] text-[#9b8b7c]"
                                }`}
                              >
                                {completed ? (
                                  <Check size={13} />
                                ) : (
                                  <span className="h-2 w-2 rounded-full bg-current" />
                                )}
                              </div>

                              {index <
                                STATUS_STEPS.length - 1 && (
                                <div
                                  className={`h-0.5 flex-1 ${
                                    index < currentStep
                                      ? "bg-[#a76d3e]"
                                      : "bg-[#ded3c6]"
                                  }`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-3 flex justify-between gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#8b7b6d]">
                        <span>Placed</span>
                        <span>Confirmed</span>
                        <span>Preparing</span>
                        <span>Ready</span>
                        <span>Completed</span>
                      </div>
                    </div>

                    {/* Mobile Timeline */}
                    <div className="mt-7 space-y-3 sm:hidden">
                      {STATUS_STEPS.map((step, index) => {
                        const completed =
                          index <= currentStep;

                        const active =
                          index === currentStep;

                        return (
                          <div
                            key={step}
                            className="flex items-center gap-3"
                          >
                            <div
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                                completed
                                  ? "bg-[#a76d3e] text-white"
                                  : "bg-[#ded3c6] text-[#9b8b7c]"
                              }`}
                            >
                              {completed ? (
                                <Check size={13} />
                              ) : (
                                <span className="h-2 w-2 rounded-full bg-current" />
                              )}
                            </div>

                            <div
                              className={`text-sm ${
                                active
                                  ? "font-semibold text-[#a76d3e]"
                                  : completed
                                  ? "text-[#5f5146]"
                                  : "text-[#a69a8e]"
                              }`}
                            >
                              {STATUS_LABELS[step]}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ================= CANCELLED ================= */}

                {isCancelled && (
                  <div className="border-t border-red-100 bg-red-50 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-red-600">
                        <PackageCheck size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-red-700">
                          Order cancelled
                        </p>

                        <p className="mt-1 text-xs text-red-600/80">
                          This order was cancelled.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </article>
            );
          })}
        </div>

        {/* Bottom CTA */}
        {orders.length > 0 && (
          <div className="mt-10 rounded-[2rem] bg-[#2b2118] p-7 text-center text-white sm:p-9">

            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d5a06d]">
              Hungry again?
            </p>

            <h2 className="mt-2 font-serif text-3xl">
              Something delicious is waiting.
            </h2>

            <Link
              to="/menu"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#c78b55] px-7 py-3.5 text-sm font-semibold transition hover:bg-[#b87843]"
            >
              Explore Menu
              <ArrowRight size={17} />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
};

export default Orders;
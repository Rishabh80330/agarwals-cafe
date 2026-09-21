import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  MapPin,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import api from "../services/api";

const Checkout = () => {
  const navigate = useNavigate();

  const { cartItems, subtotal, clearCart } = useCart();

  const [orderType, setOrderType] = useState("takeaway");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [address, setAddress] = useState({
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-IN");

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    setAddress((current) => ({
      ...current,
      [name]:
        name === "pincode"
          ? value.replace(/\D/g, "").slice(0, 6)
          : value,
    }));

    setError("");
  };

  const handleOrderTypeChange = (type) => {
    setOrderType(type);
    setError("");
  };

  const handlePaymentChange = (method) => {
    setPaymentMethod(method);
    setError("");
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    setError("");

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (orderType === "delivery") {
      const { addressLine, city, state, pincode } = address;

      if (!addressLine.trim() || !city.trim() || !state.trim()) {
        setError("Please enter your complete delivery address.");
        return;
      }

      if (!/^\d{6}$/.test(pincode)) {
        setError("Please enter a valid 6-digit pincode.");
        return;
      }
    }

    try {
      setPlacingOrder(true);

      const orderData = {
        items: cartItems.map((item) => ({
          menuItem: item._id,
          quantity: item.quantity,
        })),
        orderType,
        paymentMethod,
      };

      if (orderType === "delivery") {
        orderData.address = {
          addressLine: address.addressLine.trim(),
          city: address.city.trim(),
          state: address.state.trim(),
          pincode: address.pincode,
        };
      }

      const response = await api.post("/orders", orderData);

      setSuccess(response.data.order);

      clearCart();
    } catch (err) {
      console.error("Place order error:", err);

      if (err.response?.status === 401) {
        setError("Please login before placing your order.");
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to place your order. Please try again."
        );
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  /* =====================================================
     EMPTY CART
  ===================================================== */

  if (!success && cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#f8f4ee] px-5 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[65vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-[2rem] bg-white p-10 text-center shadow-[0_15px_50px_rgba(61,43,31,0.07)] sm:p-14">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#eee5d9] text-[#a76d3e]">
              <ShoppingBag size={34} strokeWidth={1.7} />
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.3em] text-[#a76d3e]">
              Nothing to checkout
            </p>

            <h1 className="mt-3 font-serif text-4xl text-[#2b2118] sm:text-5xl">
              Your cart is empty
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#75685d]">
              Add something delicious from our menu before checking out.
            </p>

            <Link
              to="/menu"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#2b2118] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#3b2c20]"
            >
              Explore Menu
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* =====================================================
     SUCCESS
  ===================================================== */

  if (success) {
    return (
      <main className="min-h-screen bg-[#f8f4ee] px-5 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[65vh] max-w-2xl items-center justify-center">

          <div className="w-full rounded-[2rem] bg-white p-8 text-center shadow-[0_15px_50px_rgba(61,43,31,0.07)] sm:p-14">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
              <CheckCircle2 size={42} strokeWidth={1.8} />
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.3em] text-[#a76d3e]">
              Order confirmed
            </p>

            <h1 className="mt-3 font-serif text-4xl text-[#2b2118] sm:text-5xl">
              Thank you!
            </h1>

            <p className="mt-4 text-sm leading-6 text-[#75685d] sm:text-base">
              Your order has been placed successfully.
              We&apos;ll take care of the rest.
            </p>

            {/* Order Card */}
            <div className="mx-auto mt-8 max-w-sm rounded-2xl bg-[#f8f4ee] p-6">

              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8b7b6d]">
                Order number
              </p>

              <p className="mt-2 font-serif text-2xl font-semibold text-[#2b2118]">
                {success.orderNumber}
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-[#ded3c6] pt-5 text-sm">
                <span className="text-[#75685d]">
                  Total
                </span>

                <span className="font-semibold text-[#2b2118]">
                  ₹{formatPrice(success.total)}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-[#75685d]">
                  Order type
                </span>

                <span className="font-medium capitalize text-[#2b2118]">
                  {success.orderType?.replace("-", " ")}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-[#75685d]">
                  Payment
                </span>

                <span className="font-medium capitalize text-[#2b2118]">
                  {success.paymentMethod}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="rounded-full bg-[#2b2118] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#3b2c20]"
              >
                View My Orders
              </button>

              <Link
                to="/menu"
                className="rounded-full border border-[#d8cabb] px-7 py-3.5 text-sm font-semibold text-[#5f5146] transition hover:bg-[#f8f4ee]"
              >
                Order Something Else
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =====================================================
     CHECKOUT
  ===================================================== */

  const orderTypes = [
    {
      value: "dine-in",
      label: "Dine-in",
      description: "Enjoy your meal at the cafe",
      icon: Store,
    },
    {
      value: "takeaway",
      label: "Takeaway",
      description: "Pick up your order",
      icon: ShoppingBag,
    },
    {
      value: "delivery",
      label: "Delivery",
      description: "Have it delivered to you",
      icon: Truck,
    },
  ];

  const paymentOptions = [
    {
      value: "cash",
      label: "Cash",
      description: "Pay when you receive your order",
      icon: Store,
    },
    {
      value: "online",
      label: "Online Payment",
      description: "Secure online payment",
      icon: CreditCard,
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8f4ee] px-5 pb-24 pt-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-9">

          <Link
            to="/cart"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#8a6a50] transition hover:text-[#2b2118]"
          >
            <ArrowLeft size={16} />
            Back to cart
          </Link>

          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a76d3e]">
            Almost ready
          </p>

          <h1 className="mt-2 font-serif text-4xl text-[#2b2118] sm:text-5xl">
            Checkout
          </h1>

          <p className="mt-3 text-sm text-[#75685d]">
            Choose how you&apos;d like to receive your order.
          </p>
        </div>

        <form
          onSubmit={handlePlaceOrder}
          className="grid gap-8 lg:grid-cols-[1fr_390px]"
        >

          {/* =================================================
             LEFT
          ================================================= */}

          <div className="space-y-6">

            {/* Order Type */}
            <section className="rounded-[1.75rem] border border-[#eadfd3] bg-white p-6 shadow-[0_8px_30px_rgba(61,43,31,0.04)] sm:p-8">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a76d3e]">
                  Step 01
                </p>

                <h2 className="mt-2 font-serif text-2xl text-[#2b2118]">
                  How would you like your order?
                </h2>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {orderTypes.map((option) => {
                  const Icon = option.icon;
                  const selected = orderType === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        handleOrderTypeChange(option.value)
                      }
                      className={`relative rounded-2xl border p-5 text-left transition ${
                        selected
                          ? "border-[#a76d3e] bg-[#f8f0e7] shadow-sm"
                          : "border-[#e0d5c9] bg-white hover:border-[#c7b6a5]"
                      }`}
                    >
                      {selected && (
                        <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#a76d3e] text-white">
                          <Check size={14} />
                        </span>
                      )}

                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          selected
                            ? "bg-white text-[#a76d3e]"
                            : "bg-[#f8f4ee] text-[#8a6a50]"
                        }`}
                      >
                        <Icon size={19} />
                      </div>

                      <p className="mt-4 font-semibold text-[#2b2118]">
                        {option.label}
                      </p>

                      <p className="mt-1.5 text-xs leading-5 text-[#75685d]">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Delivery Address */}
            {orderType === "delivery" && (
              <section className="rounded-[1.75rem] border border-[#eadfd3] bg-white p-6 shadow-[0_8px_30px_rgba(61,43,31,0.04)] sm:p-8">

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eee5d9] text-[#a76d3e]">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a76d3e]">
                      Step 02
                    </p>

                    <h2 className="mt-1 font-serif text-2xl text-[#2b2118]">
                      Delivery address
                    </h2>

                    <p className="mt-1 text-sm text-[#75685d]">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#75685d]">
                      Address
                    </label>

                    <input
                      name="addressLine"
                      value={address.addressLine}
                      onChange={handleAddressChange}
                      placeholder="House / Street / Area"
                      autoComplete="street-address"
                      className="w-full rounded-xl border border-[#ded3c6] bg-[#fdfbf8] px-4 py-3.5 text-sm text-[#2b2118] outline-none transition placeholder:text-[#aa9b8d] focus:border-[#a76d3e] focus:ring-2 focus:ring-[#a76d3e]/10"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#75685d]">
                        City
                      </label>

                      <input
                        name="city"
                        value={address.city}
                        onChange={handleAddressChange}
                        placeholder="City"
                        autoComplete="address-level2"
                        className="w-full rounded-xl border border-[#ded3c6] bg-[#fdfbf8] px-4 py-3.5 text-sm text-[#2b2118] outline-none transition placeholder:text-[#aa9b8d] focus:border-[#a76d3e] focus:ring-2 focus:ring-[#a76d3e]/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#75685d]">
                        State
                      </label>

                      <input
                        name="state"
                        value={address.state}
                        onChange={handleAddressChange}
                        placeholder="State"
                        autoComplete="address-level1"
                        className="w-full rounded-xl border border-[#ded3c6] bg-[#fdfbf8] px-4 py-3.5 text-sm text-[#2b2118] outline-none transition placeholder:text-[#aa9b8d] focus:border-[#a76d3e] focus:ring-2 focus:ring-[#a76d3e]/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#75685d]">
                      Pincode
                    </label>

                    <input
                      name="pincode"
                      value={address.pincode}
                      onChange={handleAddressChange}
                      placeholder="6-digit pincode"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={6}
                      className="w-full rounded-xl border border-[#ded3c6] bg-[#fdfbf8] px-4 py-3.5 text-sm tracking-wider text-[#2b2118] outline-none transition placeholder:text-[#aa9b8d] focus:border-[#a76d3e] focus:ring-2 focus:ring-[#a76d3e]/10"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Payment */}
            <section className="rounded-[1.75rem] border border-[#eadfd3] bg-white p-6 shadow-[0_8px_30px_rgba(61,43,31,0.04)] sm:p-8">

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a76d3e]">
                {orderType === "delivery" ? "Step 03" : "Step 02"}
              </p>

              <h2 className="mt-2 font-serif text-2xl text-[#2b2118]">
                Payment method
              </h2>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {paymentOptions.map((option) => {
                  const Icon = option.icon;
                  const selected = paymentMethod === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        handlePaymentChange(option.value)
                      }
                      className={`relative rounded-2xl border p-5 text-left transition ${
                        selected
                          ? "border-[#a76d3e] bg-[#f8f0e7]"
                          : "border-[#e0d5c9] bg-white hover:border-[#c7b6a5]"
                      }`}
                    >
                      {selected && (
                        <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#a76d3e] text-white">
                          <Check size={14} />
                        </span>
                      )}

                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          selected
                            ? "bg-white text-[#a76d3e]"
                            : "bg-[#f8f4ee] text-[#8a6a50]"
                        }`}
                      >
                        <Icon size={18} />
                      </div>

                      <p className="mt-4 font-semibold text-[#2b2118]">
                        {option.label}
                      </p>

                      <p className="mt-1.5 text-xs leading-5 text-[#75685d]">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {paymentMethod === "online" && (
                <div className="mt-4 rounded-2xl border border-[#ead7c4] bg-[#fff8ef] p-4">
                  <div className="flex gap-3">
                    <CreditCard
                      size={18}
                      className="mt-0.5 shrink-0 text-[#a76d3e]"
                    />

                    <div>
                      <p className="text-sm font-semibold text-[#5f4532]">
                        Online payment
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#8a6a50]">
                        Secure Razorpay payment will be connected here.
                        For now, the order will be submitted with online
                        payment selected.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <span className="mt-0.5 font-bold">!</span>
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* =================================================
             RIGHT SUMMARY
          ================================================= */}

          <aside className="h-fit lg:sticky lg:top-28">
            <div className="rounded-[2rem] bg-[#2b2118] p-6 text-white shadow-[0_20px_60px_rgba(43,33,24,0.18)] sm:p-7">

              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d5a06d]">
                Your order
              </p>

              <h2 className="mt-3 font-serif text-3xl">
                Order summary
              </h2>

              {/* Items */}
              <div className="mt-7 max-h-72 space-y-4 overflow-y-auto border-b border-white/10 pb-6 pr-1">

                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/10">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingBag
                            size={17}
                            className="text-white/40"
                          />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-white/50">
                        {item.quantity} × ₹
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-medium text-white/90">
                      ₹
                      {formatPrice(
                        Number(item.price || 0) *
                          Number(item.quantity || 0)
                      )}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-4 pt-6">

                <div className="flex justify-between text-sm">
                  <span className="text-white/60">
                    Subtotal
                  </span>

                  <span className="text-white/85">
                    ₹{formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-white/60">
                    Delivery
                  </span>

                  <span className="text-white/85">
                    {deliveryFee === 0
                      ? "Free"
                      : `₹${formatPrice(deliveryFee)}`}
                  </span>
                </div>

                <div className="flex justify-between border-t border-white/10 pt-5">
                  <span className="text-white/70">
                    Total
                  </span>

                  <span className="text-2xl font-semibold">
                    ₹{formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Place Order */}
              <button
                type="submit"
                disabled={placingOrder}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#c78b55] py-4 text-sm font-semibold text-white transition hover:bg-[#b87843] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {placingOrder ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                    Placing order...
                  </>
                ) : (
                  <>
                    Place Order
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-[11px] leading-5 text-white/35">
                Your order will be sent securely to Agarwal&apos;s Cafe.
              </p>
            </div>

            {/* Trust note */}
            <div className="mt-4 rounded-2xl border border-[#e7d9cb] bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eee5d9] text-[#a76d3e]">
                  <CheckCircle2 size={17} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#2b2118]">
                    Freshly prepared
                  </p>

                  <p className="mt-0.5 text-[11px] text-[#8a7a6c]">
                    Your order is prepared with care.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
};

export default Checkout;
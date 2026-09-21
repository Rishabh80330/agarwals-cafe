import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    subtotal,
  } = useCart();

  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-IN");

  const handleDecrease = (item) => {
    if (item.quantity <= 1) {
      removeFromCart(item._id);
      return;
    }

    updateQuantity(item._id, item.quantity - 1);
  };

  /* ================= EMPTY CART ================= */

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#f8f4ee] px-5 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[65vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-[2rem] bg-white px-6 py-14 text-center shadow-[0_15px_50px_rgba(61,43,31,0.07)] sm:px-10 sm:py-20">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#eee5d9] text-[#a76d3e]">
              <ShoppingBag size={34} strokeWidth={1.7} />
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.28em] text-[#a76d3e]">
              Your table is waiting
            </p>

            <h1 className="mt-3 font-serif text-4xl text-[#2b2118] sm:text-5xl">
              Your cart is empty
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#75685d] sm:text-base">
              Looks like you haven't added anything yet. Explore our menu
              and discover something delicious.
            </p>

            <Link
              to="/menu"
              className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full bg-[#2b2118] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#3b2c20]"
            >
              Explore Menu
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* ================= CART ================= */

  return (
    <main className="min-h-screen bg-[#f8f4ee] px-5 pb-24 pt-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-9">
          <Link
            to="/menu"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#8a6a50] transition hover:text-[#2b2118]"
          >
            <ArrowLeft size={16} />
            Continue shopping
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a76d3e]">
              Almost there
            </p>

            <h1 className="mt-2 font-serif text-4xl text-[#2b2118] sm:text-5xl">
              Your Cart
            </h1>

            <p className="mt-3 text-sm text-[#75685d]">
              {cartItems.length}{" "}
              {cartItems.length === 1 ? "item" : "items"} in your order
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* ================= ITEMS ================= */}

          <section className="space-y-4">
            {cartItems.map((item) => {
              const itemTotal =
                Number(item.price || 0) * Number(item.quantity || 0);

              return (
                <article
                  key={item._id}
                  className="group rounded-[1.75rem] border border-[#eadfd3] bg-white p-4 shadow-[0_8px_30px_rgba(61,43,31,0.04)] transition hover:shadow-[0_12px_40px_rgba(61,43,31,0.08)] sm:p-5"
                >
                  <div className="flex flex-col gap-5 sm:flex-row">

                    {/* Image */}
                    <div className="relative h-52 w-full shrink-0 overflow-hidden rounded-2xl bg-[#e8dfd4] sm:h-32 sm:w-32">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#9b8b7c]">
                          <UtensilsCrossed size={24} />
                          <span className="text-xs">No image</span>
                        </div>
                      )}

                      {item.isVeg && (
                        <span className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-md bg-white/95 shadow-sm">
                          <span className="h-2.5 w-2.5 rounded-full border-2 border-green-600 bg-green-500" />
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between">

                      {/* Top */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h2 className="font-serif text-2xl leading-tight text-[#2b2118]">
                            {item.name}
                          </h2>

                          {item.category?.name && (
                            <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a76d3e]">
                              {item.category.name}
                            </p>
                          )}

                          {item.description && (
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#85766a]">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item._id)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#9b8b7c] transition hover:bg-red-50 hover:text-red-600"
                          title="Remove item"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>

                      {/* Bottom */}
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

                        {/* Quantity */}
                        <div className="flex items-center rounded-full border border-[#ded3c6] bg-[#faf7f3] p-1">
                          <button
                            type="button"
                            onClick={() => handleDecrease(item)}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#5f5146] transition hover:bg-[#eee5d9]"
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            <Minus size={14} />
                          </button>

                          <span className="w-9 text-center text-sm font-semibold text-[#2b2118]">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item._id,
                                item.quantity + 1
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#5f5146] transition hover:bg-[#eee5d9]"
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-xs text-[#9b8b7c]">
                            ₹{formatPrice(item.price)} each
                          </p>

                          <p className="mt-0.5 text-lg font-semibold text-[#2b2118]">
                            ₹{formatPrice(itemTotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          {/* ================= SUMMARY ================= */}

          <aside className="h-fit lg:sticky lg:top-28">
            <div className="rounded-[2rem] bg-[#2b2118] p-6 text-white shadow-[0_20px_60px_rgba(43,33,24,0.18)] sm:p-7">

              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d5a06d]">
                Order summary
              </p>

              <h2 className="mt-3 font-serif text-3xl">
                Your order
              </h2>

              {/* Mini items */}
              <div className="mt-7 space-y-3 border-b border-white/10 pb-6">
                {cartItems.slice(0, 4).map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between gap-4 text-sm"
                  >
                    <span className="min-w-0 truncate text-white/65">
                      {item.name} × {item.quantity}
                    </span>

                    <span className="shrink-0 text-white/80">
                      ₹
                      {formatPrice(
                        Number(item.price || 0) *
                          Number(item.quantity || 0)
                      )}
                    </span>
                  </div>
                ))}

                {cartItems.length > 4 && (
                  <p className="pt-1 text-xs text-white/40">
                    + {cartItems.length - 4} more items
                  </p>
                )}
              </div>

              {/* Pricing */}
              <div className="space-y-4 border-b border-white/10 py-6">
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
              </div>

              {/* Total */}
              <div className="flex items-end justify-between pt-6">
                <div>
                  <p className="text-sm text-white/60">
                    Total
                  </p>

                  <p className="mt-1 text-xs text-white/35">
                    Inclusive of current cart charges
                  </p>
                </div>

                <span className="text-3xl font-semibold">
                  ₹{formatPrice(total)}
                </span>
              </div>

              {/* Checkout */}
              <Link
                to="/checkout"
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#c78b55] py-4 text-sm font-semibold text-white transition hover:bg-[#b87843]"
              >
                Proceed to Checkout
                <ArrowRight size={17} />
              </Link>

              <Link
                to="/menu"
                className="mt-3 flex w-full items-center justify-center rounded-full border border-white/10 py-3.5 text-sm font-medium text-white/65 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
              >
                Add More Items
              </Link>

              <p className="mt-5 text-center text-[11px] leading-5 text-white/35">
                Taxes and final charges are calculated at checkout.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Cart;
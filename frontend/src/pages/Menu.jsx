import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Coffee,
  LoaderCircle,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import api from "../services/api";
import { useCart } from "../context/CartContext";

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [addedItem, setAddedItem] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const { addToCart } = useCart();

  // =====================================================
  // FETCH MENU
  // =====================================================

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError("");

      const [menuResponse, categoryResponse] = await Promise.all([
        api.get("/menu"),
        api.get("/categories"),
      ]);

      setMenuItems(menuResponse.data.menuItems || []);
      setCategories(categoryResponse.data.categories || []);
    } catch (err) {
      console.error("Menu fetch error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load the menu. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" ||
        item.category?._id === selectedCategory;

      const matchesSearch =
        !query ||
        item.name?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.name?.toLowerCase().includes(query);

      const matchesVeg =
        !vegOnly || item.isVeg === true;

      const matchesFeatured =
        !featuredOnly || item.featured === true;

      return (
        matchesCategory &&
        matchesSearch &&
        matchesVeg &&
        matchesFeatured
      );
    });
  }, [
    menuItems,
    selectedCategory,
    search,
    vegOnly,
    featuredOnly,
  ]);

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = (item) => {
    if (item.isAvailable === false) return;

    addToCart(item);

    setAddedItem(item._id);

    setTimeout(() => {
      setAddedItem(null);
    }, 1600);
  };

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSelectedCategory("all");
    setSearch("");
    setVegOnly(false);
    setFeaturedOnly(false);
  };

  const hasActiveFilters =
    selectedCategory !== "all" ||
    search.trim() !== "" ||
    vegOnly ||
    featuredOnly;

  // =====================================================
  // STATS
  // =====================================================

  const availableItems = menuItems.filter(
    (item) => item.isAvailable !== false
  ).length;

  const featuredItems = menuItems.filter(
    (item) => item.featured
  ).length;

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8f4ee] pt-24 sm:pt-28">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="px-5 pb-8 pt-8 sm:pb-10 sm:pt-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:items-end">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-[#a76d3e]" />

                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#a76d3e] sm:text-xs">
                  Fresh from our kitchen
                </p>
              </div>

              <h1 className="font-serif text-5xl leading-[1.02] text-[#2b2118] sm:text-6xl lg:text-7xl">
                Our Menu
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#75685d] sm:text-base sm:leading-8">
                Freshly prepared favourites, delicious drinks
                and little treats made for every kind of
                craving.
              </p>

              <div className="mt-6 flex flex-wrap gap-4 text-xs text-[#8b7b6d]">
                <div className="flex items-center gap-2">
                  <Coffee
                    size={15}
                    className="text-[#a76d3e]"
                  />
                  Freshly prepared
                </div>

                <div className="flex items-center gap-2">
                  <ShoppingBag
                    size={15}
                    className="text-[#a76d3e]"
                  />
                  Easy ordering
                </div>

                <div className="flex items-center gap-2">
                  <Sparkles
                    size={15}
                    className="text-[#a76d3e]"
                  />
                  Cafe favourites
                </div>
              </div>
            </div>

            {/* SEARCH */}

            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b7b6d]"
              />

              <input
                type="text"
                placeholder="Search coffee, snacks, desserts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-[#ded3c6] bg-white py-4 pl-11 pr-12 text-sm text-[#2b2118] shadow-sm outline-none transition placeholder:text-[#aaa096] focus:border-[#b87945] focus:ring-4 focus:ring-[#c78b55]/10"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-[#8b7b6d] transition hover:text-[#2b2118]"
                >
                  <X size={17} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORY BAR
      ===================================================== */}

      <section className="sticky top-[72px] z-20 border-y border-[#e4dace] bg-[#eee5d9]/95 px-5 py-3 backdrop-blur-md sm:top-[80px] lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="hidden shrink-0 items-center gap-2 pr-2 text-xs font-medium text-[#75685d] sm:flex">
              <SlidersHorizontal size={15} />
              Categories
            </div>

            <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-semibold transition sm:text-sm ${
                  selectedCategory === "all"
                    ? "bg-[#2b2118] text-white shadow-sm"
                    : "bg-[#f8f4ee] text-[#5f5146] hover:bg-white"
                }`}
              >
                All
              </button>

              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() =>
                    setSelectedCategory(category._id)
                  }
                  className={`whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-semibold transition sm:text-sm ${
                    selectedCategory === category._id
                      ? "bg-[#2b2118] text-white shadow-sm"
                      : "bg-[#f8f4ee] text-[#5f5146] hover:bg-white"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <section className="px-5 pt-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-full border border-[#d9ccbe] bg-white px-4 py-2.5 text-xs font-semibold text-[#5f5146] transition hover:bg-[#fdfbf8] sm:text-sm"
            >
              <SlidersHorizontal size={15} />
              Filters

              {(vegOnly || featuredOnly) && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2b2118] px-1 text-[10px] text-white">
                  {(vegOnly ? 1 : 0) +
                    (featuredOnly ? 1 : 0)}
                </span>
              )}
            </button>

            <p className="text-xs text-[#8b7b6d] sm:text-sm">
              Showing{" "}
              <span className="font-semibold text-[#5f5146]">
                {filteredItems.length}
              </span>{" "}
              {filteredItems.length === 1
                ? "item"
                : "items"}
            </p>
          </div>

          {showFilters && (
            <div className="mt-3 flex flex-wrap gap-3 rounded-[1.3rem] border border-[#e5dbd0] bg-white p-4 shadow-sm">
              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium transition sm:text-sm ${
                  vegOnly
                    ? "border-green-600 bg-green-50 text-green-700"
                    : "border-[#ddd1c4] text-[#66594e] hover:bg-[#f8f4ee]"
                }`}
              >
                <span className="flex h-4 w-4 items-center justify-center rounded border border-green-600">
                  {vegOnly && <Check size={11} />}
                </span>
                Vegetarian only
              </button>

              <button
                onClick={() =>
                  setFeaturedOnly(!featuredOnly)
                }
                className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium transition sm:text-sm ${
                  featuredOnly
                    ? "border-[#a76d3e] bg-[#f8f0e7] text-[#8b572f]"
                    : "border-[#ddd1c4] text-[#66594e] hover:bg-[#f8f4ee]"
                }`}
              >
                <Sparkles size={14} />
                Popular only
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-auto flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold text-[#a76d3e] transition hover:bg-[#f8f0e7] sm:text-sm"
                >
                  <X size={14} />
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          MENU GRID
      ===================================================== */}

      <section className="px-5 py-10 sm:py-12 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          {/* LOADING */}

          {loading && (
            <div className="flex min-h-[420px] flex-col items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                <LoaderCircle
                  size={30}
                  className="animate-spin text-[#a76d3e]"
                />
              </div>

              <p className="mt-5 text-sm text-[#75685d]">
                Preparing the menu...
              </p>
            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div className="rounded-[2rem] border border-[#eadfd4] bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f8f0e7] text-[#a76d3e]">
                <Coffee size={23} />
              </div>

              <h2 className="mt-5 font-serif text-2xl text-[#2b2118]">
                Menu unavailable
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#75685d]">
                {error}
              </p>

              <button
                onClick={fetchMenu}
                className="mt-6 rounded-full bg-[#2b2118] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#3b2c20]"
              >
                Try Again
              </button>
            </div>
          )}

          {/* NO RESULTS */}

          {!loading &&
            !error &&
            filteredItems.length === 0 && (
              <div className="rounded-[2rem] border border-[#eadfd4] bg-white px-6 py-16 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f0e9] text-[#a76d3e]">
                  <Search size={25} />
                </div>

                <h2 className="mt-6 font-serif text-3xl text-[#2b2118]">
                  Nothing found
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#75685d]">
                  We couldn't find anything matching your
                  current search or filters.
                </p>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-6 rounded-full bg-[#2b2118] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#3b2c20]"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

          {/* ITEMS */}

          {!loading &&
            !error &&
            filteredItems.length > 0 && (
              <>
                <div className="mb-7 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a76d3e] sm:text-xs">
                      Freshly prepared
                    </p>

                    <h2 className="mt-2 font-serif text-2xl text-[#2b2118] sm:text-3xl">
                      {selectedCategory === "all"
                        ? "Everything you love"
                        : categories.find(
                            (category) =>
                              category._id ===
                              selectedCategory
                          )?.name || "Our menu"}
                    </h2>
                  </div>

                  <div className="hidden text-right sm:block">
                    <p className="text-xs text-[#8b7b6d]">
                      {availableItems} available
                    </p>

                    <p className="mt-1 text-xs text-[#b09e8d]">
                      {featuredItems} popular
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                  {filteredItems.map((item) => {
                    const isUnavailable =
                      item.isAvailable === false;

                    const isAdded =
                      addedItem === item._id;

                    return (
                      <article
                        key={item._id}
                        className={`group overflow-hidden rounded-[1.6rem] border border-[#eee4d9] bg-white shadow-sm transition duration-300 ${
                          isUnavailable
                            ? "opacity-85"
                            : "hover:-translate-y-1 hover:shadow-xl"
                        }`}
                      >
                        {/* IMAGE */}

                        <div className="relative h-64 overflow-hidden bg-[#e8dfd4] sm:h-72">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              loading="lazy"
                              className={`h-full w-full object-cover transition duration-700 ${
                                !isUnavailable
                                  ? "group-hover:scale-105"
                                  : "grayscale-[15%]"
                              }`}
                            />
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center text-[#9b8b7c]">
                              <Coffee size={30} />

                              <span className="mt-2 text-xs">
                                Image coming soon
                              </span>
                            </div>
                          )}

                          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />

                          {/* VEG */}

                          <div className="absolute left-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg bg-white/95 shadow-sm">
                            <span
                              className={`h-3 w-3 rounded-full border-2 ${
                                item.isVeg
                                  ? "border-green-700 bg-green-500"
                                  : "border-red-700 bg-red-500"
                              }`}
                            />
                          </div>

                          {/* POPULAR */}

                          {item.featured && (
                            <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-[#c78b55] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                              <Sparkles size={11} />
                              Popular
                            </div>
                          )}

                          {/* UNAVAILABLE */}

                          {isUnavailable && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                              <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#5f5146] shadow-lg">
                                Currently unavailable
                              </span>
                            </div>
                          )}

                          {/* PRICE */}

                          <div className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#2b2118] shadow-md">
                            ₹
                            {Number(item.price).toLocaleString(
                              "en-IN"
                            )}
                          </div>
                        </div>

                        {/* CONTENT */}

                        <div className="p-5 sm:p-6">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="font-serif text-2xl leading-tight text-[#2b2118]">
                                {item.name}
                              </h3>

                              {item.category?.name && (
                                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a76d3e]">
                                  {item.category.name}
                                </p>
                              )}
                            </div>
                          </div>

                          <p className="mt-3 min-h-[48px] text-sm leading-6 text-[#75685d]">
                            {item.description}
                          </p>

                          <button
                            onClick={() =>
                              handleAddToCart(item)
                            }
                            disabled={isUnavailable}
                            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition active:scale-[0.98] ${
                              isUnavailable
                                ? "cursor-not-allowed bg-[#eee8e1] text-[#a59a90]"
                                : isAdded
                                ? "bg-emerald-600 text-white"
                                : "bg-[#2b2118] text-white hover:bg-[#3b2c20]"
                            }`}
                          >
                            {isUnavailable ? (
                              "Unavailable"
                            ) : isAdded ? (
                              <>
                                <Check size={16} />
                                Added to cart
                              </>
                            ) : (
                              <>
                                Add to cart
                                <ArrowRight size={16} />
                              </>
                            )}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
        </div>
      </section>

      {/* =====================================================
          BOTTOM CTA
      ===================================================== */}

      {!loading && !error && menuItems.length > 0 && (
        <section className="px-5 pb-16 lg:px-8 lg:pb-24">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#211810] px-6 py-12 text-center text-white sm:px-12 sm:py-16">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#d5a06d] sm:text-xs">
              Made for good moments
            </p>

            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
              Found something you love?
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/55">
              Add your favourites to the cart and enjoy your
              next cafe moment.
            </p>

            <Link
              to="/cart"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#c78b55] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#b87843]"
            >
              View your cart
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
};

export default Menu;
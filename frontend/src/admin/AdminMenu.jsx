import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Coffee,
  Edit3,
  ImagePlus,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
  Utensils,
  Eye,
  EyeOff,
  Leaf,
  Circle,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  image: "",
  isVeg: true,
  isAvailable: true,
  featured: false,
};

const formatPrice = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const getCategoryId = (category) => {
  if (!category) return "";
  return typeof category === "object" ? category._id : category;
};

const getCategoryNameFromItem = (item) => {
  if (!item?.category) return "Uncategorized";

  if (typeof item.category === "object") {
    return item.category.name || "Uncategorized";
  }

  return "Uncategorized";
};

const getCategoryName = (categoryId, categories) => {
  const category = categories.find(
    (item) => item._id === categoryId
  );

  return category?.name || "Uncategorized";
};

export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [foodTypeFilter, setFoodTypeFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");

  const fetchData = async () => {
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
      console.error("Admin menu fetch error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load menu data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return menuItems
      .filter((item) => {
        if (!searchValue) return true;

        const name = item.name?.toLowerCase() || "";
        const description = item.description?.toLowerCase() || "";
        const category = getCategoryNameFromItem(item).toLowerCase();

        return (
          name.includes(searchValue) ||
          description.includes(searchValue) ||
          category.includes(searchValue)
        );
      })
      .filter((item) => {
        if (categoryFilter === "all") return true;

        return getCategoryId(item.category) === categoryFilter;
      })
      .filter((item) => {
        if (foodTypeFilter === "all") return true;

        if (foodTypeFilter === "veg") {
          return item.isVeg === true;
        }

        if (foodTypeFilter === "nonveg") {
          return item.isVeg === false;
        }

        return true;
      })
      .filter((item) => {
        if (availabilityFilter === "all") return true;

        if (availabilityFilter === "available") {
          return item.isAvailable === true;
        }

        if (availabilityFilter === "unavailable") {
          return item.isAvailable === false;
        }

        return true;
      })
      .filter((item) => {
        if (featuredFilter === "all") return true;

        if (featuredFilter === "featured") {
          return item.featured === true;
        }

        if (featuredFilter === "regular") {
          return item.featured !== true;
        }

        return true;
      })
      .sort((a, b) => {
        return (a.name || "").localeCompare(b.name || "");
      });
  }, [
    menuItems,
    search,
    categoryFilter,
    foodTypeFilter,
    availabilityFilter,
    featuredFilter,
  ]);

  const stats = useMemo(() => {
    const total = menuItems.length;

    const available = menuItems.filter(
      (item) => item.isAvailable === true
    ).length;

    const unavailable = menuItems.filter(
      (item) => item.isAvailable === false
    ).length;

    const veg = menuItems.filter(
      (item) => item.isVeg === true
    ).length;

    const nonVeg = menuItems.filter(
      (item) => item.isVeg === false
    ).length;

    const featured = menuItems.filter(
      (item) => item.featured === true
    ).length;

    return {
      total,
      available,
      unavailable,
      veg,
      nonVeg,
      featured,
    };
  }, [menuItems]);

  const resetForm = () => {
    const firstCategory =
      categories.find((category) => category.isActive) ||
      categories[0];

    setForm({
      ...emptyForm,
      category: firstCategory?._id || "",
    });

    setEditingId(null);
  };

  const openAddForm = () => {
    setSuccess("");
    setError("");

    const firstCategory =
      categories.find((category) => category.isActive) ||
      categories[0];

    setForm({
      ...emptyForm,
      category: firstCategory?._id || "",
    });

    setEditingId(null);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openEditForm = (item) => {
    setSuccess("");
    setError("");

    setEditingId(item._id);
    setShowForm(true);

    setForm({
      name: item.name || "",
      description: item.description || "",
      price: item.price ?? "",
      category: getCategoryId(item.category),
      image: item.image || "",
      isVeg: item.isVeg ?? true,
      isAvailable: item.isAvailable ?? true,
      featured: item.featured ?? false,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const closeForm = () => {
    if (saving || uploading) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post(
        "/upload/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const imageUrl =
        response.data?.imageUrl ||
        response.data?.url ||
        response.data?.secure_url;

      if (!imageUrl) {
        throw new Error("Image URL was not returned.");
      }

      setForm((previous) => ({
        ...previous,
        image: imageUrl,
      }));

      setSuccess("Image uploaded successfully.");
    } catch (err) {
      console.error("Image upload error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to upload image."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const removeImage = () => {
    setForm((previous) => ({
      ...previous,
      image: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = form.name.trim();
    const description = form.description.trim();
    const price = Number(form.price);

    if (!name) {
      setError("Please enter menu item name.");
      return;
    }

    if (!description) {
      setError("Please enter menu item description.");
      return;
    }

    if (form.price === "" || Number.isNaN(price) || price < 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (!form.category) {
      setError("Please select a category.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name,
        description,
        price,
        category: form.category,
        image: form.image,
        isVeg: form.isVeg,
        isAvailable: form.isAvailable,
        featured: form.featured,
      };

      if (editingId) {
        await api.put(`/menu/${editingId}`, payload);
        setSuccess("Menu item updated successfully.");
      } else {
        await api.post("/menu", payload);
        setSuccess("Menu item added successfully.");
      }

      await fetchData();

      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (err) {
      console.error("Save menu item error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save menu item. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(item._id);
      setError("");
      setSuccess("");

      await api.delete(`/menu/${item._id}`);

      setMenuItems((previous) =>
        previous.filter((menuItem) => menuItem._id !== item._id)
      );

      setSuccess(`"${item.name}" deleted successfully.`);
    } catch (err) {
      console.error("Delete menu item error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete menu item."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setFoodTypeFilter("all");
    setAvailabilityFilter("all");
    setFeaturedFilter("all");
  };

  const hasActiveFilters =
    search ||
    categoryFilter !== "all" ||
    foodTypeFilter !== "all" ||
    availabilityFilter !== "all" ||
    featuredFilter !== "all";

  return (
    <div className="min-h-screen bg-[#f8f5ef] text-[#2d211b]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#e8dfd4] bg-[#f8f5ef]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ded3c6] bg-white text-[#4b3327] transition hover:bg-[#f2ece4]"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a7258]">
                Admin Panel
              </p>

              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Menu Management
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex h-10 items-center gap-2 rounded-xl border border-[#ded3c6] bg-white px-3 text-sm font-medium text-[#4b3327] transition hover:bg-[#f2ece4] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
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

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Page Intro */}
        <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[#9a7258]">
              <Coffee size={18} />
              <span className="text-sm font-medium">
                Agarwal&apos;s Cafe
              </span>
            </div>

            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Manage your menu
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#75665c]">
              Add, update and organize every item shown on the cafe menu.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#6f4632] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5d3929]"
          >
            <Plus size={18} />
            Add Menu Item
          </button>
        </section>

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
              <Check size={17} />
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

        {/* Stats */}
        <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard
            icon={<Utensils size={18} />}
            label="Total Items"
            value={stats.total}
          />

          <StatCard
            icon={<Eye size={18} />}
            label="Available"
            value={stats.available}
          />

          <StatCard
            icon={<EyeOff size={18} />}
            label="Unavailable"
            value={stats.unavailable}
          />

          <StatCard
            icon={<Leaf size={18} />}
            label="Veg"
            value={stats.veg}
          />

          <StatCard
            icon={<Circle size={18} />}
            label="Non-Veg"
            value={stats.nonVeg}
          />

          <StatCard
            icon={<Star size={18} />}
            label="Featured"
            value={stats.featured}
          />
        </section>

        {/* Add/Edit Form */}
        {showForm && (
          <section className="mb-8 overflow-hidden rounded-3xl border border-[#e4d9cc] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#eee6dd] px-5 py-4 sm:px-6">
              <div>
                <h3 className="text-lg font-semibold">
                  {editingId
                    ? "Edit Menu Item"
                    : "Add New Menu Item"}
                </h3>

                <p className="mt-1 text-xs text-[#81736a]">
                  Keep the menu information clear and customer-friendly.
                </p>
              </div>

              <button
                onClick={closeForm}
                disabled={saving || uploading}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e4d9cc] text-[#66564c] transition hover:bg-[#f8f5ef] disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_340px]"
            >
              {/* Details */}
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Item Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Cappuccino"
                    className="w-full rounded-xl border border-[#ded3c6] bg-[#fffdfa] px-4 py-3 text-sm outline-none transition placeholder:text-[#aa9b90] focus:border-[#9a7258] focus:ring-2 focus:ring-[#9a7258]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe the item briefly..."
                    className="w-full resize-none rounded-xl border border-[#ded3c6] bg-[#fffdfa] px-4 py-3 text-sm outline-none transition placeholder:text-[#aa9b90] focus:border-[#9a7258] focus:ring-2 focus:ring-[#9a7258]/10"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Price
                    </label>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#806e63]">
                        ₹
                      </span>

                      <input
                        type="number"
                        name="price"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full rounded-xl border border-[#ded3c6] bg-[#fffdfa] py-3 pl-9 pr-4 text-sm outline-none transition placeholder:text-[#aa9b90] focus:border-[#9a7258] focus:ring-2 focus:ring-[#9a7258]/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Category
                    </label>

                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[#ded3c6] bg-[#fffdfa] px-4 py-3 text-sm outline-none transition focus:border-[#9a7258] focus:ring-2 focus:ring-[#9a7258]/10"
                    >
                      <option value="">Select category</option>

                      {categories.map((category) => (
                        <option
                          key={category._id}
                          value={category._id}
                        >
                          {category.name}
                          {!category.isActive
                            ? " (Inactive)"
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <ToggleBox
                    checked={form.isVeg}
                    onChange={(checked) =>
                      setForm((previous) => ({
                        ...previous,
                        isVeg: checked,
                      }))
                    }
                    title="Vegetarian"
                    description="Mark as veg"
                    color="green"
                  />

                  <ToggleBox
                    checked={form.isAvailable}
                    onChange={(checked) =>
                      setForm((previous) => ({
                        ...previous,
                        isAvailable: checked,
                      }))
                    }
                    title="Available"
                    description="Show to customers"
                    color="blue"
                  />

                  <ToggleBox
                    checked={form.featured}
                    onChange={(checked) =>
                      setForm((previous) => ({
                        ...previous,
                        featured: checked,
                      }))
                    }
                    title="Featured"
                    description="Highlight item"
                    color="amber"
                  />
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Item Image
                </label>

                <div className="overflow-hidden rounded-2xl border border-[#ded3c6] bg-[#f8f5ef]">
                  {form.image ? (
                    <div className="relative aspect-[4/3]">
                      <img
                        src={form.image}
                        alt={form.name || "Menu item"}
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
                        <label className="cursor-pointer rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-[#3b281f] shadow-sm transition hover:bg-white">
                          Change Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={removeImage}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500 text-white shadow-sm transition hover:bg-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center px-5 text-center transition hover:bg-[#f1ebe3]">
                      {uploading ? (
                        <>
                          <LoaderCircle
                            size={30}
                            className="mb-3 animate-spin text-[#8c624a]"
                          />

                          <p className="text-sm font-semibold">
                            Uploading image...
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#8c624a] shadow-sm">
                            <ImagePlus size={24} />
                          </div>

                          <p className="text-sm font-semibold">
                            Upload item image
                          </p>

                          <p className="mt-1 text-xs text-[#8b7b70]">
                            JPG, PNG or WEBP
                          </p>
                        </>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <p className="mt-2 text-xs leading-5 text-[#8b7b70]">
                  Use a clear food photo. The image will be uploaded to
                  Cloudinary.
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-[#eee6dd] pt-5 sm:flex-row sm:justify-end lg:col-span-2">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving || uploading}
                  className="rounded-xl border border-[#ded3c6] px-5 py-3 text-sm font-semibold text-[#5c4b41] transition hover:bg-[#f8f5ef] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#6f4632] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5d3929] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={17} />
                      {editingId ? "Update Item" : "Add Item"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Filters */}
        <section className="mb-6 rounded-3xl border border-[#e4d9cc] bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="font-semibold">Menu Items</h3>

              <p className="mt-1 text-xs text-[#81736a]">
                Showing {filteredItems.length} of {menuItems.length} items
              </p>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 self-start rounded-lg px-3 py-2 text-xs font-semibold text-[#8a5b42] transition hover:bg-[#f8f5ef]"
              >
                <X size={14} />
                Clear Filters
              </button>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a8a7f]"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search menu items..."
                className="w-full rounded-xl border border-[#ded3c6] bg-[#fffdfa] py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-[#aa9b90] focus:border-[#9a7258] focus:ring-2 focus:ring-[#9a7258]/10"
              />
            </div>

            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              className="rounded-xl border border-[#ded3c6] bg-[#fffdfa] px-3 py-3 text-sm outline-none focus:border-[#9a7258]"
            >
              <option value="all">All Categories</option>

              {categories.map((category) => (
                <option
                  key={category._id}
                  value={category._id}
                >
                  {category.name}
                </option>
              ))}
            </select>

            {/* Food type */}
            <select
              value={foodTypeFilter}
              onChange={(event) =>
                setFoodTypeFilter(event.target.value)
              }
              className="rounded-xl border border-[#ded3c6] bg-[#fffdfa] px-3 py-3 text-sm outline-none focus:border-[#9a7258]"
            >
              <option value="all">All Food Types</option>
              <option value="veg">Vegetarian</option>
              <option value="nonveg">Non-Vegetarian</option>
            </select>

            {/* Availability */}
            <select
              value={availabilityFilter}
              onChange={(event) =>
                setAvailabilityFilter(event.target.value)
              }
              className="rounded-xl border border-[#ded3c6] bg-[#fffdfa] px-3 py-3 text-sm outline-none focus:border-[#9a7258]"
            >
              <option value="all">All Availability</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setFeaturedFilter("all")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                featuredFilter === "all"
                  ? "bg-[#3b281f] text-white"
                  : "bg-[#f4eee7] text-[#66564c] hover:bg-[#eee5dc]"
              }`}
            >
              All Items
            </button>

            <button
              onClick={() => setFeaturedFilter("featured")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                featuredFilter === "featured"
                  ? "bg-[#3b281f] text-white"
                  : "bg-[#f4eee7] text-[#66564c] hover:bg-[#eee5dc]"
              }`}
            >
              <Star size={13} />
              Featured
            </button>

            <button
              onClick={() => setFeaturedFilter("regular")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                featuredFilter === "regular"
                  ? "bg-[#3b281f] text-white"
                  : "bg-[#f4eee7] text-[#66564c] hover:bg-[#eee5dc]"
              }`}
            >
              Regular
            </button>
          </div>
        </section>

        {/* Menu Grid */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-[#e4d9cc] bg-white">
            <div className="text-center">
              <LoaderCircle
                size={34}
                className="mx-auto mb-3 animate-spin text-[#8c624a]"
              />

              <p className="text-sm font-medium">
                Loading menu...
              </p>

              <p className="mt-1 text-xs text-[#81736a]">
                Please wait a moment.
              </p>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-[#e4d9cc] bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5eee6] text-[#8c624a]">
              <Coffee size={28} />
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              {menuItems.length === 0
                ? "No menu items yet"
                : "No matching items"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#81736a]">
              {menuItems.length === 0
                ? "Start building your cafe menu by adding your first item."
                : "Try changing your search or filters to find the menu item you are looking for."}
            </p>

            {menuItems.length === 0 ? (
              <button
                onClick={openAddForm}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6f4632] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5d3929]"
              >
                <Plus size={17} />
                Add First Item
              </button>
            ) : (
              <button
                onClick={clearFilters}
                className="mt-5 rounded-xl border border-[#ded3c6] px-5 py-3 text-sm font-semibold text-[#5c4b41] transition hover:bg-[#f8f5ef]"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => {
              const categoryName =
                getCategoryNameFromItem(item);

              const isDeleting = deletingId === item._id;

              return (
                <article
                  key={item._id}
                  className="group overflow-hidden rounded-3xl border border-[#e4d9cc] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#f1ebe3]">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
                          !item.isAvailable
                            ? "grayscale"
                            : ""
                        }`}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#a18d80]">
                        <Coffee size={45} />
                      </div>
                    )}

                    {!item.isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="rounded-full bg-black/65 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
                          Currently Unavailable
                        </span>
                      </div>
                    )}

                    {/* Top badges */}
                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-[#5d4639] shadow-sm backdrop-blur">
                        {categoryName}
                      </span>

                      {item.featured && (
                        <span className="flex items-center gap-1 rounded-full bg-[#c58b3b] px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm">
                          <Star size={11} fill="currentColor" />
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Veg badge */}
                    <div className="absolute bottom-3 left-3">
                      <span
                        className={`flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold shadow-sm ${
                          item.isVeg
                            ? "text-emerald-700"
                            : "text-red-700"
                        }`}
                      >
                        <span
                          className={`flex h-3.5 w-3.5 items-center justify-center rounded-sm border ${
                            item.isVeg
                              ? "border-emerald-600"
                              : "border-red-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              item.isVeg
                                ? "bg-emerald-600"
                                : "bg-red-600"
                            }`}
                          />
                        </span>

                        {item.isVeg ? "Veg" : "Non-Veg"}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-[#2f241e]">
                          {item.name}
                        </h3>

                        <p className="mt-1 line-clamp-2 min-h-[40px] text-sm leading-5 text-[#81736a]">
                          {item.description}
                        </p>
                      </div>

                      <p className="shrink-0 text-lg font-bold text-[#7a4b34]">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                          item.isAvailable
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {item.isAvailable ? (
                          <>
                            <Eye size={13} />
                            Available
                          </>
                        ) : (
                          <>
                            <EyeOff size={13} />
                            Unavailable
                          </>
                        )}
                      </span>

                      <span className="text-xs text-[#99887d]">
                        {item.featured
                          ? "Featured item"
                          : "Regular item"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openEditForm(item)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-[#ded3c6] bg-[#fffdfa] px-4 py-2.5 text-sm font-semibold text-[#5c4336] transition hover:bg-[#f5eee6]"
                      >
                        <Edit3 size={15} />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(item)}
                        disabled={isDeleting}
                        className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isDeleting ? (
                          <LoaderCircle
                            size={15}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={15} />
                        )}

                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------------- Components ---------------- */

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

function ToggleBox({
  checked,
  onChange,
  title,
  description,
  color,
}) {
  const colorClasses = {
    green: checked
      ? "border-emerald-200 bg-emerald-50"
      : "border-[#e4d9cc] bg-white",

    blue: checked
      ? "border-blue-200 bg-blue-50"
      : "border-[#e4d9cc] bg-white",

    amber: checked
      ? "border-amber-200 bg-amber-50"
      : "border-[#e4d9cc] bg-white",
  };

  const dotClasses = {
    green: "bg-emerald-600",
    blue: "bg-blue-600",
    amber: "bg-amber-600",
  };

  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${colorClasses[color]}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="sr-only"
      />

      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
          checked
            ? "border-transparent"
            : "border-[#cfc2b6] bg-white"
        }`}
      >
        {checked && (
          <span
            className={`flex h-full w-full items-center justify-center rounded-md ${dotClasses[color]}`}
          >
            <Check
              size={13}
              strokeWidth={3}
              className="text-white"
            />
          </span>
        )}
      </span>

      <span className="min-w-0">
        <span className="block text-sm font-semibold">
          {title}
        </span>

        <span className="mt-0.5 block text-[11px] text-[#81736a]">
          {description}
        </span>
      </span>
    </label>
  );
}
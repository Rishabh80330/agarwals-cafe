import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Edit3,
  FolderOpen,
  ImagePlus,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

const emptyForm = {
  name: "",
  description: "",
  image: "",
  isActive: true,
  displayOrder: 0,
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // FETCH CATEGORIES
  // =========================

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/categories");

      setCategories(response.data.categories || []);
    } catch (err) {
      console.error("Category fetch error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // =========================
  // STATS
  // =========================

  const totalCategories = categories.length;

  const activeCategories = categories.filter(
    (category) => category.isActive
  ).length;

  const inactiveCategories = categories.filter(
    (category) => !category.isActive
  ).length;

  // =========================
  // FILTERED CATEGORIES
  // =========================

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...categories]
      .filter((category) => {
        if (statusFilter === "active") {
          return category.isActive;
        }

        if (statusFilter === "inactive") {
          return !category.isActive;
        }

        return true;
      })
      .filter((category) => {
        if (!query) return true;

        return (
          category.name?.toLowerCase().includes(query) ||
          category.description
            ?.toLowerCase()
            .includes(query)
        );
      })
      .sort(
        (a, b) =>
          Number(a.displayOrder || 0) -
          Number(b.displayOrder || 0)
      );
  }, [categories, search, statusFilter]);

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  // =========================
  // ADD FORM
  // =========================

  const openAddForm = () => {
    setError("");
    setSuccess("");

    setForm({
      ...emptyForm,
      displayOrder: categories.length,
    });

    setEditingId(null);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // EDIT FORM
  // =========================

  const openEditForm = (category) => {
    setError("");
    setSuccess("");

    setForm({
      name: category.name || "",
      description:
        category.description || "",
      image: category.image || "",
      isActive:
        category.isActive ?? true,
      displayOrder:
        category.displayOrder ?? 0,
    });

    setEditingId(category._id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // IMAGE UPLOAD
  // =========================

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];

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
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      const imageUrl =
        response.data.url ||
        response.data.imageUrl ||
        response.data.secure_url;

      if (!imageUrl) {
        throw new Error(
          "Image URL was not returned by server."
        );
      }

      setForm((current) => ({
        ...current,
        image: imageUrl,
      }));

      setSuccess(
        "Image uploaded successfully."
      );
    } catch (err) {
      console.error(
        "Category image upload error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Image upload failed."
      );
    } finally {
      setUploading(false);

      e.target.value = "";
    }
  };

  // =========================
  // REMOVE IMAGE
  // =========================

  const removeImage = () => {
    setForm((current) => ({
      ...current,
      image: "",
    }));

    setSuccess("");
  };

  // =========================
  // SAVE CATEGORY
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError(
        "Please enter a category name."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: form.name.trim(),
        description:
          form.description.trim(),
        image: form.image,
        isActive: form.isActive,
        displayOrder:
          Number(form.displayOrder) || 0,
      };

      if (editingId) {
        await api.put(
          `/categories/${editingId}`,
          payload
        );

        setSuccess(
          "Category updated successfully."
        );
      } else {
        await api.post(
          "/categories",
          payload
        );

        setSuccess(
          "Category created successfully."
        );
      }

      await fetchCategories();

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error(
        "Save category error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE
  // =========================

  const deleteCategory = async (category) => {
    const confirmed = window.confirm(
      `Delete "${category.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(category._id);
      setError("");
      setSuccess("");

      await api.delete(
        `/categories/${category._id}`
      );

      setCategories((current) =>
        current.filter(
          (item) =>
            item._id !== category._id
        )
      );

      setSuccess(
        `"${category.name}" deleted successfully.`
      );
    } catch (err) {
      console.error(
        "Delete category error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete category."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f0e9] px-4 pt-24">
        <div className="flex flex-col items-center">
          <LoaderCircle
            size={38}
            className="animate-spin text-[#a76d3e]"
          />

          <p className="mt-4 text-sm text-[#75685d]">
            Loading categories...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f0e9] pt-24 sm:pt-28">

      {/* ================= HEADER ================= */}

      <header className="border-b border-[#ded3c6] bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-5 lg:px-8">

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a76d3e] sm:text-xs">
              Agarwal's Cafe
            </p>

            <h1 className="mt-1 font-serif text-2xl text-[#2b2118] sm:text-3xl md:text-4xl">
              Categories
            </h1>

            <p className="mt-1 text-xs text-[#8b7b6d] sm:text-sm">
              Manage the categories shown across your cafe menu.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">

            <button
              onClick={fetchCategories}
              disabled={loading}
              className="flex items-center gap-2 rounded-full border border-[#ded3c6] px-3 py-2.5 text-sm text-[#5f5146] transition hover:bg-[#f8f4ee] disabled:opacity-60 sm:px-4"
            >
              <RefreshCw
                size={16}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
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

      {/* ================= CONTENT ================= */}

      <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-5 sm:py-8 lg:px-8">

        {/* ALERTS */}

        {error && (
          <div className="mb-5 flex items-start justify-between gap-4 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
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
          <div className="mb-5 flex items-start justify-between gap-4 rounded-2xl border border-green-100 bg-green-50 px-5 py-4 text-sm text-green-700">
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

        {/* ================= TITLE ================= */}

        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a76d3e]">
              Menu Structure
            </p>

            <h2 className="mt-2 font-serif text-2xl text-[#2b2118] sm:text-3xl">
              Category Management
            </h2>

            <p className="mt-1 text-sm text-[#8b7b6d]">
              Create, organise and control your menu categories.
            </p>
          </div>

          <button
            onClick={
              showForm
                ? resetForm
                : openAddForm
            }
            className="flex items-center justify-center gap-2 rounded-full bg-[#2b2118] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#3b2c20]"
          >
            {showForm ? (
              <>
                <X size={17} />
                Close Form
              </>
            ) : (
              <>
                <Plus size={17} />
                Add Category
              </>
            )}
          </button>

        </div>

        {/* ================= STATS ================= */}

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9b8b7c]">
              Total Categories
            </p>

            <div className="mt-3 flex items-end justify-between">
              <p className="font-serif text-3xl text-[#2b2118]">
                {totalCategories}
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eee5d9] text-[#a76d3e]">
                <FolderOpen size={19} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9b8b7c]">
              Active
            </p>

            <div className="mt-3 flex items-end justify-between">
              <p className="font-serif text-3xl text-green-700">
                {activeCategories}
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-700">
                <Check size={19} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9b8b7c]">
              Inactive
            </p>

            <div className="mt-3 flex items-end justify-between">
              <p className="font-serif text-3xl text-red-600">
                {inactiveCategories}
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                <X size={19} />
              </div>
            </div>
          </div>

        </div>

        {/* ================= FORM ================= */}

        {showForm && (
          <section className="mb-8 rounded-[1.5rem] bg-white p-5 shadow-sm sm:p-7">

            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a76d3e]">
                {editingId
                  ? "Edit Category"
                  : "New Category"}
              </p>

              <h2 className="mt-2 font-serif text-2xl text-[#2b2118]">
                {editingId
                  ? "Update Category"
                  : "Create Category"}
              </h2>

              <p className="mt-1 text-sm text-[#8b7b6d]">
                Add the information customers will see on the menu.
              </p>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="grid gap-6 lg:grid-cols-2">

                {/* LEFT */}

                <div className="space-y-5">

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#5f5146]">
                      Category Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Coffee"
                      maxLength={60}
                      className="w-full rounded-xl border border-[#ded3c6] bg-[#fcfaf7] px-4 py-3 text-sm text-[#2b2118] outline-none transition placeholder:text-[#b4a79b] focus:border-[#a76d3e] focus:ring-2 focus:ring-[#c78b55]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#5f5146]">
                      Description
                    </label>

                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={5}
                      maxLength={250}
                      placeholder="Short description of this category..."
                      className="w-full resize-none rounded-xl border border-[#ded3c6] bg-[#fcfaf7] px-4 py-3 text-sm leading-6 text-[#2b2118] outline-none transition placeholder:text-[#b4a79b] focus:border-[#a76d3e] focus:ring-2 focus:ring-[#c78b55]/10"
                    />

                    <p className="mt-1 text-right text-xs text-[#a79a8d]">
                      {form.description.length}/250
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#5f5146]">
                        Display Order
                      </label>

                      <input
                        type="number"
                        name="displayOrder"
                        min="0"
                        value={form.displayOrder}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-[#ded3c6] bg-[#fcfaf7] px-4 py-3 text-sm text-[#2b2118] outline-none transition focus:border-[#a76d3e] focus:ring-2 focus:ring-[#c78b55]/10"
                      />

                      <p className="mt-1 text-xs text-[#9b8b7c]">
                        Lower number appears first.
                      </p>
                    </div>

                    <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#faf7f3] px-4 py-3">

                      <input
                        type="checkbox"
                        name="isActive"
                        checked={form.isActive}
                        onChange={handleChange}
                        className="h-4 w-4 accent-[#a76d3e]"
                      />

                      <div>
                        <p className="text-sm font-medium text-[#5f5146]">
                          Active
                        </p>

                        <p className="text-xs text-[#9b8b7c]">
                          Visible to customers
                        </p>
                      </div>

                    </label>

                  </div>

                </div>

                {/* IMAGE */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-[#5f5146]">
                    Category Image
                  </label>

                  <div className="overflow-hidden rounded-2xl border border-[#ded3c6] bg-[#fcfaf7]">

                    {form.image ? (
                      <div className="relative aspect-[4/3]">

                        <img
                          src={form.image}
                          alt={
                            form.name ||
                            "Category"
                          }
                          className="h-full w-full object-cover"
                        />

                        <div className="absolute inset-x-0 bottom-0 flex justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">

                          <label className="flex cursor-pointer items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-medium text-[#3b2c20]">
                            <ImagePlus size={15} />
                            Change

                            <input
                              type="file"
                              accept="image/*"
                              onChange={
                                handleImageUpload
                              }
                              disabled={
                                uploading
                              }
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={removeImage}
                            className="flex items-center gap-2 rounded-full bg-red-500/90 px-4 py-2 text-xs font-medium text-white"
                          >
                            <Trash2 size={15} />
                            Remove
                          </button>

                        </div>

                      </div>
                    ) : (
                      <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center p-6 text-center transition hover:bg-[#f8f4ee]">

                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eee5d9] text-[#a76d3e]">
                          {uploading ? (
                            <LoaderCircle
                              size={27}
                              className="animate-spin"
                            />
                          ) : (
                            <ImagePlus
                              size={27}
                            />
                          )}
                        </div>

                        <p className="mt-4 text-sm font-medium text-[#5f5146]">
                          {uploading
                            ? "Uploading..."
                            : "Upload category image"}
                        </p>

                        <p className="mt-1 text-xs text-[#9b8b7c]">
                          JPG, PNG or WEBP
                        </p>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={
                            handleImageUpload
                          }
                          disabled={uploading}
                          className="hidden"
                        />

                      </label>
                    )}

                  </div>

                  {uploading && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-[#8b7b6d]">
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                      Uploading image to Cloudinary...
                    </div>
                  )}

                  <p className="mt-3 text-xs leading-5 text-[#9b8b7c]">
                    Use a clear food or category image. The owner can replace this image later.
                  </p>

                </div>

              </div>

              {/* BUTTONS */}

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#eee5d9] pt-6 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-[#ded3c6] px-6 py-3 text-sm font-medium text-[#5f5146] transition hover:bg-[#f8f4ee]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    uploading ||
                    !form.name.trim()
                  }
                  className="flex items-center justify-center gap-2 rounded-full bg-[#2b2118] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#3b2c20] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      {editingId
                        ? "Update Category"
                        : "Create Category"}
                    </>
                  )}
                </button>

              </div>

            </form>
          </section>
        )}

        {/* ================= SEARCH + FILTER ================= */}

        <section className="mb-6 rounded-[1.5rem] bg-white p-4 shadow-sm sm:p-5">

          <div className="flex flex-col gap-3 lg:flex-row">

            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b8b7c]"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search categories..."
                className="w-full rounded-xl border border-[#ded3c6] bg-[#fcfaf7] py-3 pl-11 pr-4 text-sm text-[#2b2118] outline-none transition placeholder:text-[#b4a79b] focus:border-[#a76d3e]"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#8b7b6d] hover:bg-[#eee5d9]"
                >
                  <X size={16} />
                </button>
              )}

            </div>

            <div className="flex rounded-xl border border-[#ded3c6] bg-[#fcfaf7] p-1">

              {[
                ["all", "All"],
                ["active", "Active"],
                ["inactive", "Inactive"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() =>
                    setStatusFilter(value)
                  }
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition sm:flex-none ${
                    statusFilter === value
                      ? "bg-[#2b2118] text-white"
                      : "text-[#75685d] hover:bg-[#eee5d9]"
                  }`}
                >
                  {label}
                </button>
              ))}

            </div>

          </div>

          {(search ||
            statusFilter !== "all") && (
            <div className="mt-3 flex items-center justify-between text-xs text-[#8b7b6d]">
              <span>
                Showing{" "}
                {filteredCategories.length}{" "}
                of {categories.length} categories
              </span>

              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="font-medium text-[#a76d3e] hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}

        </section>

        {/* ================= CATEGORY LIST ================= */}

        {filteredCategories.length === 0 ? (
          <div className="rounded-[1.5rem] bg-white px-5 py-16 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eee5d9] text-[#a76d3e]">
              <FolderOpen size={28} />
            </div>

            <h2 className="mt-5 font-serif text-2xl text-[#2b2118]">
              {categories.length === 0
                ? "No categories yet"
                : "No categories found"}
            </h2>

            <p className="mt-2 text-sm text-[#75685d]">
              {categories.length === 0
                ? "Create your first menu category."
                : "Try changing your search or filter."}
            </p>

            {categories.length === 0 ? (
              <button
                onClick={openAddForm}
                className="mt-6 rounded-full bg-[#2b2118] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#3b2c20]"
              >
                <span className="inline-flex items-center gap-2">
                  <Plus size={16} />
                  Add First Category
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="mt-6 rounded-full border border-[#ded3c6] px-6 py-3 text-sm font-medium text-[#5f5146] transition hover:bg-[#f8f4ee]"
              >
                Clear Filters
              </button>
            )}

          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

            {filteredCategories.map(
              (category) => (
                <article
                  key={category._id}
                  className="group overflow-hidden rounded-[1.5rem] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >

                  {/* IMAGE */}

                  <div className="relative aspect-[4/3] overflow-hidden bg-[#eee5d9]">

                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#a76d3e]">
                        <FolderOpen
                          size={42}
                        />
                      </div>
                    )}

                    <div className="absolute left-3 top-3">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-medium shadow-sm ${
                          category.isActive
                            ? "bg-white text-green-700"
                            : "bg-white text-red-600"
                        }`}
                      >
                        {category.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    <div className="absolute right-3 top-3">
                      <span className="rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                        #{category.displayOrder}
                      </span>
                    </div>

                  </div>

                  {/* CONTENT */}

                  <div className="p-5">

                    <div className="flex items-start justify-between gap-3">

                      <h3 className="font-serif text-2xl text-[#2b2118]">
                        {category.name}
                      </h3>

                    </div>

                    <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#75685d]">
                      {category.description ||
                        "No description added."}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-[#eee5d9] pt-4 text-xs text-[#9b8b7c]">
                      <span>
                        Display order
                      </span>

                      <span className="font-semibold text-[#5f5146]">
                        #{category.displayOrder}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">

                      <button
                        onClick={() =>
                          openEditForm(
                            category
                          )
                        }
                        className="flex items-center justify-center gap-2 rounded-xl border border-[#ded3c6] py-3 text-sm font-medium text-[#5f5146] transition hover:bg-[#f8f4ee]"
                      >
                        <Edit3 size={16} />
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteCategory(
                            category
                          )
                        }
                        disabled={
                          deletingId ===
                          category._id
                        }
                        className="flex items-center justify-center gap-2 rounded-xl bg-red-50 py-3 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId ===
                        category._id ? (
                          <LoaderCircle
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={16} />
                        )}

                        Delete
                      </button>

                    </div>

                  </div>

                </article>
              )
            )}

          </div>
        )}

      </div>
    </main>
  );
};

export default AdminCategories;
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Edit3,
  Gift,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
  ToggleLeft,
  ToggleRight,
  Percent,
  IndianRupee,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

const emptyForm = {
  name: "",
  description: "",
  pointsRequired: "",
  discountType: "fixed",
  discountValue: "",
  isActive: true,
};

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("en-IN");
};

const formatDiscount = (reward) => {
  const value = Number(reward.discountValue || 0);

  if (reward.discountType === "percentage") {
    return `${value}% OFF`;
  }

  return `₹${value.toLocaleString("en-IN")} OFF`;
};

const AdminRewards = () => {
  const [rewards, setRewards] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [discountFilter, setDiscountFilter] = useState("all");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchRewards = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/rewards");

      setRewards(response.data.rewards || []);
    } catch (err) {
      console.error("Rewards fetch error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load rewards. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const stats = useMemo(() => {
    const total = rewards.length;

    const active = rewards.filter(
      (reward) => reward.isActive === true
    ).length;

    const inactive = rewards.filter(
      (reward) => reward.isActive !== true
    ).length;

    const fixed = rewards.filter(
      (reward) => reward.discountType === "fixed"
    ).length;

    const percentage = rewards.filter(
      (reward) => reward.discountType === "percentage"
    ).length;

    return {
      total,
      active,
      inactive,
      fixed,
      percentage,
    };
  }, [rewards]);

  const filteredRewards = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return rewards
      .filter((reward) => {
        if (!searchValue) return true;

        const name = reward.name?.toLowerCase() || "";
        const description =
          reward.description?.toLowerCase() || "";

        return (
          name.includes(searchValue) ||
          description.includes(searchValue)
        );
      })
      .filter((reward) => {
        if (statusFilter === "all") return true;

        if (statusFilter === "active") {
          return reward.isActive === true;
        }

        if (statusFilter === "inactive") {
          return reward.isActive !== true;
        }

        return true;
      })
      .filter((reward) => {
        if (discountFilter === "all") return true;

        return reward.discountType === discountFilter;
      })
      .sort((a, b) => {
        return (a.pointsRequired || 0) - (b.pointsRequired || 0);
      });
  }, [
    rewards,
    search,
    statusFilter,
    discountFilter,
  ]);

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    discountFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDiscountFilter("all");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const openAddForm = () => {
    setError("");
    setSuccess("");

    setForm({
      ...emptyForm,
    });

    setEditingId(null);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openEditForm = (reward) => {
    setError("");
    setSuccess("");

    setForm({
      name: reward.name || "",
      description: reward.description || "",
      pointsRequired: reward.pointsRequired ?? "",
      discountType: reward.discountType || "fixed",
      discountValue: reward.discountValue ?? "",
      isActive: reward.isActive ?? true,
    });

    setEditingId(reward._id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = form.name.trim();
    const description = form.description.trim();

    const pointsRequired = Number(form.pointsRequired);
    const discountValue = Number(form.discountValue);

    if (!name) {
      setError("Please enter a reward name.");
      return;
    }

    if (
      form.pointsRequired === "" ||
      Number.isNaN(pointsRequired) ||
      pointsRequired < 1
    ) {
      setError("Points required must be at least 1.");
      return;
    }

    if (
      form.discountValue === "" ||
      Number.isNaN(discountValue) ||
      discountValue < 0
    ) {
      setError("Please enter a valid discount value.");
      return;
    }

    if (
      form.discountType === "percentage" &&
      discountValue > 100
    ) {
      setError(
        "Percentage discount cannot be more than 100%."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name,
        description,
        pointsRequired,
        discountType: form.discountType,
        discountValue,
        isActive: form.isActive,
      };

      if (editingId) {
        await api.put(
          `/rewards/${editingId}`,
          payload
        );

        setSuccess("Reward updated successfully.");
      } else {
        await api.post("/rewards", payload);

        setSuccess("Reward created successfully.");
      }

      await fetchRewards();

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error("Save reward error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save reward."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteReward = async (reward) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${reward.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(reward._id);
      setError("");
      setSuccess("");

      await api.delete(`/rewards/${reward._id}`);

      setRewards((current) =>
        current.filter(
          (item) => item._id !== reward._id
        )
      );

      setSuccess(
        `"${reward.name}" deleted successfully.`
      );
    } catch (err) {
      console.error("Delete reward error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete reward."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const toggleRewardStatus = async (reward) => {
    try {
      setTogglingId(reward._id);
      setError("");
      setSuccess("");

      const payload = {
        name: reward.name,
        description: reward.description || "",
        pointsRequired: Number(
          reward.pointsRequired
        ),
        discountType: reward.discountType,
        discountValue: Number(
          reward.discountValue
        ),
        isActive: !reward.isActive,
      };

      await api.put(
        `/rewards/${reward._id}`,
        payload
      );

      setRewards((current) =>
        current.map((item) =>
          item._id === reward._id
            ? {
                ...item,
                isActive: !item.isActive,
              }
            : item
        )
      );

      setSuccess(
        `${reward.name} is now ${
          !reward.isActive
            ? "active"
            : "inactive"
        }.`
      );
    } catch (err) {
      console.error(
        "Toggle reward status error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to update reward status."
      );
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f5ef] px-4">
        <div className="text-center">
          <LoaderCircle
            size={38}
            className="mx-auto animate-spin text-[#8c624a]"
          />

          <p className="mt-4 text-sm font-medium text-[#5f5146]">
            Loading rewards...
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
                Rewards Management
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={fetchRewards}
              disabled={loading}
              className="flex h-10 items-center gap-2 rounded-xl border border-[#ded3c6] bg-white px-3 text-sm font-medium text-[#4b3327] transition hover:bg-[#f2ece4] disabled:opacity-60 sm:px-4"
            >
              <RefreshCw
                size={16}
                className={
                  loading ? "animate-spin" : ""
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

        {/* Intro */}
        <section className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[#9a7258]">
              <Gift size={18} />

              <span className="text-sm font-medium">
                Customer Loyalty
              </span>
            </div>

            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Rewards & Offers
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#75665c]">
              Create and manage loyalty rewards that customers
              can redeem using their points.
            </p>
          </div>

          <button
            onClick={
              showForm ? resetForm : openAddForm
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-[#6f4632] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5d3929]"
          >
            {showForm ? (
              <>
                <X size={17} />
                Close Form
              </>
            ) : (
              <>
                <Plus size={17} />
                Add Reward
              </>
            )}
          </button>
        </section>

        {/* Stats */}
        <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            icon={<Gift size={18} />}
            label="Total Rewards"
            value={stats.total}
          />

          <StatCard
            icon={<ToggleRight size={19} />}
            label="Active"
            value={stats.active}
          />

          <StatCard
            icon={<ToggleLeft size={19} />}
            label="Inactive"
            value={stats.inactive}
          />

          <StatCard
            icon={<IndianRupee size={18} />}
            label="Fixed Offers"
            value={stats.fixed}
          />

          <StatCard
            icon={<Percent size={18} />}
            label="Percentage"
            value={stats.percentage}
          />
        </section>

        {/* Form */}
        {showForm && (
          <section className="mb-8 overflow-hidden rounded-3xl border border-[#e4d9cc] bg-white shadow-sm">
            <div className="border-b border-[#eee6dd] px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">
                    {editingId
                      ? "Edit Reward"
                      : "Create New Reward"}
                  </h3>

                  <p className="mt-1 text-xs text-[#81736a]">
                    Configure points and discount details for
                    this reward.
                  </p>
                </div>

                <button
                  onClick={resetForm}
                  disabled={saving}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e4d9cc] text-[#66564c] transition hover:bg-[#f8f5ef] disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 sm:p-6"
            >
              <div className="grid gap-5 lg:grid-cols-2">
                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#5f5146]">
                    Reward Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. ₹50 Off"
                    className="w-full rounded-xl border border-[#ded3c6] bg-[#fffdfa] px-4 py-3 text-sm outline-none transition placeholder:text-[#aa9b90] focus:border-[#9a7258] focus:ring-2 focus:ring-[#9a7258]/10"
                  />
                </div>

                {/* Points */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#5f5146]">
                    Points Required
                  </label>

                  <div className="relative">
                    <Star
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a7258]"
                    />

                    <input
                      type="number"
                      name="pointsRequired"
                      min="1"
                      value={form.pointsRequired}
                      onChange={handleChange}
                      placeholder="500"
                      className="w-full rounded-xl border border-[#ded3c6] bg-[#fffdfa] py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-[#aa9b90] focus:border-[#9a7258] focus:ring-2 focus:ring-[#9a7258]/10"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="lg:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#5f5146]">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe what the customer gets..."
                    className="w-full resize-none rounded-xl border border-[#ded3c6] bg-[#fffdfa] px-4 py-3 text-sm outline-none transition placeholder:text-[#aa9b90] focus:border-[#9a7258] focus:ring-2 focus:ring-[#9a7258]/10"
                  />
                </div>

                {/* Discount Type */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#5f5146]">
                    Discount Type
                  </label>

                  <select
                    name="discountType"
                    value={form.discountType}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#ded3c6] bg-[#fffdfa] px-4 py-3 text-sm outline-none transition focus:border-[#9a7258] focus:ring-2 focus:ring-[#9a7258]/10"
                  >
                    <option value="fixed">
                      Fixed Amount
                    </option>

                    <option value="percentage">
                      Percentage
                    </option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#5f5146]">
                    Discount Value
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      name="discountValue"
                      min="0"
                      max={
                        form.discountType ===
                        "percentage"
                          ? "100"
                          : undefined
                      }
                      step={
                        form.discountType ===
                        "percentage"
                          ? "1"
                          : "0.01"
                      }
                      value={form.discountValue}
                      onChange={handleChange}
                      placeholder={
                        form.discountType ===
                        "percentage"
                          ? "10"
                          : "50"
                      }
                      className="w-full rounded-xl border border-[#ded3c6] bg-[#fffdfa] px-4 py-3 pr-14 text-sm outline-none transition placeholder:text-[#aa9b90] focus:border-[#9a7258] focus:ring-2 focus:ring-[#9a7258]/10"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#8b7b6d]">
                      {form.discountType ===
                      "percentage"
                        ? "%"
                        : "₹"}
                    </span>
                  </div>
                </div>

                {/* Active */}
                <div className="lg:col-span-2">
                  <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-[#e5dbd0] bg-[#faf7f3] p-4">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                      className="h-5 w-5 accent-[#6f4632]"
                    />

                    <div>
                      <p className="text-sm font-semibold text-[#4d3a2e]">
                        Active Reward
                      </p>

                      <p className="mt-1 text-xs text-[#8b7b6d]">
                        Customers can see and redeem this reward.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#eee6dd] pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-xl border border-[#ded3c6] px-6 py-3 text-sm font-semibold text-[#5c4b41] transition hover:bg-[#f8f5ef] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#6f4632] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#5d3929] disabled:cursor-not-allowed disabled:opacity-60"
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

                      {editingId
                        ? "Update Reward"
                        : "Create Reward"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Filters */}
        <section className="mb-6 rounded-3xl border border-[#e4d9cc] bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">
                Reward List
              </h3>

              <p className="mt-1 text-xs text-[#81736a]">
                Showing {filteredRewards.length} of{" "}
                {rewards.length} rewards
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

          <div className="grid gap-3 md:grid-cols-3">
            {/* Search */}
            <div className="relative md:col-span-1">
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
                placeholder="Search rewards..."
                className="w-full rounded-xl border border-[#ded3c6] bg-[#fffdfa] py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-[#aa9b90] focus:border-[#9a7258] focus:ring-2 focus:ring-[#9a7258]/10"
              />
            </div>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-xl border border-[#ded3c6] bg-[#fffdfa] px-4 py-3 text-sm outline-none focus:border-[#9a7258]"
            >
              <option value="all">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

            {/* Discount */}
            <select
              value={discountFilter}
              onChange={(event) =>
                setDiscountFilter(event.target.value)
              }
              className="rounded-xl border border-[#ded3c6] bg-[#fffdfa] px-4 py-3 text-sm outline-none focus:border-[#9a7258]"
            >
              <option value="all">
                All Discount Types
              </option>

              <option value="fixed">
                Fixed Amount
              </option>

              <option value="percentage">
                Percentage
              </option>
            </select>
          </div>
        </section>

        {/* Rewards */}
        {filteredRewards.length === 0 ? (
          <div className="rounded-3xl border border-[#e4d9cc] bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5eee6] text-[#8c624a]">
              <Gift size={28} />
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              {rewards.length === 0
                ? "No rewards yet"
                : "No matching rewards"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#81736a]">
              {rewards.length === 0
                ? "Create your first loyalty reward to give customers an extra reason to come back."
                : "Try changing your search or filters."}
            </p>

            {rewards.length === 0 ? (
              <button
                onClick={openAddForm}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6f4632] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5d3929]"
              >
                <Plus size={17} />
                Add First Reward
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
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredRewards.map((reward) => {
              const isDeleting =
                deletingId === reward._id;

              const isToggling =
                togglingId === reward._id;

              return (
                <article
                  key={reward._id}
                  className="group overflow-hidden rounded-3xl border border-[#e4d9cc] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Card Header */}
                  <div className="border-b border-[#eee6dd] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f3eae1] text-[#8c624a]">
                          <Gift size={22} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a7258]">
                            Loyalty Reward
                          </p>

                          <h3 className="mt-1 truncate text-lg font-semibold text-[#30231c]">
                            {reward.name}
                          </h3>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                          reward.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {reward.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    <p className="mt-4 min-h-[42px] text-sm leading-6 text-[#81736a]">
                      {reward.description ||
                        "No description added for this reward."}
                    </p>
                  </div>

                  {/* Reward Value */}
                  <div className="p-5">
                    <div className="rounded-2xl bg-[#faf7f3] p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9b8b7c]">
                            Customer Gets
                          </p>

                          <p className="mt-2 font-serif text-3xl font-semibold text-[#8a593d]">
                            {formatDiscount(reward)}
                          </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#a76d3e] shadow-sm">
                          {reward.discountType ===
                          "percentage" ? (
                            <Percent size={20} />
                          ) : (
                            <IndianRupee size={20} />
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2 border-t border-[#e8ded3] pt-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#a76d3e]">
                          <Star
                            size={15}
                            fill="currentColor"
                          />
                        </div>

                        <div>
                          <p className="text-[11px] text-[#8b7b6d]">
                            Points required
                          </p>

                          <p className="text-sm font-bold text-[#3f3027]">
                            {formatNumber(
                              reward.pointsRequired
                            )}{" "}
                            points
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Toggle */}
                    <button
                      onClick={() =>
                        toggleRewardStatus(reward)
                      }
                      disabled={isToggling}
                      className={`mt-4 flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        reward.isActive
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "border-[#ded3c6] bg-[#faf7f3] text-[#6f6055] hover:bg-[#f3ece4]"
                      }`}
                    >
                      <span className="flex items-center gap-2 font-semibold">
                        {isToggling ? (
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                          />
                        ) : reward.isActive ? (
                          <ToggleRight size={19} />
                        ) : (
                          <ToggleLeft size={19} />
                        )}

                        {reward.isActive
                          ? "Reward is active"
                          : "Reward is inactive"}
                      </span>

                      <span className="text-xs font-medium">
                        {isToggling
                          ? "Updating..."
                          : reward.isActive
                          ? "Disable"
                          : "Activate"}
                      </span>
                    </button>

                    {/* Actions */}
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <button
                        onClick={() =>
                          openEditForm(reward)
                        }
                        className="flex items-center justify-center gap-2 rounded-xl border border-[#ded3c6] bg-[#fffdfa] py-3 text-sm font-semibold text-[#5c4b41] transition hover:bg-[#f5eee6]"
                      >
                        <Edit3 size={16} />
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteReward(reward)
                        }
                        disabled={isDeleting}
                        className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isDeleting ? (
                          <LoaderCircle
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={16} />
                        )}

                        {isDeleting
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

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

export default AdminRewards;
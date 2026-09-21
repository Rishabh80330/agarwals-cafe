import { useEffect, useState } from "react";
import {
  Check,
  Edit3,
  LoaderCircle,
  LogOut,
  MapPin,
  Plus,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showAddressForm, setShowAddressForm] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
  });

  const [addressForm, setAddressForm] = useState({
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users/profile");
      const userData = response.data.user;

      setUser(userData);

      setProfileForm({
        name: userData.name || "",
        phone: userData.phone || "",
      });
    } catch (err) {
      console.error("Profile fetch error:", err);

      if (err.response?.status === 401) {
        setError("Please login to view your profile.");
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load your profile."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));

    setMessage("");
    setError("");
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    setAddressForm((current) => ({
      ...current,
      [name]:
        name === "pincode"
          ? value.replace(/\D/g, "").slice(0, 6)
          : value,
    }));

    setMessage("");
    setError("");
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    if (!profileForm.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await api.put(
        "/users/profile",
        {
          name: profileForm.name.trim(),
          phone: profileForm.phone.trim(),
        }
      );

      const updatedUser = response.data.user;

      setUser((current) => ({
        ...current,
        ...updatedUser,
      }));

      localStorage.setItem(
        "agarwals-cafe-user",
        JSON.stringify({
          ...user,
          ...updatedUser,
        })
      );

      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error("Profile update error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const addAddress = async (e) => {
    e.preventDefault();

    const {
      addressLine,
      city,
      state,
      pincode,
    } = addressForm;

    if (
      !addressLine.trim() ||
      !city.trim() ||
      !state.trim()
    ) {
      setError("Please complete all address fields.");
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    try {
      setSavingAddress(true);
      setError("");
      setMessage("");

      const response = await api.post(
        "/users/addresses",
        {
          addressLine: addressLine.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode,
        }
      );

      setUser((current) => ({
        ...current,
        addresses: response.data.addresses,
      }));

      setAddressForm({
        addressLine: "",
        city: "",
        state: "",
        pincode: "",
      });

      setShowAddressForm(false);
      setMessage("Address added successfully.");
    } catch (err) {
      console.error("Add address error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to add address."
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const deleteAddress = async (addressId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await api.delete(
        `/users/addresses/${addressId}`
      );

      setUser((current) => ({
        ...current,
        addresses: response.data.addresses,
      }));

      setMessage("Address deleted successfully.");
    } catch (err) {
      console.error("Delete address error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete address."
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("agarwals-cafe-token");
    localStorage.removeItem("agarwals-cafe-user");

    navigate("/login");
  };

  const closeAddressForm = () => {
    setShowAddressForm(false);

    setAddressForm({
      addressLine: "",
      city: "",
      state: "",
      pincode: "",
    });

    setError("");
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f4ee] px-5 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">

          <div className="mb-10">
            <div className="h-3 w-28 animate-pulse rounded-full bg-[#e5d9cc]" />
            <div className="mt-4 h-12 w-60 animate-pulse rounded-xl bg-[#e5d9cc]" />
            <div className="mt-4 h-4 w-80 max-w-full animate-pulse rounded-full bg-[#e5d9cc]" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-64 animate-pulse rounded-[2rem] bg-[#e8ddd1]" />
            <div className="h-64 animate-pulse rounded-[2rem] bg-white lg:col-span-2" />
            <div className="h-80 animate-pulse rounded-[2rem] bg-white lg:col-span-3" />
          </div>
        </div>
      </main>
    );
  }

  /* =====================================================
     ERROR / NOT LOGGED IN
  ===================================================== */

  if (error && !user) {
    return (
      <main className="min-h-screen bg-[#f8f4ee] px-5 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[65vh] max-w-xl items-center justify-center">

          <div className="w-full rounded-[2rem] bg-white p-10 text-center shadow-[0_15px_50px_rgba(61,43,31,0.07)] sm:p-14">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#eee5d9] text-[#a76d3e]">
              <User size={34} />
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.3em] text-[#a76d3e]">
              Your account
            </p>

            <h1 className="mt-3 font-serif text-3xl text-[#2b2118]">
              Login required
            </h1>

            <p className="mt-4 text-sm leading-6 text-[#75685d]">
              Please login to manage your profile and saved addresses.
            </p>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-8 rounded-full bg-[#2b2118] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#3b2c20]"
            >
              Login
            </button>
          </div>
        </div>
      </main>
    );
  }

  const addresses = user?.addresses || [];

  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#f8f4ee] px-5 pb-24 pt-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-9">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a76d3e]">
            Your account
          </p>

          <div className="mt-2 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>
              <h1 className="font-serif text-4xl text-[#2b2118] sm:text-5xl">
                My Profile
              </h1>

              <p className="mt-3 text-sm leading-6 text-[#75685d]">
                Manage your personal details, loyalty points and saved addresses.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d8cabb] bg-white px-5 py-3 text-sm font-medium text-[#6d5d50] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        {/* Notifications */}
        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white">
              <Check size={16} />
            </div>
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 text-red-400 hover:text-red-700"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* =================================================
           TOP GRID
        ================================================= */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Loyalty */}
          <section className="relative overflow-hidden rounded-[2rem] bg-[#2b2118] p-7 text-white shadow-[0_20px_50px_rgba(43,33,24,0.15)]">

            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#c78b55]/10" />

            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#c78b55]">
                <User size={21} />
              </div>

              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.25em] text-[#d5a06d]">
                Loyalty points
              </p>

              <p className="mt-2 font-serif text-5xl">
                {user?.loyaltyPoints || 0}
              </p>

              <p className="mt-3 max-w-xs text-sm leading-6 text-white/55">
                Earn points every time you complete an order at Agarwal&apos;s Cafe.
              </p>

              <div className="mt-7 border-t border-white/10 pt-5">
                <p className="text-xs text-white/40">
                  Keep ordering to unlock more rewards.
                </p>
              </div>
            </div>
          </section>

          {/* Personal Details */}
          <section className="rounded-[2rem] border border-[#eadfd3] bg-white p-6 shadow-[0_8px_30px_rgba(61,43,31,0.04)] lg:col-span-2 sm:p-8">

            <div className="flex items-start justify-between gap-4">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a76d3e]">
                  Personal details
                </p>

                <h2 className="mt-2 font-serif text-2xl text-[#2b2118]">
                  Your information
                </h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eee5d9] text-[#a76d3e]">
                <Edit3 size={18} />
              </div>
            </div>

            <form
              onSubmit={updateProfile}
              className="mt-7 space-y-5"
            >

              {/* Name */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#75685d]">
                  Full name
                </label>

                <input
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  required
                  className="w-full rounded-xl border border-[#ded3c6] bg-[#fdfbf8] px-4 py-3.5 text-sm text-[#2b2118] outline-none transition placeholder:text-[#aa9b8d] focus:border-[#a76d3e] focus:ring-2 focus:ring-[#a76d3e]/10"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#75685d]">
                  Email
                </label>

                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-[#ded3c6] bg-[#eeeae4] px-4 py-3.5 text-sm text-[#8b7b6d]"
                />

                <p className="mt-2 text-xs text-[#9b8b7c]">
                  Email cannot be changed here.
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#75685d]">
                  Phone number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  placeholder="Your phone number"
                  inputMode="tel"
                  className="w-full rounded-xl border border-[#ded3c6] bg-[#fdfbf8] px-4 py-3.5 text-sm text-[#2b2118] outline-none transition placeholder:text-[#aa9b8d] focus:border-[#a76d3e] focus:ring-2 focus:ring-[#a76d3e]/10"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-[#2b2118] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#3b2c20] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                )}

                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </section>

          {/* =================================================
             ADDRESSES
          ================================================= */}

          <section className="rounded-[2rem] border border-[#eadfd3] bg-white p-6 shadow-[0_8px_30px_rgba(61,43,31,0.04)] lg:col-span-3 sm:p-8">

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a76d3e]">
                  Saved locations
                </p>

                <h2 className="mt-2 font-serif text-2xl text-[#2b2118]">
                  My Addresses
                </h2>

                <p className="mt-2 text-sm text-[#75685d]">
                  Save your frequently used delivery addresses.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAddressForm((current) => !current);
                  setError("");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2b2118] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3b2c20]"
              >
                {showAddressForm ? (
                  <>
                    <X size={16} />
                    Close
                  </>
                ) : (
                  <>
                    <Plus size={17} />
                    Add Address
                  </>
                )}
              </button>
            </div>

            {/* Add Address */}
            {showAddressForm && (
              <form
                onSubmit={addAddress}
                className="mt-7 rounded-2xl border border-[#e8ddd1] bg-[#f8f4ee] p-5 sm:p-6"
              >

                <div className="mb-5">
                  <p className="font-serif text-xl text-[#2b2118]">
                    Add a new address
                  </p>

                  <p className="mt-1 text-xs text-[#75685d]">
                    This address can be used during checkout.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#75685d]">
                      Address
                    </label>

                    <input
                      name="addressLine"
                      value={addressForm.addressLine}
                      onChange={handleAddressChange}
                      placeholder="House / Street / Area"
                      required
                      className="w-full rounded-xl border border-[#ded3c6] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#a76d3e] focus:ring-2 focus:ring-[#a76d3e]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#75685d]">
                      City
                    </label>

                    <input
                      name="city"
                      value={addressForm.city}
                      onChange={handleAddressChange}
                      placeholder="City"
                      required
                      className="w-full rounded-xl border border-[#ded3c6] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#a76d3e] focus:ring-2 focus:ring-[#a76d3e]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#75685d]">
                      State
                    </label>

                    <input
                      name="state"
                      value={addressForm.state}
                      onChange={handleAddressChange}
                      placeholder="State"
                      required
                      className="w-full rounded-xl border border-[#ded3c6] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#a76d3e] focus:ring-2 focus:ring-[#a76d3e]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#75685d]">
                      Pincode
                    </label>

                    <input
                      name="pincode"
                      value={addressForm.pincode}
                      onChange={handleAddressChange}
                      placeholder="6-digit pincode"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      className="w-full rounded-xl border border-[#ded3c6] bg-white px-4 py-3.5 text-sm tracking-wider outline-none transition focus:border-[#a76d3e] focus:ring-2 focus:ring-[#a76d3e]/10"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="inline-flex items-center gap-2 rounded-full bg-[#a76d3e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#915d32] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingAddress && (
                      <LoaderCircle
                        size={15}
                        className="animate-spin"
                      />
                    )}

                    {savingAddress
                      ? "Saving..."
                      : "Save Address"}
                  </button>

                  <button
                    type="button"
                    onClick={closeAddressForm}
                    className="rounded-full border border-[#d8cabb] bg-white px-6 py-3 text-sm font-semibold text-[#5f5146] transition hover:bg-[#eee5d9]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Address List */}
            <div className="mt-7 grid gap-4 md:grid-cols-2">

              {addresses.length > 0 ? (
                addresses.map((address, index) => (
                  <div
                    key={address._id || index}
                    className="group rounded-2xl border border-[#e5dbd0] bg-[#fdfbf8] p-5 transition hover:border-[#d4c2b0] hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">

                      <div className="flex min-w-0 gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eee5d9] text-[#a76d3e]">
                          <MapPin size={18} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[#2b2118]">
                              Delivery Address
                            </p>

                            {index === 0 && (
                              <span className="rounded-full bg-[#f0e4d7] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#a76d3e]">
                                Saved
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-sm leading-6 text-[#75685d]">
                            {address.addressLine}
                            <br />
                            {address.city}, {address.state}
                            <br />
                            {address.pincode}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          deleteAddress(address._id)
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#9b8b7c] transition hover:bg-red-50 hover:text-red-600"
                        title="Delete address"
                        aria-label="Delete address"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#d8cabb] p-10 text-center md:col-span-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eee5d9] text-[#a76d3e]">
                    <MapPin size={23} />
                  </div>

                  <p className="mt-4 font-medium text-[#2b2118]">
                    No saved addresses
                  </p>

                  <p className="mt-1 text-sm text-[#75685d]">
                    Add an address to make checkout faster.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Profile;
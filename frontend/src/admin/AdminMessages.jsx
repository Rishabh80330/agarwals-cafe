import React, { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Phone,
  Search,
  RefreshCw,
  Trash2,
  Eye,
  CheckCircle2,
  Clock3,
  MessageSquare,
  User,
  CalendarDays,
  X,
} from "lucide-react";
import api from "../services/api";

const STATUS_OPTIONS = ["all", "new", "read", "replied"];

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusStyles = {
  new: "bg-amber-50 text-amber-700 border-amber-200",
  read: "bg-blue-50 text-blue-700 border-blue-200",
  replied: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const statusLabels = {
  new: "New",
  read: "Read",
  replied: "Replied",
};

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchMessages = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/contact");

      setMessages(response.data.messages || []);
    } catch (err) {
      console.error("Fetch messages error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load customer messages."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase();

    return messages.filter((message) => {
      const matchesSearch =
        !query ||
        message.name?.toLowerCase().includes(query) ||
        message.email?.toLowerCase().includes(query) ||
        message.phone?.toLowerCase().includes(query) ||
        message.message?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        message.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [messages, search, statusFilter]);

  const stats = useMemo(() => {
    const total = messages.length;

    const newMessages = messages.filter(
      (message) => message.status === "new"
    ).length;

    const readMessages = messages.filter(
      (message) => message.status === "read"
    ).length;

    const repliedMessages = messages.filter(
      (message) => message.status === "replied"
    ).length;

    return {
      total,
      newMessages,
      readMessages,
      repliedMessages,
    };
  }, [messages]);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);

      const response = await api.put(`/contact/${id}/status`, {
        status,
      });

      const updatedMessage = response.data.contactMessage;

      setMessages((prev) =>
        prev.map((message) =>
          message._id === id ? updatedMessage : message
        )
      );

      setSelectedMessage((prev) =>
        prev?._id === id ? updatedMessage : prev
      );
    } catch (err) {
      console.error("Update status error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to update message status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteMessage = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer message?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await api.delete(`/contact/${id}`);

      setMessages((prev) =>
        prev.filter((message) => message._id !== id)
      );

      if (selectedMessage?._id === id) {
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error("Delete message error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to delete message."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const openMessage = async (message) => {
    setSelectedMessage(message);

    if (message.status === "new") {
      await updateStatus(message._id, "read");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ef] px-4 pb-8 pt-36 sm:px-6 sm:pt-40 lg:px-8 lg:pt-40">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#9a6b45]">
              Customer Communication
            </p>

            <h1 className="font-serif text-3xl font-semibold text-[#2f211a] sm:text-4xl">
              Customer Messages
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#75675f]">
              Manage enquiries and messages received through the café
              website.
            </p>
          </div>

          <button
            onClick={() => fetchMessages(true)}
            disabled={refreshing}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#ded4cb] bg-white px-4 py-3 text-sm font-semibold text-[#3a2a21] shadow-sm transition hover:bg-[#faf8f5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* STATS */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Messages"
            value={stats.total}
            icon={MessageSquare}
          />

          <StatCard
            label="New"
            value={stats.newMessages}
            icon={Clock3}
          />

          <StatCard
            label="Read"
            value={stats.readMessages}
            icon={Eye}
          />

          <StatCard
            label="Replied"
            value={stats.repliedMessages}
            icon={CheckCircle2}
          />
        </div>

        {/* SEARCH + FILTERS */}
        <div className="mb-6 rounded-2xl border border-[#e3dad2] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row">
            
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b8e85]"
              />

              <input
                type="text"
                placeholder="Search by name, email, phone or message..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-[#ded4cb] bg-[#fcfaf8] py-3 pl-11 pr-4 text-sm text-[#30231d] outline-none transition focus:border-[#9a6b45] focus:ring-2 focus:ring-[#9a6b45]/10"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
              {STATUS_OPTIONS.map((status) => {
                const active = statusFilter === status;

                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-[#3b2920] text-white"
                        : "border border-[#ded4cb] bg-white text-[#685950] hover:bg-[#faf8f5]"
                    }`}
                  >
                    {status === "all"
                      ? "All"
                      : statusLabels[status]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="rounded-2xl border border-[#e3dad2] bg-white p-12 text-center shadow-sm">
            <RefreshCw
              size={28}
              className="mx-auto mb-3 animate-spin text-[#9a6b45]"
            />

            <p className="text-sm font-medium text-[#75675f]">
              Loading customer messages...
            </p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="rounded-2xl border border-[#e3dad2] bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f4ede7]">
              <Mail
                size={25}
                className="text-[#9a6b45]"
              />
            </div>

            <h3 className="font-serif text-xl font-semibold text-[#34251e]">
              No messages found
            </h3>

            <p className="mt-2 text-sm text-[#81736b]">
              {messages.length === 0
                ? "Customer enquiries will appear here."
                : "Try changing your search or filter."}
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden overflow-hidden rounded-2xl border border-[#e3dad2] bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px]">
                  <thead className="border-b border-[#e7ded7] bg-[#fcfaf8]">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#8a7b71]">
                        Customer
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#8a7b71]">
                        Contact
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#8a7b71]">
                        Message
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#8a7b71]">
                        Received
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#8a7b71]">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#8a7b71]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#eee7e1]">
                    {filteredMessages.map((message) => (
                      <MessageRow
                        key={message._id}
                        message={message}
                        onOpen={openMessage}
                        onDelete={deleteMessage}
                        onStatusChange={updateStatus}
                        updatingId={updatingId}
                        deletingId={deletingId}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MOBILE */}
            <div className="space-y-4 lg:hidden">
              {filteredMessages.map((message) => (
                <MobileMessageCard
                  key={message._id}
                  message={message}
                  onOpen={openMessage}
                  onDelete={deleteMessage}
                  onStatusChange={updateStatus}
                  updatingId={updatingId}
                  deletingId={deletingId}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* MESSAGE MODAL */}
      {selectedMessage && (
        <MessageModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
          onStatusChange={updateStatus}
          onDelete={deleteMessage}
          updatingId={updatingId}
          deletingId={deletingId}
        />
      )}
    </div>
  );
};


/* ============================= */
/* STAT CARD */
/* ============================= */

const StatCard = ({ label, value, icon: Icon }) => {
  return (
    <div className="rounded-2xl border border-[#e3dad2] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4ede7] text-[#9a6b45]">
        <Icon size={19} />
      </div>

      <p className="text-xs font-medium text-[#887970]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold text-[#30221b]">
        {value}
      </p>
    </div>
  );
};


/* ============================= */
/* DESKTOP ROW */
/* ============================= */

const MessageRow = ({
  message,
  onOpen,
  onDelete,
  onStatusChange,
  updatingId,
  deletingId,
}) => {
  return (
    <tr className="transition hover:bg-[#fdfbf9]">
      <td className="px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4ede7] text-[#9a6b45]">
            <User size={18} />
          </div>

          <div>
            <p className="font-semibold text-[#33251e]">
              {message.name}
            </p>

            {message.phone && (
              <p className="mt-1 text-xs text-[#8a7b71]">
                {message.phone}
              </p>
            )}
          </div>
        </div>
      </td>

      <td className="px-5 py-5">
        <a
          href={`mailto:${message.email}`}
          className="text-sm text-[#685950] hover:text-[#9a6b45]"
        >
          {message.email}
        </a>
      </td>

      <td className="max-w-[280px] px-5 py-5">
        <button
          onClick={() => onOpen(message)}
          className="text-left"
        >
          <p className="line-clamp-2 text-sm leading-6 text-[#5f5149]">
            {message.message}
          </p>
        </button>
      </td>

      <td className="px-5 py-5">
        <p className="whitespace-nowrap text-sm text-[#75675f]">
          {formatDate(message.createdAt)}
        </p>
      </td>

      <td className="px-5 py-5">
        <StatusSelect
          message={message}
          onChange={onStatusChange}
          updatingId={updatingId}
        />
      </td>

      <td className="px-5 py-5">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onOpen(message)}
            className="rounded-lg border border-[#ded4cb] p-2 text-[#6f6057] transition hover:bg-[#f6f1ed] hover:text-[#3a2a21]"
            title="View message"
          >
            <Eye size={17} />
          </button>

          <button
            onClick={() => onDelete(message._id)}
            disabled={deletingId === message._id}
            className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            title="Delete message"
          >
            <Trash2
              size={17}
              className={
                deletingId === message._id
                  ? "animate-pulse"
                  : ""
              }
            />
          </button>
        </div>
      </td>
    </tr>
  );
};


/* ============================= */
/* MOBILE CARD */
/* ============================= */

const MobileMessageCard = ({
  message,
  onOpen,
  onDelete,
  onStatusChange,
  updatingId,
  deletingId,
}) => {
  return (
    <div className="rounded-2xl border border-[#e3dad2] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f4ede7] text-[#9a6b45]">
            <User size={19} />
          </div>

          <div>
            <h3 className="font-semibold text-[#33251e]">
              {message.name}
            </h3>

            <p className="mt-1 text-xs text-[#8a7b71]">
              {message.email}
            </p>
          </div>
        </div>

        <StatusBadge status={message.status} />
      </div>

      <div className="mt-5 space-y-3">
        {message.phone && (
          <a
            href={`tel:${message.phone}`}
            className="flex items-center gap-2 text-sm text-[#685950]"
          >
            <Phone size={15} />
            {message.phone}
          </a>
        )}

        <p className="line-clamp-3 text-sm leading-6 text-[#5f5149]">
          {message.message}
        </p>

        <p className="flex items-center gap-2 text-xs text-[#8a7b71]">
          <CalendarDays size={14} />
          {formatDate(message.createdAt)}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-[#eee7e1] pt-4">
        <StatusSelect
          message={message}
          onChange={onStatusChange}
          updatingId={updatingId}
        />

        <div className="flex gap-2">
          <button
            onClick={() => onOpen(message)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#ded4cb] px-4 py-3 text-sm font-semibold text-[#4d3b31] transition hover:bg-[#f8f4f0]"
          >
            <Eye size={16} />
            View Message
          </button>

          <button
            onClick={() => onDelete(message._id)}
            disabled={deletingId === message._id}
            className="rounded-xl border border-red-200 px-4 py-3 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </div>
  );
};


/* ============================= */
/* STATUS BADGE */
/* ============================= */

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        statusStyles[status] ||
        "border-gray-200 bg-gray-50 text-gray-600"
      }`}
    >
      {statusLabels[status] || status}
    </span>
  );
};


/* ============================= */
/* STATUS SELECT */
/* ============================= */

const StatusSelect = ({
  message,
  onChange,
  updatingId,
}) => {
  return (
    <select
      value={message.status}
      disabled={updatingId === message._id}
      onChange={(e) =>
        onChange(message._id, e.target.value)
      }
      className="rounded-lg border border-[#ded4cb] bg-white px-3 py-2 text-xs font-semibold text-[#4c3b32] outline-none focus:border-[#9a6b45] disabled:opacity-50"
    >
      <option value="new">New</option>
      <option value="read">Read</option>
      <option value="replied">Replied</option>
    </select>
  );
};


/* ============================= */
/* MESSAGE MODAL */
/* ============================= */

const MessageModal = ({
  message,
  onClose,
  onStatusChange,
  onDelete,
  updatingId,
  deletingId,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-[#eee7e1] px-5 py-5 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a6b45]">
              Customer Message
            </p>

            <h2 className="mt-1 font-serif text-2xl font-semibold text-[#33251e]">
              {message.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#75675f] transition hover:bg-[#f5f1ed]"
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL CONTENT */}
        <div className="space-y-6 p-5 sm:p-7">

          <div className="grid gap-4 sm:grid-cols-2">

            <div className="rounded-2xl bg-[#faf7f4] p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-[#91837a]">
                Email
              </p>

              <a
                href={`mailto:${message.email}`}
                className="mt-2 block break-all text-sm font-medium text-[#4d3b31] hover:text-[#9a6b45]"
              >
                {message.email}
              </a>
            </div>

            <div className="rounded-2xl bg-[#faf7f4] p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-[#91837a]">
                Phone
              </p>

              {message.phone ? (
                <a
                  href={`tel:${message.phone}`}
                  className="mt-2 block text-sm font-medium text-[#4d3b31] hover:text-[#9a6b45]"
                >
                  {message.phone}
                </a>
              ) : (
                <p className="mt-2 text-sm text-[#91837a]">
                  Not provided
                </p>
              )}
            </div>
          </div>

          {/* MESSAGE */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#91837a]">
                Message
              </p>

              <StatusBadge status={message.status} />
            </div>

            <div className="rounded-2xl border border-[#e6ddd6] bg-[#fcfaf8] p-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-[#51433b]">
                {message.message}
              </p>
            </div>
          </div>

          {/* DATE */}
          <div className="flex items-center gap-2 text-xs text-[#8a7b71]">
            <CalendarDays size={15} />
            Received {formatDate(message.createdAt)}
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col gap-3 border-t border-[#eee7e1] pt-5 sm:flex-row">

            <div className="flex flex-1 gap-2">
              <select
                value={message.status}
                disabled={updatingId === message._id}
                onChange={(e) =>
                  onStatusChange(
                    message._id,
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-[#ded4cb] bg-white px-4 py-3 text-sm font-semibold text-[#4c3b32] outline-none focus:border-[#9a6b45]"
              >
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
              </select>
            </div>

            <a
              href={`mailto:${message.email}?subject=Re: Agarwal's Cafe Enquiry`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3b2920] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4c352a]"
            >
              <Mail size={16} />
              Reply by Email
            </a>

            <button
              onClick={() => onDelete(message._id)}
              disabled={deletingId === message._id}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 size={16} />
              Delete
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Gift,
  History,
  LoaderCircle,
  Lock,
  RefreshCw,
  Sparkles,
  Star,
} from "lucide-react";

import api from "../services/api";

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [redeeming, setRedeeming] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchRewards = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        rewardResponse,
        redemptionResponse,
        profileResponse,
      ] = await Promise.all([
        api.get("/rewards"),
        api.get("/reward-redemptions/my"),
        api.get("/users/profile"),
      ]);

      setRewards(rewardResponse.data.rewards || []);
      setRedemptions(
        redemptionResponse.data.redemptions || []
      );
      setUser(profileResponse.data.user || null);
    } catch (err) {
      console.error("Rewards fetch error:", err);

      if (err.response?.status === 401) {
        setError("Please login to view your rewards.");
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load rewards."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const redeemReward = async (rewardId) => {
    try {
      setRedeeming(rewardId);
      setMessage("");
      setError("");

      const response = await api.post(
        "/reward-redemptions",
        { rewardId }
      );

      setMessage(
        response.data.message ||
          "Reward redeemed successfully."
      );

      await fetchRewards();
    } catch (err) {
      console.error("Redeem reward error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to redeem this reward."
      );
    } finally {
      setRedeeming("");
    }
  };

  const points = user?.loyaltyPoints || 0;

  const redeemableCount = useMemo(() => {
    return rewards.filter(
      (reward) => points >= reward.pointsRequired
    ).length;
  }, [rewards, points]);

  const nextReward = useMemo(() => {
    const lockedRewards = rewards
      .filter((reward) => reward.pointsRequired > points)
      .sort(
        (a, b) =>
          a.pointsRequired - b.pointsRequired
      );

    return lockedRewards[0] || null;
  }, [rewards, points]);

  const pointsNeeded = nextReward
    ? nextReward.pointsRequired - points
    : 0;

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatRewardValue = (reward) => {
    if (reward.discountType === "percentage") {
      return `${reward.discountValue}% OFF`;
    }

    return `₹${Number(
      reward.discountValue || 0
    ).toLocaleString("en-IN")} OFF`;
  };

  const formatPoints = (value) => {
    return Number(value || 0).toLocaleString("en-IN");
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f4ee] px-5 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">

          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-[#e5d9cc]" />

            <div className="mx-auto mt-6 h-3 w-40 animate-pulse rounded-full bg-[#e5d9cc]" />

            <div className="mx-auto mt-4 h-12 w-72 max-w-full animate-pulse rounded-xl bg-[#e5d9cc]" />
          </div>

          <div className="mx-auto mt-10 h-64 max-w-2xl animate-pulse rounded-[2rem] bg-[#2b2118]/10" />

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-[2rem] bg-white"
              />
            ))}
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
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eee5d9] text-[#a76d3e]">
            <Gift size={25} />
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#a76d3e]">
            Agarwal&apos;s Rewards
          </p>

          <h1 className="mt-2 font-serif text-4xl text-[#2b2118] sm:text-5xl">
            Good things come back
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#75685d] sm:text-base">
            Earn points with every completed order and turn them
            into delicious rewards.
          </p>
        </div>

        {/* =================================================
           BALANCE CARD
        ================================================= */}

        <section className="relative mx-auto mt-10 max-w-2xl overflow-hidden rounded-[2rem] bg-[#2b2118] p-7 text-white shadow-[0_20px_60px_rgba(43,33,24,0.18)] sm:p-9">

          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#c78b55]/10" />
          <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-[#c78b55]/5" />

          <div className="relative">

            <div className="flex items-center justify-between gap-4">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d5a06d]">
                  Your balance
                </p>

                <div className="mt-3 flex items-end gap-3">
                  <p className="font-serif text-6xl sm:text-7xl">
                    {formatPoints(points)}
                  </p>

                  <p className="mb-2 text-sm text-white/50">
                    points
                  </p>
                </div>
              </div>

              <div className="hidden h-14 w-14 items-center justify-center rounded-full bg-[#c78b55] sm:flex">
                <Star size={24} />
              </div>
            </div>

            <div className="mt-7 h-px bg-white/10" />

            <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

              <div>
                {nextReward ? (
                  <>
                    <p className="text-sm text-white/70">
                      You&apos;re{" "}
                      <span className="font-semibold text-[#d5a06d]">
                        {formatPoints(pointsNeeded)} points
                      </span>{" "}
                      away from
                    </p>

                    <p className="mt-1 font-serif text-xl">
                      {nextReward.name}
                    </p>
                  </>
                ) : rewards.length > 0 ? (
                  <p className="text-sm text-white/70">
                    You have enough points for all available rewards.
                  </p>
                ) : (
                  <p className="text-sm text-white/70">
                    New rewards will appear here soon.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => fetchRewards(true)}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold text-white/80 transition hover:bg-white/5 disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={
                    refreshing ? "animate-spin" : ""
                  }
                />
                Refresh
              </button>
            </div>
          </div>
        </section>

        {/* =================================================
           NOTIFICATIONS
        ================================================= */}

        {message && (
          <div className="mx-auto mt-6 flex max-w-2xl items-center gap-3 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white">
              <Check size={16} />
            </div>

            {message}
          </div>
        )}

        {error && (
          <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =================================================
           QUICK STATS
        ================================================= */}

        <div className="mt-10 grid gap-3 sm:grid-cols-3">

          <div className="rounded-2xl border border-[#eadfd3] bg-white p-5">
            <p className="text-xs uppercase tracking-wider text-[#9b8b7c]">
              Your points
            </p>

            <p className="mt-2 font-serif text-3xl text-[#2b2118]">
              {formatPoints(points)}
            </p>
          </div>

          <div className="rounded-2xl border border-[#eadfd3] bg-white p-5">
            <p className="text-xs uppercase tracking-wider text-[#9b8b7c]">
              Available rewards
            </p>

            <p className="mt-2 font-serif text-3xl text-[#2b2118]">
              {rewards.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#eadfd3] bg-white p-5">
            <p className="text-xs uppercase tracking-wider text-[#9b8b7c]">
              Ready to redeem
            </p>

            <p className="mt-2 font-serif text-3xl text-[#a76d3e]">
              {redeemableCount}
            </p>
          </div>
        </div>

        {/* =================================================
           REWARDS
        ================================================= */}

        <section className="mt-16">

          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a76d3e]">
              Available rewards
            </p>

            <h2 className="mt-2 font-serif text-4xl text-[#2b2118]">
              Treat yourself
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#75685d]">
              Use your loyalty points to unlock exclusive benefits.
            </p>
          </div>

          {rewards.length === 0 ? (
            <div className="rounded-[2rem] bg-white p-12 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eee5d9] text-[#c78b55]">
                <Sparkles size={28} />
              </div>

              <h3 className="mt-5 font-serif text-2xl text-[#2b2118]">
                Rewards coming soon
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-[#75685d]">
                New rewards will appear here as they become available.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              {rewards.map((reward) => {
                const canRedeem =
                  points >= reward.pointsRequired;

                const isRedeeming =
                  redeeming === reward._id;

                return (
                  <article
                    key={reward._id}
                    className={`group relative overflow-hidden rounded-[2rem] border bg-white p-6 transition ${
                      canRedeem
                        ? "border-[#e6d5c4] shadow-[0_10px_35px_rgba(61,43,31,0.05)] hover:-translate-y-1 hover:shadow-[0_15px_45px_rgba(61,43,31,0.09)]"
                        : "border-[#eadfd3]"
                    }`}
                  >

                    {/* Top */}
                    <div className="flex items-start justify-between gap-4">

                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${
                          canRedeem
                            ? "bg-[#eee5d9] text-[#a76d3e]"
                            : "bg-[#f1eee9] text-[#aaa096]"
                        }`}
                      >
                        <Gift size={21} />
                      </div>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          canRedeem
                            ? "bg-[#f8f0e7] text-[#a76d3e]"
                            : "bg-[#eeeae4] text-[#8b7b6d]"
                        }`}
                      >
                        {formatPoints(
                          reward.pointsRequired
                        )}{" "}
                        pts
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="mt-6 font-serif text-2xl text-[#2b2118]">
                      {reward.name}
                    </h3>

                    <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#75685d]">
                      {reward.description ||
                        "Enjoy this special reward on your next visit."}
                    </p>

                    {/* Benefit */}
                    <div className="mt-5 rounded-2xl bg-[#f8f4ee] p-4">

                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9b8b7c]">
                        Your benefit
                      </p>

                      <p className="mt-1.5 font-serif text-xl text-[#2b2118]">
                        {formatRewardValue(reward)}
                      </p>
                    </div>

                    {/* Progress */}
                    {!canRedeem && (
                      <div className="mt-5">

                        <div className="flex justify-between text-[11px] text-[#8b7b6d]">
                          <span>
                            Your points
                          </span>

                          <span>
                            {formatPoints(points)} /{" "}
                            {formatPoints(
                              reward.pointsRequired
                            )}
                          </span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eee5d9]">
                          <div
                            className="h-full rounded-full bg-[#c78b55] transition-all"
                            style={{
                              width: `${Math.min(
                                (points /
                                  reward.pointsRequired) *
                                  100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Button */}
                    <button
                      type="button"
                      onClick={() =>
                        redeemReward(reward._id)
                      }
                      disabled={
                        !canRedeem || isRedeeming
                      }
                      className={`mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition ${
                        canRedeem
                          ? "bg-[#2b2118] text-white hover:bg-[#3b2c20]"
                          : "cursor-not-allowed bg-[#eeeae4] text-[#9b8b7c]"
                      }`}
                    >
                      {isRedeeming ? (
                        <>
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                          />
                          Redeeming...
                        </>
                      ) : canRedeem ? (
                        <>
                          Redeem Reward
                          <Sparkles size={16} />
                        </>
                      ) : (
                        <>
                          <Lock size={15} />
                          Need{" "}
                          {formatPoints(
                            reward.pointsRequired - points
                          )}{" "}
                          more
                        </>
                      )}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* =================================================
           REDEMPTION HISTORY
        ================================================= */}

        <section className="mt-16">

          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a76d3e]">
              Your rewards
            </p>

            <div className="mt-2 flex items-center gap-3">
              <h2 className="font-serif text-4xl text-[#2b2118]">
                Redemption history
              </h2>

              <History
                size={22}
                className="text-[#a76d3e]"
              />
            </div>
          </div>

          {redemptions.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-[#d8cabb] bg-white p-10 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eee5d9] text-[#a76d3e]">
                <History size={23} />
              </div>

              <p className="mt-4 font-medium text-[#2b2118]">
                No rewards redeemed yet
              </p>

              <p className="mt-1 text-sm text-[#75685d]">
                Your redeemed rewards will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">

              {redemptions.map((redemption) => {

                const statusClasses =
                  redemption.status === "active"
                    ? "bg-green-50 text-green-700"
                    : redemption.status === "used"
                    ? "bg-[#f8f0e7] text-[#a76d3e]"
                    : "bg-[#eeeae4] text-[#75685d]";

                return (
                  <div
                    key={redemption._id}
                    className="rounded-2xl border border-[#eadfd3] bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                      <div className="flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eee5d9] text-[#a76d3e]">
                          <Gift size={17} />
                        </div>

                        <div>
                          <p className="font-semibold text-[#2b2118]">
                            {redemption.rewardName}
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#8b7b6d]">
                            <span>
                              {formatPoints(
                                redemption.pointsUsed
                              )}{" "}
                              points used
                            </span>

                            {redemption.createdAt && (
                              <>
                                <span>•</span>
                                <span>
                                  {formatDate(
                                    redemption.createdAt
                                  )}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${statusClasses}`}
                      >
                        {redemption.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Bottom note */}
        <div className="mt-12 rounded-[2rem] bg-[#2b2118] p-7 text-center text-white sm:p-9">

          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#c78b55]">
            <Sparkles size={19} />
          </div>

          <h3 className="mt-4 font-serif text-2xl">
            Every visit counts.
          </h3>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/55">
            Complete your orders and keep collecting points to unlock
            more rewards at Agarwal&apos;s Cafe.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Rewards;
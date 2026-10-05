const crypto = require("crypto");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const User = require("../models/User");
const RewardRedemption = require("../models/RewardRedemption");
const getRazorpayInstance = require("../config/razorpay");

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(100 + Math.random() * 900);

  return `AC-${timestamp}-${random}`;
};

// Create order
const createOrder = async (req, res) => {
  try {
    const {
      items,
      orderType,
      address,
      paymentMethod = "cash",
      redemptionId,
    } = req.body;

    // -----------------------------
    // Basic validation
    // -----------------------------

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item.",
      });
    }

    if (!["dine-in", "takeaway", "delivery"].includes(orderType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order type.",
      });
    }

    if (!["cash", "online"].includes(paymentMethod)) {
       return res.status(400).json({
         success: false,
         message: "Invalid payment method. Please choose Cash or Online.",
       });
    }

    // -----------------------------
    // Validate delivery address
    // -----------------------------

    let normalizedAddress;

    if (orderType === "delivery") {
      if (!address) {
        return res.status(400).json({
          success: false,
          message: "Delivery address is required.",
        });
      }

      const addressLine = String(address.addressLine || "").trim();
      const city = String(address.city || "").trim();
      const state = String(address.state || "").trim();
      const pincode = String(address.pincode || "").trim();

      if (!addressLine || !city || !state || !pincode) {
        return res.status(400).json({
          success: false,
          message: "Complete delivery address is required.",
        });
      }

      if (!/^\d{6}$/.test(pincode)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid 6-digit pincode.",
        });
      }

      normalizedAddress = {
        addressLine,
        city,
        state,
        pincode,
      };
    }

    // -----------------------------
    // Validate item structure
    // -----------------------------

    for (const item of items) {
      if (!item || !item.menuItem) {
        return res.status(400).json({
          success: false,
          message: "Invalid menu item in order.",
        });
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Each item must have a valid quantity.",
        });
      }

      if (quantity > 50) {
        return res.status(400).json({
          success: false,
          message: "Maximum quantity allowed for one item is 50.",
        });
      }
    }

    // -----------------------------
    // Prevent duplicate menu items
    // -----------------------------

    const itemIds = items.map((item) => String(item.menuItem));

    const uniqueItemIds = [...new Set(itemIds)];

    if (uniqueItemIds.length !== itemIds.length) {
      return res.status(400).json({
        success: false,
        message:
          "Duplicate menu items are not allowed. Please update the quantity instead.",
      });
    }

    // -----------------------------
    // Fetch menu items from DB
    // -----------------------------

    const menuItems = await MenuItem.find({
      _id: { $in: uniqueItemIds },
      isAvailable: true,
    });

    if (menuItems.length !== uniqueItemIds.length) {
      return res.status(400).json({
        success: false,
        message:
          "One or more selected menu items are unavailable or no longer exist.",
      });
    }

    // -----------------------------
    // Build trusted order items
    // -----------------------------

    const orderItems = [];

    for (const item of items) {
      const menuItem = menuItems.find(
        (menu) => menu._id.toString() === String(item.menuItem)
      );

      if (!menuItem) {
        return res.status(400).json({
          success: false,
          message: "One or more menu items could not be found.",
        });
      }

      const quantity = Number(item.quantity);

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        image: menuItem.image || "",
      });
    }

    // -----------------------------
    // Calculate totals server-side
    // -----------------------------

    const subtotal = orderItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    const tax = 0;
    const orderNumber = generateOrderNumber();

    // -----------------------------
    // Order with Reward Redemption
    // -----------------------------

    if (redemptionId) {
      if (!mongoose.Types.ObjectId.isValid(redemptionId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid reward redemption ID.",
        });
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const redemption = await RewardRedemption.findOneAndUpdate(
          {
            _id: redemptionId,
            user: req.user._id,
            status: "active",
          },
          {
            status: "used",
            usedAt: new Date(),
          },
          {
            new: true,
            session,
          }
        );

        if (!redemption) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            success: false,
            message: "Invalid, expired, or already used reward redemption.",
          });
        }

        let discount = 0;
        if (redemption.discountType === "fixed") {
          discount = Math.min(redemption.discountValue, subtotal);
        } else if (redemption.discountType === "percentage") {
          discount = Math.min(
            subtotal,
            Math.round((subtotal * redemption.discountValue) / 100)
          );
        }

        const discountedTotal = Math.max(0, subtotal - discount + tax);

        let razorpayOrderId = null;
        let finalPaymentStatus = "pending";
        let rzpOrderData = null;

        if (paymentMethod === "online") {
          if (discountedTotal === 0) {
            finalPaymentStatus = "paid";
          } else {
            const razorpay = getRazorpayInstance();
            const rzpOrder = await razorpay.orders.create({
              amount: Math.round(discountedTotal * 100),
              currency: "INR",
              receipt: orderNumber,
              notes: {
                userId: req.user._id.toString(),
              },
            });
            razorpayOrderId = rzpOrder.id;
            rzpOrderData = {
              keyId: process.env.RAZORPAY_KEY_ID || "",
              orderId: rzpOrder.id,
              amount: rzpOrder.amount,
              currency: "INR",
            };
          }
        }

        const [order] = await Order.create(
          [
            {
              orderNumber,
              user: req.user._id,
              items: orderItems,
              subtotal,
              discount,
              tax,
              total: discountedTotal,
              orderType,
              address: normalizedAddress,
              paymentMethod,
              paymentStatus: finalPaymentStatus,
              orderStatus: "placed",
              rewardRedemption: redemption._id,
              razorpayOrderId,
            },
          ],
          { session }
        );

        redemption.order = order._id;
        await redemption.save({ session });

        await session.commitTransaction();
        session.endSession();

        const populatedOrder = await Order.findById(order._id)
          .populate("user", "name email phone")
          .populate("items.menuItem", "name image")
          .populate(
            "rewardRedemption",
            "rewardName discountType discountValue pointsUsed"
          );

        if (paymentMethod === "online" && discountedTotal > 0) {
          return res.status(201).json({
            success: true,
            requiresPayment: true,
            order: populatedOrder,
            razorpay: rzpOrderData,
          });
        }

        return res.status(201).json({
          success: true,
          requiresPayment: false,
          message: "Order placed successfully.",
          order: populatedOrder,
        });
      } catch (txnError) {
        await session.abortTransaction();
        session.endSession();
        throw txnError;
      }
    }

    // -----------------------------
    // Standard Order without Reward
    // -----------------------------

    const total = subtotal + tax;
    let razorpayOrderId = null;
    let finalPaymentStatus = "pending";
    let rzpOrderData = null;

    if (paymentMethod === "online") {
      if (total === 0) {
        finalPaymentStatus = "paid";
      } else {
        const razorpay = getRazorpayInstance();
        const rzpOrder = await razorpay.orders.create({
          amount: Math.round(total * 100),
          currency: "INR",
          receipt: orderNumber,
          notes: {
            userId: req.user._id.toString(),
          },
        });
        razorpayOrderId = rzpOrder.id;
        rzpOrderData = {
          keyId: process.env.RAZORPAY_KEY_ID || "",
          orderId: rzpOrder.id,
          amount: rzpOrder.amount,
          currency: "INR",
        };
      }
    }

    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: orderItems,
      subtotal,
      discount: 0,
      tax,
      total,
      orderType,
      address: normalizedAddress,
      paymentMethod,
      paymentStatus: finalPaymentStatus,
      orderStatus: "placed",
      rewardRedemption: null,
      razorpayOrderId,
    });

    // -----------------------------
    // Return populated order
    // -----------------------------

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "name email phone")
      .populate("items.menuItem", "name image");

    if (paymentMethod === "online" && total > 0) {
      return res.status(201).json({
        success: true,
        requiresPayment: true,
        order: populatedOrder,
        razorpay: rzpOrderData,
      });
    }

    return res.status(201).json({
      success: true,
      requiresPayment: false,
      message: "Order placed successfully.",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);

    // Invalid MongoDB ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "One or more menu items are invalid.",
      });
    }

    // Duplicate order number
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Could not generate a unique order number. Please try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create order.",
    });
  }
};

// Get logged-in user's orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .populate("items.menuItem", "name image")
      .populate(
        "rewardRedemption",
        "rewardName discountType discountValue pointsUsed"
      )
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your orders.",
    });
  }
};

// Get all orders - Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("items.menuItem", "name image")
      .populate(
        "rewardRedemption",
        "rewardName discountType discountValue pointsUsed"
      )
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders.",
    });
  }
};

// Update order status - Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "placed",
      "confirmed",
      "preparing",
      "ready",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const currentStatus = order.orderStatus;

    // -----------------------------
    // Prevent changing final states
    // -----------------------------

    if (
      currentStatus === "completed" ||
      currentStatus === "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message: `Order is already ${currentStatus} and cannot be changed.`,
      });
    }

    // -----------------------------
    // Valid status transitions
    // -----------------------------

    const allowedTransitions = {
      placed: ["confirmed", "cancelled"],
      confirmed: ["preparing", "cancelled"],
      preparing: ["ready", "cancelled"],
      ready: ["completed", "cancelled"],
    };

    if (!allowedTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot move from ${currentStatus} to ${status}.`,
      });
    }

    // -----------------------------
    // Update status
    // -----------------------------

    order.orderStatus = status;

    await order.save();

    // -----------------------------
    // Restore redemption voucher on cancellation
    // -----------------------------

    if (status === "cancelled" && order.rewardRedemption) {
      await RewardRedemption.findOneAndUpdate(
        {
          _id: order.rewardRedemption,
          order: order._id,
          status: "used",
        },
        {
          status: "active",
          order: null,
          usedAt: null,
        }
      );
    }

    // -----------------------------
    // Award loyalty points
    // -----------------------------

    if (status === "completed" && order.user) {
      const points = Math.floor(order.total / 100);

      if (points > 0) {
        await User.findByIdAndUpdate(order.user, {
          $inc: {
            loyaltyPoints: points,
          },
        });
      }
    }

    // -----------------------------
    // Return updated order
    // -----------------------------

    const updatedOrder = await Order.findById(order._id)
      .populate("user", "name email phone loyaltyPoints")
      .populate("items.menuItem", "name image")
      .populate(
        "rewardRedemption",
        "rewardName discountType discountValue pointsUsed"
      );

    return res.json({
      success: true,
      message: "Order status updated successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update order status.",
    });
  }
};

// Verify Razorpay payment signature
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      req.body;

    if (
      !orderId ||
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Order ID, Razorpay order ID, payment ID, and signature are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    const sigBuf = Buffer.from(String(razorpaySignature), "utf8");
    const expBuf = Buffer.from(expectedSignature, "utf8");

    if (
      sigBuf.length !== expBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expBuf)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature.",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (order.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order ID does not match this cafe order.",
      });
    }

    // Idempotency: If already paid, return 200 without duplicate processing
    if (order.paymentStatus === "paid") {
      const populatedOrder = await Order.findById(order._id)
        .populate("user", "name email phone")
        .populate("items.menuItem", "name image")
        .populate(
          "rewardRedemption",
          "rewardName discountType discountValue pointsUsed"
        );

      return res.json({
        success: true,
        message: "Payment already verified.",
        order: populatedOrder,
      });
    }

    order.paymentStatus = "paid";
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "name email phone")
      .populate("items.menuItem", "name image")
      .populate(
        "rewardRedemption",
        "rewardName discountType discountValue pointsUsed"
      );

    return res.json({
      success: true,
      message: "Payment verified successfully.",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Razorpay verify error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment.",
    });
  }
};

// Handle payment failure / cancellation
const handlePaymentFailure = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Valid order ID is required.",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // If order was already paid, do not mark as failed
    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Order has already been marked as paid.",
      });
    }

    order.paymentStatus = "failed";
    await order.save();

    // Safely restore reward voucher if one was applied
    if (order.rewardRedemption) {
      await RewardRedemption.findOneAndUpdate(
        {
          _id: order.rewardRedemption,
          order: order._id,
          status: "used",
        },
        {
          status: "active",
          order: null,
          usedAt: null,
        }
      );
    }

    return res.json({
      success: true,
      message:
        "Payment marked as failed and voucher restored if applicable.",
    });
  } catch (error) {
    console.error("Payment failure error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process payment failure.",
    });
  }
};

// Handle Razorpay Webhook
const handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"];

    if (!webhookSignature) {
      return res.status(400).json({
        success: false,
        message: "Missing webhook signature.",
      });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    if (!webhookSecret) {
      console.warn("RAZORPAY_WEBHOOK_SECRET is not configured.");
      return res.status(500).json({
        success: false,
        message: "Webhook secret is not configured.",
      });
    }

    const rawPayload = req.rawBody
      ? req.rawBody.toString("utf8")
      : JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawPayload)
      .digest("hex");

    const sigBuf = Buffer.from(String(webhookSignature), "utf8");
    const expBuf = Buffer.from(expectedSignature, "utf8");

    if (
      sigBuf.length !== expBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expBuf)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature.",
      });
    }

    const event = req.body?.event;
    const payload = req.body?.payload;

    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload?.payment?.entity;
      const orderEntity = payload?.order?.entity;
      const rzpOrderId = paymentEntity?.order_id || orderEntity?.id;
      const rzpPaymentId = paymentEntity?.id;

      if (rzpOrderId) {
        const order = await Order.findOne({ razorpayOrderId: rzpOrderId });
        if (order && order.paymentStatus !== "paid") {
          order.paymentStatus = "paid";
          if (rzpPaymentId) {
            order.razorpayPaymentId = rzpPaymentId;
          }
          await order.save();
        }
      }
    } else if (event === "payment.failed") {
      const paymentEntity = payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;

      if (rzpOrderId) {
        const order = await Order.findOne({ razorpayOrderId: rzpOrderId });
        if (order && order.paymentStatus !== "paid") {
          order.paymentStatus = "failed";
          await order.save();

          if (order.rewardRedemption) {
            await RewardRedemption.findOneAndUpdate(
              {
                _id: order.rewardRedemption,
                order: order._id,
                status: "used",
              },
              {
                status: "active",
                order: null,
                usedAt: null,
              }
            );
          }
        }
      }
    }

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return res.status(500).json({
      success: false,
      message: "Webhook processing error.",
    });
  }
};

module.exports = {
  createOrder,
  verifyRazorpayPayment,
  handlePaymentFailure,
  handleRazorpayWebhook,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

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
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    if (!["dine-in", "takeaway", "delivery"].includes(orderType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order type",
      });
    }

    if (!["cash", "online"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    if (orderType === "delivery") {
      if (
        !address ||
        !address.addressLine ||
        !address.city ||
        !address.state ||
        !address.pincode
      ) {
        return res.status(400).json({
          success: false,
          message: "Complete delivery address is required",
        });
      }
    }

    const menuItemIds = items.map((item) => item.menuItem);

    const menuItems = await MenuItem.find({
      _id: { $in: menuItemIds },
      isAvailable: true,
    });

    if (menuItems.length !== items.length) {
      return res.status(400).json({
        success: false,
        message: "One or more menu items are unavailable or invalid",
      });
    }

    const orderItems = [];

    for (const item of items) {
      const menuItem = menuItems.find(
        (menu) => menu._id.toString() === item.menuItem
      );

      if (!menuItem) {
        return res.status(400).json({
          success: false,
          message: "Menu item not found",
        });
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid item quantity",
        });
      }

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        image: menuItem.image,
      });
    }

    const subtotal = orderItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    const tax = 0;
    const total = subtotal + tax;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: req.user._id,
      items: orderItems,
      subtotal,
      tax,
      total,
      orderType,
      address: orderType === "delivery" ? address : undefined,
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "placed",
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create order",
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
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch your orders",
    });
  }
};

// Get all orders - Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("items.menuItem", "name image")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
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
        message: "Invalid order status",
      });
    }

    const existingOrder = await Order.findById(req.params.id);

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Prevent loyalty points from being awarded more than once
    const wasAlreadyCompleted =
      existingOrder.orderStatus === "completed";

    existingOrder.orderStatus = status;

    await existingOrder.save();

    // Award loyalty points only when order becomes completed
    if (status === "completed" && !wasAlreadyCompleted) {
      const User = require("../models/User");

      if (existingOrder.user) {
        const points = Math.floor(existingOrder.total / 100);

        await User.findByIdAndUpdate(existingOrder.user, {
          $inc: {
            loyaltyPoints: points,
          },
        });
      }
    }

    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone loyaltyPoints")
      .populate("items.menuItem", "name image");

    res.json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
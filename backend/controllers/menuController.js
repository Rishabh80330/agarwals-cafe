const MenuItem = require("../models/MenuItem");

// Get all menu items
const getMenuItems = async (req, res) => {
  try {
    const { category, featured } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (featured === "true") {
      filter.featured = true;
    }

    const menuItems = await MenuItem.find(filter)
      .populate("category", "name description image")
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      count: menuItems.length,
      menuItems,
    });
  } catch (error) {
    console.error("Get menu error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch menu",
    });
  }
};

// Get single menu item
const getMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate(
      "category",
      "name description image"
    );

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.json({
      success: true,
      menuItem,
    });
  } catch (error) {
    console.error("Get single menu error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch menu item",
    });
  }
};

// Create menu item
const createMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      isVeg,
      isAvailable,
      featured,
    } = req.body;

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, description, price and category are required",
      });
    }

    const menuItem = await MenuItem.create({
      name,
      description,
      price,
      category,
      image,
      isVeg,
      isAvailable,
      featured,
    });

    const populatedMenuItem = await menuItem.populate(
      "category",
      "name description image"
    );

    res.status(201).json({
      success: true,
      message: "Menu item created successfully",
      menuItem: populatedMenuItem,
    });
  } catch (error) {
    console.error("Create menu error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create menu item",
    });
  }
};

// Update menu item
const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("category", "name description image");

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.json({
      success: true,
      message: "Menu item updated successfully",
      menuItem,
    });
  } catch (error) {
    console.error("Update menu error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update menu item",
    });
  }
};

// Delete menu item
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error("Delete menu error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete menu item",
    });
  }
};

module.exports = {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
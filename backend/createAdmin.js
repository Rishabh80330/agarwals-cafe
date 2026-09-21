require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = require("./models/User");

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const newPassword = "CafeAdmin@2026"; // Change this to your desired password

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const admin = await User.findOneAndUpdate(
      { email: "admin@agarwalscafe.com" },
      {
        password: hashedPassword,
        role: "admin",
      },
      { new: true }
    );

    if (!admin) {
      console.log("Admin account not found.");
      process.exit(1);
    }

    console.log("Admin password reset successfully.");
    console.log("Email: admin@agarwalscafe.com");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Failed to reset admin:", error.message);
    process.exit(1);
  }
};

resetAdmin();
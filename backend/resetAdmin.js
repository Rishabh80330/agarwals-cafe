require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = require("./models/User");

const resetAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error(
        "ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required."
      );
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await User.findOneAndUpdate(
      { email: adminEmail },
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
    console.log(`Email: ${adminEmail}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Failed to reset admin:", error.message);
    process.exit(1);
  }
};

resetAdmin();
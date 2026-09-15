import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

import User from "./models/User.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dawadost";

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const adminExists = await User.findOne({ email: "admin@gmail.com" });

    if (adminExists) {
      console.log("⚠️ Admin user already exists");
      
      // Fetch with password to update
      const adminWithPassword = await User.findOne({ email: "admin@gmail.com" }).select("+password");
      
      // Always ensure user has admin role and is verified
      adminWithPassword.role = "admin";
      adminWithPassword.isVerified = true;
      
      // Set phone if not set
      if (!adminWithPassword.phone) {
        adminWithPassword.phone = "9999999999";
      }
      
      // If password is not admin123, update it
      const isMatch = await bcrypt.compare("admin123", adminWithPassword.password);
      if (!isMatch) {
        adminWithPassword.password = await bcrypt.hash("admin123", 10);
        console.log("✅ Password updated to admin123");
      }
      
      await adminWithPassword.save();
      console.log("✅ Admin role and verification updated");
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash("admin123", 10);
      
      const adminUser = await User.create({
        name: "Admin",
        email: "admin@gmail.com",
        phone: "9999999999",
        password: hashedPassword,
        role: "admin",
        isVerified: true,
      });

      console.log("✅ Admin user created successfully!");
      console.log("📧 Email: admin@gmail.com");
      console.log("🔑 Password: admin123");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

seedAdmin();


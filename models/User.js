import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    firstName: {
      type: String,
      default: "",
      trim: true,
    },

    lastName: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      match: [/^[6-9]\d{9}$/, "Invalid phone number"],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
    },
     
    password: {
      type: String,
      required: true,
      select: false,
    },

    profilePic: {
      type: String,
      default: "",
    },

    gender: {
  type: String,
  enum: ["Male", "Female", "Other"],
},

    address: {
      houseName: {
        type: String,
        default: "",
      },
      landmark: {
        type: String,
        default: "",
      },
      street: {
        type: String,
        default: "",
      },
      district: {
        type: String,
        default: "",
      },
      state: {
        type: String,
        default: "",
      },
      pincode: {
        type: String,
        default: "",
      },
      country: {
        type: String,
        default: "",
      },
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    otp: String,
    otpExpire: Date,

    resetPasswordToken: String,
    resetPasswordExpire: Date,

    wishlist: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      price: Number,
      image: String,
    }],
  },
  { timestamps: true }
);

export default mongoose.model("users", userSchema);

import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["cod", "online"],
    default: "cod",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
orderStatus: {
  type: String,
  enum: [
    "confirmed",
    "packed",
    "shipping",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ],
  default: "confirmed",
},

trackingHistory: [
  {
    status: String,
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
],
  totalAmount: {
    type: Number,
    required: true,
  },
  discountApplied: {
    type: Number,
    default: 0,
  },
  deliveryDate: {
    type: Date,
  },
  finalAmount: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);


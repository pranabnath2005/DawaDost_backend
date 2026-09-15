  import mongoose from "mongoose";

  const cartItemSchema = new mongoose.Schema({
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
      default: 1,
    },
  });

  const cartSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  }, { timestamps: true });

  // Calculate total price virtual
  cartSchema.virtual('totalPrice').get(function() {
    return this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  });

  cartSchema.set('toJSON', { virtuals: true });
  cartSchema.set('toObject', { virtuals: true });

  export default mongoose.model("Cart", cartSchema);


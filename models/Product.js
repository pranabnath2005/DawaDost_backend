import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
{
  // PRODUCT ID
  productId: {
    type: String,
    required: true,
  },

  // PRODUCT NAME
  name: {
    type: String,
    required: true,
  },

  // PRODUCT TYPE
  type: {
    type: String,
  },

  // CATEGORY
  category: {
    type: String,
  },

  // BRAND NAME
  brand: {
    type: String,
    required: true,
  },

  // BRAND URL SLUG
  brandSlug: {
    type: String,
    required: true,
  },

  // BRAND LOGO
  brandLogo: {
    type: String,
  },

  // PRICE
  price: {
    type: Number,
    required: true,
  },

  // DISCOUNT PRICE
  discountPrice: {
    type: Number,
  },

  // STOCK
  stock: {
    type: Number,
    default: 0,
  },

  // DELIVERY
  delivery: {
    type: String,
  },

  // DESCRIPTION
  description: {
    type: String,
  },

  // PRODUCT IMAGE
  image: {
    type: String,
  },

  // CLOUDINARY IMAGE ID
  cloudinaryId: {
    type: String,
  },
},
{
  timestamps: true,
}
);

export default mongoose.model(
  "Product",
  productSchema
);
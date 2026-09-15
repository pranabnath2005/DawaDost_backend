import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile_pictures",
    resource_type: "image",
  },
});

const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products",
    resource_type: "image",
  },
});

export const uploadProfile = multer({
  storage: profileStorage,
});

export const uploadProduct = multer({
  storage: productStorage,
});
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      maxlength: [100, "name is too long (max 100)"],
      unique: true,
    },
    price: {
      type: Number,
      required: [true, "price is required"],
      min: [0, "price must be non-negative"],
    },
    stock: {
      type: Number,
      required: [true, "stock is required"],
      min: [0, "stock must be non-negative"],
      validate: {
        validator: Number.isInteger,
        message: "stock must be an integer",
      },
    },
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);

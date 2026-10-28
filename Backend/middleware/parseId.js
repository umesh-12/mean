import mongoose from "mongoose";

export default function parseId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  next();
}
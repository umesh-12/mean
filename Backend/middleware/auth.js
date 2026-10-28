import jwt from "jsonwebtoken";
import User from "../models/User.js";

// protect: login garyo ki garena check garne
export async function protect(req, res, next) {
  // header: Authorization: Bearer <token>
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Login required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }
    req.user = user; // pachi ko handler ma req.user paiyxa
    next();
  } catch (err) {
    // token galat ya expire bhayo
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// adminOnly: admin role matra
export function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
}
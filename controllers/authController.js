import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// token banaune helper
function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role }, // token bhitra k rakhne
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// 1. REGISTER: POST /api/auth/register
export const register = async (req, res) => {
  const body = req.body ?? {};
  const { name, email, password } = body;

  if (typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ error: "password must be at least 6 characters" });
  }

  // password hash garne (10 = kati kada hash garne)
  const hashed = await bcrypt.hash(password, 10);

  // role body bata linna: user le aafai admin banna nasakos
  const user = await User.create({ name, email, password: hashed });

  res.status(201).json({
    token: signToken(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

// 2. LOGIN: POST /api/auth/login
export const login = async (req, res) => {
  const body = req.body ?? {};
  const { email, password } = body;

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "email and password are required" });
  }

  // password select: false xa, tesaile yaha +password le maagne
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

  // email ya password kun galat bhanera nabhane (attacker lai help hunxa)
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  res.json({
    token: signToken(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

// 3. ME: GET /api/auth/me (login bhayeko user ko info)
export const me = async (req, res) => {
  res.json(req.user); // protect middleware le req.user rakheko xa
};
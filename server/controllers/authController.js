import User from "../models/User.js";
import { signToken, userPayload } from "../utils/token.js";

export async function signup(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already registered" });

  const user = await User.create({ name, email, password });
  res.status(201).json({ token: signToken(user), user: userPayload(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  res.json({ token: signToken(user), user: userPayload(user) });
}

export function me(req, res) {
  res.json({ user: userPayload(req.user) });
}

import jwt from "jsonwebtoken";

export function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export function userPayload(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

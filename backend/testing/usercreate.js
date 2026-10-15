import { User } from "../models/mysql/user.model.js";

try {
  const result = await User.create({
    name: "Test User",
    email: "test@gmail.com",
    password: "123456",
    role: "user",
  });

  console.log("User created:", result);
} catch (error) {
  console.error("Create user failed:", error.message);
}
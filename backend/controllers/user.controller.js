import bcrypt from "bcrypt";
import { User } from "../models/mysql/user.model.js";
import jwt from "jsonwebtoken";
//import dotenv from 'dotenv';

//dotenv.config();

export const registerUser = async (req, res) => {
  console.log(req.body);
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name,email,password are required" });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    const user = await User.findByEmail(email);

    if (!user) return res.status(401).json({ message: "invalid email" });

    const match = await bcrypt.compare(password, user.password);

    if (match) {
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      return res.status(401).json({ message: "password doesn't match" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error:", error: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await User.findById(userId);
    if (!data) {
      return res.status(404).json({ message: "user id doesn't exist" });
    }
    return res.status(200).json({
      user: data,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({ message: "User successfully logged Out" });
  } catch (err) {
    res.status(500).json({ message: "something went wrong" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;

    // 1. Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    // 2. Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 3. Update User Profile
    const updatedUser = await User.update(userId, {
      name: name.trim(),
      phone: phone ? phone.trim() : null,
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({
      message: "Failed to update profile",
    });
  }
};

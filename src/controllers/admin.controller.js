import { Admin } from "../models/admin.model.js";

export const createAdmin = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Create a new admin
    const newAdmin = new Admin({
      username,
      email,
      password,
      role, // Ensure this is passed correctly
    });

    await newAdmin.save();
    res.status(201).json({ message: "Admin created successfully", admin: newAdmin });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
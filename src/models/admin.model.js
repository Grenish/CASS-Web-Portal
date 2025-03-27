import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const AdminSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["admin", "contentManager","user"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving with proper error handling
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare passwords
AdminSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Generate access token (synchronous JWT signing)
AdminSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Generate refresh token (synchronous JWT signing)
AdminSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// Export the model
export const Admin = mongoose.model("Admin", AdminSchema);

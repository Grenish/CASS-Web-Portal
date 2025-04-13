import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const ROLES = {
  ADMIN: "admin",
  CONTENT_MANAGER: "contentManager",
  USER: "user",
};

const AdminSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    displayName: {
      first: {
        type: String,
        required: true,
        trim: true,
      },
      last: {
        type: String,
        required: true,
        trim: true,
      },
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{10}$/, "Phone number must be 10 digits"],
    },
    avatar: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      trim: true,
      minlength: [8, "Password must be at least 8 characters long"],
    },
    refreshToken: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field for full name
AdminSchema.virtual("fullName").get(function () {
  return `${this.displayName.first} ${this.displayName.last}`;
});

// Hash password before saving
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(new Error("Error hashing the password"));
  }
});

AdminSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Exclude sensitive data in JSON
AdminSchema.methods.toJSON = function () {
  const admin = this.toObject();
  delete admin.password;
  delete admin.refreshToken;
  return admin;
};

// Generate access token
AdminSchema.methods.generateAccessToken = function () {
  try {
    const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || "1h";
    return jwt.sign(
      {
        _id: this._id,
        username: this.username,
        email: this.email,
        role: this.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: accessTokenExpiry,
      }
    );
  } catch (error) {
    throw new Error("Error generating access token");
  }
};

// Generate refresh token
AdminSchema.methods.generateRefreshToken = function () {
  try {
    const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || "10d";
    return jwt.sign(
      {
        _id: this._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: refreshTokenExpiry,
      }
    );
  } catch (error) {
    throw new Error("Error generating refresh token");
  }
};

export const Admin = mongoose.model("Admin", AdminSchema);

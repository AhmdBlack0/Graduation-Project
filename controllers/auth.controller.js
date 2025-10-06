import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import { generateTokenAndSetCookie } from "../lib/generateTokenAndSetCookie.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "ahmdblack.0@gmail.com",
    pass: "qpitagpmolqshrvu",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;
    let avatar = null;

    // Upload avatar if exists
    if (req.files && req.files.avatar) {
      const result = await cloudinary.uploader.upload(
        req.files.avatar.tempFilePath,
        {
          folder: "avatars",
          width: 150,
          crop: "scale",
        }
      );
      avatar = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-digit verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = Date.now() + 600000; // 10 minutes

    // Create user in database
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar,
      username,
      verificationCode,
      verificationCodeExpires,
      isVerified: false,
    });

    // Send verification email
    await transporter.sendMail({
      from: `"My App" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Verify your email - Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name},</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              Thank you for registering! Please verify your email by entering this code:
            </p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px;">
                ${verificationCode}
              </span>
            </div>
            <p style="color: #999; font-size: 14px; margin-top: 20px;">
              This code will expire in 10 minutes.
            </p>
            <p style="color: #999; font-size: 14px;">
              If you didn't create this account, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    res.status(201).json({
      success: true,
      message: "Verification code sent to your email. Please check your inbox.",
      email: user.email, // Send email back so frontend knows where code was sent
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now login.",
    });
  } catch (error) {
    console.error("Verify Email Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    // Send new verification email
    await transporter.sendMail({
      from: `"My App" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Resend Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name},</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              Here is your new verification code:
            </p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px;">
                ${verificationCode}
              </span>
            </div>
            <p style="color: #999; font-size: 14px; margin-top: 20px;">
              This code will expire in 10 minutes.
            </p>
          </div>
        </div>
      `,
    });

    res.json({
      success: true,
      message: "Verification code resent successfully.",
    });
  } catch (error) {
    console.error("Resend Verification Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        message: "Please verify your email to login",
        needsVerification: true,
        email: user.email,
      });
    }

    generateTokenAndSetCookie(user, res);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: error.message });
  }
};

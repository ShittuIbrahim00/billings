import JsonWebToken from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { sendPasswordResetEmail, sendPasswordSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/email.js";

export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const avatar = req.files?.avatar?.[0]?.path || null;

    const existingUser = await userModel.findOne({ email });
    if (existingUser)
      return res.status(400).json({ msg: "Email already taken" });

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    let userData = new userModel({
      firstName,
      lastName,
      email,
      password,
      avatar: avatar,
      role: "user",
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    await userData.save();
    await sendVerificationEmail(userData.email, verificationToken);

    const token = JsonWebToken.sign(
      { id: userData._id, role: userData.role },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    res
      .status(201)
      .json({ success: true, msg: "User created", userData, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await userModel.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid or expired verification code" });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();
    await sendWelcomeEmail(user.email)
    res.status(200).json({
      success: true,
      msg: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("Error in verifying email", error);
    res.status(500).json({success: false, msg: error.message})
  }
};

export const resendVerificationEmail = async (req, res) => {
  const {email} = req.body;
  try {
    const user = await userModel.findOne({email});
    if (!user) {
      return res.status(400).json({ success: false, msg: "User not found" });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, msg: "User already verified" });
    }
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = verificationTokenExpiresAt;

    await user.save();
    await sendVerificationEmail(user.email, user.firstName, verificationToken);

    return res.status(200).json({success: true, msg: "Verification code sent successfully", verificationToken, verificationTokenExpiresAt})
  } catch (error) {
    console.log("Error verifying email", error);
    res.status(500).json({success: false, msg: error.message})
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(403)
        .json({ success: false, msg: "Invalid credentials" });
    }
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ success: false, msg: "Please verify your email to login" });
    }
    const token = JsonWebToken.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );
    user.lastLogin = new Date();
    user.isOnline = true
    await user.save();
    res
      .status(201)
      .json({ success: true, msg: "User logged successfully", user, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if(!user) return res.status(400).json({success: true, msg: "If an account exists with this email, A reset link will be sent shortly."})
      
    // Generate password reset token
    const resetToken = crypto.randomUUID(20).toString("hex");
    const resetPasswordExpiresAt = Date.now() + 2 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetPasswordExpiresAt;

    await user.save();
    await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);
    res.status(200).json({success: true, msg: "Password reset successful"})
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const {token} = req.params;
    const {password} = req.body;
    const user = await userModel.findOne({ resetPasswordToken: token, resetPasswordExpiresAt: {$gt: Date.now()}});
    if(!user) return res.status(400).json({success: false, msg: "Invalid or expired token"});

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    await sendPasswordSuccessEmail(user.email)
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().populate("firstName");
    res
      .status(200)
      .json({ success: true, msg: "Users retrieved successfully", users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const users = await userModel.findById(req.user).select("-password");
    if(!users) return res.status(400).json({ success: false, msg: "User not found" });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



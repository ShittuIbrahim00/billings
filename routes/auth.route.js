import express from "express";
import { checkAuth, forgotPassword, getAllUsers, loginUser, registerUser, resendVerificationEmail, resetPassword, verifyEmail } from "../controllers/auth.controller.js";
import { authorize, protect } from "../middlewares/authMiddleware.js";
import uploadMiddleware from "../utils/upload.js";

const authRouter = express.Router();

authRouter.post("/register", uploadMiddleware, registerUser);
authRouter.post("/verifyaccount", verifyEmail);
authRouter.post("/resend-verification-code", resendVerificationEmail);
authRouter.post("/login", loginUser);
authRouter.get("/all-users", protect, authorize("admin"), getAllUsers);
authRouter.get("/check-auth", protect, checkAuth);

authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);

export default authRouter;
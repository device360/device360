import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

const DEFAULT_USERNAME = "Admin";
const DEFAULT_PASSWORD = "Admin@device360";
const ADMIN_EMAIL = "device360recycle@gmail.com";

const otpStore = new Map();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/send-otp", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      username !== DEFAULT_USERNAME ||
      password !== DEFAULT_PASSWORD
    ) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const code = generateOtp();

    otpStore.set(ADMIN_EMAIL, {
      code,
      expires: Date.now() + 10 * 60 * 1000,
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: ADMIN_EMAIL,
      subject: "Device360 Admin Login OTP",
      html: `
        <h2>Device360 Admin Verification</h2>
        <p>Your verification code:</p>
        <h1>${code}</h1>
        <p>Expires in 10 minutes.</p>
      `,
    });

    return res.json({
      success: true,
      message: "OTP sent",
    });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);

    return res.status(500).json({
      error: "OTP send failed",
    });
  }
});

router.post("/verify-otp", (req, res) => {
  try {
    const { otp } = req.body;

    const data = otpStore.get(ADMIN_EMAIL);

    if (!data) {
      return res.status(400).json({
        error: "OTP expired",
      });
    }

    if (Date.now() > data.expires) {
      otpStore.delete(ADMIN_EMAIL);

      return res.status(400).json({
        error: "OTP expired",
      });
    }

    if (data.code !== otp) {
      return res.status(400).json({
        error: "Invalid OTP",
      });
    }

    otpStore.delete(ADMIN_EMAIL);

    return res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      error: "OTP verification failed",
    });
  }
});

export default router;
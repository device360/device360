import express from "express";
import { db, auth } from "../firebase.js";

const router = express.Router();

// ─── POST /api/auth/send-otp ──────────────────────────────────────────────────
// Creates/updates user record in Firestore before OTP is sent via Firebase client SDK
// ─────────────────────────────────────────────────────────────────────────────
router.post("/send-otp", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: "phoneNumber is required" });
    }

    const e164Regex = /^\+[1-9]\d{7,14}$/;
    if (!e164Regex.test(phoneNumber)) {
      return res.status(400).json({
        error: "phoneNumber must be in E.164 format (e.g. +919876543210)",
      });
    }

    const userRef  = db.collection("users").doc(phoneNumber);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      await userRef.set({
        phoneNumber,
        createdAt:   new Date().toISOString(),
        otpVerified: false,
      });
    } else {
      await userRef.update({
        otpVerified: false,
        updatedAt:   new Date().toISOString(),
      });
    }

    return res.json({
      success: true,
      message: "Proceed with Firebase OTP on frontend",
    });
  } catch (err) {
    console.error("[auth] send-otp error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/auth/verify-otp ───────────────────────────────────────────────
// Called FIRE-AND-FORGET from frontend — never blocks user flow
// Verifies Firebase idToken and marks user as verified in Firestore
// ─────────────────────────────────────────────────────────────────────────────
router.post("/verify-otp", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      // Return 200 so fire-and-forget doesn't log errors on frontend
      return res.status(200).json({ success: false, error: "idToken is required" });
    }

    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (tokenErr) {
      console.warn("[auth] verifyIdToken failed:", tokenErr.code);

      // Return 200 (not 401/500) — frontend doesn't block on this response
      return res.status(200).json({
        success: false,
        error:   tokenErr.code || "token-verification-failed",
      });
    }

    const { uid, phone_number: phoneNumber } = decodedToken;

    if (!phoneNumber) {
      return res.status(200).json({ success: false, error: "No phone_number in token" });
    }

    // Update Firestore — mark verified
    await db.collection("users").doc(phoneNumber).set(
      {
        uid,
        phoneNumber,
        otpVerified: true,
        verifiedAt:  new Date().toISOString(),
      },
      { merge: true },
    );

    console.log(`[auth] ✅ Verified: ${phoneNumber} (uid: ${uid})`);

    return res.status(200).json({
      success:     true,
      uid,
      phoneNumber,
    });
  } catch (err) {
    console.error("[auth] verify-otp unexpected error:", err);
    // Always return 200 — this endpoint is fire-and-forget from frontend
    return res.status(200).json({ success: false, error: "Internal server error" });
  }
});

// ─── GET /api/auth/user/:phoneNumber ─────────────────────────────────────────
router.get("/user/:phoneNumber", async (req, res) => {
  try {
    const phoneNumber = decodeURIComponent(req.params.phoneNumber);
    const userSnap    = await db.collection("users").doc(phoneNumber).get();

    if (!userSnap.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ success: true, user: userSnap.data() });
  } catch (err) {
    console.error("[auth] get-user error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

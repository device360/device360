import express from "express";
import { db } from "../firebase.js";

const router = express.Router();

// ─── POST /api/leads ──────────────────────────────────────────────────────────
// Creates a new booking and returns bookingId
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      addressDetails,
      timeSlot,
      brand,
      model,
      issue,
      price,
      estimatedTime,
      doorstepPickup,
      isLiveRepair,
    } = req.body;

    // Validation
    if (!name || !phone || !brand || !model || !issue) {
      return res.status(400).json({
        error: "Missing required fields: name, phone, brand, model, issue",
      });
    }

    const bookingData = {
      name,
      phone,
      address:        address        || "",
      addressDetails: addressDetails || {},
      timeSlot:       timeSlot       || "",
      brand,
      model,
      issue,
      price:          price          || 0,
      estimatedTime:  estimatedTime  || "",
      doorstepPickup: doorstepPickup ?? true,
      isLiveRepair:   isLiveRepair   || false,
      status:         "pending",   // pending | confirmed | picked_up | in_progress | completed | cancelled
      videoLink:      null,
      technicianId:   null,
      createdAt:      new Date().toISOString(),
      updatedAt:      new Date().toISOString(),
    };

    const docRef = await db.collection("leads").add(bookingData);

    console.log(`[leads] ✅ Created booking ${docRef.id} for ${name} (${phone})`);

    return res.status(201).json({
      success:   true,
      bookingId: docRef.id,
      message:   "Booking created successfully",
    });
  } catch (err) {
    console.error("[leads] create error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/leads ───────────────────────────────────────────────────────────
// Returns all leads ordered by newest first — used by Admin Dashboard
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const snapshot = await db
      .collection("leads")
      .orderBy("createdAt", "desc")
      .get();

    const leads = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ success: true, leads });
  } catch (err) {
    console.error("[leads] get-all error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/leads/:id ───────────────────────────────────────────────────────
// Returns a single lead — used by customer Dashboard to track repair
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const doc = await db.collection("leads").doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Booking not found" });
    }

    return res.json({
      success: true,
      lead: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    console.error("[leads] get-one error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PATCH /api/leads/:id ─────────────────────────────────────────────────────
// Updates status, videoLink, price, or technicianId
// Used by Admin Dashboard
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/:id", async (req, res) => {
  try {
    const { status, videoLink, technicianId, price } = req.body;

    const updates = { updatedAt: new Date().toISOString() };

    if (status       !== undefined) updates.status       = status;
    if (videoLink    !== undefined) updates.videoLink    = videoLink;
    if (technicianId !== undefined) updates.technicianId = technicianId;
    if (price        !== undefined) updates.price        = price;

    await db.collection("leads").doc(req.params.id).update(updates);

    console.log(`[leads] ✅ Updated booking ${req.params.id}`, updates);

    return res.json({ success: true, message: "Booking updated" });
  } catch (err) {
    console.error("[leads] update error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

// ─── DELETE /api/leads/all ────────────────────────────────────────────────────
// Danger zone — used by admin settings
router.delete("/all", async (req, res) => {
  try {
    const snap = await db.collection("leads").get();
    const batch = db.batch();
    snap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`[leads] ⚠️ Deleted all ${snap.size} leads`);
    return res.json({ success: true, deleted: snap.size });
  } catch (err) {
    console.error("[leads] delete-all error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── DELETE /api/leads/:id ────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    await db.collection("leads").doc(req.params.id).delete();
    return res.json({ success: true });
  } catch (err) {
    console.error("[leads] delete error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

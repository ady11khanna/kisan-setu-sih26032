import express from 'express';
import db from '../database.js';

const router = express.Router();

// Helper to log SMS to SQLite DB
const addSmsLog = (recipientMobile, recipientName, message, type = 'INFO') => {
  const newLog = {
    id: "sms-" + Date.now(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    recipient: `${recipientMobile} (${recipientName})`,
    message,
    type,
  };

  const stmt = db.prepare('INSERT INTO sms_logs (id, timestamp, recipient, message, type) VALUES (?, ?, ?, ?, ?)');
  stmt.run(newLog.id, newLog.timestamp, newLog.recipient, newLog.message, newLog.type);
  return newLog;
};

// GET /api/v1/mandis
router.get('/mandis', (req, res) => {
  const mandis = db.prepare('SELECT * FROM mandis').all();
  res.json({ success: true, data: mandis });
});

// GET /api/v1/crops
router.get('/crops', (req, res) => {
  const crops = db.prepare('SELECT * FROM crops').all();
  res.json({ success: true, data: crops });
});

// GET /api/v1/tokens
router.get('/tokens', (req, res) => {
  const rawTokens = db.prepare('SELECT * FROM tokens ORDER BY tokenNumber DESC').all();
  const tokens = rawTokens.map((t) => ({
    ...t,
    weighmentData: t.weighmentData ? JSON.parse(t.weighmentData) : null,
  }));
  res.json({ success: true, data: tokens });
});

// GET /api/v1/sms/logs
router.get('/sms/logs', (req, res) => {
  const logs = db.prepare('SELECT * FROM sms_logs ORDER BY id DESC').all();
  res.json({ success: true, data: logs });
});

// POST /api/v1/auth/verify-otp
router.post('/auth/verify-otp', (req, res) => {
  const { mobileOrAadhaar } = req.body;
  const user = {
    id: "PMK-HAR-" + Math.floor(10000 + Math.random() * 90000),
    name: "Farmer " + (mobileOrAadhaar ? mobileOrAadhaar.slice(-4) : "4819"),
    mobile: mobileOrAadhaar && mobileOrAadhaar.length === 10 ? mobileOrAadhaar : "9988776655",
    aadhaarLast4: mobileOrAadhaar ? mobileOrAadhaar.slice(-4) : "4819",
    district: "Karnal",
    state: "Haryana",
    landAreaAcres: 8.5,
    primaryCrop: "wheat",
    isVerified: true,
  };
  res.json({ success: true, user });
});

// POST /api/v1/slots/book
router.post('/slots/book', (req, res) => {
  const { cropId, quantityQuintal, mandiId, slotDate, slotTimeWindow, farmerName, farmerMobile, farmerId } = req.body;

  const mandi = db.prepare('SELECT * FROM mandis WHERE id = ?').get(mandiId) || db.prepare('SELECT * FROM mandis LIMIT 1').get();
  const crop = db.prepare('SELECT * FROM crops WHERE id = ?').get(cropId) || db.prepare('SELECT * FROM crops LIMIT 1').get();

  const maxToken = db.prepare('SELECT MAX(tokenNumber) as maxNum FROM tokens').get();
  const nextTokenNum = (maxToken?.maxNum || 44) + 1;
  const newTokenId = `KS-2026-${nextTokenNum}`;

  const fName = farmerName || "Vikram Sharma";
  const fMobile = farmerMobile || "9988776655";
  const fId = farmerId || "PMK-HAR-77120";

  const newToken = {
    id: newTokenId,
    tokenNumber: nextTokenNum,
    farmerName: fName,
    farmerMobile: fMobile,
    farmerId: fId,
    cropId: crop.id,
    cropName: crop.name.split(" ")[0],
    quantityQuintal: Number(quantityQuintal),
    mandiId: mandi.id,
    mandiName: mandi.name,
    slotDate,
    slotTimeWindow,
    counterAssigned: null,
    status: "BOOKED",
    checkInTime: null,
    weighmentData: null,
    pfmsTxnId: null,
    createdAt: new Date().toISOString(),
  };

  // SQL Insert
  const insertStmt = db.prepare(`
    INSERT INTO tokens (id, tokenNumber, farmerName, farmerMobile, farmerId, cropId, cropName, quantityQuintal, mandiId, mandiName, slotDate, slotTimeWindow, counterAssigned, status, checkInTime, weighmentData, pfmsTxnId, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertStmt.run(
    newToken.id, newToken.tokenNumber, newToken.farmerName, newToken.farmerMobile, newToken.farmerId,
    newToken.cropId, newToken.cropName, newToken.quantityQuintal, newToken.mandiId, newToken.mandiName,
    newToken.slotDate, newToken.slotTimeWindow, null, "BOOKED", null, null, null, newToken.createdAt
  );

  // Update Mandi booked count
  db.prepare('UPDATE mandis SET currentBooked = currentBooked + 1 WHERE id = ?').run(mandi.id);

  // Send SMS
  addSmsLog(
    fMobile,
    fName,
    `Kisan Setu: Slot Confirmed! Token #${nextTokenNum} for ${quantityQuintal} Qtl ${crop.name.split(" ")[0]} at ${mandi.name} on ${slotDate} (${slotTimeWindow}). Please bring QR code.`,
    "BOOKING"
  );

  res.status(201).json({ success: true, data: newToken });
});

// POST /api/v1/admin/checkin
router.post('/admin/checkin', (req, res) => {
  const { tokenId, counterAssigned } = req.body;
  const counter = counterAssigned || "Counter 1";
  const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const token = db.prepare('SELECT * FROM tokens WHERE id = ? OR tokenNumber = ?').get(tokenId, Number(tokenId));
  if (!token) {
    return res.status(404).json({ success: false, message: "Token not found" });
  }

  db.prepare('UPDATE tokens SET status = ?, counterAssigned = ?, checkInTime = ? WHERE id = ?')
    .run("CHECKED_IN", counter, checkInTime, token.id);

  const updatedToken = db.prepare('SELECT * FROM tokens WHERE id = ?').get(token.id);

  addSmsLog(
    token.farmerMobile,
    token.farmerName,
    `Kisan Setu: Gate Check-in Complete for Token #${token.tokenNumber} at ${token.mandiName}. Assigned to ${counter}. Est. wait: 10 mins.`,
    "GATE_ENTRY"
  );

  res.json({
    success: true,
    data: {
      ...updatedToken,
      weighmentData: updatedToken.weighmentData ? JSON.parse(updatedToken.weighmentData) : null,
    }
  });
});

// POST /api/v1/admin/weighment
router.post('/admin/weighment', (req, res) => {
  const { tokenId, grossKg, tareKg, moisturePct, grade } = req.body;

  const token = db.prepare('SELECT * FROM tokens WHERE id = ? OR tokenNumber = ?').get(tokenId, Number(tokenId));
  if (!token) {
    return res.status(404).json({ success: false, message: "Token not found" });
  }

  const netKg = Number(grossKg) - Number(tareKg);
  const netQuintals = Math.round((netKg / 100) * 10) / 10;
  const crop = db.prepare('SELECT * FROM crops WHERE id = ?').get(token.cropId) || db.prepare('SELECT * FROM crops LIMIT 1').get();
  const totalPayoutRs = Math.round(netQuintals * crop.mspPerQuintal);

  const weighmentData = {
    grossKg: Number(grossKg),
    tareKg: Number(tareKg),
    netQuintals,
    moisturePct: Number(moisturePct),
    grade,
    totalPayoutRs,
  };

  db.prepare('UPDATE tokens SET status = ?, weighmentData = ? WHERE id = ?')
    .run("WEIGHMENT_DONE", JSON.stringify(weighmentData), token.id);

  const updatedToken = db.prepare('SELECT * FROM tokens WHERE id = ?').get(token.id);

  addSmsLog(
    token.farmerMobile,
    token.farmerName,
    `Kisan Setu: Weighment & Quality verified for Token #${token.tokenNumber}! Net: ${netQuintals} Quintals (${grade}). Payout: ₹${totalPayoutRs.toLocaleString('en-IN')}. Sent to PFMS for disbursal.`,
    "WEIGHMENT"
  );

  res.json({
    success: true,
    data: {
      ...updatedToken,
      weighmentData,
    }
  });
});

// POST /api/v1/admin/pfms-pay
router.post('/admin/pfms-pay', (req, res) => {
  const { tokenId } = req.body;

  const token = db.prepare('SELECT * FROM tokens WHERE id = ? OR tokenNumber = ?').get(tokenId, Number(tokenId));
  if (!token) {
    return res.status(404).json({ success: false, message: "Token not found" });
  }

  const pfmsTxnId = "PFMS-" + Math.floor(10000000000 + Math.random() * 90000000000);
  db.prepare('UPDATE tokens SET status = ?, pfmsTxnId = ? WHERE id = ?')
    .run("PAYMENT_DISPATCHED", pfmsTxnId, token.id);

  const updatedToken = db.prepare('SELECT * FROM tokens WHERE id = ?').get(token.id);
  const weighmentData = updatedToken.weighmentData ? JSON.parse(updatedToken.weighmentData) : null;

  if (weighmentData) {
    addSmsLog(
      token.farmerMobile,
      token.farmerName,
      `Kisan Setu: MSP Payment of ₹${weighmentData.totalPayoutRs.toLocaleString('en-IN')} for Token #${token.tokenNumber} DISPATCHED to your Bank Account via PFMS. Ref: ${pfmsTxnId}.`,
      "PAYMENT"
    );
  }

  res.json({
    success: true,
    data: {
      ...updatedToken,
      weighmentData,
    }
  });
});

export default router;

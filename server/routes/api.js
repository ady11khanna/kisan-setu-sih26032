import express from 'express';
import { pool, isProduction } from '../pgDatabase.js';
import db from '../database.js'; // SQLite fallback for local dev

const router = express.Router();

// Helper: run query on PostgreSQL (cloud) or SQLite (local)
const query = async (pgSql, pgParams, sqliteFn) => {
  if (isProduction) {
    const result = await pool.query(pgSql, pgParams);
    return result.rows;
  } else {
    return sqliteFn();
  }
};

// Helper: Add SMS log
const addSmsLog = async (recipientMobile, recipientName, message, type = 'INFO') => {
  const newLog = {
    id: "sms-" + Date.now(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    recipient: `${recipientMobile} (${recipientName})`,
    message,
    type,
  };

  if (isProduction) {
    await pool.query(
      'INSERT INTO sms_logs (id, timestamp, recipient, message, type) VALUES ($1,$2,$3,$4,$5)',
      [newLog.id, newLog.timestamp, newLog.recipient, newLog.message, newLog.type]
    );
  } else {
    db.prepare('INSERT INTO sms_logs (id, timestamp, recipient, message, type) VALUES (?, ?, ?, ?, ?)')
      .run(newLog.id, newLog.timestamp, newLog.recipient, newLog.message, newLog.type);
  }
  return newLog;
};

// GET /api/v1/mandis
router.get('/mandis', async (req, res) => {
  try {
    const mandis = await query('SELECT * FROM mandis', [], () => db.prepare('SELECT * FROM mandis').all());
    res.json({ success: true, data: mandis });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/v1/crops
router.get('/crops', async (req, res) => {
  try {
    const crops = await query('SELECT * FROM crops', [], () => db.prepare('SELECT * FROM crops').all());
    res.json({ success: true, data: crops });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/v1/tokens
router.get('/tokens', async (req, res) => {
  try {
    const rawTokens = await query(
      'SELECT * FROM tokens ORDER BY "tokenNumber" DESC',
      [],
      () => db.prepare('SELECT * FROM tokens ORDER BY tokenNumber DESC').all()
    );
    const tokens = rawTokens.map((t) => ({
      ...t,
      weighmentData: t.weighmentData ? (typeof t.weighmentData === 'string' ? JSON.parse(t.weighmentData) : t.weighmentData) : null,
    }));
    res.json({ success: true, data: tokens });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/v1/sms/logs
router.get('/sms/logs', async (req, res) => {
  try {
    const logs = await query('SELECT * FROM sms_logs ORDER BY id DESC', [], () => db.prepare('SELECT * FROM sms_logs ORDER BY id DESC').all());
    res.json({ success: true, data: logs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
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
router.post('/slots/book', async (req, res) => {
  try {
    const { cropId, quantityQuintal, mandiId, slotDate, slotTimeWindow, farmerName, farmerMobile, farmerId } = req.body;

    let mandi, crop, maxTokenNum;

    if (isProduction) {
      const mandiRes = await pool.query('SELECT * FROM mandis WHERE id = $1', [mandiId]);
      mandi = mandiRes.rows[0] || (await pool.query('SELECT * FROM mandis LIMIT 1')).rows[0];
      const cropRes = await pool.query('SELECT * FROM crops WHERE id = $1', [cropId]);
      crop = cropRes.rows[0] || (await pool.query('SELECT * FROM crops LIMIT 1')).rows[0];
      const maxRes = await pool.query('SELECT MAX("tokenNumber") as maxnum FROM tokens');
      maxTokenNum = maxRes.rows[0].maxnum || 44;
    } else {
      mandi = db.prepare('SELECT * FROM mandis WHERE id = ?').get(mandiId) || db.prepare('SELECT * FROM mandis LIMIT 1').get();
      crop = db.prepare('SELECT * FROM crops WHERE id = ?').get(cropId) || db.prepare('SELECT * FROM crops LIMIT 1').get();
      maxTokenNum = db.prepare('SELECT MAX(tokenNumber) as maxNum FROM tokens').get()?.maxNum || 44;
    }

    const nextTokenNum = Number(maxTokenNum) + 1;
    const newTokenId = `KS-2026-${nextTokenNum}`;
    const fName = farmerName || "Vikram Sharma";
    const fMobile = farmerMobile || "9988776655";
    const fId = farmerId || "PMK-HAR-77120";
    const createdAt = new Date().toISOString();

    if (isProduction) {
      await pool.query(
        `INSERT INTO tokens (id, "tokenNumber", "farmerName", "farmerMobile", "farmerId", "cropId", "cropName", "quantityQuintal", "mandiId", "mandiName", "slotDate", "slotTimeWindow", "counterAssigned", status, "checkInTime", "weighmentData", "pfmsTxnId", "createdAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
        [newTokenId, nextTokenNum, fName, fMobile, fId, crop.id, crop.name.split(" ")[0], Number(quantityQuintal), mandi.id, mandi.name, slotDate, slotTimeWindow, null, "BOOKED", null, null, null, createdAt]
      );
      await pool.query('UPDATE mandis SET "currentBooked" = "currentBooked" + 1 WHERE id = $1', [mandi.id]);
    } else {
      db.prepare(`INSERT INTO tokens (id, tokenNumber, farmerName, farmerMobile, farmerId, cropId, cropName, quantityQuintal, mandiId, mandiName, slotDate, slotTimeWindow, counterAssigned, status, checkInTime, weighmentData, pfmsTxnId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(newTokenId, nextTokenNum, fName, fMobile, fId, crop.id, crop.name.split(" ")[0], Number(quantityQuintal), mandi.id, mandi.name, slotDate, slotTimeWindow, null, "BOOKED", null, null, null, createdAt);
      db.prepare('UPDATE mandis SET currentBooked = currentBooked + 1 WHERE id = ?').run(mandi.id);
    }

    await addSmsLog(fMobile, fName,
      `Kisan Setu: Slot Confirmed! Token #${nextTokenNum} for ${quantityQuintal} Qtl ${crop.name.split(" ")[0]} at ${mandi.name} on ${slotDate} (${slotTimeWindow}). Please bring QR code.`,
      "BOOKING"
    );

    res.status(201).json({ success: true, data: { id: newTokenId, tokenNumber: nextTokenNum, farmerName: fName, farmerMobile: fMobile, farmerId: fId, cropId: crop.id, cropName: crop.name.split(" ")[0], quantityQuintal: Number(quantityQuintal), mandiId: mandi.id, mandiName: mandi.name, slotDate, slotTimeWindow, counterAssigned: null, status: "BOOKED", checkInTime: null, weighmentData: null, pfmsTxnId: null, createdAt } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/v1/admin/checkin
router.post('/admin/checkin', async (req, res) => {
  try {
    const { tokenId, counterAssigned } = req.body;
    const counter = counterAssigned || "Counter 1";
    const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let token;
    if (isProduction) {
      const res1 = await pool.query('SELECT * FROM tokens WHERE id = $1 OR "tokenNumber" = $2', [tokenId, Number(tokenId)]);
      token = res1.rows[0];
    } else {
      token = db.prepare('SELECT * FROM tokens WHERE id = ? OR tokenNumber = ?').get(tokenId, Number(tokenId));
    }

    if (!token) return res.status(404).json({ success: false, message: "Token not found" });

    if (isProduction) {
      await pool.query('UPDATE tokens SET status = $1, "counterAssigned" = $2, "checkInTime" = $3 WHERE id = $4', ["CHECKED_IN", counter, checkInTime, token.id]);
    } else {
      db.prepare('UPDATE tokens SET status = ?, counterAssigned = ?, checkInTime = ? WHERE id = ?').run("CHECKED_IN", counter, checkInTime, token.id);
    }

    await addSmsLog(token.farmerMobile, token.farmerName,
      `Kisan Setu: Gate Check-in Complete for Token #${token.tokenNumber} at ${token.mandiName}. Assigned to ${counter}. Est. wait: 10 mins.`,
      "GATE_ENTRY"
    );

    res.json({ success: true, data: { ...token, status: "CHECKED_IN", counterAssigned: counter, checkInTime, weighmentData: token.weighmentData ? JSON.parse(token.weighmentData) : null } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/v1/admin/weighment
router.post('/admin/weighment', async (req, res) => {
  try {
    const { tokenId, grossKg, tareKg, moisturePct, grade } = req.body;

    let token, crop;
    if (isProduction) {
      const t = await pool.query('SELECT * FROM tokens WHERE id = $1 OR "tokenNumber" = $2', [tokenId, Number(tokenId)]);
      token = t.rows[0];
      const c = await pool.query('SELECT * FROM crops WHERE id = $1', [token?.cropId]);
      crop = c.rows[0] || (await pool.query('SELECT * FROM crops LIMIT 1')).rows[0];
    } else {
      token = db.prepare('SELECT * FROM tokens WHERE id = ? OR tokenNumber = ?').get(tokenId, Number(tokenId));
      crop = db.prepare('SELECT * FROM crops WHERE id = ?').get(token?.cropId) || db.prepare('SELECT * FROM crops LIMIT 1').get();
    }

    if (!token) return res.status(404).json({ success: false, message: "Token not found" });

    const netKg = Number(grossKg) - Number(tareKg);
    const netQuintals = Math.round((netKg / 100) * 10) / 10;
    const totalPayoutRs = Math.round(netQuintals * crop.mspPerQuintal);
    const weighmentData = { grossKg: Number(grossKg), tareKg: Number(tareKg), netQuintals, moisturePct: Number(moisturePct), grade, totalPayoutRs };

    if (isProduction) {
      await pool.query('UPDATE tokens SET status = $1, "weighmentData" = $2 WHERE id = $3', ["WEIGHMENT_DONE", JSON.stringify(weighmentData), token.id]);
    } else {
      db.prepare('UPDATE tokens SET status = ?, weighmentData = ? WHERE id = ?').run("WEIGHMENT_DONE", JSON.stringify(weighmentData), token.id);
    }

    await addSmsLog(token.farmerMobile, token.farmerName,
      `Kisan Setu: Weighment & Quality verified for Token #${token.tokenNumber}! Net: ${netQuintals} Quintals (${grade}). Payout: ₹${totalPayoutRs.toLocaleString('en-IN')}. Sent to PFMS for disbursal.`,
      "WEIGHMENT"
    );

    res.json({ success: true, data: { ...token, status: "WEIGHMENT_DONE", weighmentData } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/v1/admin/pfms-pay
router.post('/admin/pfms-pay', async (req, res) => {
  try {
    const { tokenId } = req.body;

    let token;
    if (isProduction) {
      const t = await pool.query('SELECT * FROM tokens WHERE id = $1 OR "tokenNumber" = $2', [tokenId, Number(tokenId)]);
      token = t.rows[0];
    } else {
      token = db.prepare('SELECT * FROM tokens WHERE id = ? OR tokenNumber = ?').get(tokenId, Number(tokenId));
    }

    if (!token) return res.status(404).json({ success: false, message: "Token not found" });

    const pfmsTxnId = "PFMS-" + Math.floor(10000000000 + Math.random() * 90000000000);

    if (isProduction) {
      await pool.query('UPDATE tokens SET status = $1, "pfmsTxnId" = $2 WHERE id = $3', ["PAYMENT_DISPATCHED", pfmsTxnId, token.id]);
    } else {
      db.prepare('UPDATE tokens SET status = ?, pfmsTxnId = ? WHERE id = ?').run("PAYMENT_DISPATCHED", pfmsTxnId, token.id);
    }

    const weighmentData = token.weighmentData ? (typeof token.weighmentData === 'string' ? JSON.parse(token.weighmentData) : token.weighmentData) : null;

    if (weighmentData) {
      await addSmsLog(token.farmerMobile, token.farmerName,
        `Kisan Setu: MSP Payment of ₹${weighmentData.totalPayoutRs.toLocaleString('en-IN')} for Token #${token.tokenNumber} DISPATCHED to your Bank Account via PFMS. Ref: ${pfmsTxnId}.`,
        "PAYMENT"
      );
    }

    res.json({ success: true, data: { ...token, status: "PAYMENT_DISPATCHED", pfmsTxnId, weighmentData } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;

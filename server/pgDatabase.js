import pg from 'pg';
const { Pool } = pg;

// Use DATABASE_URL env var on Render cloud, fallback to local SQLite-style connection for dev
const isProduction = !!process.env.DATABASE_URL;

let pool = null;

if (isProduction) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
}

// Initialize Tables
export const initDb = async () => {
  if (!isProduction) return; // Skip if running locally (SQLite handles it)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS mandis (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      district TEXT NOT NULL,
      state TEXT NOT NULL,
      "distanceKm" REAL,
      "maxCapacityPerDay" INTEGER,
      "currentBooked" INTEGER,
      "countersActive" INTEGER,
      "avgProcessingTimeMins" INTEGER,
      "moistureLimitPct" REAL,
      status TEXT,
      lat REAL,
      lng REAL
    );

    CREATE TABLE IF NOT EXISTS crops (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      "mspPerQuintal" INTEGER NOT NULL,
      unit TEXT,
      "maxPerFarmer" INTEGER,
      icon TEXT
    );

    CREATE TABLE IF NOT EXISTS tokens (
      id TEXT PRIMARY KEY,
      "tokenNumber" INTEGER NOT NULL,
      "farmerName" TEXT NOT NULL,
      "farmerMobile" TEXT NOT NULL,
      "farmerId" TEXT,
      "cropId" TEXT,
      "cropName" TEXT,
      "quantityQuintal" REAL,
      "mandiId" TEXT,
      "mandiName" TEXT,
      "slotDate" TEXT,
      "slotTimeWindow" TEXT,
      "counterAssigned" TEXT,
      status TEXT NOT NULL,
      "checkInTime" TEXT,
      "weighmentData" TEXT,
      "pfmsTxnId" TEXT,
      "createdAt" TEXT
    );

    CREATE TABLE IF NOT EXISTS sms_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT,
      recipient TEXT,
      message TEXT,
      type TEXT
    );
  `);

  // Seed Mandis if empty
  const mandiCheck = await pool.query('SELECT COUNT(*) as count FROM mandis');
  if (parseInt(mandiCheck.rows[0].count) === 0) {
    const seedMandis = [
      ["mandi-1", "Karnal Central MSP Mandi", "Karnal", "Haryana", 4.2, 150, 112, 4, 12, 14, "OPEN", 29.6857, 76.9905],
      ["mandi-2", "Ludhiana Grain Hub", "Ludhiana", "Punjab", 8.7, 200, 195, 6, 10, 12, "HEAVY_LOAD", 30.9010, 75.8573],
      ["mandi-3", "Kurukshetra Agri Market", "Kurukshetra", "Haryana", 12.1, 120, 45, 3, 15, 14, "SMOOTH", 29.9695, 76.8783],
      ["mandi-4", "Indore MSP Procurement Centre", "Indore", "Madhya Pradesh", 18.5, 180, 90, 5, 11, 13, "OPEN", 22.7196, 75.8577],
    ];
    for (const m of seedMandis) {
      await pool.query(
        `INSERT INTO mandis (id, name, district, state, "distanceKm", "maxCapacityPerDay", "currentBooked", "countersActive", "avgProcessingTimeMins", "moistureLimitPct", status, lat, lng) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT (id) DO NOTHING`,
        m
      );
    }
  }

  // Seed Crops if empty
  const cropCheck = await pool.query('SELECT COUNT(*) as count FROM crops');
  if (parseInt(cropCheck.rows[0].count) === 0) {
    const seedCrops = [
      ["wheat", "Wheat (गेहूँ / ਕਣਕ)", 2275, "Quintal", 150, "🌾"],
      ["paddy", "Paddy / Rice (धान / ਝੋਨਾ)", 2300, "Quintal", 200, "🌾"],
      ["chana", "Gram / Chana (चना / ਛੋਲੇ)", 5440, "Quintal", 80, "🌱"],
      ["mustard", "Mustard / Sarson (सरसों / ਸਰ੍ਹੋਂ)", 5650, "Quintal", 60, "🌼"],
      ["maize", "Maize / Makka (मक्का / ਮੱਕੀ)", 2090, "Quintal", 100, "🌽"],
    ];
    for (const c of seedCrops) {
      await pool.query(
        `INSERT INTO crops (id, name, "mspPerQuintal", unit, "maxPerFarmer", icon) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
        c
      );
    }
  }

  // Seed Tokens if empty
  const tokenCheck = await pool.query('SELECT COUNT(*) as count FROM tokens');
  if (parseInt(tokenCheck.rows[0].count) === 0) {
    const today = new Date().toISOString().split("T")[0];
    const seedTokens = [
      ["KS-2026-451", 45, "Ramesh Kumar", "9876543210", "PMK-HAR-88421", "wheat", "Wheat", 40, "mandi-1", "Karnal Central MSP Mandi", today, "09:00 AM - 10:30 AM", "Counter 2", "PAYMENT_DISPATCHED", "09:12 AM", JSON.stringify({ grossKg: 4200, tareKg: 200, netQuintals: 40, moisturePct: 11.5, grade: "Grade A", totalPayoutRs: 91000 }), "PFMS-99482019482", new Date(Date.now() - 3600000 * 3).toISOString()],
      ["KS-2026-452", 46, "Gurpreet Singh", "9812345678", "PMK-PB-12903", "wheat", "Wheat", 65, "mandi-1", "Karnal Central MSP Mandi", today, "10:30 AM - 12:00 PM", "Counter 1", "WEIGHMENT_DONE", "10:25 AM", JSON.stringify({ grossKg: 6800, tareKg: 300, netQuintals: 65, moisturePct: 12.8, grade: "FAQ (Fair Average Quality)", totalPayoutRs: 147875 }), null, new Date(Date.now() - 3600000 * 2).toISOString()],
      ["KS-2026-453", 47, "Sukhwinder Kaur", "9789012345", "PMK-PB-99381", "paddy", "Paddy", 50, "mandi-1", "Karnal Central MSP Mandi", today, "10:30 AM - 12:00 PM", "Counter 3", "CHECKED_IN", "10:40 AM", null, null, new Date(Date.now() - 3600000 * 1).toISOString()],
      ["KS-2026-454", 48, "Vikram Sharma", "9988776655", "PMK-HAR-77120", "chana", "Chana", 25, "mandi-1", "Karnal Central MSP Mandi", today, "12:00 PM - 01:30 PM", null, "BOOKED", null, null, null, new Date().toISOString()],
    ];
    for (const t of seedTokens) {
      await pool.query(
        `INSERT INTO tokens (id, "tokenNumber", "farmerName", "farmerMobile", "farmerId", "cropId", "cropName", "quantityQuintal", "mandiId", "mandiName", "slotDate", "slotTimeWindow", "counterAssigned", status, "checkInTime", "weighmentData", "pfmsTxnId", "createdAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) ON CONFLICT (id) DO NOTHING`,
        t
      );
    }
  }

  // Seed SMS logs if empty
  const smsCheck = await pool.query('SELECT COUNT(*) as count FROM sms_logs');
  if (parseInt(smsCheck.rows[0].count) === 0) {
    const seedSms = [
      ["sms-1", new Date(Date.now() - 3600000 * 3).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), "9876543210 (Ramesh Kumar)", "Kisan Setu: Payment of ₹91,000 for Token #45 (40 Qtl Wheat) credited to Bank A/c ending 4821 via PFMS. Ref: PFMS-99482019482.", "PAYMENT"],
      ["sms-2", new Date(Date.now() - 3600000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), "9812345678 (Gurpreet Singh)", "Kisan Setu: Weighment completed for Token #46. Net Quantity: 65 Quintals (FAQ Grade). Total Amount: ₹1,47,875. Payment processing via PFMS.", "WEIGHMENT"],
      ["sms-3", new Date(Date.now() - 3600000 * 1).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), "9789012345 (Sukhwinder Kaur)", "Kisan Setu: Welcome to Karnal Mandi! Token #47 checked-in. Please proceed to Counter 3. Est. wait: 15 mins.", "GATE_ENTRY"],
    ];
    for (const s of seedSms) {
      await pool.query(
        `INSERT INTO sms_logs (id, timestamp, recipient, message, type) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`,
        s
      );
    }
  }

  console.log('✅ PostgreSQL tables initialized and seeded!');
};

export { pool, isProduction };

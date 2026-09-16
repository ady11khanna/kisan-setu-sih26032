import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'kisan_setu.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance
db.pragma('journal_mode = WAL');

// Initialize SQL Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS mandis (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    distanceKm REAL,
    maxCapacityPerDay INTEGER,
    currentBooked INTEGER,
    countersActive INTEGER,
    avgProcessingTimeMins INTEGER,
    moistureLimitPct REAL,
    status TEXT,
    lat REAL,
    lng REAL
  );

  CREATE TABLE IF NOT EXISTS crops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    mspPerQuintal INTEGER NOT NULL,
    unit TEXT,
    maxPerFarmer INTEGER,
    icon TEXT
  );

  CREATE TABLE IF NOT EXISTS tokens (
    id TEXT PRIMARY KEY,
    tokenNumber INTEGER NOT NULL,
    farmerName TEXT NOT NULL,
    farmerMobile TEXT NOT NULL,
    farmerId TEXT,
    cropId TEXT,
    cropName TEXT,
    quantityQuintal REAL,
    mandiId TEXT,
    mandiName TEXT,
    slotDate TEXT,
    slotTimeWindow TEXT,
    counterAssigned TEXT,
    status TEXT NOT NULL,
    checkInTime TEXT,
    weighmentData TEXT, -- JSON string
    pfmsTxnId TEXT,
    createdAt TEXT
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
const mandiCount = db.prepare('SELECT COUNT(*) as count FROM mandis').get().count;
if (mandiCount === 0) {
  const insertMandi = db.prepare(`
    INSERT INTO mandis (id, name, district, state, distanceKm, maxCapacityPerDay, currentBooked, countersActive, avgProcessingTimeMins, moistureLimitPct, status, lat, lng)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertMandi.run("mandi-1", "Karnal Central MSP Mandi", "Karnal", "Haryana", 4.2, 150, 112, 4, 12, 14, "OPEN", 29.6857, 76.9905);
  insertMandi.run("mandi-2", "Ludhiana Grain Hub", "Ludhiana", "Punjab", 8.7, 200, 195, 6, 10, 12, "HEAVY_LOAD", 30.9010, 75.8573);
  insertMandi.run("mandi-3", "Kurukshetra Agri Market", "Kurukshetra", "Haryana", 12.1, 120, 45, 3, 15, 14, "SMOOTH", 29.9695, 76.8783);
  insertMandi.run("mandi-4", "Indore MSP Procurement Centre", "Indore", "Madhya Pradesh", 18.5, 180, 90, 5, 11, 13, "OPEN", 22.7196, 75.8577);
}

// Seed Crops if empty
const cropCount = db.prepare('SELECT COUNT(*) as count FROM crops').get().count;
if (cropCount === 0) {
  const insertCrop = db.prepare(`
    INSERT INTO crops (id, name, mspPerQuintal, unit, maxPerFarmer, icon)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertCrop.run("wheat", "Wheat (गेहूँ / ਕਣਕ)", 2275, "Quintal", 150, "🌾");
  insertCrop.run("paddy", "Paddy / Rice (धान / ਝੋਨਾ)", 2300, "Quintal", 200, "🌾");
  insertCrop.run("chana", "Gram / Chana (चना / ਛੋਲੇ)", 5440, "Quintal", 80, "🌱");
  insertCrop.run("mustard", "Mustard / Sarson (सरसों / ਸਰ੍ਹੋਂ)", 5650, "Quintal", 60, "🌼");
  insertCrop.run("maize", "Maize / Makka (मक्का / ਮੱਕੀ)", 2090, "Quintal", 100, "🌽");
}

// Seed Tokens if empty
const tokenCount = db.prepare('SELECT COUNT(*) as count FROM tokens').get().count;
if (tokenCount === 0) {
  const insertToken = db.prepare(`
    INSERT INTO tokens (id, tokenNumber, farmerName, farmerMobile, farmerId, cropId, cropName, quantityQuintal, mandiId, mandiName, slotDate, slotTimeWindow, counterAssigned, status, checkInTime, weighmentData, pfmsTxnId, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertToken.run(
    "KS-2026-451", 45, "Ramesh Kumar", "9876543210", "PMK-HAR-88421", "wheat", "Wheat", 40, "mandi-1", "Karnal Central MSP Mandi",
    new Date().toISOString().split("T")[0], "09:00 AM - 10:30 AM", "Counter 2", "PAYMENT_DISPATCHED", "09:12 AM",
    JSON.stringify({ grossKg: 4200, tareKg: 200, netQuintals: 40, moisturePct: 11.5, grade: "Grade A", totalPayoutRs: 91000 }),
    "PFMS-99482019482", new Date(Date.now() - 3600000 * 3).toISOString()
  );

  insertToken.run(
    "KS-2026-452", 46, "Gurpreet Singh", "9812345678", "PMK-PB-12903", "wheat", "Wheat", 65, "mandi-1", "Karnal Central MSP Mandi",
    new Date().toISOString().split("T")[0], "10:30 AM - 12:00 PM", "Counter 1", "WEIGHMENT_DONE", "10:25 AM",
    JSON.stringify({ grossKg: 6800, tareKg: 300, netQuintals: 65, moisturePct: 12.8, grade: "FAQ (Fair Average Quality)", totalPayoutRs: 147875 }),
    null, new Date(Date.now() - 3600000 * 2).toISOString()
  );

  insertToken.run(
    "KS-2026-453", 47, "Sukhwinder Kaur", "9789012345", "PMK-PB-99381", "paddy", "Paddy", 50, "mandi-1", "Karnal Central MSP Mandi",
    new Date().toISOString().split("T")[0], "10:30 AM - 12:00 PM", "Counter 3", "CHECKED_IN", "10:40 AM",
    null, null, new Date(Date.now() - 3600000 * 1).toISOString()
  );

  insertToken.run(
    "KS-2026-454", 48, "Vikram Sharma", "9988776655", "PMK-HAR-77120", "chana", "Chana", 25, "mandi-1", "Karnal Central MSP Mandi",
    new Date().toISOString().split("T")[0], "12:00 PM - 01:30 PM", null, "BOOKED", null,
    null, null, new Date().toISOString()
  );
}

// Seed SMS Logs if empty
const smsCount = db.prepare('SELECT COUNT(*) as count FROM sms_logs').get().count;
if (smsCount === 0) {
  const insertSms = db.prepare(`
    INSERT INTO sms_logs (id, timestamp, recipient, message, type)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertSms.run("sms-1", new Date(Date.now() - 3600000 * 3).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), "9876543210 (Ramesh Kumar)", "Kisan Setu: Payment of ₹91,000 for Token #45 (40 Qtl Wheat) credited to Bank A/c ending 4821 via PFMS. Ref: PFMS-99482019482.", "PAYMENT");
  insertSms.run("sms-2", new Date(Date.now() - 3600000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), "9812345678 (Gurpreet Singh)", "Kisan Setu: Weighment completed for Token #46. Net Quantity: 65 Quintals (FAQ Grade). Total Amount: ₹1,47,875. Payment processing via PFMS.", "WEIGHMENT");
  insertSms.run("sms-3", new Date(Date.now() - 3600000 * 1).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), "9789012345 (Sukhwinder Kaur)", "Kisan Setu: Welcome to Karnal Mandi! Token #47 checked-in. Please proceed to Counter 3. Est. wait: 15 mins.", "GATE_ENTRY");
}

export default db;

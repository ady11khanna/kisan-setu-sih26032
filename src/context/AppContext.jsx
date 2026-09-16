import React, { createContext, useContext, useState, useEffect } from 'react';
import { MANDIS, CROPS, INITIAL_TOKENS, TRANSLATIONS } from '../data/mockData';
import { apiClient } from '../services/apiClient';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activeRole, setActiveRole] = useState('farmer'); // farmer | admin | analytics | sms
  const [lang, setLang] = useState('en'); // en | hi | pa
  
  // Auth state
  const [farmerUser, setFarmerUser] = useState({
    id: "PMK-HAR-77120",
    name: "Vikram Sharma",
    mobile: "9988776655",
    aadhaarLast4: "4819",
    district: "Karnal",
    state: "Haryana",
    landAreaAcres: 8.5,
    primaryCrop: "wheat",
    isVerified: true,
  });

  // State
  const [mandis, setMandis] = useState(MANDIS);
  const [tokens, setTokens] = useState(INITIAL_TOKENS);
  const [smsLogs, setSmsLogs] = useState([
    {
      id: "sms-1",
      timestamp: new Date(Date.now() - 3600000 * 3).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recipient: "9876543210 (Ramesh Kumar)",
      message: "Kisan Setu: Payment of ₹91,000 for Token #45 (40 Qtl Wheat) credited to Bank A/c ending 4821 via PFMS. Ref: PFMS-99482019482.",
      type: "PAYMENT",
    },
    {
      id: "sms-2",
      timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recipient: "9812345678 (Gurpreet Singh)",
      message: "Kisan Setu: Weighment completed for Token #46. Net Quantity: 65 Quintals (FAQ Grade). Total Amount: ₹1,47,875. Payment processing via PFMS.",
      type: "WEIGHMENT",
    },
    {
      id: "sms-3",
      timestamp: new Date(Date.now() - 3600000 * 1).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recipient: "9789012345 (Sukhwinder Kaur)",
      message: "Kisan Setu: Welcome to Karnal Mandi! Token #47 checked-in. Please proceed to Counter 3. Est. wait: 15 mins.",
      type: "GATE_ENTRY",
    },
  ]);

  // Sync with Express backend on load
  useEffect(() => {
    async function syncBackendData() {
      const serverTokens = await apiClient.fetchTokens();
      if (serverTokens) setTokens(serverTokens);

      const serverLogs = await apiClient.fetchSmsLogs();
      if (serverLogs) setSmsLogs(serverLogs);
    }
    syncBackendData();
  }, []);

  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];

  // Send SMS helper
  const sendSms = (recipientMobile, recipientName, text, type = 'INFO') => {
    const newLog = {
      id: "sms-" + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recipient: `${recipientMobile} (${recipientName})`,
      message: text,
      type,
    };
    setSmsLogs((prev) => [newLog, ...prev]);
  };

  // Farmer login
  const loginFarmer = (identifier) => {
    setFarmerUser({
      id: "PMK-HAR-" + Math.floor(10000 + Math.random() * 90000),
      name: "Farmer " + identifier.slice(-4),
      mobile: identifier.length === 10 ? identifier : "9876543210",
      aadhaarLast4: identifier.slice(-4),
      district: "Karnal",
      state: "Haryana",
      landAreaAcres: 6.0,
      primaryCrop: "wheat",
      isVerified: true,
    });
  };

  const logoutFarmer = () => {
    setFarmerUser(null);
  };

  // Book a new slot
  const bookSlot = async ({ cropId, quantityQuintal, mandiId, slotDate, slotTimeWindow }) => {
    const farmerName = farmerUser ? farmerUser.name : "Kisan User";
    const farmerMobile = farmerUser ? farmerUser.mobile : "9988776655";
    const farmerId = farmerUser ? farmerUser.id : "PMK-UNKNOWN";

    // Attempt Express backend API call
    const serverToken = await apiClient.bookSlot({
      cropId,
      quantityQuintal,
      mandiId,
      slotDate,
      slotTimeWindow,
      farmerName,
      farmerMobile,
      farmerId,
    });

    if (serverToken) {
      setTokens((prev) => [serverToken, ...prev]);
      const logs = await apiClient.fetchSmsLogs();
      if (logs) setSmsLogs(logs);
      return serverToken;
    }

    // Local Fallback if backend offline
    const mandi = mandis.find((m) => m.id === mandiId);
    const crop = CROPS.find((c) => c.id === cropId);
    
    const nextTokenNum = Math.max(...tokens.map((t) => t.tokenNumber), 44) + 1;
    const newTokenId = `KS-2026-${nextTokenNum}`;

    const newToken = {
      id: newTokenId,
      tokenNumber: nextTokenNum,
      farmerName,
      farmerMobile,
      farmerId,
      cropId,
      cropName: crop ? crop.name.split(" ")[0] : "Crop",
      quantityQuintal: Number(quantityQuintal),
      mandiId,
      mandiName: mandi ? mandi.name : "Procurement Mandi",
      slotDate,
      slotTimeWindow,
      counterAssigned: null,
      status: "BOOKED",
      checkInTime: null,
      weighmentData: null,
      pfmsTxnId: null,
      createdAt: new Date().toISOString(),
    };

    setTokens((prev) => [newToken, ...prev]);
    sendSms(
      farmerMobile,
      farmerName,
      `Kisan Setu: Slot Confirmed! Token #${nextTokenNum} for ${quantityQuintal} Qtl ${crop?.name.split(" ")[0]} at ${mandi?.name} on ${slotDate} (${slotTimeWindow}). Please bring QR code.`,
      "BOOKING"
    );

    return newToken;
  };

  // Admin: Gate Check-in
  const checkInToken = async (tokenId, counterAssigned = "Counter 1") => {
    const serverToken = await apiClient.checkInToken(tokenId, counterAssigned);
    if (serverToken) {
      setTokens((prev) => prev.map((t) => (t.id === serverToken.id ? serverToken : t)));
      const logs = await apiClient.fetchSmsLogs();
      if (logs) setSmsLogs(logs);
      return;
    }

    // Local Fallback
    const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let updatedToken = null;

    setTokens((prev) =>
      prev.map((tok) => {
        if (tok.id === tokenId || tok.tokenNumber === Number(tokenId)) {
          updatedToken = {
            ...tok,
            status: "CHECKED_IN",
            counterAssigned,
            checkInTime,
          };
          return updatedToken;
        }
        return tok;
      })
    );

    if (updatedToken) {
      sendSms(
        updatedToken.farmerMobile,
        updatedToken.farmerName,
        `Kisan Setu: Gate Check-in Complete for Token #${updatedToken.tokenNumber} at ${updatedToken.mandiName}. Assigned to ${counterAssigned}. Est. wait: 10 mins.`,
        "GATE_ENTRY"
      );
    }
  };

  // Admin: Weighment & Quality
  const recordWeighment = async (tokenId, { grossKg, tareKg, moisturePct, grade }) => {
    const serverToken = await apiClient.recordWeighment(tokenId, { grossKg, tareKg, moisturePct, grade });
    if (serverToken) {
      setTokens((prev) => prev.map((t) => (t.id === serverToken.id ? serverToken : t)));
      const logs = await apiClient.fetchSmsLogs();
      if (logs) setSmsLogs(logs);
      return;
    }

    // Local Fallback
    const netKg = grossKg - tareKg;
    const netQuintals = Math.round((netKg / 100) * 10) / 10;
    let targetToken = tokens.find((t) => t.id === tokenId || t.tokenNumber === Number(tokenId));
    if (!targetToken) return;

    const crop = CROPS.find((c) => c.id === targetToken.cropId) || CROPS[0];
    const totalPayoutRs = Math.round(netQuintals * crop.mspPerQuintal);

    setTokens((prev) =>
      prev.map((tok) => {
        if (tok.id === tokenId || tok.tokenNumber === Number(tokenId)) {
          return {
            ...tok,
            status: "WEIGHMENT_DONE",
            weighmentData: { grossKg, tareKg, netQuintals, moisturePct, grade, totalPayoutRs },
          };
        }
        return tok;
      })
    );

    sendSms(
      targetToken.farmerMobile,
      targetToken.farmerName,
      `Kisan Setu: Weighment & Quality verified for Token #${targetToken.tokenNumber}! Net: ${netQuintals} Quintals (${grade}). Payout: ₹${totalPayoutRs.toLocaleString('en-IN')}. Sent to PFMS for disbursal.`,
      "WEIGHMENT"
    );
  };

  // Admin: Dispatch Payment via PFMS
  const dispatchPayment = async (tokenId) => {
    const serverToken = await apiClient.dispatchPayment(tokenId);
    if (serverToken) {
      setTokens((prev) => prev.map((t) => (t.id === serverToken.id ? serverToken : t)));
      const logs = await apiClient.fetchSmsLogs();
      if (logs) setSmsLogs(logs);
      return;
    }

    // Local Fallback
    const pfmsTxnId = "PFMS-" + Math.floor(10000000000 + Math.random() * 90000000000);
    let targetToken = tokens.find((t) => t.id === tokenId || t.tokenNumber === Number(tokenId));

    setTokens((prev) =>
      prev.map((tok) => {
        if (tok.id === tokenId || tok.tokenNumber === Number(tokenId)) {
          return {
            ...tok,
            status: "PAYMENT_DISPATCHED",
            pfmsTxnId,
          };
        }
        return tok;
      })
    );

    if (targetToken && targetToken.weighmentData) {
      sendSms(
        targetToken.farmerMobile,
        targetToken.farmerName,
        `Kisan Setu: MSP Payment of ₹${targetToken.weighmentData.totalPayoutRs.toLocaleString('en-IN')} for Token #${targetToken.tokenNumber} DISPATCHED to your Bank Account via PFMS. Ref: ${pfmsTxnId}.`,
        "PAYMENT"
      );
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeRole,
        setActiveRole,
        lang,
        setLang,
        t,
        farmerUser,
        loginFarmer,
        logoutFarmer,
        mandis,
        tokens,
        smsLogs,
        bookSlot,
        checkInToken,
        recordWeighment,
        dispatchPayment,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

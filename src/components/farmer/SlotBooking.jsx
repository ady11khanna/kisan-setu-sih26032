import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CROPS } from '../../data/mockData';
import { Calendar, Clock, MapPin, Truck, CheckCircle2, ChevronRight, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SlotBooking = ({ onBookingComplete }) => {
  const { mandis, bookSlot, farmerUser, t } = useApp();

  const [step, setStep] = useState(1);
  const [selectedCrop, setSelectedCrop] = useState(CROPS[0]);
  const [quantity, setQuantity] = useState(40);
  const [selectedMandi, setSelectedMandi] = useState(mandis[0]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("10:30 AM - 12:00 PM");
  const [lastBookedToken, setLastBookedToken] = useState(null);

  const timeSlots = [
    { window: "07:30 AM - 09:00 AM", status: "AVAILABLE", bookedPct: 35 },
    { window: "09:00 AM - 10:30 AM", status: "HEAVY", bookedPct: 88 },
    { window: "10:30 AM - 12:00 PM", status: "AVAILABLE", bookedPct: 50 },
    { window: "12:00 PM - 01:30 PM", status: "FULL", bookedPct: 100 },
    { window: "02:00 PM - 03:30 PM", status: "AVAILABLE", bookedPct: 20 },
    { window: "03:30 PM - 05:00 PM", status: "AVAILABLE", bookedPct: 15 },
  ];

  const handleConfirmBooking = () => {
    const token = bookSlot({
      cropId: selectedCrop.id,
      quantityQuintal: quantity,
      mandiId: selectedMandi.id,
      slotDate: selectedDate,
      slotTimeWindow: selectedTimeSlot,
    });

    setLastBookedToken(token);
    setStep(4);

    // Fire celebration confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
      {/* Wizard Progress Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/30">
            {step}
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">
              {step === 1 && "Step 1: Crop & Quantity"}
              {step === 2 && "Step 2: Select Mandi"}
              {step === 3 && "Step 3: Choose Slot & Time"}
              {step === 4 && "Step 4: Booking Confirmation"}
            </h3>
            <p className="text-[11px] text-slate-400">
              {step < 4 ? `Step ${step} of 3 • Direct Govt MSP Procurement` : "Token Generated"}
            </p>
          </div>
        </div>

        {step < 4 && (
          <div className="flex items-center space-x-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-6 h-1.5 rounded-full ${
                  i <= step ? "bg-emerald-500" : "bg-slate-800"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* STEP 1: Crop & Quantity */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Crop to Sell at MSP
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CROPS.map((crop) => (
                <div
                  key={crop.id}
                  onClick={() => setSelectedCrop(crop)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedCrop.id === crop.id
                      ? "bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                      : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{crop.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold">{crop.name}</h4>
                      <p className="text-xs text-emerald-400 font-medium">
                        Govt MSP: ₹{crop.mspPerQuintal.toLocaleString('en-IN')} / Quintal
                      </p>
                    </div>
                  </div>
                  {selectedCrop.id === crop.id && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Estimated Produce Quantity (Quintals)
              </label>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                {quantity} Quintals (≈ {(quantity * 100).toLocaleString()} kg)
              </span>
            </div>
            
            <input
              type="range"
              min="5"
              max={selectedCrop.maxPerFarmer}
              step="5"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Min: 5 Qtl</span>
              <span>Suggested Trolley Load: 40-60 Qtl</span>
              <span>Max Limit: {selectedCrop.maxPerFarmer} Qtl</span>
            </div>
          </div>

          {/* Approx Payout Preview */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Estimated MSP Gross Payout</p>
                <p className="text-lg font-bold text-emerald-400 font-mono">
                  ₹{(quantity * selectedCrop.mspPerQuintal).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
            <span className="text-[11px] text-slate-500 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
              Direct Bank Transfer via PFMS
            </span>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <span>Continue to Select Mandi</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: Mandi Selection */}
      {step === 2 && (
        <div className="space-y-4">
          <label className="block text-xs font-semibold text-slate-300">
            Choose Preferred Procurement Centre (Mandi)
          </label>

          <div className="space-y-3">
            {mandis.map((mandi) => {
              const capacityPct = Math.round((mandi.currentBooked / mandi.maxCapacityPerDay) * 100);
              let statusBadge = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
              let statusText = "Smooth Flow (Low Queue)";

              if (capacityPct > 70) {
                statusBadge = "bg-amber-500/10 text-amber-400 border-amber-500/30";
                statusText = "Moderate Load";
              }
              if (capacityPct >= 95) {
                statusBadge = "bg-rose-500/10 text-rose-400 border-rose-500/30";
                statusText = "High Congestion";
              }

              return (
                <div
                  key={mandi.id}
                  onClick={() => setSelectedMandi(mandi)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedMandi.id === mandi.id
                      ? "bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                      : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-white">{mandi.name}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${statusBadge}`}>
                          {statusText}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {mandi.district}, {mandi.state} • <strong className="text-slate-200">{mandi.distanceKm} km away</strong>
                      </p>
                    </div>

                    <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4">
                      <p className="text-[11px] text-slate-400">Daily Capacity Load</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              capacityPct > 80 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${capacityPct}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-200">
                          {mandi.currentBooked}/{mandi.maxCapacityPerDay}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStep(1)}
              className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-xl text-sm"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <span>Choose Date & Time Slot</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Date & Time Window */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Procurement Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Arrival Time Window (OPD-Style Token Reservation)
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {timeSlots.map((slot) => {
                const isFull = slot.status === "FULL";
                const isSelected = selectedTimeSlot === slot.window;

                return (
                  <button
                    key={slot.window}
                    type="button"
                    disabled={isFull}
                    onClick={() => setSelectedTimeSlot(slot.window)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isFull
                        ? "bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed"
                        : isSelected
                        ? "bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        {slot.window}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isFull
                            ? "bg-rose-500/10 text-rose-500"
                            : slot.status === "HEAVY"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-emerald-500/10 text-emerald-400"
                        }`}
                      >
                        {slot.status}
                      </span>
                    </div>

                    <div className="mt-2 text-[10px] text-slate-400 flex justify-between items-center">
                      <span>Booked: {slot.bookedPct}%</span>
                      <span>Est. Wait: 15 mins</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Booking Summary Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
            <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1">
              Slot Booking Summary
            </h4>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div><span className="text-slate-500">Farmer:</span> {farmerUser ? farmerUser.name : "Vikram Sharma"}</div>
              <div><span className="text-slate-500">Crop:</span> {selectedCrop.name.split(" ")[0]} ({quantity} Qtl)</div>
              <div><span className="text-slate-500">Mandi:</span> {selectedMandi.name}</div>
              <div><span className="text-slate-500">Date/Time:</span> {selectedDate} ({selectedTimeSlot})</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-xl text-sm"
            >
              Back
            </button>
            <button
              onClick={handleConfirmBooking}
              className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Confirm & Generate Token</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Confirmation Screen */}
      {step === 4 && lastBookedToken && (
        <div className="space-y-6 text-center py-4 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 rounded-full font-bold">
              {t.congratulations}
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-2">
              Digital e-Token #{lastBookedToken.tokenNumber}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Token Reference: <strong className="text-slate-200 font-mono">{lastBookedToken.id}</strong>
            </p>
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto shadow-2xl flex flex-col items-center justify-center border-4 border-emerald-500">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${lastBookedToken.id}`}
              alt="Token QR Code"
              className="w-36 h-36 object-contain"
            />
            <p className="text-[10px] text-slate-800 font-mono font-bold mt-1">
              SCAN AT MANDI GATE
            </p>
          </div>

          {/* Slot Info Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Centre Location:</span>
              <strong className="text-white">{lastBookedToken.mandiName}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Date & Window:</span>
              <strong className="text-emerald-400 font-mono">{lastBookedToken.slotDate} ({lastBookedToken.slotTimeWindow})</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Crop & Quantity:</span>
              <strong className="text-white">{lastBookedToken.cropName} - {lastBookedToken.quantityQuintal} Qtl</strong>
            </div>
            <div className="flex justify-between text-amber-400 font-bold">
              <span>Estimated MSP Value:</span>
              <span>₹{(lastBookedToken.quantityQuintal * 2275).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="bg-sky-500/10 border border-sky-500/20 p-3 rounded-xl text-xs text-sky-300 max-w-md mx-auto flex items-center gap-2 text-left">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>SMS confirmation & reminder alert sent to {lastBookedToken.farmerMobile}. Present this QR code or Token #{lastBookedToken.tokenNumber} upon entry.</span>
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => setStep(1)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-5 py-2.5 rounded-xl text-xs"
            >
              Book Another Slot
            </button>
            <button
              onClick={() => onBookingComplete && onBookingComplete()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-600/30"
            >
              Track Live Queue Turn →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

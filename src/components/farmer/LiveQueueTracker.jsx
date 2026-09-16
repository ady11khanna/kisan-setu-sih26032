import React from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, CheckCircle2, Truck, QrCode, ArrowUpRight, Scale, ShieldCheck, FileText, AlertCircle } from 'lucide-react';

export const LiveQueueTracker = () => {
  const { tokens, farmerUser, t } = useApp();

  // Find user's tokens or demo tokens
  const userTokens = tokens.filter(
    (tok) => tok.farmerMobile === farmerUser?.mobile || tok.farmerId === farmerUser?.id
  );

  const activeToken = userTokens[0] || tokens[tokens.length - 1] || tokens[0];

  const checkedInToken = tokens.find((t) => t.status === "CHECKED_IN") || tokens[0];
  const currentlyServingTokenNum = checkedInToken ? checkedInToken.tokenNumber : 45;

  const tokensAhead = Math.max(0, activeToken.tokenNumber - currentlyServingTokenNum);
  const estimatedWaitMins = tokensAhead * 12;

  // Stages definition
  const stages = [
    { id: "BOOKED", label: "Slot Booked", desc: "e-Token generated" },
    { id: "CHECKED_IN", label: "Gate Checked-In", desc: "Vehicle arrived at Mandi" },
    { id: "WEIGHMENT_DONE", label: "Weighment & Grading", desc: "Net Weight & Moisture % Verified" },
    { id: "PAYMENT_DISPATCHED", label: "PFMS Payment Dispatched", desc: "Direct Bank Credit Initiated" },
  ];

  const getStageIndex = (status) => {
    switch (status) {
      case "BOOKED": return 0;
      case "CHECKED_IN": return 1;
      case "WEIGHMENT_DONE": return 2;
      case "PAYMENT_DISPATCHED": return 3;
      default: return 0;
    }
  };

  const currentStageIdx = getStageIndex(activeToken.status);

  return (
    <div className="space-y-6">
      {/* Live Token Counter Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-extrabold text-emerald-400 tracking-wider uppercase">
                OPD-STYLE DIGITAL QUEUE DISPLAY
              </span>
            </div>

            <h2 className="text-2xl font-black text-white mt-1">
              Token #{activeToken.tokenNumber} <span className="text-slate-400 text-sm font-normal">({activeToken.cropName} - {activeToken.quantityQuintal} Qtl)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Centre: <strong className="text-slate-200">{activeToken.mandiName}</strong> • Window: <span className="text-emerald-400 font-mono">{activeToken.slotTimeWindow}</span>
            </p>
          </div>

          {/* OPD Big Token Displays */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl text-center shadow-inner">
              <p className="text-[10px] uppercase font-bold text-slate-400">Currently Serving</p>
              <p className="text-3xl font-black text-amber-400 font-mono mt-0.5">
                #{currentlyServingTokenNum}
              </p>
              <p className="text-[10px] text-slate-500">Counter 1 & 2</p>
            </div>

            <div className="bg-slate-950/80 border border-emerald-500/30 p-3.5 rounded-xl text-center shadow-inner">
              <p className="text-[10px] uppercase font-bold text-emerald-400">Est. Wait Time</p>
              <p className="text-3xl font-black text-emerald-400 font-mono mt-0.5">
                {estimatedWaitMins > 0 ? `${estimatedWaitMins}m` : "NOW"}
              </p>
              <p className="text-[10px] text-slate-400">
                {tokensAhead > 0 ? `${tokensAhead} tokens ahead` : "Your turn!"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Stage Progress Tracker Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
          Real-Time Procurement Lifecycle Progress
        </h3>

        <div className="relative">
          {/* Connector Line */}
          <div className="absolute top-5 left-6 right-6 h-1 bg-slate-800 hidden md:block">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${(currentStageIdx / (stages.length - 1)) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-2 relative z-10">
            {stages.map((stg, idx) => {
              const isPassed = idx <= currentStageIdx;
              const isCurrent = idx === currentStageIdx;

              return (
                <div key={stg.id} className="flex md:flex-col items-center md:text-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border transition-all ${
                      isPassed
                        ? "bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30"
                        : "bg-slate-950 text-slate-600 border-slate-800"
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>

                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        isCurrent ? "text-emerald-400" : isPassed ? "text-white" : "text-slate-500"
                      }`}
                    >
                      {stg.label}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{stg.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weighment & Digital Receipt Card (If Weighment Done) */}
      {activeToken.weighmentData ? (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Digital Procurement Receipt</h3>
                <p className="text-xs text-slate-400">Verified by Mandi Quality Inspection Officer</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              VERIFIED & APPROVED
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
            <div>
              <p className="text-slate-500">Gross Weight</p>
              <p className="font-bold text-slate-200 text-sm">{activeToken.weighmentData.grossKg} kg</p>
            </div>
            <div>
              <p className="text-slate-500">Tare Weight (Truck)</p>
              <p className="font-bold text-slate-200 text-sm">{activeToken.weighmentData.tareKg} kg</p>
            </div>
            <div>
              <p className="text-slate-500">Net Quantity</p>
              <p className="font-bold text-emerald-400 text-sm">{activeToken.weighmentData.netQuintals} Quintals</p>
            </div>
            <div>
              <p className="text-slate-500">Moisture & Grade</p>
              <p className="font-bold text-amber-400 text-sm">{activeToken.weighmentData.moisturePct}% ({activeToken.weighmentData.grade})</p>
            </div>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs text-emerald-300">Total MSP Disbursal Amount</p>
              <p className="text-2xl font-black text-emerald-400 font-mono">
                ₹{activeToken.weighmentData.totalPayoutRs.toLocaleString('en-IN')}
              </p>
            </div>

            {activeToken.pfmsTxnId ? (
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-500/30">
                  <ShieldCheck className="w-4 h-4" /> PFMS DISPATCHED
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-1">Ref: {activeToken.pfmsTxnId}</p>
              </div>
            ) : (
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-bold bg-amber-500/20 px-3 py-1 rounded-lg border border-amber-500/30">
                  PFMS Processing
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Direct Bank Credit within 24h</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
          <Truck className="w-8 h-8 text-amber-400 mx-auto" />
          <h4 className="text-sm font-bold text-white">Next Step: Mandi Gate Check-in</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            When you arrive at {activeToken.mandiName}, present your Token #{activeToken.tokenNumber} or QR code to the gate security officer to mark your arrival.
          </p>
        </div>
      )}
    </div>
  );
};

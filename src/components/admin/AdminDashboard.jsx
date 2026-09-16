import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CROPS } from '../../data/mockData';
import { QrCode, Search, CheckCircle2, Scale, DollarSign, Clock, ShieldCheck, AlertCircle, Building2, UserCheck } from 'lucide-react';

export const AdminDashboard = () => {
  const { tokens, checkInToken, recordWeighment, dispatchPayment, mandis } = useApp();
  const [selectedMandiId, setSelectedMandiId] = useState('mandi-1');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Weighment Modal State
  const [activeWeighmentToken, setActiveWeighmentToken] = useState(null);
  const [grossKg, setGrossKg] = useState(4500);
  const [tareKg, setTareKg] = useState(250);
  const [moisturePct, setMoisturePct] = useState(12.5);
  const [grade, setGrade] = useState("Grade A");

  const currentMandi = mandis.find((m) => m.id === selectedMandiId) || mandis[0];

  const mandiTokens = tokens.filter(
    (t) => t.mandiId === selectedMandiId || t.mandiName.includes(currentMandi.name.split(" ")[0])
  );

  const filteredTokens = mandiTokens.filter(
    (t) =>
      t.tokenNumber.toString().includes(searchQuery) ||
      t.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenWeighmentModal = (token) => {
    setActiveWeighmentToken(token);
    const approxKg = token.quantityQuintal * 100;
    setGrossKg(approxKg + 250);
    setTareKg(250);
    setMoisturePct(12.0);
    setGrade("Grade A");
  };

  const handleSaveWeighment = (e) => {
    e.preventDefault();
    if (activeWeighmentToken) {
      recordWeighment(activeWeighmentToken.id, {
        grossKg: Number(grossKg),
        tareKg: Number(tareKg),
        moisturePct: Number(moisturePct),
        grade,
      });
      setActiveWeighmentToken(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Admin Header & Centre Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              Mandi Officer Desk & Queue Console
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Official Access
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Procurement Centre: <strong className="text-white">{currentMandi.name}</strong> ({currentMandi.district}, {currentMandi.state})
            </p>
          </div>
        </div>

        {/* Mandi Selector */}
        <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Switch Mandi:</span>
          <select
            value={selectedMandiId}
            onChange={(e) => setSelectedMandiId(e.target.value)}
            className="bg-slate-900 text-slate-200 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            {mandis.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Counter Controls & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search / Scan Box */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
          <QrCode className="w-6 h-6 text-amber-400 shrink-0" />
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Scan QR or search Token #, Farmer Name, or Token ID..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Quick Gate Check-in Simulation */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400">Gate Entry Scanner</p>
            <p className="text-xs font-bold text-white">Auto-Scan Active</p>
          </div>
          <button
            onClick={() => {
              const booked = mandiTokens.find((t) => t.status === "BOOKED");
              if (booked) checkInToken(booked.id, "Counter " + (Math.floor(Math.random() * 3) + 1));
            }}
            className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-all shadow-md shadow-amber-600/20"
          >
            + Fast Gate Entry
          </button>
        </div>
      </div>

      {/* Queue Token Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            Today's Token Queue ({filteredTokens.length} Tokens)
          </h3>
          <span className="text-xs text-slate-400">
            Real-time Sync Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">Token #</th>
                <th className="p-3">Farmer & ID</th>
                <th className="p-3">Crop & Qtl</th>
                <th className="p-3">Time Window</th>
                <th className="p-3">Counter</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTokens.map((tok) => {
                let statusBadge = "bg-sky-500/10 text-sky-400 border-sky-500/30";
                if (tok.status === "CHECKED_IN") statusBadge = "bg-amber-500/10 text-amber-400 border-amber-500/30";
                if (tok.status === "WEIGHMENT_DONE") statusBadge = "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
                if (tok.status === "PAYMENT_DISPATCHED") statusBadge = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";

                return (
                  <tr key={tok.id} className="hover:bg-slate-950/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-white text-sm">
                      #{tok.tokenNumber}
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-white">{tok.farmerName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{tok.farmerId}</div>
                    </td>

                    <td className="p-3">
                      <span className="font-semibold text-slate-200">{tok.cropName}</span>
                      <span className="text-slate-400 block text-[11px]">{tok.quantityQuintal} Quintals</span>
                    </td>

                    <td className="p-3 font-mono text-slate-400">
                      {tok.slotTimeWindow}
                    </td>

                    <td className="p-3">
                      {tok.counterAssigned ? (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono text-[11px]">
                          {tok.counterAssigned}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[10px]">Unassigned</span>
                      )}
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge}`}>
                        {tok.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="p-3 text-right space-x-1.5">
                      {tok.status === "BOOKED" && (
                        <button
                          onClick={() => checkInToken(tok.id, "Counter 1")}
                          className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-2.5 py-1 rounded text-[11px]"
                        >
                          Check In
                        </button>
                      )}

                      {tok.status === "CHECKED_IN" && (
                        <button
                          onClick={() => handleOpenWeighmentModal(tok)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-2.5 py-1 rounded text-[11px] flex items-center gap-1 inline-flex"
                        >
                          <Scale className="w-3 h-3" /> Record Weighment
                        </button>
                      )}

                      {tok.status === "WEIGHMENT_DONE" && (
                        <button
                          onClick={() => dispatchPayment(tok.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-2.5 py-1 rounded text-[11px] flex items-center gap-1 inline-flex shadow"
                        >
                          <DollarSign className="w-3 h-3" /> Disburse PFMS
                        </button>
                      )}

                      {tok.status === "PAYMENT_DISPATCHED" && (
                        <span className="text-emerald-400 text-[11px] font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weighment & Quality Modal */}
      {activeWeighmentToken && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-indigo-400" />
                  Weighment & Moisture Quality Entry
                </h3>
                <p className="text-xs text-slate-400">
                  Token #{activeWeighmentToken.tokenNumber} • {activeWeighmentToken.farmerName} ({activeWeighmentToken.cropName})
                </p>
              </div>
              <button
                onClick={() => setActiveWeighmentToken(null)}
                className="text-slate-500 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWeighment} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Gross Weight (Tractor + Grain) kg
                  </label>
                  <input
                    type="number"
                    value={grossKg}
                    onChange={(e) => setGrossKg(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tare Weight (Empty Vehicle) kg
                  </label>
                  <input
                    type="number"
                    value={tareKg}
                    onChange={(e) => setTareKg(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                    required
                  />
                </div>
              </div>

              {/* Calculated Net Quintals */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Calculated Net Grain Quantity:</span>
                <span className="font-bold text-emerald-400 text-base font-mono">
                  {Math.round(((grossKg - tareKg) / 100) * 10) / 10} Quintals
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Moisture Content %
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={moisturePct}
                    onChange={(e) => setMoisturePct(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Govt limit: &lt; 14.0%</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Quality Grade
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  >
                    <option value="Grade A">Grade A (Premium MSP)</option>
                    <option value="FAQ (Fair Average Quality)">FAQ (Standard MSP)</option>
                    <option value="Grade B">Grade B (-2% Deduction)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveWeighmentToken(null)}
                  className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/20"
                >
                  Save & Approve Weighment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

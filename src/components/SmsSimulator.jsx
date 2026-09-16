import React from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, PhoneCall, ShieldAlert, CheckCircle2, Clock, Smartphone } from 'lucide-react';

export const SmsSimulator = () => {
  const { smsLogs } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Smartphone className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white">Live SMS & IVR Notification Sandbox</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Simulates automated SMS, push notifications, and voice calls sent to farmers' basic feature phones or smartphones.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>TRAI DLT Registered SMS Gateway (Msg91 / Govt DLT)</span>
          </div>
        </div>

        {/* Device Preview & Logs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Mock Feature Phone Graphic */}
          <div className="bg-slate-950 rounded-2xl border-4 border-slate-800 p-4 flex flex-col items-center justify-between min-h-[420px] shadow-inner relative">
            <div className="w-16 h-3 bg-slate-800 rounded-full mb-3"></div>
            
            {/* Phone Screen */}
            <div className="w-full bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between items-center text-[10px] text-emerald-400 border-b border-emerald-500/20 pb-1 mb-2 font-mono">
                <span>BSNL 4G / AIRTEL</span>
                <span>100% 🔋</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {smsLogs.slice(0, 3).map((sms) => (
                  <div key={sms.id} className="bg-slate-900/90 border border-emerald-500/20 p-2.5 rounded-lg text-[11px] text-slate-200 shadow">
                    <div className="flex justify-between items-center text-[10px] text-emerald-400 font-semibold mb-1">
                      <span>📩 GOVT-KISAN</span>
                      <span>{sms.timestamp}</span>
                    </div>
                    <p className="leading-snug text-slate-300">{sms.message}</p>
                  </div>
                ))}
              </div>

              <div className="mt-2 text-[10px] text-center text-emerald-500 font-mono border-t border-emerald-500/20 pt-1">
                Press [1] to Repeat | [2] Cancel Slot
              </div>
            </div>

            {/* Feature Phone Keypad Buttons Graphic */}
            <div className="w-full grid grid-cols-3 gap-1.5 mt-4 pt-2 border-t border-slate-800/60">
              {['1', '2 ABC', '3 DEF', '4 GHI', '5 JKL', '6 MNO', '7 PQRS', '8 TUV', '9 WXYZ', '*', '0 +', '#'].map((key) => (
                <div key={key} className="bg-slate-800/80 rounded py-1 text-center text-[10px] text-slate-400 font-semibold select-none">
                  {key}
                </div>
              ))}
            </div>
          </div>

          {/* Full Activity Feed */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Real-Time Broadcast Log</span>
              <span className="text-sky-400 text-[11px] font-normal">Total Sent: {smsLogs.length} Messages</span>
            </h3>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {smsLogs.map((log) => {
                let badgeStyle = "bg-sky-500/10 text-sky-400 border-sky-500/30";
                if (log.type === "PAYMENT") badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                if (log.type === "WEIGHMENT") badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/30";
                if (log.type === "GATE_ENTRY") badgeStyle = "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";

                return (
                  <div
                    key={log.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 transition-all hover:border-slate-700"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeStyle}`}>
                          {log.type}
                        </span>
                        <span className="text-xs font-bold text-white">{log.recipient}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-600" />
                        {log.timestamp}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 leading-relaxed font-mono">
                      "{log.message}"
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> SMS Delivered via Govt SMS Gateway
                      </span>
                      <span className="text-slate-500">Carrier Status: 200 OK</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

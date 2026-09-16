import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Phone, Lock, CheckCircle, ArrowRight } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { loginFarmer, t } = useApp();
  const [mobileOrAadhaar, setMobileOrAadhaar] = useState('9988776655');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = identifier, 2 = otp

  if (!isOpen) return null;

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (mobileOrAadhaar.length >= 4) {
      setStep(2);
      setOtp('4821'); // Mock auto-filled OTP for fast demo
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    loginFarmer(mobileOrAadhaar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">{t.loginTitle}</h3>
          <p className="text-xs text-slate-400 mt-1">
            Linked with PM-KISAN & State Agristack Database
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Aadhaar Number or Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={mobileOrAadhaar}
                  onChange={(e) => setMobileOrAadhaar(e.target.value)}
                  placeholder="e.g. 9988776655 or 1234-5678-9012"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <span>{t.sendOtp}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>OTP sent to registered mobile linked with Aadhaar (Demo OTP: 4821)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Enter 4-Digit OTP
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-xs"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20"
              >
                Verify & Login
              </button>
            </div>
          </form>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 text-xs font-bold p-1"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

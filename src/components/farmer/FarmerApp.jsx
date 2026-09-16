import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SlotBooking } from './SlotBooking';
import { LiveQueueTracker } from './LiveQueueTracker';
import { AuthModal } from './AuthModal';
import { User, ShieldCheck, LogOut, PlusCircle, Radio, Clock, MapPin, CheckCircle, Smartphone } from 'lucide-react';

export const FarmerApp = () => {
  const { farmerUser, logoutFarmer, tokens, t } = useApp();
  const [activeTab, setActiveTab] = useState('booking'); // booking | queue | history
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Farmer Profile Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {farmerUser ? (
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg">
              🌾
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">{farmerUser.name}</h2>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Aadhaar Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ID: <span className="font-mono text-slate-200">{farmerUser.id}</span> • Mobile: {farmerUser.mobile} • {farmerUser.district}, {farmerUser.state}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Guest Farmer View</h2>
              <p className="text-xs text-slate-400">Login with Aadhaar or PM-KISAN ID for personalized slots</p>
            </div>
          </div>
        )}

        <div>
          {farmerUser ? (
            <button
              onClick={logoutFarmer}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span>Switch Farmer Account</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
            >
              <User className="w-4 h-4" />
              <span>Aadhaar / Mobile Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('booking')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'booking'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Book New Slot</span>
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'queue'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Live Queue Turn Status</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'booking' && (
        <SlotBooking onBookingComplete={() => setActiveTab('queue')} />
      )}

      {activeTab === 'queue' && <LiveQueueTracker />}

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

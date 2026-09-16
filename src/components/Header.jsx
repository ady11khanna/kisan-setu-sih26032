import React from 'react';
import { useApp } from '../context/AppContext';
import { Tractor, Building2, BarChart3, MessageSquareText, Globe, Radio, ShieldCheck } from 'lucide-react';

export const Header = () => {
  const { activeRole, setActiveRole, lang, setLang, t, tokens, mandis } = useApp();

  const currentlyServingToken = tokens.find((t) => t.status === "CHECKED_IN" || t.status === "WEIGHMENT_DONE") || tokens[0];
  const activeMandisCount = mandis.length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-xl backdrop-blur-md bg-opacity-95">
      {/* Top Govt Bar */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/60 text-xs flex flex-wrap justify-between items-center text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            SIH 2024 / 2025 #26032
          </span>
          <span className="hidden sm:inline">Ministry of Consumer Affairs, Food & Public Distribution</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-medium">Department of Consumer Affairs (DoCA)</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-mono text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>LIVE SYSTEM ACTIVE</span>
          </div>

          {/* Language Selector */}
          <div className="flex items-center space-x-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-xs text-slate-300">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-medium text-xs"
            >
              <option value="en" className="bg-slate-900">English</option>
              <option value="hi" className="bg-slate-900">हिन्दी (Hindi)</option>
              <option value="pa" className="bg-slate-900">ਪੰਜਾਬੀ (Punjabi)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Header & Role Switcher */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-xl border border-emerald-400/30">
            🌾
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
                {t.title}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AgriQueue v1.0
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Navigation / Role Switcher Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveRole('farmer')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeRole === 'farmer'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Tractor className="w-4 h-4" />
            <span>{t.roleFarmer}</span>
          </button>

          <button
            onClick={() => setActiveRole('admin')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeRole === 'admin'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{t.roleAdmin}</span>
          </button>

          <button
            onClick={() => setActiveRole('analytics')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeRole === 'analytics'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{t.roleAnalytics}</span>
          </button>

          <button
            onClick={() => setActiveRole('sms')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeRole === 'sms'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <MessageSquareText className="w-4 h-4" />
            <span>{t.roleSms}</span>
          </button>
        </div>
      </div>

      {/* Ticker bar for live queue updates */}
      <div className="bg-slate-950/80 px-4 py-1 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-2 overflow-hidden">
          <span className="flex items-center gap-1 font-semibold text-amber-400 uppercase tracking-wider text-[10px]">
            <Radio className="w-3 h-3 text-amber-400 animate-pulse" /> LIVE MANDI QUEUE:
          </span>
          <span className="text-slate-300 font-mono">
            Karnal Mandi Token Serving: <strong className="text-emerald-400">#{currentlyServingToken ? currentlyServingToken.tokenNumber : 45}</strong> ({currentlyServingToken ? currentlyServingToken.farmerName : 'Ramesh Kumar'})
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 hidden md:inline">
            Active Counters: 4 | Average Processing Time: 12 Mins/Tractor | Disbursed Today: ₹2.38 Cr via PFMS
          </span>
        </div>
        <div className="hidden lg:flex items-center space-x-1 text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Aadhaar & PFMS Enabled</span>
        </div>
      </div>
    </header>
  );
};

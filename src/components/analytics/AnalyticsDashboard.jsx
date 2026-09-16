import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { BarChart3, Users, Clock, TrendingUp, ShieldAlert, Award, MapPin, CheckCircle2, ArrowDownRight } from 'lucide-react';

export const AnalyticsDashboard = () => {
  const { mandis, tokens } = useApp();

  // Mock analytics data for charts
  const waitTimeData = [
    { mandi: "Karnal", beforeHours: 6.8, afterMins: 22 },
    { mandi: "Ludhiana", beforeHours: 8.5, afterMins: 28 },
    { mandi: "Kurukshetra", beforeHours: 5.4, afterMins: 15 },
    { mandi: "Indore", beforeHours: 7.2, afterMins: 20 },
    { mandi: "Ambala", beforeHours: 6.0, afterMins: 18 },
  ];

  const hourlyLoadData = [
    { hour: "08:00 AM", expectedFarmers: 20, servedFarmers: 18 },
    { hour: "10:00 AM", expectedFarmers: 45, servedFarmers: 42 },
    { hour: "12:00 PM", expectedFarmers: 60, servedFarmers: 58 },
    { hour: "02:00 PM", expectedFarmers: 35, servedFarmers: 35 },
    { hour: "04:00 PM", expectedFarmers: 25, servedFarmers: 24 },
  ];

  const totalProcuredQuintals = tokens.reduce(
    (acc, curr) => acc + (curr.weighmentData ? curr.weighmentData.netQuintals : curr.quantityQuintal),
    0
  );

  const totalPayout = tokens.reduce(
    (acc, curr) => acc + (curr.weighmentData ? curr.weighmentData.totalPayoutRs : curr.quantityQuintal * 2275),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Policy Dashboard Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-white">
              Central Government & Ministry Policy Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Department of Consumer Affairs (DoCA) • Real-time Procurement Monitoring & Heatmap Engine
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs bg-slate-950 p-2 rounded-xl border border-slate-800 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>State-wide Live Sync Active (4 Districts)</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Total Farmers Served</p>
              <h3 className="text-2xl font-black text-white mt-1 font-mono">1,480</h3>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +18.4% vs last season
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Avg Wait Time</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1 font-mono">22 Mins</h3>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" /> Reduced from 6.5 Hours
              </p>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Total Grain Procured</p>
              <h3 className="text-2xl font-black text-white mt-1 font-mono">
                {totalProcuredQuintals.toLocaleString()} Qtl
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Wheat & Paddy MSP</p>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              🌾
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">PFMS Disbursed</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                ₹{(totalPayout / 100000).toFixed(2)} Lakh
              </h3>
              <p className="text-[11px] text-emerald-400 mt-1">Direct Bank Credits</p>
            </div>
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Wait Time Impact Chart */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Farmer Wait Time Reduction (Hours vs Minutes)
              </h3>
              <p className="text-xs text-slate-400">Before Kisan Setu (Hours) vs After Kisan Setu (Minutes)</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waitTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="mandi" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="beforeHours" name="Historical Wait (Hours)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="afterMins" name="Kisan Setu Wait (Mins)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Hourly Capacity vs Arrival Flow */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Hourly Arrival vs Capacity Allocation
              </h3>
              <p className="text-xs text-slate-400">Prevents Morning Congestion Spikes</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyLoadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="expectedFarmers" name="Slot Allocated" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                <Area type="monotone" dataKey="servedFarmers" name="Checked-in" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* State-wide Mandi Congestion & Load Grid */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Real-time Procurement Centre Congestion Heatmap</span>
          <span className="text-xs text-emerald-400 font-normal">Capacity Auto-Balancing Enabled</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mandis.map((mandi) => {
            const loadPct = Math.round((mandi.currentBooked / mandi.maxCapacityPerDay) * 100);
            let badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
            let statusText = "Smooth Flow";

            if (loadPct > 70) {
              badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/30";
              statusText = "Moderate Load";
            }
            if (loadPct >= 95) {
              badgeStyle = "bg-rose-500/10 text-rose-400 border-rose-500/30";
              statusText = "Heavy Load / Reallocate";
            }

            return (
              <div key={mandi.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-white">{mandi.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{mandi.district}, {mandi.state}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeStyle}`}>
                    {statusText}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
                    <span>Capacity Load</span>
                    <span className="font-bold text-slate-200">{mandi.currentBooked}/{mandi.maxCapacityPerDay} ({loadPct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        loadPct >= 90 ? "bg-rose-500" : loadPct > 70 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${loadPct}%` }}
                    />
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 flex justify-between border-t border-slate-900 pt-2">
                  <span>Active Counters: {mandi.countersActive}</span>
                  <span>Avg Process: {mandi.avgProcessingTimeMins}m</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

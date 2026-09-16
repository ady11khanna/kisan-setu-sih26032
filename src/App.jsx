import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { FarmerApp } from './components/farmer/FarmerApp';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { SmsSimulator } from './components/SmsSimulator';

const MainContent = () => {
  const { activeRole } = useApp();

  return (
    <main className="min-h-[calc(100vh-140px)] pb-12">
      {activeRole === 'farmer' && <FarmerApp />}
      {activeRole === 'admin' && <AdminDashboard />}
      {activeRole === 'analytics' && <AnalyticsDashboard />}
      {activeRole === 'sms' && <SmsSimulator />}
    </main>
  );
};

export const App = () => {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Header />
        <MainContent />
        
        {/* Footer */}
        <footer className="bg-slate-900 border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-300">Kisan Setu Platform</span>
              <span>• SIH Problem Statement 26032</span>
            </div>
            <div>
              Ministry of Consumer Affairs, Food & Public Distribution • Department of Consumer Affairs (DoCA)
            </div>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
};

export default App;

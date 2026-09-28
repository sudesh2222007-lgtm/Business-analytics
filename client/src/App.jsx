import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Login from './pages/Login.jsx';
import ExecutiveDashboard from './pages/ExecutiveDashboard.jsx';
import SalesAnalysis from './pages/SalesAnalysis.jsx';
import CustomerAnalytics from './pages/CustomerAnalytics.jsx';
import ProfitabilityAnalysis from './pages/ProfitabilityAnalysis.jsx';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('analytics_user');
    return saved ? JSON.parse(saved) : {
      name: 'Sudesh S',
      email: 'sudesh@analytics.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    };
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('analytics_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('analytics_user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={handleLogout} />
      <main className="main">
        <Routes>
          <Route path="/" element={<ExecutiveDashboard />} />
          <Route path="/sales" element={<SalesAnalysis />} />
          <Route path="/customers" element={<CustomerAnalytics />} />
          <Route path="/profitability" element={<ProfitabilityAnalysis />} />
        </Routes>
      </main>
    </div>
  );
}

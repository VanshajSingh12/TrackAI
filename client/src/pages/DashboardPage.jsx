import { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, LogOut, Loader2 } from 'lucide-react';
import { SummaryGrid } from '../components/DashboardSummary';
import { SpendingPieChart } from '../components/FinancialCharts';
import { TransactionList } from '../components/TransactionList';
import { AIInput } from '../components/AIInput';
import { AIChat } from '../components/AIChat';

export default function DashboardPage() {
  const [user] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/api/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(data.data);
      setSummary(data.summary);
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    setAiLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/transactions', { text: aiInput }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAiInput('');
      fetchData(); // Refresh dashboard
    } catch (err) {
      alert('AI failed to parse transaction. Try specifying amount and category.');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary w-12 h-12 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="bg-primary p-1.5 rounded-lg shadow-md">
            <Wallet className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-gray-900 tracking-tight italic">TrackAI</span>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400 font-bold uppercase">Member</p>
            <p className="text-sm font-bold text-gray-900">{user.username}</p>
          </div>
          <button onClick={handleLogout} className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-gray-100">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <SummaryGrid summary={summary} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Transactions & Input) */}
          <div className="lg:col-span-2 space-y-8">
            <AIInput 
              value={aiInput} 
              onChange={setAiInput} 
              onSubmit={handleAiSubmit} 
              loading={aiLoading} 
            />
            <SpendingPieChart transactions={transactions} />
            <TransactionList transactions={transactions} />
          </div>

          {/* Sidebar (AI Chat) */}
          <div className="lg:col-span-1">
            <AIChat />
          </div>
        </div>
      </main>
    </div>
  );
}

// 

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Leaf, Award, BarChart3, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { SummaryGrid } from '../components/DashboardSummary';
import { SpendingPieChart } from '../components/FinancialCharts';
import { TransactionList } from '../components/TransactionList';
import { AIInput } from '../components/AIInput';
import { AIChat } from '../components/AIChat';
import api from '../utils/api';

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [ecoAnalytics, setEcoAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('financial'); // Tabs: 'financial' or 'sustainability'
  const [loading, setLoading] = useState(true);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch both transactions list and dynamic sustainability aggregation concurrently
      const [transRes, ecoRes] = await Promise.allSettled([
        api.get('/api/transactions', { headers }),
        api.get('/api/analytics/sustainability', { headers })
      ]);

      if (transRes.status === 'fulfilled') {
        setTransactions(transRes.value.data.data);
        setSummary(transRes.value.data.summary);
      } else {
        console.error('Error fetching transactions:', transRes.reason);
        if (transRes.reason.response?.status === 401) logout();
      }

      if (ecoRes.status === 'fulfilled') {
        setEcoAnalytics(ecoRes.value.data.data);
      } else {
        console.error('Error fetching eco analytics:', ecoRes.reason);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    setAiLoading(true);
    try {
      const token = localStorage.getItem('token');
      await api.post('/api/transactions', { text: aiInput }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAiInput('');
      fetchData(); // Refresh both standard and sustainability dashboards
    } catch (err) {
      alert('AI failed to parse transaction. Try specifying amount and category.');
    } finally {
      setAiLoading(false);
    }
  };

  // Assign semantic colors for SDG Letter compliance badges
  const getGradeColor = (ratio) => {
    if (ratio >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (ratio >= 60) return 'text-green-600 bg-green-50 border-green-100';
    if (ratio >= 40) return 'text-amber-600 bg-amber-50 border-amber-100';
    if (ratio >= 20) return 'text-orange-600 bg-orange-50 border-orange-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  const getGradeLetter = (ratio) => {
    if (ratio >= 80) return 'A';
    if (ratio >= 60) return 'B';
    if (ratio >= 40) return 'C';
    if (ratio >= 20) return 'D';
    return 'F';
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
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">

        {/* Dashboard Title & Responsive Tab Toggles */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              EcoTrack AI <span className="text-emerald-500">🌱</span>
            </h1>
            <p className="text-gray-500 mt-1">Intelligent Consumption & Carbon Footprint Ledger</p>
          </div>

          {/* Toggle Tab Selector */}
          <div className="bg-white p-1.5 rounded-xl border border-gray-100 flex items-center shadow-sm">
            <button
              onClick={() => setActiveTab('financial')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'financial'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              Financial Ledger
            </button>
            <button
              onClick={() => setActiveTab('sustainability')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === 'sustainability'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-emerald-600'
                }`}
            >
              Sustainability Hub
              <span className={`inline-block w-2 h-2 rounded-full bg-emerald-400 ${activeTab === 'sustainability' ? 'animate-ping' : ''}`}></span>
            </button>
          </div>
        </div>

        {/* View Layout Conditional Renderer */}
        {activeTab === 'financial' ? (
          /* ================= FINANCIAL VIEW (Original Code Preserved) ================= */
          <div className="space-y-8 animate-fadeIn">
            <SummaryGrid summary={summary} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

              <div className="lg:col-span-1">
                <AIChat />
              </div>
            </div>
          </div>
        ) : (
          /* ================= ECO SUSTAINABILITY HUB (New Features) ================= */
          <div className="space-y-8 animate-fadeIn">

            {/* Sustainability Header Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Card 1: Total Carbon footprint */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-5">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Leaf className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Carbon Footprint</p>
                  <h3 className="text-3xl font-extrabold text-gray-900 mt-1">
                    {ecoAnalytics?.summary?.totalCO2 ? `${ecoAnalytics.summary.totalCO2.toFixed(1)}` : '0.0'}
                    <span className="text-sm font-normal text-gray-500 ml-1.5">kg CO₂e</span>
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1">Total estimated GHG consumption burden</p>
                </div>
              </div>

              {/* Card 2: SDG Letter grade score card */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-5">
                <div className={`p-4 rounded-xl border flex items-center justify-center text-2xl font-black w-14 h-14 ${getGradeColor(ecoAnalytics?.summary?.sustainableRatio || 0)}`}>
                  {getGradeLetter(ecoAnalytics?.summary?.sustainableRatio || 0)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">SDG 12 Score Card</p>
                  <h3 className="text-3xl font-extrabold text-gray-900 mt-1">
                    {ecoAnalytics?.summary?.sustainableRatio ? `${ecoAnalytics.summary.sustainableRatio}%` : '0%'}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1">Ratio of green purchases (A & B ratings)</p>
                </div>
              </div>

              {/* Card 3: Average Carbon Intensity */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-5">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Average Intensity</p>
                  <h3 className="text-3xl font-extrabold text-gray-900 mt-1">
                    {ecoAnalytics?.summary?.averageCO2 ? `${ecoAnalytics.summary.averageCO2.toFixed(1)}` : '0.0'}
                    <span className="text-sm font-normal text-gray-500 ml-1.5">kg/tx</span>
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1">Average emissions per logged transaction</p>
                </div>
              </div>

            </div>

            {/* AI Insights & Carbon Progress Tracker Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left Side (2/3 Width): Gemini Recommendations */}
              <div className="lg:col-span-2 space-y-6">

                <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-6 shadow-sm border border-emerald-800/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-bold tracking-tight text-emerald-400">Gemini Sustainability Insights</h3>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed mb-6">
                    Dynamic recommendations curated by Gemini based on your personal ledger history, aligning with
                    <span className="text-emerald-300 font-bold"> UN SDG Target 12.8</span>.
                  </p>

                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 scrollbar-hide">
                    {ecoAnalytics?.recentInsights && ecoAnalytics.recentInsights.length > 0 ? (
                      ecoAnalytics.recentInsights.map((insight, idx) => (
                        <div key={insight.id || idx} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-4 hover:bg-white/10 transition-colors">
                          <span className="text-xl mt-1">💡</span>
                          <div>
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/20 px-2 py-0.5 rounded-full">
                                {insight.category}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {insight.sdg}
                              </span>
                            </div>
                            <p className="text-slate-100 text-xs leading-relaxed font-medium">
                              {insight.insight}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400 text-center py-8 text-xs italic">
                        Use the conversational prompt or manual logger to record transactions and unlock customized environmental insights!
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Transaction Prompt inside Sustainability view to ease user workflow */}
                <AIInput
                  value={aiInput}
                  onChange={setAiInput}
                  onSubmit={handleAiSubmit}
                  loading={aiLoading}
                />
              </div>

              {/* Right Side (1/3 Width): Category-wise Carbon distribution progress trackers */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Carbon Intensity Breakdown</h3>
                  <p className="text-xs text-gray-500 mt-1">Greenhouse emissions sorted by shopping categories</p>
                </div>

                <div className="space-y-5 my-auto">
                  {ecoAnalytics?.categoryBreakdown && ecoAnalytics.categoryBreakdown.length > 0 ? (
                    ecoAnalytics.categoryBreakdown.map((item, idx) => {
                      const totalMax = Math.max(...ecoAnalytics.categoryBreakdown.map(i => i.totalCO2)) || 1;
                      const percentageWidth = Math.min(100, Math.max(5, (item.totalCO2 / totalMax) * 100));

                      return (
                        <div key={item.category || idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-gray-700">{item.category}</span>
                            <span className="text-gray-500 font-bold">{item.totalCO2.toFixed(1)} kg CO₂e</span>
                          </div>

                          {/* Emitted footprint indicator bar */}
                          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${item.category.toLowerCase().includes('transport')
                                  ? 'bg-red-500'
                                  : item.category.toLowerCase().includes('food')
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                              style={{ width: `${percentageWidth}%` }}
                            ></div>
                          </div>

                          <div className="flex justify-between text-[10px] text-gray-400">
                            <span>{item.transactionCount} choices logged</span>
                            <span>Spent: ${item.totalSpend.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-gray-400 text-xs italic">
                      No category carbon data compiled yet.
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center gap-2 text-[11px] text-gray-400 leading-snug">
                  <AlertCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Calculations align with Greenhouse Gas Protocol values for standard consumer baskets.</span>
                </div>
              </div>

            </div>

            {/* Comprehensive transaction ledger highlighting environmental grades */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-gray-900">Carbon Transaction Audit</h3>
                <span className="text-xs text-gray-400">Includes live CO2 & SDG metrics</span>
              </div>
              <TransactionList transactions={transactions} />
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
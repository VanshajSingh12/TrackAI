import { Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const icons = {
  wallet: Wallet,
  income: ArrowUpRight,
  expense: ArrowDownLeft
};

const colors = {
  blue: "bg-blue-600",
  green: "bg-green-600",
  red: "bg-red-600"
};

export function SummaryCard({ title, amount, iconType, color }) {
  const Icon = icons[iconType];
  const colorClass = colors[color];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 transition-transform hover:scale-[1.02]">
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">${amount.toLocaleString()}</h3>
      </div>
    </div>
  );
}

export function SummaryGrid({ summary }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <SummaryCard title="Total Balance" amount={summary.balance} iconType="wallet" color="blue" />
      <SummaryCard title="Total Income" amount={summary.totalIncome} iconType="income" color="green" />
      <SummaryCard title="Total Expenses" amount={summary.totalExpense} iconType="expense" color="red" />
    </div>
  );
}

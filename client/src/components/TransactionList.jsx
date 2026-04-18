import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export function TransactionList({ transactions }) {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        <button className="text-sm text-primary font-medium hover:underline">View All</button>
      </div>
      <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto scrollbar-hide">
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-gray-400 italic">
            No transactions found. Use the AI logger to start!
          </div>
        ) : (
          transactions.map((t) => (
            <div key={t._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{t.description || t.category}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`font-bold text-lg ${t.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

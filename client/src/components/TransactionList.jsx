// import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

// export function TransactionList({ transactions }) {
//   return (
//     <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//       <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
//         <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
//         <button className="text-sm text-primary font-medium hover:underline">View All</button>
//       </div>
//       <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto scrollbar-hide">
//         {transactions.length === 0 ? (
//           <div className="p-12 text-center text-gray-400 italic">
//             No transactions found. Use the AI logger to start!
//           </div>
//         ) : (
//           transactions.map((t) => (
//             <div key={t._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
//               <div className="flex items-center space-x-4">
//                 <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
//                   {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-900">{t.description || t.category}</p>
//                   <p className="text-xs text-gray-500 uppercase tracking-wider">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
//                 </div>
//               </div>
//               <span className={`font-bold text-lg ${t.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
//                 {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
//               </span>
//             </div>
//           ))
//         )}
//       </div>
//     </section>
//   );
// }

import { ArrowUpRight, ArrowDownLeft, Leaf } from 'lucide-react';

export function TransactionList({ transactions }) {
  // Helper to assign semantic colors for SDG Letter Grades
  const getRatingStyle = (rating) => {
    switch (rating) {
      case 'A':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'B':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'C':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'D':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'F':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

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
          transactions.map((t) => {
            const hasEco = t.sustainability;
            const co2 = hasEco ? t.sustainability.co2_footprint_kg : 0.1;
            const rating = hasEco ? t.sustainability.sdg_rating : 'C';

            return (
              <div key={t._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.description || t.category}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        {t.category} • {new Date(t.date).toLocaleDateString()}
                      </p>

                      {/* Responsive Mobile-Only Sustainability Tags */}
                      {hasEco && (
                        <div className="flex items-center space-x-1.5 sm:hidden">
                          <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                            <Leaf className="w-2.5 h-2.5" />
                            {co2.toFixed(1)} kg
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getRatingStyle(rating)}`}>
                            {rating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Container: Desktop Sustainability Indicators + Prices */}
                <div className="flex items-center space-x-6">
                  {/* Desktop-Only Sustainability Badge Stack */}
                  {hasEco && (
                    <div className="hidden sm:flex flex-col items-end text-right">
                      <div className="flex items-center space-x-1 text-emerald-600 font-medium text-xs">
                        <Leaf className="w-3.5 h-3.5" />
                        <span>{co2.toFixed(1)} kg CO₂</span>
                      </div>
                      <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border ${getRatingStyle(rating)} mt-0.5`}>
                        Grade {rating}
                      </span>
                    </div>
                  )}

                  {/* Transaction Amount */}
                  <span className={`font-bold text-lg ${t.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                    {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

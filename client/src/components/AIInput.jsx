import { PlusCircle, Loader2 } from 'lucide-react';

export function AIInput({ value, onChange, onSubmit, loading }) {
  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
      <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
        <PlusCircle className="mr-2 text-primary w-5 h-5" /> Add Transaction
      </h2>
      <form onSubmit={onSubmit} className="relative">
        <input
          type="text"
          placeholder="Enter Transaction"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-4 pr-12 py-4 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-gray-700"
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="absolute right-2.5 top-2 p-2 bg-primary text-white rounded-lg hover:bg-secondary disabled:opacity-50 transition-all shadow-md active:scale-95"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <PlusCircle className="w-6 h-6" />}
        </button>
      </form>
      <div className="mt-3 relative flex items-center justify-between">
        {/* <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Gemini 1.5 Flash AI</p> */}
        <span className="text-[10px] absolute right-0 text-gray-400 italic">Powered by Natural Language</span>
      </div>
    </section>
  );
}

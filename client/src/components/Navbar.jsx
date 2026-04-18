import { Wallet, LogOut, User as UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
      <Link to="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
        <div className="bg-primary p-1.5 rounded-lg shadow-md">
          <Wallet className="text-white w-6 h-6" />
        </div>
        <span className="text-2xl font-black text-gray-900 tracking-tight italic">TrackAI</span>
      </Link>
      
      <div className="flex items-center space-x-6">
        {isAuthenticated ? (
          <>
            <div className="text-right hidden sm:block border-r border-gray-100 pr-6 mr-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active Member</p>
              <p className="text-sm font-bold text-gray-900 flex items-center">
                <UserIcon className="w-3 h-3 mr-1 text-primary" /> {user?.username}
              </p>
            </div>
            <button 
              onClick={handleLogout} 
              className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-gray-100 group"
              title="Logout"
            >
              <LogOut className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors">Login</Link>
            <Link 
              to="/signup" 
              className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-md hover:bg-secondary transition-all active:scale-95"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

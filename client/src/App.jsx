import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyOTPPage from './pages/VerifyOTPPage';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

// Placeholder for Dashboard (Next Phase)
const Dashboard = () => (
  <div className="p-10">
    <h1 className="text-2xl font-bold">User Dashboard</h1>
    <button 
      onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
      className="mt-4 text-red-600 underline"
    >
      Logout
    </button>
  </div>
);

export default App;

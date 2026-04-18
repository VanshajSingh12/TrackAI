import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

// Temporary Placeholders
const Home = () => <div className="p-10"><h1>Welcome to TrackAI</h1><a href="/login" className="text-primary underline">Login</a></div>;
const Login = () => <div className="p-10"><h1>Login Page</h1></div>;
const Signup = () => <div className="p-10"><h1>Signup Page</h1></div>;
const Dashboard = () => <div className="p-10"><h1>User Dashboard</h1></div>;

export default App;

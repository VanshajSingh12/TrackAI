import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthCard } from '../components/AuthCard';
import { InputField, Button } from '../components/FormElements';
import { Navbar } from '../components/Navbar';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <AuthCard title="Welcome Back" subtitle="Log in to manage your finances">
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {error && <div className="p-3 text-xs text-red-600 bg-red-50 rounded-md border border-red-200">{error}</div>}
            <div className="space-y-3">
              <InputField
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <InputField
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? 'Logging in...' : 'Sign In'}
            </Button>

            <div className="text-center text-xs pt-2">
              <span className="text-gray-600">Don't have an account? </span>
              <Link to="/signup" className="font-medium text-primary hover:text-secondary">
                Sign up
              </Link>
            </div>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}

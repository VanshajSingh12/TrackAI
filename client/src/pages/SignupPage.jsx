import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthCard } from '../components/AuthCard';
import { InputField, Button } from '../components/FormElements';
import { Navbar } from '../components/Navbar';

export default function SignupPage() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('/api/auth/signup', formData);
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <AuthCard title="Create Account" subtitle="Join TrackAI to track expenses intelligently">
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {error && <div className="p-3 text-xs text-red-600 bg-red-50 rounded-md border border-red-200">{error}</div>}
            <div className="space-y-3">
              <InputField
                label="Full Name"
                placeholder="John Doe"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
              <InputField
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <InputField
                label="Password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>

            <div className="text-center text-xs pt-2">
              <span className="text-gray-600">Already have an account? </span>
              <Link to="/login" className="font-medium text-primary hover:text-secondary">
                Log in
              </Link>
            </div>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}

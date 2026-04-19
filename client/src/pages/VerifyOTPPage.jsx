import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { AuthCard } from '../components/AuthCard';
import { InputField, Button } from '../components/FormElements';

export default function VerifyOTPPage() {
  const { login } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { state } = useLocation();
  const navigate = useNavigate();

  const email = state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError('Email missing. Please sign up again.');
    
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post('/api/auth/verify-otp', { email, otp });
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Verify Email" subtitle={`Enter the 6-digit code sent to ${email}`}>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">{error}</div>}
        <InputField
          label="Verification Code"
          placeholder="123456"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify & Continue'}
        </Button>
      </form>
    </AuthCard>
  );
}

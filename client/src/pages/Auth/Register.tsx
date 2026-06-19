import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Mail, Lock, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, sendOtp } = useAuth();
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  React.useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => {
      setCountdown(c => c - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const result = await sendOtp(email);
    setLoading(false);
    if (!result.ok) {
      toast.error(result.message || 'Failed to send verification code');
      return;
    }
    toast.success('Verification code sent to your email!');
    setStep('OTP');
    setCountdown(120); // 2 minutes countdown
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true);
    const result = await sendOtp(email);
    setLoading(false);
    if (!result.ok) {
      toast.error(result.message || 'Failed to resend verification code');
      return;
    }
    toast.success('New verification code sent!');
    setCountdown(120);
    setOtp('');
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }
    setLoading(true);
    const result = await register({ name, email, phone, password, otp });
    setLoading(false);
    if (!result.ok) {
      toast.error(result.message || 'Registration failed');
      return;
    }
    toast.success('Registration successful! Welcome to Raino Cars.');
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-24 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full overflow-hidden rounded-3xl bg-surface border border-off-white/10 shadow-2xl">
          {/* Left: Branding/Graphic */}
          <div className="relative hidden lg:flex h-full min-h-[600px] items-center justify-center p-12 overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1494976388531-d10584948836?q=80&w=1200&auto=format&fit=crop"
                alt="Luxury Car"
                className="h-full w-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary/60 to-transparent" />
            </div>
            <div className="relative z-10 text-center max-w-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center"
              >
                <Car className="h-20 w-20 text-accent mb-6" />
                <h1 className="text-5xl font-display font-bold text-off-white mb-4 leading-tight">
                  Join the <span className="text-accent">Elite</span>
                </h1>
                <p className="text-off-white/60 text-lg leading-relaxed">
                  Start your journey with Raino Cars. Access the most exclusive fleet
                  of luxury vehicles in the city.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="p-8 md:p-16 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full space-y-8">
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-display font-bold text-off-white mb-2">
                  {step === 'DETAILS' ? 'Create Account' : 'Verify Email'}
                </h2>
                <p className="text-off-white/60">
                  {step === 'DETAILS'
                    ? 'Join us and start driving the moment'
                    : `We sent a 6-digit verification code to ${email}`}
                </p>
              </div>

              {step === 'DETAILS' ? (
                <form className="space-y-6" onSubmit={handleRequestOtp}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-off-white/60 flex items-center gap-2">
                      <User className="h-4 w-4" /> Full Name
                    </label>
                    <Input type="text" value={name} onChange={e => setName(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-off-white/60 flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email Address
                    </label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-off-white/60 flex items-center gap-2">
                      <Phone className="h-4 w-4" /> Phone Number
                    </label>
                    <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-off-white/60 flex items-center gap-2">
                        <Lock className="h-4 w-4" /> Password
                      </label>
                      <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-off-white/60 flex items-center gap-2">
                        <Lock className="h-4 w-4" /> Confirm Password
                      </label>
                      <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
                    </div>
                  </div>

                  <Button variant="primary" className="w-full py-6 text-lg font-bold" type="submit" disabled={loading}>
                    {loading ? 'Sending Code...' : 'Get Verification Code'}
                  </Button>
                </form>
              ) : (
                <form className="space-y-6" onSubmit={handleVerifyAndRegister}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-off-white/60">
                      Verification OTP
                    </label>
                    <Input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit code"
                      className="text-center text-2xl font-mono tracking-[0.5em] placeholder:tracking-normal placeholder:text-sm placeholder:font-sans py-4"
                      required
                    />
                  </div>

                  <Button variant="primary" className="w-full py-6 text-lg font-bold" type="submit" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify & Register'}
                  </Button>

                  <div className="flex justify-between items-center text-sm">
                    <button
                      type="button"
                      onClick={() => setStep('DETAILS')}
                      className="text-off-white/50 hover:text-off-white transition-colors"
                      disabled={loading}
                    >
                      ← Back to Details
                    </button>
                    {countdown > 0 ? (
                      <span className="text-off-white/40">Resend in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-accent hover:underline font-bold"
                        disabled={loading}
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                </form>
              )}

              <div className="text-center text-sm text-off-white/60">
                Already have an account? <Link to="/login" className="text-accent hover:underline font-bold">Sign In</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;

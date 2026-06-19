import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const state = location.state as { from?: string } | null;

  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => {
      setCountdown(c => c - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSuccessLogin = (role?: string) => {
    if (role === 'ADMIN') {
      toast.success('Welcome, Admin');
      navigate('/admin', { replace: true });
    } else {
      toast.success('Welcome back!');
      navigate(state?.from || '/dashboard', { replace: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (step === 'DETAILS') {
      const result = await login(email, password);
      setLoading(false);

      if (!result.ok) {
        toast.error(result.message || 'Login failed');
        return;
      }

      if (result.otpRequired) {
        toast.success('Verification code sent to your email!');
        setStep('OTP');
        setCountdown(60); // 1 minute resend cooldown
        setOtp('');
      } else {
        handleSuccessLogin(result.role);
      }
    } else {
      if (!otp || otp.length < 6) {
        setLoading(false);
        toast.error('Please enter the 6-digit verification code');
        return;
      }

      const result = await login(email, password, otp);
      setLoading(false);

      if (!result.ok) {
        toast.error(result.message || 'Verification failed');
        return;
      }

      handleSuccessLogin(result.role);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.ok) {
      toast.error(result.message || 'Failed to resend verification code');
      return;
    }

    toast.success('New verification code sent!');
    setCountdown(60);
    setOtp('');
  };

  const fillDemo = (type: 'USER' | 'ADMIN') => {
    if (type === 'ADMIN') {
      setEmail('admin@rainocars.com');
      setPassword('Admin@123');
    } else {
      setEmail('user@raino.com');
      setPassword('User@123');
    }
    // Automatically switch back to DETAILS step if they fill demo credentials
    setStep('DETAILS');
  };

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />
      <main className="mx-auto flex max-w-6xl items-center justify-center px-6 py-24">
        <div className="grid w-full overflow-hidden rounded-3xl border border-accent/15 bg-surface-elevated/80 shadow-premium lg:grid-cols-2">
          {/* Left Panel */}
          <div className="relative hidden min-h-[560px] lg:flex lg:flex-col lg:justify-center lg:p-12">
            <div className="absolute inset-0 bg-hero-glow" />
            <div className="grain-overlay absolute inset-0 opacity-10" />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 space-y-6"
            >
              <img src="/raino-logo.jpeg" alt="Raino Cars" className="h-20 w-auto object-contain" />
              <h1 className="font-display text-4xl font-bold text-off-white">
                Welcome to <span className="text-gradient-red">Raino Cars</span>
              </h1>
              <p className="max-w-sm text-lg text-off-white/60">
                Sign in with your account — members go to the dashboard, admins to the control panel.
              </p>
            </motion.div>
          </div>

          {/* Right Panel: Auth Form */}
          <div className="flex flex-col justify-center p-8 md:p-12">
            <div className="mx-auto w-full max-w-md space-y-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-off-white">
                  {step === 'DETAILS' ? 'Sign In' : 'Verify Email'}
                </h2>
                <p className="mt-2 text-sm text-off-white/60">
                  {step === 'DETAILS'
                    ? 'Enter your credentials to access your account'
                    : `We sent a 6-digit verification code to ${email}`}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {step === 'DETAILS' ? (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-5"
                    >
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm text-off-white/60">
                          <Mail className="h-4 w-4 text-accent" /> Email
                        </label>
                        <Input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm text-off-white/60">
                          <Lock className="h-4 w-4 text-accent" /> Password
                        </label>
                        <Input
                          type="password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                        />
                      </div>

                      <Button variant="primary" className="w-full py-5 text-lg" type="submit" disabled={loading}>
                        {loading ? 'Validating...' : 'Get Verification Code'}
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="otp"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-5"
                    >
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
                          autoFocus
                        />
                      </div>

                      <Button variant="primary" className="w-full py-5 text-lg" type="submit" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify & Sign In'}
                      </Button>

                      <div className="flex justify-between items-center text-sm">
                        <button
                          type="button"
                          onClick={() => setStep('DETAILS')}
                          className="flex items-center gap-1 text-off-white/50 hover:text-off-white transition-colors"
                          disabled={loading}
                        >
                          <ArrowLeft className="h-4 w-4" /> Credentials
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              {step === 'DETAILS' && (
                <>
                  <div className="space-y-3 rounded-2xl border border-accent/10 bg-primary/40 p-4">
                    <p className="text-center text-xs font-bold uppercase tracking-widest text-off-white/40">
                      Quick fill (demo bypass)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => fillDemo('USER')}
                        className="rounded-lg border border-accent/10 p-3 text-left text-xs transition-colors hover:border-accent/30"
                      >
                        <p className="text-off-white/40 uppercase">User → Dashboard</p>
                        <p className="font-medium text-off-white">user@raino.com</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => fillDemo('ADMIN')}
                        className="rounded-lg border border-accent/10 p-3 text-left text-xs transition-colors hover:border-accent/30"
                      >
                        <p className="text-off-white/40 uppercase">Admin → Panel</p>
                        <p className="font-medium text-off-white">admin@rainocars.com</p>
                      </button>
                    </div>
                  </div>

                  <p className="text-center text-sm text-off-white/60">
                    New here?{' '}
                    <Link to="/register" className="font-bold text-accent hover:underline">
                      Create account
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;

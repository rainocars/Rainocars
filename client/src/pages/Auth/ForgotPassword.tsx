import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ArrowLeft, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<'REQUEST' | 'RESET'>('REQUEST');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => {
      setCountdown(c => c - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setLoading(false);
      
      if (response.data.status === 'success') {
        toast.success('Verification code sent to your email!');
        setStep('RESET');
        setCountdown(60);
      } else {
        toast.error(response.data.message || 'Failed to request reset');
      }
    } catch (err: any) {
      setLoading(false);
      toast.error(err.response?.data?.message || 'Failed to request reset code');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', { email, otp, password });
      setLoading(false);

      if (response.data.status === 'success') {
        toast.success('Password reset successfully! Please sign in with your new password.');
        navigate('/login');
      } else {
        toast.error(response.data.message || 'Failed to reset password');
      }
    } catch (err: any) {
      setLoading(false);
      toast.error(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setLoading(false);
      toast.success('New verification code sent!');
      setCountdown(60);
      setOtp('');
    } catch (err: any) {
      setLoading(false);
      toast.error('Failed to resend code');
    }
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
                Reset your <br />
                <span className="text-gradient-red">Password</span>
              </h1>
              <p className="max-w-sm text-lg text-off-white/60">
                Confirm your identity using a verification code and create a new secure password.
              </p>
            </motion.div>
          </div>

          {/* Right Panel: Form */}
          <div className="flex flex-col justify-center p-8 md:p-12">
            <div className="mx-auto w-full max-w-md space-y-8">
              <div>
                <Button variant="ghost" size="sm" asChild className="mb-4 -ml-4 text-off-white/60 hover:text-off-white">
                  <Link to="/login" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Sign In
                  </Link>
                </Button>
                <h2 className="font-display text-2xl font-bold text-off-white">
                  {step === 'REQUEST' ? 'Forgot Password' : 'Reset Password'}
                </h2>
                <p className="mt-2 text-sm text-off-white/60">
                  {step === 'REQUEST'
                    ? 'Enter your email address to receive a secure recovery OTP code.'
                    : `Enter the code sent to ${email} along with your new password.`}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {step === 'REQUEST' ? (
                  <motion.form
                    key="request-form"
                    onSubmit={handleRequestOtp}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm text-off-white/60">
                        <Mail className="h-4 w-4 text-accent" /> Email Address
                      </label>
                      <Input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Enter your registered email"
                        required
                      />
                    </div>

                    <Button variant="primary" className="w-full py-5 text-lg" type="submit" disabled={loading}>
                      {loading ? 'Requesting...' : 'Send Reset Code'}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="reset-form"
                    onSubmit={handleResetPassword}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-off-white/60">
                        Verification OTP Code
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

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm text-off-white/60">
                        <Lock className="h-4 w-4 text-accent" /> New Password
                      </label>
                      <Input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm text-off-white/60">
                        <KeyRound className="h-4 w-4 text-accent" /> Confirm Password
                      </label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Retype password"
                        required
                      />
                    </div>

                    <Button variant="primary" className="w-full py-5 text-lg" type="submit" disabled={loading}>
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </Button>

                    <div className="flex justify-between items-center text-sm">
                      <button
                        type="button"
                        onClick={() => setStep('REQUEST')}
                        className="flex items-center gap-1 text-off-white/50 hover:text-off-white transition-colors"
                        disabled={loading}
                      >
                        <ArrowLeft className="h-4 w-4" /> Change Email
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
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;

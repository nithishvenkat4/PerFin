/**
 * Login Page styled after the modern SaaS design system.
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Lock, Mail, ShieldAlert, Sparkles, Check } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!googleClientId) return;

    const setupGoogle = () => {
      const g = (window as any).google;
      if (g?.accounts?.id) {
        g.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            setError(null);
            setIsGoogleSubmitting(true);
            try {
              await loginWithGoogle({ credential: response.credential });
              navigate('/dashboard');
            } catch (err: any) {
              setError(err.message || 'Google Authentication failed.');
            } finally {
              setIsGoogleSubmitting(false);
            }
          },
        });

        const container = document.getElementById('google-native-btn');
        if (container) {
          container.innerHTML = '';
          g.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            width: 380,
            text: 'continue_with',
            shape: 'pill',
          });
        }
      }
    };

    if ((window as any).google?.accounts?.id) {
      setupGoogle();
    } else {
      const timer = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(timer);
          setupGoogle();
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, [googleClientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleSubmitting(true);
    try {
      // If GSI is initialized with a real client ID, trigger the Google prompt
      const g = (window as any).google;
      if (googleClientId && g?.accounts?.id) {
        g.accounts.id.prompt();
        return;
      }
      // Otherwise, use seamless fallback SSO
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleAdminQuickFill = async () => {
    setEmail('admin@finmate.local');
    setPassword('admin123');
    setError(null);
    setIsSubmitting(true);
    try {
      await login('admin@finmate.local', 'admin123');
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Admin login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserQuickFill = async () => {
    setEmail('demo@finmate.local');
    setPassword('demo123');
    setError(null);
    setIsSubmitting(true);
    try {
      await login('demo@finmate.local', 'demo123');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo user login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col items-center justify-center px-4 py-12">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#5E4AE3] to-[#7B68EE] flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
          <Sparkles className="w-6 h-6 text-amber-300" />
        </div>
        <div>
          <span className="font-heading-tech text-2xl font-extrabold text-[#1E1B4B] tracking-tight">
            PerFin
          </span>
          <p className="text-xs text-slate-400 font-medium">Personal Finance Platform</p>
        </div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl shadow-purple-500/5">
        {/* Header */}
        <div className="border-b border-slate-100 pb-5 mb-6 text-center">
          <h1 className="font-heading-tech text-2xl font-extrabold text-[#1E1B4B]">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to access your finances and decisions
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Continue with Google Button */}
        <div className="space-y-4">
          <div id="google-native-btn" className="flex justify-center empty:hidden"></div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSubmitting || isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-3 shadow-xs hover:border-slate-300 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isGoogleSubmitting ? 'Connecting with Google...' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
              or with email
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@finmate.local"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-[#5E4AE3] focus:ring-2 focus:ring-[#5E4AE3]/15 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-[#5E4AE3] focus:ring-2 focus:ring-[#5E4AE3]/15 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full mt-2 py-3 rounded-xl bg-[#5E4AE3] hover:bg-[#4D38D0] text-white font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-400 uppercase text-center mb-3">
            Quick Demo Sign-In
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={handleUserQuickFill}
              disabled={isSubmitting}
              className="py-2 px-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold transition-all text-center flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-amber-600" />
              <span>Demo User</span>
            </button>
            <button
              type="button"
              onClick={handleAdminQuickFill}
              disabled={isSubmitting}
              className="py-2 px-3 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold transition-all text-center flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <span>Don't have an account? </span>
          <Link to="/register" className="font-bold text-[#5E4AE3] hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Zap, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!email || !password) {
      setError('Email dan password harus diisi');
      setIsSubmitting(false);
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6">
      {/* Upper Brand Info */}
      <div className="text-center pt-8 space-y-3">
        <div className="flex justify-center">
          <div className="bg-gradient-to-tr from-emerald-400 to-teal-500 p-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 text-white">
            <Zap className="h-8 w-8 fill-current" />
          </div>
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Masuk Aplikasi</h1>
        <p className="text-xs font-semibold text-slate-400 max-w-xs mx-auto">
          Silakan masuk untuk memantau status baterai dan melakukan swap di stasiun terdekat.
        </p>
      </div>

      {/* Form Content panel */}
      <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto my-8">
        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-100 p-3 rounded-xl text-rose-600 flex items-start gap-2.5 text-xs font-bold">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="budi@gmail.com"
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/10 disabled:opacity-50 transition flex items-center justify-center gap-1.5 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Masuk Akun'
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-xs font-semibold text-slate-400">
          Belum punya akun?{' '}
          <Link to="/register" className="text-emerald-500 font-extrabold">
            Daftar Sekarang
          </Link>
        </div>
      </div>

      {/* Demo Credentials Info block */}
      <div className="bg-slate-100 p-4 border border-slate-200 rounded-2xl max-w-sm w-full mx-auto">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-2">Akun Demo Pelanggan (Regular)</h4>
        <div className="text-xs text-slate-500 space-y-1.5 font-semibold">
          <div className="flex justify-between">
            <span>Email:</span>
            <span className="font-extrabold text-slate-700">budi@gmail.com</span>
          </div>
          <div className="flex justify-between">
            <span>Password:</span>
            <span className="font-extrabold text-slate-700">userpassword</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { formatRupiah } from '../utils/formatter';
import api from '../services/api';
import { 
  User, 
  Mail, 
  Wallet, 
  LogOut, 
  X, 
  Check, 
  Loader2, 
  PlusCircle, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const Profile = () => {
  const { user, logout, refreshProfile } = useAuth();
  
  // Topup overlay states
  const [showTopUp, setShowTopUp] = useState(false);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleTopUpSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseInt(amount) <= 0) return;

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      // Connect to real Express + PostgreSQL backend top up
      const response = await api.post('/users/topup', {
        amount: parseInt(amount)
      });

      setSuccessMsg(`Berhasil mengisi saldo sebesar ${formatRupiah(amount)}`);
      await refreshProfile(); // reload wallet balance

      setTimeout(() => {
        setShowTopUp(false);
        setAmount('');
        setSuccessMsg('');
      }, 1500);

    } catch (error) {
      console.error('Top up failed:', error);
      setErrorMsg(error.response?.data?.message || 'Gagal memproses pengisian saldo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-5 pb-24 space-y-6">
      
      {/* Page Title */}
      <div className="pt-4">
        <h2 className="text-lg font-black text-slate-800 tracking-tight">Akun Pengendara</h2>
        <p className="text-xs font-semibold text-slate-400">Atur profil Anda, isi ulang saldo, atau keluar akun.</p>
      </div>

      {/* User profile Summary Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div className="h-14 w-14 bg-gradient-to-tr from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center rounded-full font-black text-lg shadow-md border-2 border-white">
          {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
        </div>
        <div>
          <h3 className="font-extrabold text-slate-800 text-base">{user?.name || 'Pelanggan'}</h3>
          <p className="text-xs text-slate-400 font-semibold">{user?.email || 'user@spbklu.com'}</p>
          <span className="inline-flex items-center gap-0.5 mt-1.5 text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
            <ShieldCheck className="h-3 w-3 fill-current" /> Verified Rider
          </span>
        </div>
      </div>

      {/* Wallet Summary Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Dompet Elektrik</span>
            <span className="text-2xl font-black text-slate-100 tracking-tight">{formatRupiah(user?.balance || 0)}</span>
          </div>
          <button
            onClick={() => setShowTopUp(true)}
            className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 font-extrabold text-xs text-slate-950 px-3.5 py-2.5 rounded-xl shadow shadow-emerald-500/10 active:scale-95 transition"
          >
            <PlusCircle className="h-4 w-4" />
            Top Up
          </button>
        </div>
      </div>

      {/* Secondary System list details */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm space-y-3 font-semibold text-slate-700 text-xs">
        <div className="flex justify-between border-b pb-2.5 border-slate-100">
          <span className="text-slate-400">Provider Jaringan</span>
          <span className="text-slate-800 font-bold">SPBKLU Indonesia</span>
        </div>
        <div className="flex justify-between border-b pb-2.5 border-slate-100">
          <span className="text-slate-400">Versi Aplikasi</span>
          <span className="text-slate-800 font-bold">1.0.0 (Capacitor Android)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Database Server Connection</span>
          <span className="text-emerald-500 font-extrabold">Connected OK</span>
        </div>
      </div>

      {/* Logout action block */}
      <button
        onClick={logout}
        className="w-full py-3.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white font-bold text-xs rounded-xl border border-rose-100 hover:border-rose-500 transition-all flex items-center justify-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        <span>Keluar dari Akun</span>
      </button>

      {/* --- TOP UP MODAL OVERLAY --- */}
      {showTopUp && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all animate-scaleUp">
            
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-500" />
                Isi Ulang Saldo Dompet
              </h3>
              <button 
                onClick={() => setShowTopUp(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleTopUpSubmit} className="p-6 space-y-4">
              {successMsg ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700 flex flex-col items-center justify-center text-center py-6 space-y-2">
                  <div className="bg-emerald-500 text-white p-2.5 rounded-full shadow-lg shadow-emerald-500/20">
                    <Check className="h-6 w-6 stroke-[3]" />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-sm">Top Up Berhasil!</h4>
                  <p className="text-xs font-semibold text-slate-500">{successMsg}</p>
                </div>
              ) : (
                <>
                  {errorMsg && (
                    <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-600 flex items-center gap-2 text-xs font-bold">
                      <AlertCircle className="h-4 w-4 shrink-0" /> {errorMsg}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Masukkan Nominal (Rp)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-extrabold text-xs">Rp</span>
                      <input
                        type="number"
                        min="10000"
                        step="10000"
                        required
                        placeholder="Contoh: 50000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-slate-800 font-extrabold text-sm focus:outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Minimum pengisian IDR 10.000 dengan kelipatan IDR 10.000</span>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowTopUp(false)}
                      className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-600 rounded-xl transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !amount}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs text-white rounded-xl shadow-lg disabled:opacity-50 transition flex items-center justify-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 stroke-[3]" />
                          Bayar Sekarang
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;

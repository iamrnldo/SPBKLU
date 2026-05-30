import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatDate, formatRupiah } from '../utils/formatter';
import { History as HistoryIcon, ArrowDownUp, RefreshCw } from 'lucide-react';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/transactions/my-history');
      setHistory(response.data.data);
    } catch (error) {
      console.error('Failed to load transaction history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-5 pb-24 space-y-6">
      
      {/* Title block */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">Riwayat Swap Baterai</h2>
          <p className="text-xs font-semibold text-slate-400">Log penukaran dan transaksi keuangan dompet Anda.</p>
        </div>
        <button
          onClick={fetchHistory}
          className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-150 rounded-lg transition"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center">
          <div className="h-6 w-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="mt-3 text-xs text-slate-400 font-bold">Mengambil Riwayat Transaksi...</span>
        </div>
      ) : history.length > 0 ? (
        <div className="space-y-4">
          {history.map((txn) => (
            <div key={txn.transactionId} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">#{txn.transactionId}</span>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  Sukses
                </span>
              </div>

              <div>
                <h4 className="text-xs font-black text-slate-800">{txn.stationName}</h4>
                <p className="text-[10px] text-slate-400 font-semibold">{formatDate(txn.timestamp)}</p>
              </div>

              <div className="flex items-center justify-between pt-1 font-bold">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="bg-rose-50 text-rose-500 border px-1.5 py-0.5 rounded-md text-[10px] font-extrabold">{txn.emptyBatteryId}</span>
                  <ArrowDownUp className="h-3 w-3 text-slate-400" />
                  <span className="bg-emerald-50 text-emerald-500 border px-1.5 py-0.5 rounded-md text-[10px] font-extrabold">{txn.fullBatteryId}</span>
                </div>

                <span className="text-sm font-black text-slate-800">{formatRupiah(txn.cost)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border rounded-2xl p-8 text-center text-slate-400 space-y-3 shadow-sm">
          <div className="h-10 w-10 bg-slate-100 text-slate-300 flex items-center justify-center rounded-full mx-auto border">
            <HistoryIcon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-700 text-sm">Belum Ada Transaksi</h4>
            <p className="text-xs font-semibold text-slate-400 max-w-xs mx-auto mt-0.5">Semua riwayat transaksi penukaran baterai Anda akan otomatis muncul di halaman ini.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;

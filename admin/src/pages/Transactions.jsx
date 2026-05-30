import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Table from '../components/Table';
import { formatDate, formatRupiah } from '../utils/formatter';
import { Search, History, CheckCircle, RefreshCw, AlertTriangle, ArrowRightLeft } from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/transactions/all');
      setTransactions(response.data.data);
    } catch (error) {
      console.error('Gagal mengambil data transaksi:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle className="h-3 w-3 fill-current" /> Berhasil
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
            <AlertTriangle className="h-3 w-3" /> Gagal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-600 border border-slate-100">
            {status}
          </span>
        );
    }
  };

  const filteredTransactions = transactions.filter(txn => 
    txn.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    txn.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    txn.stationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    txn.emptyBatteryId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    txn.fullBatteryId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Upper Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Laporan & Riwayat Transaksi</h1>
          <p className="text-sm font-medium text-slate-500">Daftar log penukaran baterai lengkap dengan pencatatan unit ID, stasiun asal, nama pelanggan, dan tarif billing.</p>
        </div>
        <button
          onClick={fetchTransactions}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 font-bold text-sm rounded-xl text-slate-700 transition shadow-sm active:scale-95"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Log
        </button>
      </div>

      {/* Filter and stats overview */}
      <div className="flex bg-white p-4 border border-slate-200 rounded-xl shadow-sm justify-between items-center gap-4">
        <div className="relative max-w-md w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Cari berdasarkan Pelanggan, Stasiun, Serial Baterai..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-sm font-semibold transition-all"
          />
        </div>

        <div className="text-xs font-bold text-slate-400 bg-slate-50 border px-3 py-1.5 rounded-lg">
          Total Rekaman: <span className="text-slate-700 font-extrabold">{transactions.length} Transaksi</span>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center">
          <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="mt-4 text-sm text-slate-500 font-semibold">Mengambil Data Log Transaksi...</span>
        </div>
      ) : (
        <Table
          headers={['ID Transaksi', 'Nama Pelanggan', 'Stasiun Penukaran', 'Siklus Baterai (Masuk ➔ Keluar)', 'Biaya Swap Flat', 'Status', 'Tanggal & Waktu']}
          emptyMessage="Tidak ada catatan transaksi swap yang cocok."
        >
          {filteredTransactions.map((txn) => (
            <tr key={txn.transactionId} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 font-extrabold text-slate-400 text-xs">#{txn.transactionId}</td>
              <td className="px-6 py-4 font-extrabold text-slate-800 text-sm">{txn.userName}</td>
              <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                <div className="flex flex-col">
                  <span>{txn.stationName}</span>
                  <span className="text-[10px] text-slate-400 font-bold">STATION ID: {txn.stationId}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
                  <span className="bg-rose-50 text-rose-600 px-2 py-1 rounded-md border border-rose-150">
                    {txn.emptyBatteryId}
                  </span>
                  <ArrowRightLeft className="h-3.5 w-3.5 text-slate-400" />
                  <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md border border-emerald-150">
                    {txn.fullBatteryId}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 font-black text-slate-800 text-sm">
                {formatRupiah(txn.cost)}
              </td>
              <td className="px-6 py-4">{getStatusBadge(txn.status)}</td>
              <td className="px-6 py-4 text-slate-500 text-xs font-bold">{formatDate(txn.timestamp)}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

export default Transactions;

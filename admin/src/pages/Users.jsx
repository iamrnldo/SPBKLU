import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Table from '../components/Table';
import { formatDate, formatRupiah } from '../utils/formatter';
import { Search, PlusCircle, Coins, X, Check, Loader, UserPlus, AlertCircle } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Topup modal states
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isSubmittingTopUp, setIsSubmittingTopUp] = useState(false);
  const [topUpSuccessMsg, setTopUpSuccessMsg] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Gagal mengambil data user:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenTopUp = (user) => {
    setSelectedUser(user);
    setTopUpAmount('');
    setTopUpSuccessMsg('');
    setShowTopUpModal(true);
  };

  const handleCloseTopUp = () => {
    setShowTopUpModal(false);
    setSelectedUser(null);
  };

  const handleTopUpSubmit = async (e) => {
    e.preventDefault();
    if (!topUpAmount || parseInt(topUpAmount) <= 0) return;

    setIsSubmittingTopUp(true);
    try {
      const response = await api.post(`/admin/users/${selectedUser.id}/topup`, {
        amount: parseInt(topUpAmount)
      });
      
      setTopUpSuccessMsg(response.data.message || 'Saldo berhasil ditambahkan!');
      
      // Refresh user list to reflect changes
      fetchUsers();
      
      // Auto-close after 1.5s
      setTimeout(() => {
        handleCloseTopUp();
      }, 1500);

    } catch (error) {
      console.error('Gagal top up saldo user:', error);
      alert('Gagal top up: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmittingTopUp(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top action header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen Akun User</h1>
          <p className="text-sm font-medium text-slate-500">Kelola informasi pelanggan, lihat sisa saldo dompet, dan lakukan pengisian ulang (Top Up).</p>
        </div>
      </div>

      {/* Search and control widgets */}
      <div className="flex bg-white p-4 border border-slate-200 rounded-xl shadow-sm justify-between items-center gap-4">
        <div className="relative max-w-md w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Cari user berdasarkan nama atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-sm font-semibold transition-all"
          />
        </div>

        <div className="text-xs font-bold text-slate-400 bg-slate-50 border px-3 py-1.5 rounded-lg">
          Total Pelanggan: <span className="text-slate-700 font-extrabold">{users.length}</span>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center">
          <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="mt-4 text-sm text-slate-500 font-semibold">Memuat Data Pengguna...</span>
        </div>
      ) : (
        <Table 
          headers={['ID User', 'Nama Lengkap', 'Alamat Email', 'Role Akses', 'Saldo Dompet', 'Tanggal Terdaftar', 'Aksi']}
          emptyMessage="Tidak ada pengguna yang cocok dengan pencarian Anda."
        >
          {filteredUsers.map((user) => (
            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 font-bold text-slate-400 text-xs">#{user.id}</td>
              <td className="px-6 py-4 font-extrabold text-slate-800 text-sm">{user.name}</td>
              <td className="px-6 py-4 text-slate-600 text-sm font-semibold">{user.email}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                  user.role === 'admin' 
                    ? 'bg-purple-50 text-purple-600 border border-purple-100' 
                    : 'bg-blue-50 text-blue-600 border border-blue-100'
                }`}>
                  {user.role === 'admin' ? 'Administrator' : 'Mobile User'}
                </span>
              </td>
              <td className="px-6 py-4 font-black text-slate-800 text-sm">
                {user.role === 'admin' ? '-' : formatRupiah(user.balance)}
              </td>
              <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(user.createdAt)}</td>
              <td className="px-6 py-4">
                {user.role !== 'admin' ? (
                  <button
                    onClick={() => handleOpenTopUp(user)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-200 hover:border-emerald-500 font-bold text-xs rounded-lg transition-all"
                  >
                    <Coins className="h-3.5 w-3.5" />
                    Top Up
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-medium italic">Tidak ada aksi</span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Top Up Modal Overlay */}
      {showTopUpModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-scaleUp">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <Coins className="h-5 w-5 text-emerald-500 fill-current" />
                Isi Saldo Pelanggan
              </h3>
              <button 
                onClick={handleCloseTopUp}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleTopUpSubmit} className="p-6 space-y-4">
              {topUpSuccessMsg ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700 flex flex-col items-center justify-center text-center py-6 space-y-2">
                  <div className="bg-emerald-500 text-white p-2.5 rounded-full shadow-lg shadow-emerald-500/20">
                    <Check className="h-6 w-6 stroke-[3]" />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-base">Top Up Sukses!</h4>
                  <p className="text-xs font-semibold text-slate-500">{topUpSuccessMsg}</p>
                </div>
              ) : (
                <>
                  <div className="bg-slate-50 p-4 border rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informasi Pengguna</span>
                    <h4 className="font-extrabold text-slate-800 text-sm">{selectedUser.name}</h4>
                    <p className="text-xs font-semibold text-slate-500">{selectedUser.email}</p>
                    <p className="text-xs font-bold text-slate-700 pt-1">
                      Saldo Sekarang: <span className="text-emerald-600 font-extrabold">{formatRupiah(selectedUser.balance)}</span>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="amount" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Nominal Top Up (Rupiah)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-black text-sm">
                        Rp
                      </span>
                      <input
                        id="amount"
                        type="number"
                        min="5000"
                        step="5000"
                        required
                        placeholder="Contoh: 50000"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-sm font-extrabold"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Minimum pengisian IDR 5.000 dengan kelipatan IDR 5.000</span>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-3">
                    <button
                      type="button"
                      onClick={handleCloseTopUp}
                      className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 font-bold text-sm text-slate-600 rounded-xl transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingTopUp || !topUpAmount}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-sm text-white rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition flex items-center justify-center gap-1.5"
                    >
                      {isSubmittingTopUp ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 stroke-[3]" />
                          Kirim Saldo
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

export default Users;

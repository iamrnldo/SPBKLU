import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Table from '../components/Table';
import { formatDate } from '../utils/formatter';
import { 
  Battery as BatteryIcon, 
  Plus, 
  Search, 
  X, 
  Check, 
  Loader, 
  AlertTriangle,
  Activity,
  Heart,
  Zap
} from 'lucide-react';

const Batteries = () => {
  const [batteries, setBatteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add battery states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newId, setNewId] = useState('');
  const [newType, setNewType] = useState('60V/20Ah');
  const [newSoh, setNewSoh] = useState('100');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchBatteries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/batteries');
      setBatteries(response.data.data);
    } catch (error) {
      console.error('Gagal mengambil data baterai:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatteries();
  }, []);

  const handleOpenAdd = () => {
    setNewId(`BT-${100 + batteries.length + 1}`);
    setNewType('60V/20Ah');
    setNewSoh('100');
    setFormError('');
    setShowAddModal(true);
  };

  const handleCloseAdd = () => {
    setShowAddModal(false);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    if (!newId || !newType) {
      setFormError('ID Baterai dan Tipe wajib diisi');
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post('/batteries', {
        id: newId,
        type: newType,
        stateOfHealth: parseInt(newSoh)
      });

      fetchBatteries();
      handleCloseAdd();
    } catch (error) {
      console.error('Gagal menambah baterai:', error);
      setFormError(error.response?.data?.message || error.message || 'Gagal menyimpan baterai');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">Siap Pakai</span>;
      case 'charging':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 animate-pulse">Sedang Di-charge</span>;
      case 'in-use':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-600 border border-purple-100">Digunakan User</span>;
      case 'faulty':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">Bermasalah</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-600 border border-slate-100">Idle / Gudang</span>;
    }
  };

  const getLocationLabel = (battery) => {
    if (battery.currentStationId) {
      return (
        <span className="font-semibold text-slate-700">
          Stasiun: <span className="text-blue-600 font-extrabold">{battery.currentStationId}</span>
        </span>
      );
    }
    if (battery.currentUserId) {
      return (
        <span className="font-semibold text-slate-700">
          User ID: <span className="text-purple-600 font-extrabold">#{battery.currentUserId}</span>
        </span>
      );
    }
    return <span className="text-slate-400 font-medium italic">Gudang / Idle</span>;
  };

  const getHealthColor = (soh) => {
    if (soh >= 90) return 'text-emerald-500';
    if (soh >= 80) return 'text-orange-500';
    return 'text-rose-500';
  };

  const filteredBatteries = batteries.filter(b => 
    b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Database & Diagnostik Baterai</h1>
          <p className="text-sm font-medium text-slate-500">Pantau parameter State of Health (SOH) dan State of Charge (SOC) baterai secara real-time di seluruh DKI Jakarta.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition shadow-md shadow-emerald-500/15 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Registrasi Baterai Baru
        </button>
      </div>

      {/* Control Widgets bar */}
      <div className="flex bg-white p-4 border border-slate-200 rounded-xl shadow-sm justify-between items-center gap-4">
        <div className="relative max-w-md w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Cari baterai berdasarkan Serial ID, tipe, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-sm font-semibold transition-all"
          />
        </div>

        <div className="text-xs font-bold text-slate-400 bg-slate-50 border px-3 py-1.5 rounded-lg">
          Total Unit: <span className="text-slate-700 font-extrabold">{batteries.length}</span>
        </div>
      </div>

      {/* Main Database Table */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center">
          <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="mt-4 text-sm text-slate-500 font-semibold">Mengambil Diagnostik Baterai...</span>
        </div>
      ) : (
        <Table
          headers={['Serial ID Baterai', 'Tipe Tegangan / Kapasitas', 'Daya Aktif (SOC)', 'Kesehatan Sel (SOH)', 'Lokasi Saat Ini', 'Status Kerja', 'Tanggal Registrasi']}
          emptyMessage="Tidak ada unit baterai yang ditemukan."
        >
          {filteredBatteries.map((battery) => (
            <tr key={battery.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-100 rounded-md text-slate-500 border">
                    <BatteryIcon className="h-4 w-4" />
                  </div>
                  <span className="font-extrabold text-slate-800 text-sm">{battery.id}</span>
                </div>
              </td>
              <td className="px-6 py-4 font-semibold text-slate-600 text-sm">{battery.type}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-800">{battery.chargeLevel}%</span>
                  <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden border">
                    <div 
                      className={`h-full ${battery.chargeLevel >= 80 ? 'bg-emerald-500' : battery.chargeLevel >= 30 ? 'bg-blue-500' : 'bg-rose-500'}`} 
                      style={{ width: `${battery.chargeLevel}%` }}
                    ></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 font-black text-sm">
                  <Heart className={`h-4 w-4 fill-current ${getHealthColor(battery.stateOfHealth)}`} />
                  <span className={getHealthColor(battery.stateOfHealth)}>{battery.stateOfHealth}% SOH</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-semibold">{getLocationLabel(battery)}</td>
              <td className="px-6 py-4">{getStatusBadge(battery.status)}</td>
              <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(battery.createdAt)}</td>
            </tr>
          ))}
        </Table>
      )}

      {/* Add Battery Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-scaleUp">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <BatteryIcon className="h-5 w-5 text-emerald-500" />
                Registrasi Unit Baterai Baru
              </h3>
              <button 
                onClick={handleCloseAdd}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-600 flex items-start gap-3 text-xs font-bold">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-rose-500" />
                  <div>{formError}</div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Serial ID Baterai</label>
                <input
                  type="text"
                  required
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  placeholder="e.g. BT-902"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-slate-800 font-extrabold text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Tipe / Tegangan</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-slate-800 font-bold text-sm"
                  >
                    <option value="60V/20Ah">60V / 20Ah (Standard)</option>
                    <option value="60V/24Ah">60V / 24Ah (High Capacity)</option>
                    <option value="72V/20Ah">72V / 20Ah (Performance)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Kesehatan Awal (SOH)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    required
                    value={newSoh}
                    onChange={(e) => setNewSoh(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-slate-800 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="bg-slate-50 border p-4 rounded-xl flex items-start gap-3 text-xs text-slate-500 leading-relaxed font-semibold">
                <Zap className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5 fill-current" />
                <span>Baterai baru yang terdaftar akan otomatis memiliki State of Charge (SOC) 100% dan berstatus **Idle (Gudang)**. Anda bisa langsung memasukkannya ke slot pengisi stasiun SPBKLU di menu Stasiun.</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseAdd}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 font-bold text-sm text-slate-600 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-sm text-white rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 stroke-[3]" />
                      Simpan Baterai
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default Batteries;

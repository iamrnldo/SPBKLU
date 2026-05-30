import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  MapPin, 
  Settings, 
  Plus, 
  X, 
  Check, 
  Loader, 
  Battery as BatteryIcon, 
  Activity,
  AlertTriangle,
  Info
} from 'lucide-react';

const Stations = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);

  // New Station Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newLat, setNewLat] = useState('');
  const [newLng, setNewLng] = useState('');
  const [newSlotsCount, setNewSlotsCount] = useState('4');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stations');
      setStations(response.data.data);
      
      // Keep selected station reference updated on refresh
      if (selectedStation) {
        const updated = response.data.data.find(s => s.id === selectedStation.id);
        if (updated) setSelectedStation(updated);
      }
    } catch (error) {
      console.error('Gagal mengambil data stasiun:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleOpenAdd = () => {
    setNewId(`ST-00${stations.length + 1}`);
    setNewName('');
    setNewAddress('');
    setNewLat('-6.');
    setNewLng('106.');
    setNewSlotsCount('4');
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

    if (!newId || !newName || !newAddress) {
      setFormError('ID Stasiun, Nama, dan Alamat wajib diisi');
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post('/stations', {
        id: newId,
        name: newName,
        address: newAddress,
        latitude: parseFloat(newLat) || 0,
        longitude: parseFloat(newLng) || 0,
        slotCount: parseInt(newSlotsCount)
      });

      fetchStations();
      handleCloseAdd();
    } catch (error) {
      console.error('Gagal menambah stasiun:', error);
      setFormError(error.response?.data?.message || error.message || 'Gagal menyimpan stasiun');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">Aktif / Online</span>;
      case 'maintenance':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100">Perbaikan</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-600 border border-slate-100">Nonaktif</span>;
    }
  };

  const getSlotStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">Baterai Siap</span>;
      case 'charging':
        return <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md animate-pulse">Mengisi Daya</span>;
      case 'empty':
        return <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border px-2 py-0.5 rounded-md">Slot Kosong</span>;
      case 'faulty':
        return <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">Rusak / Bermasalah</span>;
      default:
        return <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen Stasiun SPBKLU</h1>
          <p className="text-sm font-medium text-slate-500">Pantau status slot baterai secara langsung, kelola lokasi fisik, dan daftarkan stasiun baru.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition shadow-md shadow-emerald-500/15 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Tambah Stasiun Baru
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center">
          <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="mt-4 text-sm text-slate-500 font-semibold">Memuat Data Stasiun SPBKLU...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column: Stations List (2/3 width) */}
          <div className="xl:col-span-2 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider">Daftar Lokasi Fisik ({stations.length})</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stations.map((station) => (
                <div 
                  key={station.id}
                  onClick={() => setSelectedStation(station)}
                  className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                    selectedStation?.id === station.id 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/10' 
                      : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400">ID: {station.id}</span>
                      {getStatusBadge(station.status)}
                    </div>
                    <h4 className="text-base font-black text-slate-800 tracking-tight">{station.name}</h4>
                    <p className="text-xs text-slate-500 font-semibold line-clamp-2">{station.address}</p>
                  </div>

                  <div className="border-t border-slate-100 mt-4 pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="h-4 w-4" />
                      <span className="text-[10px] font-bold">{station.latitude || '-'}, {station.longitude || '-'}</span>
                    </div>

                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      {station.slots ? station.slots.length : 0} Slot Pengisi
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Slot Diagnostics panel (1/3 width) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full min-h-[500px]">
            {selectedStation ? (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Station summary header */}
                  <div className="space-y-1 pb-4 border-b border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnostik Stasiun</span>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">{selectedStation.name}</h3>
                    <p className="text-xs text-slate-500 font-semibold">{selectedStation.address}</p>
                    <div className="pt-2 flex items-center gap-1 text-slate-400">
                      <Activity className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-500">Status Modul: {selectedStation.status.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Slot grid list */}
                  <div className="space-y-4 pt-6">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Status Slot Baterai Fisik</h4>
                    
                    <div className="space-y-3">
                      {selectedStation.slots && selectedStation.slots.map((slot) => (
                        <div key={slot.slotId} className="flex items-center justify-between p-3.5 bg-slate-50 border rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-slate-200 font-black text-slate-600 text-sm flex items-center justify-center rounded-lg border border-slate-350">
                              S{slot.slotId}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-800">
                                {slot.batteryId ? `Baterai ID: ${slot.batteryId}` : 'Slot Kosong'}
                              </div>
                              {slot.batteryId && (
                                <div className="text-[10px] font-semibold text-slate-400">
                                  Daya Pengisian: {slot.chargeLevel}%
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5">
                            {getSlotStatusBadge(slot.status)}
                            {slot.batteryId && (
                              <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${slot.chargeLevel >= 90 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                  style={{ width: `${slot.chargeLevel}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border rounded-xl p-4 flex items-start gap-3 mt-6">
                  <Info className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                    Setiap slot dilengkapi dengan pengunci elektromagnetik otomatis. Slot hanya akan terbuka ketika user memindai QR Code swap dari APK mereka dan saldo mencukupi.
                  </p>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-4">
                <MapPin className="h-12 w-12 text-slate-300 animate-bounce" />
                <div>
                  <h4 className="font-extrabold text-slate-700 text-sm">Pilih Stasiun SPBKLU</h4>
                  <p className="text-xs font-semibold text-slate-400 max-w-xs mt-1">Klik pada salah satu stasiun di sebelah kiri untuk melihat status slot baterai dan pengisian daya secara langsung.</p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Add Station Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden transform transition-all animate-scaleUp">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-500" />
                Registrasi Stasiun Baru
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">ID Stasiun</label>
                  <input
                    type="text"
                    required
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    placeholder="e.g. ST-004"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-250 rounded-xl text-slate-800 font-extrabold text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Stasiun</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. SPBKLU Senayan Sport"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-250 rounded-xl text-slate-800 font-semibold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Alamat Lengkap</label>
                <textarea
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Masukkan jalan, kecamatan, kota..."
                  rows="3"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-250 rounded-xl text-slate-800 font-semibold text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Latitude</label>
                  <input
                    type="text"
                    value={newLat}
                    onChange={(e) => setNewLat(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-250 rounded-xl text-slate-800 font-semibold text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Longitude</label>
                  <input
                    type="text"
                    value={newLng}
                    onChange={(e) => setNewLng(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-250 rounded-xl text-slate-800 font-semibold text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Jumlah Slot</label>
                  <select
                    value={newSlotsCount}
                    onChange={(e) => setNewSlotsCount(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-250 rounded-xl text-slate-800 font-bold text-sm"
                  >
                    <option value="2">2 Slot</option>
                    <option value="4">4 Slot</option>
                    <option value="6">6 Slot</option>
                    <option value="8">8 Slot</option>
                  </select>
                </div>
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
                      Simpan Stasiun
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

export default Stations;

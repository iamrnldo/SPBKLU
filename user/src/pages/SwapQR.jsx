import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { formatDate, formatRupiah } from '../utils/formatter';
import { 
  Scan, 
  MapPin, 
  Zap, 
  ArrowDownUp, 
  CheckCircle2, 
  Loader2, 
  X, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

const SwapQR = () => {
  const { user, refreshProfile } = useAuth();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Swap operations states
  const [selectedStationId, setSelectedStationId] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [emptyBatteryId, setEmptyBatteryId] = useState('BT-901'); // default simulation held battery
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stations');
      // Filter only active stations for swap options
      const activeStations = response.data.data.filter(s => s.status === 'active');
      setStations(activeStations);
    } catch (error) {
      console.error('Failed to load stations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
    refreshProfile();
  }, []);

  const handleStationChange = (stationId) => {
    setSelectedStationId(stationId);
    setSelectedSlotId(''); // Reset slot selection
    setErrorMsg('');
  };

  const handleSwapSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessResult(null);

    if (!selectedStationId || !selectedSlotId || !emptyBatteryId) {
      setErrorMsg('Harap lengkapi stasiun, slot pengisian, dan ID baterai kosong Anda.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Execute transactional swap against real backend
      const response = await api.post('/transactions/swap', {
        stationId: selectedStationId,
        slotId: parseInt(selectedSlotId),
        emptyBatteryId
      });

      setSuccessResult(response.data.data);
      refreshProfile(); // refresh wallet balance
    } catch (error) {
      console.error('Swap failed:', error);
      setErrorMsg(error.response?.data?.message || error.message || 'Transaksi gagal dilakukan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStationObj = stations.find(s => s.id === selectedStationId);
  // Get slots in the selected station that are 'ready' with fully charged battery (chargeLevel >= 80)
  const readySlots = selectedStationObj?.slots?.filter(s => s.status === 'ready' && s.batteryId) || [];

  return (
    <div className="min-h-screen bg-slate-50 p-5 pb-24 space-y-6">
      
      {/* Header section */}
      <div className="text-center pt-4 space-y-1">
        <div className="inline-flex bg-emerald-50 text-emerald-500 border border-emerald-100 p-2.5 rounded-2xl mb-1">
          <Scan className="h-6 w-6 stroke-[3]" />
        </div>
        <h2 className="text-lg font-black text-slate-800 tracking-tight">Swapping QR Code</h2>
        <p className="text-xs font-semibold text-slate-400">Pindai QR Code di stasiun atau pilih manual parameter untuk memulai tukar baterai.</p>
      </div>

      {successResult ? (
        /* SUCCESS RESULTS VIEW MODAL/CARD */
        <div className="bg-white border rounded-2xl p-6 text-center shadow-xl border-slate-200 animate-scaleUp space-y-5">
          <div className="flex justify-center">
            <div className="bg-emerald-500 text-white p-3 rounded-full shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-800">Swap Berhasil!</h3>
            <p className="text-xs font-semibold text-emerald-600">Pintu slot elektromagnetik terbuka.</p>
          </div>

          <div className="bg-slate-50 p-4 border rounded-xl text-left text-xs font-semibold space-y-2 text-slate-600">
            <div className="flex justify-between border-b pb-1.5 border-slate-200/80">
              <span className="text-slate-400">ID TRANSAKSI:</span>
              <span className="font-extrabold text-slate-800">#{successResult.transaction.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span>Stasiun:</span>
              <span className="font-extrabold text-slate-800">{successResult.transaction.stationName}</span>
            </div>
            <div className="flex justify-between">
              <span>Baterai Masuk (Kosong):</span>
              <span className="font-extrabold text-rose-500">{successResult.transaction.emptyBatteryId}</span>
            </div>
            <div className="flex justify-between">
              <span>Baterai Keluar (Penuh):</span>
              <span className="font-extrabold text-emerald-500">{successResult.transaction.fullBatteryId}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200/80 font-bold">
              <span>Sisa Saldo Anda:</span>
              <span className="font-black text-emerald-600 text-sm">{formatRupiah(successResult.remainingBalance)}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setSuccessResult(null);
              setSelectedStationId('');
              setSelectedSlotId('');
            }}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Selesai & Tutup Pintu
          </button>
        </div>
      ) : (
        /* NORMAL MANUAL SWAP FORM SIMULATION */
        <form onSubmit={handleSwapSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl text-rose-600 flex items-start gap-2 text-xs font-bold leading-relaxed">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Step 1: Select Swapping Station */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">1. Pilih Lokasi Stasiun SPBKLU</label>
            <select
              value={selectedStationId}
              onChange={(e) => handleStationChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-slate-800 font-bold text-xs focus:outline-none"
            >
              <option value="">-- Pilih Stasiun Terdekat --</option>
              {stations.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Charger Slot */}
          {selectedStationId && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">2. Pilih Slot Baterai Penuh Siap Ambil</label>
              {readySlots.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {readySlots.map(slot => (
                    <div
                      key={slot.slotId}
                      onClick={() => setSelectedSlotId(String(slot.slotId))}
                      className={`p-3 border rounded-xl text-center cursor-pointer transition-all ${
                        selectedSlotId === String(slot.slotId)
                          ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/10'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-[9px] font-black text-slate-400 uppercase block">SLOT {slot.slotId}</span>
                      <span className="text-xs font-extrabold text-slate-800 block mt-0.5">{slot.batteryId}</span>
                      <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded-md inline-block mt-1.5">
                        🔋 {slot.chargeLevel}% SOC
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center text-xs font-bold text-orange-600">
                  Stasiun ini tidak memiliki baterai penuh (&gt;80%) yang siap ditukar saat ini.
                </div>
              )}
            </div>
          )}

          {/* Step 3: Current Carried Empty Battery info */}
          <div className="space-y-1.5 border-t border-slate-100 pt-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">3. Serial Baterai Anda (Untuk Dimasukkan)</span>
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border rounded-xl">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-50 text-rose-500 border border-rose-100 rounded-lg">
                  <Zap className="h-4 w-4 fill-current" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-800 block">BT-901</span>
                  <span className="text-[10px] text-rose-400 font-bold">State of Charge: 25% (Sisa Saldo)</span>
                </div>
              </div>

              <span className="text-[10px] font-black text-slate-400 uppercase">Held</span>
            </div>
          </div>

          {/* Swapping Price Flat Notification */}
          <div className="bg-slate-50 border p-3.5 rounded-xl flex items-center justify-between font-bold text-xs text-slate-600">
            <span>Biaya Swap Baterai (Flat):</span>
            <span className="font-black text-slate-800">{formatRupiah(10000)}</span>
          </div>

          {/* Swapping submit button */}
          <button
            type="submit"
            disabled={isSubmitting || !selectedStationId || !selectedSlotId}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-500/15 disabled:opacity-50 transition flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Memproses Swap PostgreSQL...</span>
              </>
            ) : (
              <>
                <ArrowDownUp className="h-5 w-5" />
                <span>Mulai Transaksi Swap!</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default SwapQR;

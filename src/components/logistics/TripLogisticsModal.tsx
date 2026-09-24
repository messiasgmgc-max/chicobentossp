import React, { useState, useEffect } from 'react';
import { useTrip } from '../../context/TripContext';
import {
  Building2,
  PlaneTakeoff,
  PlaneLanding,
  Save,
  X,
  Hotel,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { PlaceAutocompleteInput } from '../common/PlaceAutocompleteInput';
import { resolveHotelCoordinates, SP_AIRPORTS } from '../../services/logisticsLocationService';

const AIRPORT_PRESETS = [
  { code: 'CGH', name: 'Aeroporto de Congonhas (CGH) - Zona Sul' },
  { code: 'GRU', name: 'Aeroporto de Guarulhos (GRU) - Cumbica' },
  { code: 'VCP', name: 'Aeroporto de Viracopos (VCP) - Campinas' },
];

interface TripLogisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  focusSection?: 'hotel' | 'arrival' | 'departure' | 'all';
}

export const TripLogisticsModal: React.FC<TripLogisticsModalProps> = ({
  isOpen,
  onClose,
  focusSection = 'all',
}) => {
  const { trip, updateTripLogistics, triggerCelebration } = useTrip();

  // Form states
  const [hotelName, setHotelName] = useState(trip.hotelName || '');
  const [hotelAddress, setHotelAddress] = useState(trip.hotelAddress || '');
  const [hotelCheckin, setHotelCheckin] = useState(trip.hotelCheckin || '');
  const [hotelCheckout, setHotelCheckout] = useState(trip.hotelCheckout || '');
  const [hotelNotes, setHotelNotes] = useState(trip.hotelNotes || '');
  const [hotelLat, setHotelLat] = useState<number | undefined>(trip.hotelLat);
  const [hotelLng, setHotelLng] = useState<number | undefined>(trip.hotelLng);

  const [arrivalAirport, setArrivalAirport] = useState(trip.arrivalAirport || '');
  const [arrivalDateTime, setArrivalDateTime] = useState(trip.arrivalDateTime || '');
  const [arrivalFlight, setArrivalFlight] = useState(trip.arrivalFlight || '');

  const [departureAirport, setDepartureAirport] = useState(trip.departureAirport || '');
  const [departureDateTime, setDepartureDateTime] = useState(trip.departureDateTime || '');
  const [departureFlight, setDepartureFlight] = useState(trip.departureFlight || '');

  const [isSaving, setIsSaving] = useState(false);

  // Sync state whenever modal opens or trip updates
  useEffect(() => {
    if (isOpen) {
      setHotelName(trip.hotelName || '');
      setHotelAddress(trip.hotelAddress || '');
      setHotelCheckin(trip.hotelCheckin || '');
      setHotelCheckout(trip.hotelCheckout || '');
      setHotelNotes(trip.hotelNotes || '');
      setHotelLat(trip.hotelLat);
      setHotelLng(trip.hotelLng);
      setArrivalAirport(trip.arrivalAirport || '');
      setArrivalDateTime(trip.arrivalDateTime || '');
      setArrivalFlight(trip.arrivalFlight || '');
      setDepartureAirport(trip.departureAirport || '');
      setDepartureDateTime(trip.departureDateTime || '');
      setDepartureFlight(trip.departureFlight || '');
    }
  }, [isOpen, trip]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    let finalLat = hotelLat;
    let finalLng = hotelLng;

    // If coordinates are missing, try to geocode the hotel
    if ((!finalLat || !finalLng) && (hotelName || hotelAddress)) {
      const resolved = await resolveHotelCoordinates(hotelName, hotelAddress);
      if (resolved) {
        finalLat = resolved.lat;
        finalLng = resolved.lng;
      }
    }

    updateTripLogistics({
      hotelName: hotelName.trim(),
      hotelAddress: hotelAddress.trim(),
      hotelCheckin: hotelCheckin.trim(),
      hotelCheckout: hotelCheckout.trim(),
      hotelNotes: hotelNotes.trim(),
      hotelLat: finalLat,
      hotelLng: finalLng,
      arrivalAirport: arrivalAirport.trim(),
      arrivalDateTime: arrivalDateTime.trim(),
      arrivalFlight: arrivalFlight.trim(),
      departureAirport: departureAirport.trim(),
      departureDateTime: departureDateTime.trim(),
      departureFlight: departureFlight.trim(),
    });

    setIsSaving(false);
    triggerCelebration();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-2xl w-full max-w-2xl h-[92dvh] sm:h-auto sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Pinned Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900 shrink-0">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 truncate">
              <Hotel className="w-5 h-5 text-blue-400 shrink-0" />
              Hotel, Aeroportos & Horários
            </h3>
            <p className="text-xs text-slate-400 truncate">
              Preencha os dados de desembarque, hospedagem e embarque
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="logistics-modal-form"
          onSubmit={handleSave}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
        >
          {/* Section 1: Hotel */}
          <div className={`space-y-3 p-3.5 sm:p-4 rounded-2xl ${
            focusSection === 'hotel' ? 'bg-indigo-950/30 border border-indigo-500/30' : 'bg-slate-950/40 border border-slate-800/80'
          }`}>
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              1. Hospedagem (Onde Vamos Ficar)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <PlaceAutocompleteInput
                  label="Nome do Hotel, Airbnb ou Pousada"
                  placeholder="Buscar hotel ou endereço (ex: Ibis Paulista, Tivoli, Fasano...)"
                  value={hotelName}
                  onChange={val => setHotelName(val)}
                  onSelectPlace={place => {
                    setHotelName(place.name);
                    setHotelAddress(place.formattedAddress);
                    setHotelLat(place.lat);
                    setHotelLng(place.lng);
                  }}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Endereço Completo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Av. Paulista, 2355 - Bela Vista, São Paulo - SP"
                  value={hotelAddress}
                  onChange={e => setHotelAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Data & Horário de Check-in
                </label>
                <input
                  type="text"
                  placeholder="Ex: 15/10 às 14:00"
                  value={hotelCheckin}
                  onChange={e => setHotelCheckin(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Data & Horário de Check-out
                </label>
                <input
                  type="text"
                  placeholder="Ex: 19/10 às 11:00"
                  value={hotelCheckout}
                  onChange={e => setHotelCheckout(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Código da Reserva / Senha Wi-Fi / Dicas
                </label>
                <input
                  type="text"
                  placeholder="Ex: Reserva Booking #9872615 • Wi-Fi: HotelSp / senha..."
                  value={hotelNotes}
                  onChange={e => setHotelNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Desembarque (Chegada) */}
          <div className={`space-y-3 p-3.5 sm:p-4 rounded-2xl ${
            focusSection === 'arrival' ? 'bg-cyan-950/30 border border-cyan-500/30' : 'bg-slate-950/40 border border-slate-800/80'
          }`}>
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <PlaneLanding className="w-4 h-4" />
              2. Desembarque / Chegada em São Paulo
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Aeroporto de Chegada
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {AIRPORT_PRESETS.map(preset => (
                    <button
                      key={preset.code}
                      type="button"
                      onClick={() => setArrivalAirport(preset.name)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 active:scale-95 transition-colors"
                    >
                      + {preset.code}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Ex: Aeroporto de Congonhas (CGH) ou Guarulhos (GRU)"
                  value={arrivalAirport}
                  onChange={e => setArrivalAirport(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Data & Horário de Pouso
                </label>
                <input
                  type="text"
                  placeholder="Ex: 15/10 às 09:30"
                  value={arrivalDateTime}
                  onChange={e => setArrivalDateTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Número do Voo & Cia Aérea
                </label>
                <input
                  type="text"
                  placeholder="Ex: LA 3210 (LATAM) ou G3 1500 (GOL)"
                  value={arrivalFlight}
                  onChange={e => setArrivalFlight(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Embarque (Partida) */}
          <div className={`space-y-3 p-3.5 sm:p-4 rounded-2xl ${
            focusSection === 'departure' ? 'bg-amber-950/30 border border-amber-500/30' : 'bg-slate-950/40 border border-slate-800/80'
          }`}>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <PlaneTakeoff className="w-4 h-4" />
              3. Embarque / Voo de Retorno
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Aeroporto de Partida
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {AIRPORT_PRESETS.map(preset => (
                    <button
                      key={preset.code}
                      type="button"
                      onClick={() => setDepartureAirport(preset.name)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 active:scale-95 transition-colors"
                    >
                      + {preset.code}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Ex: Aeroporto de Congonhas (CGH) ou Guarulhos (GRU)"
                  value={departureAirport}
                  onChange={e => setDepartureAirport(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Data & Horário de Decolagem
                </label>
                <input
                  type="text"
                  placeholder="Ex: 19/10 às 18:45"
                  value={departureDateTime}
                  onChange={e => setDepartureDateTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Número do Voo & Cia Aérea
                </label>
                <input
                  type="text"
                  placeholder="Ex: G3 1890 (GOL)"
                  value={departureFlight}
                  onChange={e => setDepartureFlight(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Pinned Sticky Footer */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-slate-800 bg-slate-900 shrink-0 flex items-center justify-end gap-3 pb-safe">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-colors"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="logistics-modal-form"
            disabled={isSaving}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Salvando...' : 'Salvar Dados'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

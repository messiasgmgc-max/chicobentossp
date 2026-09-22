import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import {
  Building2,
  PlaneTakeoff,
  PlaneLanding,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Edit3,
  Save,
  X,
  Sparkles,
  Luggage,
  Hotel,
  ShieldCheck
} from 'lucide-react';

const AIRPORT_PRESETS = [
  { code: 'CGH', name: 'Aeroporto de Congonhas (CGH) - Zona Sul' },
  { code: 'GRU', name: 'Aeroporto de Guarulhos (GRU) - Cumbica' },
  { code: 'VCP', name: 'Aeroporto de Viracopos (VCP) - Campinas' },
];

export const TripLogisticsCard: React.FC = () => {
  const { trip, updateTripLogistics, triggerCelebration } = useTrip();
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [hotelName, setHotelName] = useState(trip.hotelName || '');
  const [hotelAddress, setHotelAddress] = useState(trip.hotelAddress || '');
  const [hotelCheckin, setHotelCheckin] = useState(trip.hotelCheckin || '');
  const [hotelCheckout, setHotelCheckout] = useState(trip.hotelCheckout || '');
  const [hotelNotes, setHotelNotes] = useState(trip.hotelNotes || '');

  const [arrivalAirport, setArrivalAirport] = useState(trip.arrivalAirport || '');
  const [arrivalDateTime, setArrivalDateTime] = useState(trip.arrivalDateTime || '');
  const [arrivalFlight, setArrivalFlight] = useState(trip.arrivalFlight || '');

  const [departureAirport, setDepartureAirport] = useState(trip.departureAirport || '');
  const [departureDateTime, setDepartureDateTime] = useState(trip.departureDateTime || '');
  const [departureFlight, setDepartureFlight] = useState(trip.departureFlight || '');

  const handleOpenEdit = () => {
    setHotelName(trip.hotelName || '');
    setHotelAddress(trip.hotelAddress || '');
    setHotelCheckin(trip.hotelCheckin || '');
    setHotelCheckout(trip.hotelCheckout || '');
    setHotelNotes(trip.hotelNotes || '');
    setArrivalAirport(trip.arrivalAirport || '');
    setArrivalDateTime(trip.arrivalDateTime || '');
    setArrivalFlight(trip.arrivalFlight || '');
    setDepartureAirport(trip.departureAirport || '');
    setDepartureDateTime(trip.departureDateTime || '');
    setDepartureFlight(trip.departureFlight || '');
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTripLogistics({
      hotelName: hotelName.trim(),
      hotelAddress: hotelAddress.trim(),
      hotelCheckin: hotelCheckin.trim(),
      hotelCheckout: hotelCheckout.trim(),
      hotelNotes: hotelNotes.trim(),
      arrivalAirport: arrivalAirport.trim(),
      arrivalDateTime: arrivalDateTime.trim(),
      arrivalFlight: arrivalFlight.trim(),
      departureAirport: departureAirport.trim(),
      departureDateTime: departureDateTime.trim(),
      departureFlight: departureFlight.trim(),
    });
    setIsEditing(false);
    triggerCelebration();
  };

  const googleMapsHotelUrl = trip.hotelAddress || trip.hotelName
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${trip.hotelName || ''} ${trip.hotelAddress || ''}, São Paulo - SP`
      )}`
    : null;

  const hasAnyLogistics = Boolean(
    trip.hotelName || trip.hotelAddress || trip.arrivalAirport || trip.departureAirport
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
      
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-md">
            <Hotel className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Hospedagem & Voos da Viagem
              {hasAnyLogistics && (
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Definido
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Hotel onde ficaremos, aeroporto de chegada e partida com horários
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenEdit}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5 text-orange-400" />
          <span>{hasAnyLogistics ? 'Editar Logística' : 'Preencher Hotel e Voos'}</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        
        {/* 1. Hotel Card */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Hotel / Onde Ficaremos
              </span>
              {googleMapsHotelUrl && (
                <a
                  href={googleMapsHotelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Abrir no Google Maps"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <h4 className="text-base font-bold text-white mb-1">
              {trip.hotelName || (
                <span className="text-slate-500 italic font-normal text-sm">
                  Hotel ainda não informado
                </span>
              )}
            </h4>

            {trip.hotelAddress && (
              <p className="text-xs text-slate-400 flex items-start gap-1.5 mb-3 line-clamp-2">
                <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                <span>{trip.hotelAddress}</span>
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-900">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Check-in</span>
                <span className="text-slate-300 font-medium">
                  {trip.hotelCheckin || 'A definir'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Check-out</span>
                <span className="text-slate-300 font-medium">
                  {trip.hotelCheckout || 'A definir'}
                </span>
              </div>
            </div>
          </div>

          {trip.hotelNotes && (
            <div className="mt-3 p-2 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[11px] text-slate-400">
              <span className="font-bold text-slate-300">Reserva: </span>
              {trip.hotelNotes}
            </div>
          )}
        </div>

        {/* 2. Arrival Flight / Airport */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <PlaneLanding className="w-3.5 h-3.5" />
              Chegada em São Paulo
            </span>

            <h4 className="text-base font-bold text-white mb-1">
              {trip.arrivalAirport || (
                <span className="text-slate-500 italic font-normal text-sm">
                  Aeroporto a definir
                </span>
              )}
            </h4>

            <div className="space-y-1.5 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {trip.arrivalDateTime ? (
                    <strong>{trip.arrivalDateTime}</strong>
                  ) : (
                    'Horário de pouso a definir'
                  )}
                </span>
              </div>

              {trip.arrivalFlight && (
                <div className="flex items-center gap-2 text-cyan-300 font-mono text-[11px]">
                  <Luggage className="w-3.5 h-3.5 text-slate-500" />
                  <span>Voo: {trip.arrivalFlight}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-500 pt-2 border-t border-slate-900">
            Dica: Uber ou táxi até o hotel
          </div>
        </div>

        {/* 3. Departure Flight / Airport */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <PlaneTakeoff className="w-3.5 h-3.5" />
              Partida / Retorno
            </span>

            <h4 className="text-base font-bold text-white mb-1">
              {trip.departureAirport || (
                <span className="text-slate-500 italic font-normal text-sm">
                  Aeroporto a definir
                </span>
              )}
            </h4>

            <div className="space-y-1.5 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {trip.departureDateTime ? (
                    <strong>{trip.departureDateTime}</strong>
                  ) : (
                    'Horário de decolagem a definir'
                  )}
                </span>
              </div>

              {trip.departureFlight && (
                <div className="flex items-center gap-2 text-purple-300 font-mono text-[11px]">
                  <Luggage className="w-3.5 h-3.5 text-slate-500" />
                  <span>Voo: {trip.departureFlight}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-500 pt-2 border-t border-slate-900">
            Chegar com 2h de antecedência no aeroporto
          </div>
        </div>

      </div>

      {/* Edit Logistics Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Hotel className="w-5 h-5 text-orange-500" />
                  Editar Hotel, Aeroportos & Horários
                </h3>
                <p className="text-xs text-slate-400">
                  Preencha os detalhes da viagem para todo o grupo acompanhar
                </p>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Hotel Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  1. Hospedagem (Onde Vamos Ficar)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nome do Hotel ou Pousada / Airbnb
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Ibis Paulista, Flat Jardins, Airbnb Vila Madalena..."
                      value={hotelName}
                      onChange={e => setHotelName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Endereço Completo (Para rotas no Google Maps)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Av. Paulista, 2355 - Bela Vista, São Paulo - SP"
                      value={hotelAddress}
                      onChange={e => setHotelAddress(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Data & Horário de Check-in
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 15/10 às 14:00"
                      value={hotelCheckin}
                      onChange={e => setHotelCheckin(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Data & Horário de Check-out
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 19/10 às 11:00"
                      value={hotelCheckout}
                      onChange={e => setHotelCheckout(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Código da Reserva / Senha Wi-Fi / Dicas
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Reserva Booking #9872615 • Wi-Fi: HotelSp / senha: ..."
                      value={hotelNotes}
                      onChange={e => setHotelNotes(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Airport & Flight of Arrival */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <PlaneLanding className="w-4 h-4" />
                  2. Voo de Chegada em São Paulo
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Aeroporto de Chegada
                    </label>
                    <div className="flex gap-2 mb-2">
                      {AIRPORT_PRESETS.map(preset => (
                        <button
                          key={preset.code}
                          type="button"
                          onClick={() => setArrivalAirport(preset.name)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 text-[11px] font-medium border border-slate-700"
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
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Data & Horário de Pouso
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 15/10 às 09:30"
                      value={arrivalDateTime}
                      onChange={e => setArrivalDateTime(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Número do Voo & Cia Aérea
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: LA 3210 (LATAM) ou G3 1500 (GOL)"
                      value={arrivalFlight}
                      onChange={e => setArrivalFlight(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Airport & Flight of Departure */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <PlaneTakeoff className="w-4 h-4" />
                  3. Voo de Partida / Retorno
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Aeroporto de Retorno
                    </label>
                    <div className="flex gap-2 mb-2">
                      {AIRPORT_PRESETS.map(preset => (
                        <button
                          key={preset.code}
                          type="button"
                          onClick={() => setDepartureAirport(preset.name)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 text-[11px] font-medium border border-slate-700"
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
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Data & Horário de Decolagem
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 19/10 às 18:45"
                      value={departureDateTime}
                      onChange={e => setDepartureDateTime(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Número do Voo & Cia Aérea
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: G3 1890 (GOL)"
                      value={departureFlight}
                      onChange={e => setDepartureFlight(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Dados da Viagem</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

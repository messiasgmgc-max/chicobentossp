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
  Luggage,
  Hotel,
  CheckCircle2,
  Cloud,
  WifiOff,
  AlertTriangle
} from 'lucide-react';
import { TripLogisticsModal } from './TripLogisticsModal';

export const TripLogisticsCard: React.FC = () => {
  const {
    trip,
    isSupabaseConnected,
    syncError
  } = useTrip();
  const [isEditing, setIsEditing] = useState(false);

  const googleMapsHotelUrl = trip.hotelAddress || trip.hotelName
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${trip.hotelName || ''} ${trip.hotelAddress || ''}, São Paulo - SP`
      )}`
    : null;

  const hasAnyLogistics = Boolean(
    trip.hotelName || trip.hotelAddress || trip.arrivalAirport || trip.departureAirport
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Hotel className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-white truncate">
                Hospedagem & Voos
              </h3>
              {hasAnyLogistics && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  Preenchido
                </span>
              )}
              {isSupabaseConnected ? (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0 flex items-center gap-1" title="Sincronização em nuvem ativa">
                  <Cloud className="w-3 h-3 text-sky-400" />
                  Nuvem Supabase
                </span>
              ) : (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 flex items-center gap-1" title="Salvo apenas neste dispositivo. Conecte o Supabase em Configurações para sincronizar com os outros.">
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  Modo Local
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">
              Hotel onde ficaremos, horários e aeroportos de chegada e partida
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0 active:scale-95"
        >
          <Edit3 className="w-3.5 h-3.5 text-blue-400" />
          <span>{hasAnyLogistics ? 'Editar Logística' : 'Cadastrar Hotel e Voos'}</span>
        </button>
      </div>

      {/* Sync Error Alert if schema or permission issue occurs */}
      {syncError && (
        <div className="mt-3.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-300">Atenção na sincronização com Supabase:</p>
            <p className="mt-0.5 text-slate-300 break-words">{syncError}</p>
            <p className="mt-1 text-[11px] text-amber-400/90">
              💡 Abra <strong>Configurações (⚙️ no topo)</strong> e clique em <strong>"Copiar SQL do Supabase"</strong> para colar no SQL Editor do Supabase.
            </p>
          </div>
        </div>
      )}

      {/* 3 Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3.5">
        
        {/* 1. Hotel Card */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Hotel / Hospedagem
              </span>
              {googleMapsHotelUrl && (
                <a
                  href={googleMapsHotelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
                  title="Abrir no Google Maps"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <h4 className="text-sm font-semibold text-white mb-1">
              {trip.hotelName || (
                <span className="text-slate-500 font-normal italic">
                  Hotel não informado
                </span>
              )}
            </h4>

            {trip.hotelAddress ? (
              <p className="text-xs text-slate-400 flex items-start gap-1 line-clamp-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>{trip.hotelAddress}</span>
              </p>
            ) : null}

            <div className="grid grid-cols-2 gap-2 text-xs pt-2.5 mt-2.5 border-t border-slate-900">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Check-in</span>
                <span className="text-slate-300 font-medium">
                  {trip.hotelCheckin || 'A definir'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Check-out</span>
                <span className="text-slate-300 font-medium">
                  {trip.hotelCheckout || 'A definir'}
                </span>
              </div>
            </div>
          </div>

          {trip.hotelNotes && (
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Nota: </span>
              {trip.hotelNotes}
            </div>
          )}
        </div>

        {/* 2. Arrival Flight / Airport */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <PlaneLanding className="w-3.5 h-3.5" />
              Chegada em São Paulo
            </span>

            <h4 className="text-sm font-semibold text-white mb-1">
              {trip.arrivalAirport || (
                <span className="text-slate-500 font-normal italic">
                  Aeroporto a definir
                </span>
              )}
            </h4>

            <div className="space-y-1.5 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>
                  {trip.arrivalDateTime ? (
                    <strong>{trip.arrivalDateTime}</strong>
                  ) : (
                    'Horário a definir'
                  )}
                </span>
              </div>

              {trip.arrivalFlight && (
                <div className="flex items-center gap-2 text-sky-300 font-mono text-[11px]">
                  <Luggage className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Voo: {trip.arrivalFlight}</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-900">
            Dica: Uber ou táxi até a hospedagem
          </div>
        </div>

        {/* 3. Departure Flight / Airport */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <PlaneTakeoff className="w-3.5 h-3.5" />
              Partida / Retorno
            </span>

            <h4 className="text-sm font-semibold text-white mb-1">
              {trip.departureAirport || (
                <span className="text-slate-500 font-normal italic">
                  Aeroporto a definir
                </span>
              )}
            </h4>

            <div className="space-y-1.5 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>
                  {trip.departureDateTime ? (
                    <strong>{trip.departureDateTime}</strong>
                  ) : (
                    'Horário a definir'
                  )}
                </span>
              </div>

              {trip.departureFlight && (
                <div className="flex items-center gap-2 text-indigo-300 font-mono text-[11px]">
                  <Luggage className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Voo: {trip.departureFlight}</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-900">
            Chegar com 2h de antecedência no portão
          </div>
        </div>

      </div>

      {/* Edit Logistics Modal */}
      <TripLogisticsModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
      />

    </div>
  );
};

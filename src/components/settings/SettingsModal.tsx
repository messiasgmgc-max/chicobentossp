import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  resetSupabaseClient,
  getGoogleMapsApiKey,
  saveGoogleMapsApiKey
} from '../../lib/supabase';
import {
  X,
  Database,
  MapPin,
  Save,
  RefreshCw,
  CheckCircle2,
  Copy,
  Download,
  Share2,
  Trash2,
  Key,
  Globe,
  Sparkles
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    trip,
    places,
    itineraryDays,
    notes,
    expenses,
    syncWithSupabase,
    isSyncing,
    resetToDefaultSPData
  } = useTrip();

  const currentConfig = getSupabaseConfig();
  const currentGmapsKey = getGoogleMapsApiKey();

  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseKey, setSupabaseKey] = useState(currentConfig.anonKey);
  const [gmapsKey, setGmapsKey] = useState(currentGmapsKey);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  if (!isOpen) return null;

  const handleSaveConfigs = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    saveGoogleMapsApiKey(gmapsKey);
    resetSupabaseClient();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify({ trip, places, itineraryDays, notes, expenses }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `chicobentosp_${trip.title.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyWhatsAppSummary = () => {
    let text = `✈️ *${trip.title} - ROTEIRO SÃO PAULO*\n📅 ${trip.startDate} até ${trip.endDate}\n👥 Grupo: ${trip.participants.join(', ')}\n\n`;

    if (trip.hotelName) {
      text += `🏨 *Hospedagem:* ${trip.hotelName}\n`;
      if (trip.hotelAddress) text += `📍 ${trip.hotelAddress}\n`;
      if (trip.hotelCheckin) text += `⏰ Check-in: ${trip.hotelCheckin} | Check-out: ${trip.hotelCheckout || '-'}\n\n`;
    }

    if (trip.arrivalAirport) {
      text += `🛬 *Chegada:* ${trip.arrivalAirport} ${trip.arrivalDateTime ? `às ${trip.arrivalDateTime}` : ''} ${trip.arrivalFlight ? `(Voo ${trip.arrivalFlight})` : ''}\n`;
    }
    if (trip.departureAirport) {
      text += `🛫 *Retorno:* ${trip.departureAirport} ${trip.departureDateTime ? `às ${trip.departureDateTime}` : ''} ${trip.departureFlight ? `(Voo ${trip.departureFlight})` : ''}\n\n`;
    }

    itineraryDays.forEach(day => {
      text += `📍 *${day.title}* (${day.date})\n`;
      day.items.forEach((item, idx) => {
        const place = places.find(p => p.id === item.placeId);
        if (place) {
          text += `  ${idx + 1}. *${place.name}* (${place.neighborhood}) ${item.startTime ? `- ${item.startTime}` : ''}\n`;
          if (item.transitTips) {
            text += `     🚇 ${item.transitTips}\n`;
          }
        }
      });
      text += '\n';
    });

    text += `📲 Planejado no Chico Bento SP!`;

    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-2xl w-full max-w-2xl h-[92dvh] sm:h-auto sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Pinned Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Configurações & Conexões</h3>
              <p className="text-xs text-slate-400">Banco Supabase, Google Maps e Backup</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Supabase Status Banner */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${currentConfig.isConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <div>
                <p className="text-xs font-semibold text-white">
                  {currentConfig.isConfigured ? 'Supabase Conectado' : 'Modo Offline / LocalStorage'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {currentConfig.isConfigured
                    ? 'Dados sincronizados na nuvem em tempo real'
                    : 'Configure as credenciais abaixo para salvar na nuvem'}
                </p>
              </div>
            </div>

            {currentConfig.isConfigured && (
              <button
                type="button"
                onClick={() => syncWithSupabase()}
                disabled={isSyncing}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
              </button>
            )}
          </div>

          {/* Form */}
          <form id="settings-form" onSubmit={handleSaveConfigs} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={supabaseUrl}
                onChange={e => setSupabaseUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={supabaseKey}
                onChange={e => setSupabaseKey(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                Google Maps API Key (Opcional)
              </label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={gmapsKey}
                onChange={e => setGmapsKey(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                * Mesmo sem chave do Google, o mapa interativo e links de rota funcionam 100%!
              </p>
            </div>

            {savedSuccess && (
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Configurações salvas com sucesso!
              </p>
            )}
          </form>

          {/* Export & WhatsApp Share */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Exportar e Compartilhar com o Grupo
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCopyWhatsAppSummary}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left transition-colors flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-white">
                    {copiedWhatsApp ? 'Copiado para o WhatsApp!' : 'Copiar Resumo p/ WhatsApp'}
                  </h5>
                  <p className="text-[11px] text-slate-400">Texto pronto para colar no grupo</p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleExportJson}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-left transition-colors flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-white">Exportar Backup JSON</h5>
                  <p className="text-[11px] text-slate-400">Baixar arquivo com todos os dados</p>
                </div>
              </button>
            </div>
          </div>

          {/* Reset Template */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-300">Limpar Dados Locais</p>
              <p className="text-[11px] text-slate-500">Apaga o cache local para começar limpo</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm('Deseja limpar todos os dados salvos localmente?')) {
                  resetToDefaultSPData();
                  onClose();
                }
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Resetar
            </button>
          </div>

        </div>

        {/* Pinned Sticky Footer - ALWAYS visible on mobile & desktop */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-900 shrink-0 flex items-center justify-between pb-safe">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-colors"
          >
            Fechar
          </button>

          <button
            type="submit"
            form="settings-form"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-sm flex items-center gap-1.5 transition-colors active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Configurações</span>
          </button>
        </div>

      </div>
    </div>
  );
};

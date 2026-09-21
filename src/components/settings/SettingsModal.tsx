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
    downloadAnchor.setAttribute('download', `sampatrip_${trip.title.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyWhatsAppSummary = () => {
    let text = `✈️ *${trip.title} - ROTEIRO SÃO PAULO*\n📅 ${trip.startDate} até ${trip.endDate}\n👥 Grupo: ${trip.participants.join(', ')}\n\n`;

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

    text += `📲 Planejado no SampaTrip!`;

    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  const sampleSqlSnippet = `-- Abra o Supabase -> SQL Editor -> Cole o arquivo supabase/schema.sql e clique em RUN!
CREATE TABLE IF NOT EXISTS trips (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT NOT NULL, ...);`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-orange-500" />
              Configurações & Integração Supabase / Google Maps
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Conecte com seu banco de dados ou exporte o roteiro para o grupo
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Supabase Status Banner */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${currentConfig.isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  {currentConfig.isConfigured ? 'Supabase Conectado' : 'Modo Demonstração / Local Storage Ativo'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {currentConfig.isConfigured
                    ? 'Seus dados podem ser sincronizados em tempo real com a nuvem'
                    : 'O app está salvando tudo instantaneamente no seu navegador'}
                </p>
              </div>
            </div>

            {currentConfig.isConfigured && (
              <button
                onClick={() => syncWithSupabase()}
                disabled={isSyncing}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
              </button>
            )}
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSaveConfigs} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                VITE_SUPABASE_URL
              </label>
              <input
                type="url"
                placeholder="https://sua-url-aqui.supabase.co"
                value={supabaseUrl}
                onChange={e => setSupabaseUrl(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                VITE_SUPABASE_ANON_KEY
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={supabaseKey}
                onChange={e => setSupabaseKey(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                VITE_GOOGLE_MAPS_API_KEY (Opcional)
              </label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={gmapsKey}
                onChange={e => setGmapsKey(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-orange-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                * Mesmo sem chave, o mapa interativo Leaflet e links de rota no Google Maps funcionam 100%!
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-emerald-400 font-bold">
                {savedSuccess && '✓ Configurações salvas com sucesso!'}
              </span>

              <button
                type="submit"
                className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 flex items-center gap-1.5 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Credenciais</span>
              </button>
            </div>
          </form>

          {/* Export & WhatsApp Share */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Exportar e Compartilhar com o Grupo
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleCopyWhatsAppSummary}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left transition-colors flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">
                    {copiedWhatsApp ? 'Copiado para o WhatsApp!' : 'Copiar Resumo p/ WhatsApp'}
                  </h5>
                  <p className="text-[10px] text-slate-400">Texto formatado pronto para enviar</p>
                </div>
              </button>

              <button
                onClick={handleExportJson}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-left transition-colors flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Exportar Backup JSON</h5>
                  <p className="text-[10px] text-slate-400">Baixar arquivo com todos os dados</p>
                </div>
              </button>
            </div>
          </div>

          {/* Reset Template */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400">Restaurar Dados Padrão de SP</p>
              <p className="text-[10px] text-slate-500">Recarrega os pontos e itinerário inicial</p>
            </div>
            <button
              onClick={() => {
                if (confirm('Deseja recarregar o roteiro e catálogo inicial de São Paulo?')) {
                  resetToDefaultSPData();
                  onClose();
                }
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 rounded-xl text-xs font-bold transition-colors"
            >
              Restaurar Padrão
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};

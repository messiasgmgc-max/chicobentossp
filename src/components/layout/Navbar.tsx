import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import {
  Calendar,
  Compass,
  Map,
  Train,
  FileText,
  Settings,
  Plus,
  Share2,
  CheckCircle2
} from 'lucide-react';

export type TabType = 'itinerary' | 'places' | 'map' | 'transit' | 'notes';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenAddPlace: () => void;
  onOpenSettings: () => void;
  onOpenUserSelect: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddPlace,
  onOpenSettings,
  onOpenUserSelect,
}) => {
  const { trip, currentUser, isSupabaseConnected } = useTrip();
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-20">
            
            {/* Logo & Trip Title */}
            <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20 text-white font-black text-sm sm:text-lg shrink-0">
                CB
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <h1 className="text-sm sm:text-lg font-extrabold text-white tracking-tight truncate">
                    Chico Bento SP
                  </h1>
                  <span className="hidden xs:inline-block text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30 shrink-0">
                    SP 🏙️
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                  <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>{trip.startDate ? new Date(trip.startDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '15 Out'}</span>
                  <span>-</span>
                  <span>{trip.endDate ? new Date(trip.endDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '19 Out'}</span>
                </p>
              </div>
            </div>

            {/* Center Navigation Tabs (Desktop Only) */}
            <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/80">
              <button
                onClick={() => setActiveTab('itinerary')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'itinerary'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Roteiro Diário</span>
              </button>

              <button
                onClick={() => setActiveTab('places')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'places'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Lugares & Votos</span>
              </button>

              <button
                onClick={() => setActiveTab('map')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'map'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Map className="w-4 h-4" />
                <span>Mapa & Rotas</span>
              </button>

              <button
                onClick={() => setActiveTab('transit')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'transit'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Train className="w-4 h-4" />
                <span>Como Chegar</span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'notes'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Notas & Gastos</span>
              </button>
            </nav>

            {/* Right Action Tools */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              
              {/* Quick Add Place Button */}
              <button
                onClick={onOpenAddPlace}
                className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                title="Sugerir novo local"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Sugerir Local</span>
              </button>

              {/* User Profile Selector */}
              <button
                onClick={onOpenUserSelect}
                className={`flex items-center space-x-1.5 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                  currentUser
                    ? 'bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200'
                    : 'bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 text-orange-300 animate-pulse'
                }`}
                title="Trocar ou editar integrante do grupo"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold uppercase shadow-sm shrink-0">
                  {currentUser ? currentUser.slice(0, 1) : '?'}
                </div>
                <span className="hidden md:inline font-medium max-w-[80px] truncate">
                  {currentUser || 'Quem é você?'}
                </span>
              </button>

              {/* Share / Copy Link Button */}
              <button
                onClick={handleShare}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors relative active:scale-95"
                title="Copiar link do roteiro"
              >
                {copiedLink ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>

              {/* Settings & Supabase Configuration Button */}
              <button
                onClick={onOpenSettings}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors relative active:scale-95"
                title="Configurações & Conexão Supabase/Google Maps"
              >
                <Settings className="w-4 h-4" />
                {isSupabaseConnected && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* Modern Fixed Bottom Tab Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 shadow-2xl pb-safe">
        <div className="flex items-center justify-around px-1 py-1.5">
          
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-2xl transition-all duration-150 active:scale-90 ${
              activeTab === 'itinerary'
                ? 'text-orange-400 font-bold bg-orange-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className={`w-5 h-5 mb-0.5 ${activeTab === 'itinerary' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] tracking-tight">Roteiro</span>
          </button>

          <button
            onClick={() => setActiveTab('places')}
            className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-2xl transition-all duration-150 active:scale-90 ${
              activeTab === 'places'
                ? 'text-orange-400 font-bold bg-orange-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className={`w-5 h-5 mb-0.5 ${activeTab === 'places' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] tracking-tight">Lugares</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-2xl transition-all duration-150 active:scale-90 ${
              activeTab === 'map'
                ? 'text-orange-400 font-bold bg-orange-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Map className={`w-5 h-5 mb-0.5 ${activeTab === 'map' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] tracking-tight">Mapa</span>
          </button>

          <button
            onClick={() => setActiveTab('transit')}
            className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-2xl transition-all duration-150 active:scale-90 ${
              activeTab === 'transit'
                ? 'text-orange-400 font-bold bg-orange-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Train className={`w-5 h-5 mb-0.5 ${activeTab === 'transit' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] tracking-tight">Metrô</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-2xl transition-all duration-150 active:scale-90 ${
              activeTab === 'notes'
                ? 'text-orange-400 font-bold bg-orange-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className={`w-5 h-5 mb-0.5 ${activeTab === 'notes' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] tracking-tight">Notas</span>
          </button>

        </div>
      </nav>
    </>
  );
};

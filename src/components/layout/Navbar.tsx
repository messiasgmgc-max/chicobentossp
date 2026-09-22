import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import {
  MapPin,
  Calendar,
  Compass,
  Map,
  Train,
  FileText,
  User,
  Settings,
  Plus,
  Share2,
  Database,
  Sparkles,
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
  const { trip, currentUser, setCurrentUser, addParticipant, isSupabaseConnected } = useTrip();
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Trip Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20 text-white font-black text-xl">
              CB
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                  Chico Bento SP
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-semibold border border-orange-500/30">
                    São Paulo 🏙️
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>{trip.startDate ? new Date(trip.startDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '15 Out'}</span>
                <span>-</span>
                <span>{trip.endDate ? new Date(trip.endDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '19 Out 2026'}</span>
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
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
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Quick Add Place Button */}
            <button
              onClick={onOpenAddPlace}
              className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Sugerir Local</span>
            </button>

            {/* User Profile Selector (Simulates Multi-user Collaboration) */}
            <button
              onClick={onOpenUserSelect}
              className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentUser
                  ? 'bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200'
                  : 'bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 text-orange-300 animate-pulse'
              }`}
              title="Trocar ou editar integrante do grupo"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                {currentUser ? currentUser.slice(0, 1) : '?'}
              </div>
              <span className="hidden md:inline font-medium">
                {currentUser ? currentUser : 'Quem é você?'}
              </span>
            </button>

            {/* Share / Copy Link Button */}
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors relative"
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
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors relative"
              title="Configurações & Conexão Supabase/Google Maps"
            >
              <Settings className="w-4 h-4" />
              {isSupabaseConnected && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Bottom Tab Navigation */}
      <div className="md:hidden flex items-center justify-around bg-slate-950/95 border-t border-slate-800 py-2 px-1">
        <button
          onClick={() => setActiveTab('itinerary')}
          className={`flex flex-col items-center p-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
            activeTab === 'itinerary' ? 'text-orange-400' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span>Roteiro</span>
        </button>

        <button
          onClick={() => setActiveTab('places')}
          className={`flex flex-col items-center p-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
            activeTab === 'places' ? 'text-orange-400' : 'text-slate-400'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span>Lugares</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center p-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
            activeTab === 'map' ? 'text-orange-400' : 'text-slate-400'
          }`}
        >
          <Map className="w-5 h-5 mb-0.5" />
          <span>Mapa</span>
        </button>

        <button
          onClick={() => setActiveTab('transit')}
          className={`flex flex-col items-center p-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
            activeTab === 'transit' ? 'text-orange-400' : 'text-slate-400'
          }`}
        >
          <Train className="w-5 h-5 mb-0.5" />
          <span>Metrô</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex flex-col items-center p-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
            activeTab === 'notes' ? 'text-orange-400' : 'text-slate-400'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span>Notas</span>
        </button>
      </div>
    </header>
  );
};

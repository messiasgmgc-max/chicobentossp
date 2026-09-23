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
  CheckCircle2,
  User
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
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Logo & Trip Title */}
            <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                CB
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                    Chico Bento SP
                  </h1>
                  <span className="hidden xs:inline-block text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700 shrink-0">
                    São Paulo 🏙️
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
            <nav className="hidden md:flex items-center space-x-1 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('itinerary')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'itinerary'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Roteiro</span>
              </button>

              <button
                onClick={() => setActiveTab('places')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'places'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Lugares</span>
              </button>

              <button
                onClick={() => setActiveTab('map')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'map'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Mapa</span>
              </button>

              <button
                onClick={() => setActiveTab('transit')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'transit'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Train className="w-3.5 h-3.5" />
                <span>Metrô</span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'notes'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Notas</span>
              </button>
            </nav>

            {/* Right Action Tools */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              
              {/* Quick Add Place Button */}
              <button
                onClick={onOpenAddPlace}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sugerir Local</span>
              </button>

              {/* User Profile Selector */}
              <button
                onClick={onOpenUserSelect}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  currentUser
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    : 'bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300'
                }`}
                title="Trocar ou editar usuário ativo"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold uppercase">
                  {currentUser ? currentUser.slice(0, 1) : '?'}
                </div>
                <span className="hidden sm:inline">
                  {currentUser || 'Escolher Perfil'}
                </span>
              </button>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title="Copiar link"
              >
                {copiedLink ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>

              {/* Settings Button */}
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors relative"
                title="Configurações"
              >
                <Settings className="w-4 h-4" />
                {isSupabaseConnected && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400"></span>
                )}
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* Fixed Bottom Tab Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 shadow-lg pb-safe">
        <div className="flex items-center justify-around px-1 py-1">
          
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
              activeTab === 'itinerary'
                ? 'text-blue-400 font-semibold bg-blue-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Roteiro</span>
          </button>

          <button
            onClick={() => setActiveTab('places')}
            className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
              activeTab === 'places'
                ? 'text-blue-400 font-semibold bg-blue-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Lugares</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
              activeTab === 'map'
                ? 'text-blue-400 font-semibold bg-blue-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Map className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Mapa</span>
          </button>

          <button
            onClick={() => setActiveTab('transit')}
            className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
              activeTab === 'transit'
                ? 'text-blue-400 font-semibold bg-blue-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Train className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Metrô</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
              activeTab === 'notes'
                ? 'text-blue-400 font-semibold bg-blue-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Notas</span>
          </button>

        </div>
      </nav>
    </>
  );
};

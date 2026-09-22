import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { Place } from '../../types';
import {
  X,
  Search,
  Plus,
  MapPin,
  Star,
  Clock,
  Train,
  Check,
  Compass
} from 'lucide-react';

interface AddStopModalProps {
  dayId: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateNewPlace: () => void;
}

export const AddStopModal: React.FC<AddStopModalProps> = ({
  dayId,
  isOpen,
  onClose,
  onOpenCreateNewPlace,
}) => {
  const { places, itineraryDays, addItemToDay } = useTrip();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const currentDay = itineraryDays.find(d => d.id === dayId);
  const existingPlaceIds = new Set(currentDay?.items.map(i => i.placeId) || []);

  const filteredPlaces = places.filter(place => {
    const matchesSearch =
      place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || place.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSelectPlace = (place: Place) => {
    addItemToDay(dayId, place.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 truncate">
              <Plus className="w-5 h-5 text-orange-500 shrink-0" />
              Adicionar Parada ({currentDay?.title || 'Dia'})
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate">
              Escolha do catálogo ou cadastre um novo local
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-950/40 space-y-2.5 sm:space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, bairro ou tag..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Categories Pill Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {['all', 'cultura', 'gastronomia', 'parque', 'vida_noturna', 'compras', 'ponto_turistico'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap capitalize transition-colors shrink-0 active:scale-95 ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat === 'all' ? 'Todos' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Places List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {filteredPlaces.length === 0 ? (
            <div className="text-center py-8">
              <Compass className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs sm:text-sm font-medium text-slate-300">Nenhum local encontrado</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">Que tal cadastrar esse novo lugar em São Paulo?</p>
              <button
                onClick={() => {
                  onClose();
                  onOpenCreateNewPlace();
                }}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md inline-flex items-center gap-1.5 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Novo Lugar
              </button>
            </div>
          ) : (
            filteredPlaces.map(place => {
              const isAlreadyInDay = existingPlaceIds.has(place.id);
              return (
                <div
                  key={place.id}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all ${
                    isAlreadyInDay
                      ? 'bg-slate-800/40 border-slate-800 opacity-60'
                      : 'bg-slate-800/80 border-slate-700/80 hover:border-orange-500/50 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <img
                      src={place.photoUrl}
                      alt={place.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0 border border-slate-700"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">{place.name}</h4>
                        <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-md bg-slate-700 text-slate-300 font-semibold capitalize shrink-0">
                          {place.category.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
                        <span className="truncate">{place.neighborhood}</span>
                        {place.metroStation && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="flex items-center gap-1 text-cyan-400 text-[10px] sm:text-[11px] truncate">
                              <Train className="w-3 h-3 shrink-0" />
                              {place.metroStation}
                            </span>
                          </>
                        )}
                      </p>
                      <div className="flex items-center gap-2.5 text-[10px] sm:text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center gap-0.5 text-amber-400 font-medium">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {place.rating}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-500" />
                          ~{place.estimatedTimeMins}m
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2 sm:ml-3">
                    {isAlreadyInDay ? (
                      <span className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-slate-400 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden xs:inline">No Roteiro</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSelectPlace(place)}
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-orange-600/20"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
          <p className="text-[11px] sm:text-xs text-slate-400 truncate mr-2">
            Não encontrou o local?
          </p>
          <button
            onClick={() => {
              onClose();
              onOpenCreateNewPlace();
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-orange-400" />
            <span>Cadastrar Novo</span>
          </button>
        </div>

      </div>
    </div>
  );
};

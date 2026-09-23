import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { Place, PlaceCategory } from '../../types';
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
  onOpenCreateNewPlace: (initialQuery?: string) => void;
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
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-2xl w-full max-w-2xl h-[92dvh] sm:h-auto sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Pinned Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900 shrink-0">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 truncate">
              <Plus className="w-5 h-5 text-blue-400 shrink-0" />
              Adicionar Parada ({currentDay?.title || 'Dia'})
            </h2>
            <p className="text-xs text-slate-400 truncate">
              Escolha do catálogo ou cadastre um novo local
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

        {/* Search & Categories Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-950/40 space-y-2.5 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, bairro ou tag..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Categories Pill Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {['all', 'cultura', 'gastronomia', 'parque', 'vida_noturna', 'compras', 'ponto_turistico'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap capitalize transition-colors shrink-0 active:scale-95 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat === 'all' ? 'Todos' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Places List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {filteredPlaces.length === 0 ? (
            <div className="py-12 text-center">
              <Compass className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">
                {places.length === 0
                  ? 'Nenhum local cadastrado ainda'
                  : 'Nenhum local encontrado com esses filtros'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto mb-4">
                {searchTerm
                  ? 'Você pode buscar diretamente no Google Maps e cadastrar esse ponto agora mesmo!'
                  : 'Cadastre os lugares que vocês querem visitar em São Paulo!'}
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCreateNewPlace(searchTerm.trim() || undefined);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{searchTerm ? `Buscar "${searchTerm}" no Maps` : 'Cadastrar Novo Ponto'}</span>
              </button>
            </div>
          ) : (
            filteredPlaces.map(place => {
              const isAlreadyAdded = existingPlaceIds.has(place.id);

              return (
                <div
                  key={place.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {place.photoUrl && (
                      <img
                        src={place.photoUrl}
                        alt={place.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-800"
                      />
                    )}
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {place.name}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                        <span>{place.neighborhood}</span>
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isAlreadyAdded ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-slate-400 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Adicionado</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectPlace(place)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1 shadow-sm"
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

        {/* Pinned Sticky Footer - ALWAYS visible on mobile & desktop */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-900 shrink-0 flex items-center justify-between pb-safe">
          <p className="text-xs text-slate-400 truncate mr-2">
            Não encontrou o local?
          </p>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCreateNewPlace(searchTerm.trim() || undefined);
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Cadastrar Novo</span>
          </button>
        </div>

      </div>
    </div>
  );
};
